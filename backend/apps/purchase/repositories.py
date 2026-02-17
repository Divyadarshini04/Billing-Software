from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from .models import Supplier, PurchaseOrder, PurchaseOrderItem, PurchaseReceiptLog, PaymentRecord

class SupplierRepository:
    @staticmethod
    def get_supplier_by_id(pk, owner=None):
        if owner:
            return get_object_or_404(Supplier, pk=pk, owner=owner)
        return get_object_or_404(Supplier, pk=pk)

    @staticmethod
    def get_suppliers_queryset(owner=None):
        queryset = Supplier.objects.all()
        if owner:
            queryset = queryset.filter(owner=owner)
        return queryset.order_by('name')

    @staticmethod
    def create_supplier(**kwargs):
        return Supplier.objects.create(**kwargs)


class PurchaseOrderRepository:
    @staticmethod
    def get_po_by_id(pk, owner=None):
        queryset = PurchaseOrder.objects.prefetch_related('items', 'receipts', 'items__product').select_related('supplier')
        if owner:
            return get_object_or_404(queryset, pk=pk, supplier__owner=owner)
        return get_object_or_404(queryset, pk=pk)

    @staticmethod
    def get_po_queryset(owner=None, supplier_id=None, status=None, payment_status=None):
        queryset = PurchaseOrder.objects.prefetch_related('items', 'receipts').select_related('supplier')
        if owner:
            queryset = queryset.filter(supplier__owner=owner)
        if supplier_id:
            queryset = queryset.filter(supplier_id=supplier_id)
        if status:
            queryset = queryset.filter(status=status)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        return queryset.order_by('-order_date')

    @staticmethod
    def create_po(**kwargs):
        return PurchaseOrder.objects.create(**kwargs)

    @staticmethod
    def create_po_item(purchase_order, **kwargs):
        return PurchaseOrderItem.objects.create(purchase_order=purchase_order, **kwargs)

    @staticmethod
    def get_po_item_by_id(pk):
        return get_object_or_404(PurchaseOrderItem, pk=pk)


class PurchaseReceiptRepository:
    @staticmethod
    def get_receipts_queryset(owner=None, po_id=None):
        queryset = PurchaseReceiptLog.objects.select_related('purchase_order')
        if owner:
            queryset = queryset.filter(purchase_order__supplier__owner=owner)
        if po_id:
            queryset = queryset.filter(purchase_order_id=po_id)
        return queryset.order_by('-receipt_date')

    @staticmethod
    def create_receipt(**kwargs):
        return PurchaseReceiptLog.objects.create(**kwargs)


class PaymentRecordRepository:
    @staticmethod
    def get_payments_queryset(owner=None, po_id=None):
        queryset = PaymentRecord.objects.select_related('purchase_order')
        if owner:
            queryset = queryset.filter(purchase_order__supplier__owner=owner)
        if po_id:
            queryset = queryset.filter(purchase_order_id=po_id)
        return queryset.order_by('-payment_date')

    @staticmethod
    def create_payment(**kwargs):
        return PaymentRecord.objects.create(**kwargs)
