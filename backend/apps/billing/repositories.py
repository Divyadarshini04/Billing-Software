from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Invoice, InvoiceItem, InvoiceReturn, DiscountRule, DiscountLog

class InvoiceRepository:
    @staticmethod
    def get_invoice_by_id(pk, owner=None):
        if owner:
            return get_object_or_404(Invoice, pk=pk, owner=owner)
        return get_object_or_404(Invoice, pk=pk)

    @staticmethod
    def get_invoices_queryset(owner=None, status=None, payment_status=None, customer_id=None, start_date=None, end_date=None):
        queryset = Invoice.objects.prefetch_related('items', 'customer')
        if owner:
            queryset = queryset.filter(owner=owner)
        if status:
            queryset = queryset.filter(status=status)
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if start_date and end_date:
            queryset = queryset.filter(invoice_date__date__range=[start_date, end_date])
        return queryset.order_by('-invoice_date')

    @staticmethod
    def get_latest_invoice_by_company_code(company_code):
        return Invoice.objects.filter(
            invoice_number__startswith=f"{company_code}-"
        ).order_by('-created_at').first()

class InvoiceItemRepository:
    @staticmethod
    def create_item(invoice, **kwargs):
        return InvoiceItem.objects.create(invoice=invoice, **kwargs)

class InvoiceReturnRepository:
    @staticmethod
    def get_returns_by_invoice(invoice):
        return InvoiceReturn.objects.filter(invoice=invoice)

    @staticmethod
    def create_return(**kwargs):
        return InvoiceReturn.objects.create(**kwargs)

class DiscountRepository:
    @staticmethod
    def get_rules_queryset(owner=None):
        queryset = DiscountRule.objects.all()
        if owner:
            queryset = queryset.filter(owner=owner)
        return queryset.order_by('-created_at')

    @staticmethod
    def get_logs_queryset(owner=None):
        queryset = DiscountLog.objects.all()
        if owner:
            queryset = queryset.filter(invoice__owner=owner)
        return queryset.order_by('-timestamp')
