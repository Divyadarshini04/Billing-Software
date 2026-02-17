from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from .serializers import CustomerSerializer, CustomerAddressSerializer, LoyaltyTransactionSerializer, LoyaltySettingsSerializer
from apps.auth_app.permissions import IsAuthenticated
from .services import CustomerService, LoyaltyService

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class LoyaltySettingsView(APIView):
    """Controller for Loyalty Settings."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings = LoyaltyService.get_loyalty_settings(request.user)
        serializer = LoyaltySettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        settings = LoyaltyService.update_loyalty_settings(request.user, request.data)
        serializer = LoyaltySettingsSerializer(settings)
        return Response(serializer.data)

class CustomerListCreateView(ListCreateAPIView):
    """Controller for Customer List and Create."""
    serializer_class = CustomerSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomerService.list_customers(self.request.user, self.request.query_params)

    def create(self, request, *args, **kwargs):
        try:
            customer = CustomerService.create_customer(request.user, request.data)
            serializer = self.get_serializer(customer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class CustomerDetailView(RetrieveUpdateDestroyAPIView):
    """Controller for Customer Detail, Update, and Delete."""
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return CustomerService.get_customer(self.request.user, self.kwargs['pk'])

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        try:
            customer = CustomerService.update_customer(request.user, self.kwargs['pk'], request.data, partial)
            serializer = self.get_serializer(customer)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

    def destroy(self, request, *args, **kwargs):
        try:
            CustomerService.delete_customer(request.user, self.kwargs['pk'])
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class CustomerAddressListCreateView(APIView):
    """Controller for Customer Address List and Create."""
    permission_classes = [IsAuthenticated]

    def get(self, request, customer_id):
        addresses = CustomerService.list_addresses(request.user, customer_id)
        serializer = CustomerAddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request, customer_id):
        try:
            address = CustomerService.create_address(request.user, customer_id, request.data)
            serializer = CustomerAddressSerializer(address)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class CustomerAddressDetailView(RetrieveUpdateDestroyAPIView):
    """Controller for Customer Address Detail, Update, and Delete."""
    serializer_class = CustomerAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # We need to handle this differently since the service handles the lookup
        # But RetrieveUpdateDestroyAPIView expects a queryset/get_object
        from .repositories import AddressRepository
        from apps.common.helpers import get_user_owner
        user = self.request.user
        owner = get_user_owner(user) if not user.is_super_admin else None
        return AddressRepository.get_address_by_id(self.kwargs['pk'], owner=owner)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        try:
            address = CustomerService.update_address(request.user, self.kwargs['pk'], request.data, partial)
            serializer = self.get_serializer(address)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

    def destroy(self, request, *args, **kwargs):
        try:
            CustomerService.delete_address(request.user, self.kwargs['pk'])
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class LoyaltyTransactionListView(ListCreateAPIView):
    """Controller for Loyalty Transaction List and Create."""
    serializer_class = LoyaltyTransactionSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LoyaltyService.list_loyalty_transactions(self.request.user, self.request.query_params)

    def create(self, request, *args, **kwargs):
        try:
            transaction = LoyaltyService.create_loyalty_transaction(request.user, request.data)
            serializer = self.get_serializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))
