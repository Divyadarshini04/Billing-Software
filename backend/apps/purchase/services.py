import logging
from decimal import Decimal
from django.db import transaction, models
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404

from .repositories import SupplierRepository, PurchaseOrderRepository, PurchaseReceiptRepository, PaymentRecordRepository
from apps.product.models import InventoryBatch, Product
from apps.purchase.serializers import SupplierSerializer, PurchaseOrderSerializer
from apps.users.utils import has_permission

logger = logging.getLogger(__name__)

class PurchaseService:
    @staticmethod
    def _check_permission(user, permission_code):
        if not user.is_superuser and not has_permission(user, permission_code):
            raise PermissionDenied("Permission denied.")

    @staticmethod
    def _get_owner(user):
        if user.is_super_admin:
            return None
        return user.parent if user.parent else user

    # --- Supplier Services ---
    @classmethod
    def list_suppliers(cls, user):
        owner = cls._get_owner(user)
        return SupplierRepository.get_suppliers_queryset(owner=owner)

    @classmethod
    @transaction.atomic
    def create_supplier(cls, user, data):
        cls._check_permission(user, 'manage_purchase')
        owner = cls._get_owner(user)
        
        serializer = SupplierSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.save(owner=owner)

    @classmethod
    @transaction.atomic
    def update_supplier(cls, user, pk, data):
        cls._check_permission(user, 'manage_purchase')
        owner = cls._get_owner(user)
        supplier = SupplierRepository.get_supplier_by_id(pk, owner=owner)
        
        serializer = SupplierSerializer(supplier, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def delete_supplier(cls, user, pk):
        cls._check_permission(user, 'manage_purchase')
        owner = cls._get_owner(user)
        supplier = SupplierRepository.get_supplier_by_id(pk, owner=owner)
        supplier.delete()

    # --- Purchase Order Services ---
    @classmethod
    def list_orders(cls, user, filters=None):
        owner = cls._get_owner(user)
        filters = filters or {}
        return PurchaseOrderRepository.get_po_queryset(
            owner=owner,
            supplier_id=filters.get('supplier_id'),
            status=filters.get('status'),
            payment_status=filters.get('payment_status')
        )

    @classmethod
    @transaction.atomic
    def create_order(cls, user, data):
        cls._check_permission(user, 'manage_purchase')
        owner = cls._get_owner(user)
        
        serializer = PurchaseOrderSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Generate PO Number
        po_count = PurchaseOrderRepository.get_po_queryset(owner=owner).count()
        po_number = f"DIR-{timezone.now().strftime('%Y%m')}{str(po_count + 1).zfill(6)}"
        
        return serializer.save(
            po_number=po_number,
            created_by_id=user.id,
            status='draft'
        )

    @classmethod
    @transaction.atomic
    def update_order(cls, user, pk, data):
        cls._check_permission(user, 'manage_purchase')
        owner = cls._get_owner(user)
        po = PurchaseOrderRepository.get_po_by_id(pk, owner=owner)
        
        if po.status not in ['draft', 'submitted']:
            raise ValidationError(f"Cannot update PO in {po.status} status.")
            
        serializer = PurchaseOrderSerializer(po, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    @transaction.atomic
    def add_order_item(cls, user, po_id, data):
        cls._check_permission(user, 'manage_purchase')
        owner = cls._get_owner(user)
        po = PurchaseOrderRepository.get_po_by_id(po_id, owner=owner)
        
        if po.status not in ['draft', 'submitted']:
            raise ValidationError(f"Cannot add items to PO in {po.status} status.")

        from apps.purchase.serializers import PurchaseOrderItemSerializer
        serializer = PurchaseOrderItemSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(purchase_order=po)
        
        cls._recalculate_po_totals(po)
        return item

    @classmethod
    @transaction.atomic
    def delete_order_item(cls, user, item_id):
        cls._check_permission(user, 'manage_purchase')
        # Permissions check implies fetching item and checking PO status
        item = PurchaseOrderRepository.get_po_item_by_id(item_id)
        po = item.purchase_order
        
        # Verify ownership via PO
        owner = cls._get_owner(user)
        if owner and po.supplier.owner != owner:
             raise PermissionDenied("Not found.")

        if po.status not in ['draft', 'submitted']:
            raise ValidationError(f"Cannot delete items from PO in {po.status} status.")
            
        item.delete()
        cls._recalculate_po_totals(po)

    @staticmethod
    def _recalculate_po_totals(po):
        items = po.items.all()
        subtotal = items.aggregate(total=models.Sum('line_total'))['total'] or 0
        po.subtotal = subtotal
        po.total_amount = subtotal + po.tax_amount + po.shipping_cost
        po.save()

    @classmethod
    @transaction.atomic
    def approve_order(cls, user, pk):
        cls._check_permission(user, 'approve_purchase')
        owner = cls._get_owner(user)
        po = PurchaseOrderRepository.get_po_by_id(pk, owner=owner)
        
        if po.status != 'draft':
            raise ValidationError(f"Cannot approve PO in {po.status} status.")
        if po.items.count() == 0:
            raise ValidationError("Cannot approve PO without items.")
            
        po.status = 'approved'
        po.approved_by_id = user.id
        po.approved_at = timezone.now()
        po.save()
        return po

    # --- Receipt (GRN) Services ---
    @classmethod
    @transaction.atomic
    def create_receipt(cls, user, data):
        cls._check_permission(user, 'receive_stock')
        owner = cls._get_owner(user)
        
        po_id = data.get('purchase_order')
        po = PurchaseOrderRepository.get_po_by_id(po_id, owner=owner)
        
        from apps.purchase.serializers import PurchaseReceiptLogSerializer
        serializer = PurchaseReceiptLogSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Generate GRN Number
        grn_count = PurchaseReceiptLogRepository.get_receipts_queryset(owner=owner).count() if hasattr(PurchaseReceiptRepository, 'get_receipts_queryset') else PurchaseReceiptLog.objects.count()
        grn_number = f"{timezone.now().strftime('%Y%m')}{str(grn_count + 1).zfill(6)}"
        
        receipt = serializer.save(
            grn_number=grn_number,
            received_by_id=user.id
        )
        
        # Process Items & Batches
        items_data = data.get('items_json', {})
        if items_data:
             cls._process_receipt_items(po, items_data, data)

        return receipt

    @staticmethod
    def _process_receipt_items(po, items_data, request_data):
        # items_data expected to be list or dict. The original view implementation suggested request.data.get('items_json') 
        # but also treated it as a single item dict in try block. 
        # Refactoring to handle safely based on previous implementation logic.
        
        # Logic from original view:
        # items_data = request.data.get('items_json', {}) 
        # item = PurchaseOrderItem.objects.get(id=items_data.get('item_id')) ...
        
        try:
            from apps.purchase.models import PurchaseOrderItem
            item_id = items_data.get('item_id')
            if not item_id: return

            item = PurchaseOrderItem.objects.get(id=item_id)
            
            Batch = InventoryBatch
            Batch.objects.create(
                product=item.product,
                batch_number=items_data.get('batch_number'),
                supplier_id=po.supplier_id,
                reference_purchase_id=po.id,
                received_quantity=items_data.get('received_qty'),
                remaining_quantity=items_data.get('received_qty'),
                unit_cost=item.unit_price,
                manufacture_date=request_data.get('manufacture_date'),
                expiry_date=request_data.get('expiry_date')
            )
            
            # Update PO Item
            item.received_quantity = items_data.get('received_qty')
            item.save()
            
            # Update PO Status
            if po.status == 'approved':
                po.status = 'partially_received'
                po.save()
            
            # Check if fully received
            total_ordered = po.items.aggregate(total=models.Sum('quantity'))['total'] or 0
            total_received = po.items.aggregate(total=models.Sum('received_quantity'))['total'] or 0
            
            if total_received >= total_ordered:
                po.status = 'received'
                po.save()

        except Exception as e:
            logger.error(f"Error processing receipt items: {e}")
            raise ValidationError(str(e))
