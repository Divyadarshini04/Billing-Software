from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import ProductSerializer, CategorySerializer
from apps.auth_app.permissions import IsAuthenticated
from .services import ProductService, StockAlertService

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

class ProductListCreate(APIView):
    """Controller for Product List and Create."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        queryset = ProductService.list_products(request.user, request.query_params)
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        serializer = ProductSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        try:
            product = ProductService.create_product(request.user, request.data)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class ProductRetrieveUpdateDelete(APIView):
    """Controller for Product Detail, Update, and Delete."""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get(self, request, pk):
        product = ProductService.get_product(request.user, pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        try:
            product = ProductService.update_product(request.user, pk, request.data)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

    def patch(self, request, pk):
        try:
            product = ProductService.update_product(request.user, pk, request.data, partial=True)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

    def delete(self, request, pk):
        try:
            ProductService.delete_product(request.user, pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class CategoryListCreate(APIView):
    """Controller for Category List and Create."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = ProductService.list_categories(request.user)
        serializer = CategorySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            category = ProductService.create_category(request.user, request.data)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class CategoryRetrieveUpdateDelete(APIView):
    """Controller for Category Detail, Update, and Delete."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        category = ProductService.get_category(request.user, pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        try:
            category = ProductService.update_category(request.user, pk, request.data)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

    def patch(self, request, pk):
        try:
            category = ProductService.update_category(request.user, pk, request.data, partial=True)
            serializer = CategorySerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

    def delete(self, request, pk):
        try:
            ProductService.delete_category(request.user, pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class CheckStockAlertsView(APIView):
    """Controller for stock checks."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        result = StockAlertService.check_low_stock(request.user)
        return Response({
            'detail': 'Stock check complete', 
            **result
        })
