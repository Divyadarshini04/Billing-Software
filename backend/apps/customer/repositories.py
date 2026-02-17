from django.shortcuts import get_object_or_404
from .models import Customer, CustomerAddress, LoyaltyTransaction, LoyaltySettings

class CustomerRepository:
    @staticmethod
    def get_customer_by_id(pk, owner=None):
        if owner:
            return get_object_or_404(Customer, pk=pk, owner=owner)
        return get_object_or_404(Customer, pk=pk)

    @staticmethod
    def get_customers_queryset(owner=None, status=None, customer_type=None, tier=None, search=None):
        queryset = Customer.objects.prefetch_related('addresses')
        if owner:
            queryset = queryset.filter(owner=owner)
        if status:
            queryset = queryset.filter(status=status)
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
        if tier:
            queryset = queryset.filter(loyalty_tier=tier)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(phone__icontains=search) |
                Q(email__icontains=search) |
                Q(name__icontains=search) |
                Q(gstin__icontains=search) |
                Q(customer_id__icontains=search)
            )
        return queryset.order_by('-created_at')

class AddressRepository:
    @staticmethod
    def get_address_by_id(pk, owner=None):
        if owner:
            return get_object_or_404(CustomerAddress, pk=pk, customer__owner=owner)
        return get_object_or_404(CustomerAddress, pk=pk)

    @staticmethod
    def get_addresses_by_customer(customer):
        return CustomerAddress.objects.filter(customer=customer)

class LoyaltyRepository:
    @staticmethod
    def get_settings():
        return LoyaltySettings.get_settings()

    @staticmethod
    def get_transactions_queryset(owner=None, customer_id=None):
        queryset = LoyaltyTransaction.objects.all()
        if owner:
            queryset = queryset.filter(customer__owner=owner)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        return queryset.order_by('-created_at')
