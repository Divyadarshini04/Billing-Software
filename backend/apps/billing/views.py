from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from .serializers import InvoiceSerializer, InvoiceReturnSerializer, DiscountRuleSerializer, DiscountLogSerializer
from apps.auth_app.permissions import IsAuthenticated
from .services import BillingService, DiscountService
from apps.common.helpers import get_user_owner

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class InvoiceListCreateView(ListCreateAPIView):
    """Controller for Invoice List and Create."""
    serializer_class = InvoiceSerializer
    pagination_class = StandardPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BillingService.list_invoices(self.request.user, self.request.query_params)

    def post(self, request, *args, **kwargs):
        try:
            invoice = BillingService.create_invoice(request.user, request.data)
            serializer = self.get_serializer(invoice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class NextInvoiceNumberView(APIView):
    """Controller for getting the next invoice number."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        owner = get_user_owner(request.user)
        next_number = BillingService.generate_invoice_number(owner)
        return Response({'next_invoice_number': next_number})

class InvoiceDetailView(RetrieveUpdateDestroyAPIView):
    """Controller for Invoice Detail, Update, and Delete."""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return BillingService.get_invoice(self.request.user, self.kwargs['pk'])

    def perform_update(self, serializer):
        try:
            BillingService.update_invoice(self.request.user, self.kwargs['pk'], self.request.data)
        except Exception as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(str(e))

    def perform_destroy(self, instance):
        try:
            BillingService.delete_invoice(self.request.user, self.kwargs['pk'])
        except Exception as e:
             from rest_framework.exceptions import ValidationError
             raise ValidationError(str(e))

class InvoiceAddItemView(APIView):
    """Controller for adding items to an invoice."""
    permission_classes = [IsAuthenticated]

    def post(self, request, invoice_id):
        try:
            invoice = BillingService.add_items_to_invoice(request.user, invoice_id, request.data.get('items', []))
            return Response({'message': 'Items added'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class InvoiceCompleteView(APIView):
    """Controller for completing an invoice."""
    permission_classes = [IsAuthenticated]

    def post(self, request, invoice_id):
        try:
            invoice = BillingService.complete_invoice(request.user, invoice_id)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class InvoiceCancelView(APIView):
    """Controller for cancelling an invoice."""
    permission_classes = [IsAuthenticated]

    def post(self, request, invoice_id):
        try:
            invoice = BillingService.cancel_invoice(request.user, invoice_id)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class InvoiceReturnView(APIView):
    """Controller for invoice returns."""
    permission_classes = [IsAuthenticated]

    def get(self, request, invoice_id):
        from .repositories import InvoiceReturnRepository
        invoice = BillingService.get_invoice(request.user, invoice_id)
        returns = InvoiceReturnRepository.get_returns_by_invoice(invoice)
        serializer = InvoiceReturnSerializer(returns, many=True)
        return Response(serializer.data)

    def post(self, request, invoice_id):
        try:
            return_obj = BillingService.create_return(request.user, invoice_id, request.data)
            serializer = InvoiceReturnSerializer(return_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class DiscountRuleViewSet(viewsets.ModelViewSet):
    """Controller for discount rules."""
    serializer_class = DiscountRuleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DiscountService.list_rules(self.request.user)

    def perform_create(self, serializer):
        owner = get_user_owner(self.request.user)
        serializer.save(created_by=self.request.user, owner=owner)

class DiscountLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Controller for discount logs."""
    serializer_class = DiscountLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return DiscountService.list_logs(self.request.user)
