from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from .models import Product, Category, InventoryMovement, InventoryBatch

class ProductRepository:
    @staticmethod
    def get_product_by_id(pk, owner=None):
        if owner:
            return get_object_or_404(Product, pk=pk, owner=owner)
        return get_object_or_404(Product, pk=pk)

    @staticmethod
    def get_products_queryset(owner=None, category_id=None, is_active=None, search=None):
        queryset = Product.objects.select_related("category", "preferred_supplier").all()
        
        if owner:
            queryset = queryset.filter(owner=owner)
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
            
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(product_code__icontains=search) |
                Q(barcode__icontains=search) |
                Q(hsn_code__icontains=search)
            )
        return queryset

class CategoryRepository:
    @staticmethod
    def get_category_by_id(pk, owner=None):
        if owner:
            return get_object_or_404(Category, pk=pk, owner=owner)
        return get_object_or_404(Category, pk=pk)

    @staticmethod
    def get_categories_queryset(owner=None):
        queryset = Category.objects.all()
        if owner:
            queryset = queryset.filter(owner=owner)
        return queryset.order_by("created_at")

class InventoryRepository:
    @staticmethod
    def get_low_stock_products(owner=None):
        queryset = Product.objects.filter(is_active=True).select_related('preferred_supplier')
        if owner:
            queryset = queryset.filter(owner=owner)
        return queryset.filter(stock__lte=F('reorder_level'))

    @staticmethod
    def create_movement(product, change_type, quantity, **kwargs):
        return InventoryMovement.objects.create(
            product=product,
            change_type=change_type,
            quantity=quantity,
            **kwargs
        )
