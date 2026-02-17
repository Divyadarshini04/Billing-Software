import logging
import uuid
from decimal import Decimal
from django.db import transaction, models
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from .repositories import InvoiceRepository, InvoiceItemRepository, InvoiceReturnRepository, DiscountRepository
from .serializers import InvoiceSerializer
from apps.common.serializers import CompanyProfileSerializer
from apps.common.helpers import get_user_owner
from apps.common.models import CompanyProfile
from apps.super_admin.models import SystemSettings
from apps.users.utils import has_permission

logger = logging.getLogger(__name__)

class BillingService:
    @staticmethod
    def _check_billing_permission(user):
        if not user.is_superuser and not has_permission(user, 'manage_invoices'):
            raise PermissionDenied("You do not have permission to manage invoices.")

    @classmethod
    def generate_invoice_number(cls, owner):
        # 1. Fetch Company Profile
        company_profile = CompanyProfile.objects.filter(owner=owner).first()
        if company_profile and company_profile.company_code:
            company_code = company_profile.company_code
        elif company_profile:
            # Generate if missing
            base_code = company_profile.company_name[:3].upper()
            company_code = ''.join(e for e in base_code if e.isalnum()).upper()
            existing_count = CompanyProfile.objects.filter(company_code__startswith=company_code).count()
            if existing_count > 0:
                company_code = f"{company_code}{existing_count}"
            company_profile.company_code = company_code
            company_profile.save(update_fields=['company_code'])
        else:
            company_code = "INV"

        # 2. Get Settings
        inv_prefix = "INV"
        starting_number = 1001
        system_settings = SystemSettings.objects.first()
        if system_settings:
            if system_settings.invoice_prefix:
                inv_prefix = system_settings.invoice_prefix
            if system_settings.invoice_starting_number:
                starting_number = system_settings.invoice_starting_number

        # 3. Generate from Repo
        latest_invoice = InvoiceRepository.get_latest_invoice_by_company_code(company_code)
        if latest_invoice:
            try:
                parts = latest_invoice.invoice_number.split('-')
                if len(parts) >= 3:
                    next_seq = int(parts[-1]) + 1
                else:
                    next_seq = starting_number
            except (ValueError, IndexError):
                next_seq = starting_number
        else:
            next_seq = starting_number

        return f"{company_code}-{inv_prefix}-{next_seq}"

    @classmethod
    def list_invoices(cls, user, query_params):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return InvoiceRepository.get_invoices_queryset(
            owner=owner,
            status=query_params.get('status'),
            payment_status=query_params.get('payment_status'),
            customer_id=query_params.get('customer_id'),
            start_date=query_params.get('start_date'),
            end_date=query_params.get('end_date')
        )

    @classmethod
    @transaction.atomic
    def create_invoice(cls, user, data):
        cls._check_billing_permission(user)
        owner = get_user_owner(user)
        
        # 1. Prepare Initial Data
        company_profile = CompanyProfile.objects.filter(owner=owner).first()
        company_snapshot = CompanyProfileSerializer(company_profile).data if company_profile else {}
        billing_settings = company_profile.billing_settings if company_profile else {}
        
        invoice_number = cls.generate_invoice_number(owner)
        
        serializer = InvoiceSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # 2. Save Basic Invoice
        invoice = serializer.save(
            invoice_number=invoice_number,
            created_by_id=user.id,
            owner=owner,
            company_details=company_snapshot,
            paid_amount=0,
            status=data.get('status', 'draft')
        )

        # 3. Handle Payment Mode in Notes
        payment_mode = data.get('payment_mode')
        if payment_mode:
            current_notes = invoice.notes or ""
            if "Payment Mode:" not in current_notes:
                formatted_mode = f"Payment Mode: {payment_mode}"
                invoice.notes = f"{current_notes} | {formatted_mode}" if current_notes else formatted_mode
        
        if 'billing_mode' in data:
            invoice.billing_mode = data['billing_mode']
        
        invoice.tax_rate = Decimal(str(data.get('tax_rate', '18')))

        # 4. Process Items
        items_data = data.get('items', [])
        for item in items_data:
            product_id = item.get('id')
            valid_product_id = int(product_id) if (isinstance(product_id, int) or (isinstance(product_id, str) and product_id.isdigit())) else None

            invoice_item = InvoiceItemRepository.create_item(
                invoice=invoice,
                product_id=valid_product_id,
                product_name=item.get('name', 'Unknown Product'),
                product_code=item.get('sku', ''),
                quantity=int(item.get('qty', 1)),
                unit_price=Decimal(str(item.get('price', 0))),
                tax_rate=Decimal(str(item.get('tax', 0))),
                discount_percent=0 
            )
            invoice_item.calculate_line_total()
            invoice_item.save()

            if valid_product_id:
                try:
                    from apps.product.models import Product
                    product = Product.objects.get(id=valid_product_id)
                    product.deduct_stock(
                        quantity=invoice_item.quantity,
                        reference_id=invoice.id,
                        reference_type='invoice',
                        user=user
                    )
                except Product.DoesNotExist:
                    pass

        # 5. Final Calculations
        from django.db.models import Sum
        invoice.subtotal = invoice.items.aggregate(total=Sum('line_total'))['total'] or Decimal('0')
        
        # GST State Logic
        customer_state = None
        if invoice.customer:
            address = invoice.customer.addresses.filter(models.Q(type='billing') | models.Q(is_default=True)).first() or invoice.customer.addresses.first()
            if address:
                customer_state = address.state

        company_state = (company_snapshot.get('state') or '').lower()
        
        if invoice.billing_mode == 'with_gst':
            tax_rate_decimal = Decimal(str(invoice.tax_rate))
            tax_amount = invoice.subtotal * (tax_rate_decimal / Decimal('100'))
            
            if customer_state and company_state and customer_state.lower() != company_state:
                 invoice.igst_amount = tax_amount
                 invoice.cgst_amount = Decimal('0')
                 invoice.sgst_amount = Decimal('0')
            else:
                 invoice.cgst_amount = tax_amount / 2
                 invoice.sgst_amount = tax_amount / 2
                 invoice.igst_amount = Decimal('0')
            
            invoice.total_amount = invoice.subtotal - invoice.discount_amount + invoice.igst_amount + invoice.cgst_amount + invoice.sgst_amount
        else:
             invoice.calculate_total()
        
        if billing_settings.get('invoice_round_off', False):
            invoice.total_amount = Decimal(str(round(float(invoice.total_amount))))
        
        # Payment Status
        requested_payment_status = data.get('payment_status', 'unpaid')
        if requested_payment_status == 'paid':
            invoice.paid_amount = invoice.total_amount
            invoice.payment_status = 'paid'
        elif 'paid_amount' in data:
            invoice.paid_amount = Decimal(str(data['paid_amount']))
            invoice.payment_status = requested_payment_status
        
        invoice.save()
        return invoice

    @classmethod
    def get_invoice(cls, user, pk):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return InvoiceRepository.get_invoice_by_id(pk, owner=owner)

    @classmethod
    def update_invoice(cls, user, pk, data, partial=False):
        cls._check_billing_permission(user)
        invoice = cls.get_invoice(user, pk)
        serializer = InvoiceSerializer(invoice, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def delete_invoice(cls, user, pk):
        cls._check_billing_permission(user)
        invoice = cls.get_invoice(user, pk)
        invoice.delete()
        return True

    @classmethod
    @transaction.atomic
    def add_items_to_invoice(cls, user, pk, items_data):
        cls._check_billing_permission(user)
        invoice = cls.get_invoice(user, pk)
        if invoice.status != 'draft':
            raise ValidationError("Items can only be added to draft invoices.")
        
        from django.db.models import Sum
        for item_data in items_data:
            from .models import InvoiceItem
            item = InvoiceItem.objects.create(invoice=invoice, **item_data)
            item.calculate_line_total()
            item.save()
        
        invoice.subtotal = invoice.items.aggregate(total=Sum('line_total'))['total'] or Decimal('0')
        invoice.calculate_total()
        invoice.save()
        return invoice

    @classmethod
    def complete_invoice(cls, user, pk):
        cls._check_billing_permission(user)
        invoice = cls.get_invoice(user, pk)
        if invoice.status == 'cancelled':
            raise ValidationError("Cannot complete a cancelled invoice.")
        invoice.complete()
        return invoice

    @classmethod
    def cancel_invoice(cls, user, pk):
        cls._check_billing_permission(user)
        invoice = cls.get_invoice(user, pk)
        if invoice.status in ['cancelled', 'returned']:
            raise ValidationError(f"Cannot cancel a {invoice.status} invoice.")
        invoice.cancel()
        return invoice

    @classmethod
    @transaction.atomic
    def create_return(cls, user, pk, data):
        cls._check_billing_permission(user)
        invoice = cls.get_invoice(user, pk)
        
        return_number = f"RET-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
        
        return_obj = InvoiceReturnRepository.create_return(
            return_number=return_number,
            invoice=invoice,
            reason=data.get('reason'),
            returned_items=data.get('returned_items', []),
            return_amount=data.get('return_amount', 0),
            refund_amount=data.get('refund_amount', 0),
            created_by_id=user.id
        )
        return return_obj

class DiscountService:
    @classmethod
    def list_rules(cls, user):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return DiscountRepository.get_rules_queryset(owner=owner)

    @classmethod
    def list_logs(cls, user):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return DiscountRepository.get_logs_queryset(owner=owner)
