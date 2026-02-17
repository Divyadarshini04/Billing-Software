from rest_framework.exceptions import PermissionDenied
from .repositories import CustomerRepository, AddressRepository, LoyaltyRepository
from .serializers import CustomerSerializer, CustomerAddressSerializer, LoyaltySettingsSerializer, LoyaltyTransactionSerializer
from apps.common.helpers import get_user_owner
from apps.users.utils import has_permission

class CustomerService:
    @staticmethod
    def _check_customer_permission(user):
        if not user.is_superuser and not has_permission(user, 'manage_customers'):
            raise PermissionDenied("You do not have permission to manage customers.")

    @classmethod
    def list_customers(cls, user, query_params):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return CustomerRepository.get_customers_queryset(
            owner=owner,
            status=query_params.get('status'),
            customer_type=query_params.get('type'),
            tier=query_params.get('tier'),
            search=query_params.get('search')
        )

    @classmethod
    def create_customer(cls, user, data):
        cls._check_customer_permission(user)
        owner = get_user_owner(user)
        serializer = CustomerSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.save(owner=owner)

    @classmethod
    def get_customer(cls, user, pk):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return CustomerRepository.get_customer_by_id(pk, owner=owner)

    @classmethod
    def update_customer(cls, user, pk, data, partial=False):
        cls._check_customer_permission(user)
        customer = cls.get_customer(user, pk)
        serializer = CustomerSerializer(customer, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def delete_customer(cls, user, pk):
        cls._check_customer_permission(user)
        customer = cls.get_customer(user, pk)
        customer.delete()
        return True

    @classmethod
    def list_addresses(cls, user, customer_id):
        customer = cls.get_customer(user, customer_id)
        return AddressRepository.get_addresses_by_customer(customer)

    @classmethod
    def create_address(cls, user, customer_id, data):
        cls._check_customer_permission(user) # Assuming address management tied to customer management
        customer = cls.get_customer(user, customer_id)
        serializer = CustomerAddressSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.save(customer=customer)

    @classmethod
    def update_address(cls, user, pk, data, partial=False):
        cls._check_customer_permission(user)
        owner = get_user_owner(user) if not user.is_super_admin else None
        address = AddressRepository.get_address_by_id(pk, owner=owner)
        serializer = CustomerAddressSerializer(address, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def delete_address(cls, user, pk):
        cls._check_customer_permission(user)
        owner = get_user_owner(user) if not user.is_super_admin else None
        address = AddressRepository.get_address_by_id(pk, owner=owner)
        address.delete()
        return True

class LoyaltyService:
    @classmethod
    def get_loyalty_settings(cls, user):
        if not user.is_superuser and not has_permission(user, 'view_loyalty'):
            raise PermissionDenied("You do not have permission to view loyalty settings.")
        return LoyaltyRepository.get_settings()

    @classmethod
    def update_loyalty_settings(cls, user, data):
        if not user.is_superuser and not has_permission(user, 'manage_loyalty'):
            raise PermissionDenied("You do not have permission to manage loyalty settings.")
        settings = LoyaltyRepository.get_settings()
        serializer = LoyaltySettingsSerializer(settings, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def list_loyalty_transactions(cls, user, query_params):
        if not user.is_superuser and not has_permission(user, 'view_loyalty'):
            raise PermissionDenied("You do not have permission to view loyalty transactions.")
        
        owner = get_user_owner(user) if not user.is_super_admin else None
        return LoyaltyRepository.get_transactions_queryset(
            owner=owner,
            customer_id=query_params.get('customer_id')
        )

    @classmethod
    def create_loyalty_transaction(cls, user, data):
        if not user.is_superuser and not has_permission(user, 'manage_loyalty'):
            raise PermissionDenied("You do not have permission to manage loyalty transactions.")
        
        serializer = LoyaltyTransactionSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.save(created_by_id=user.id)
