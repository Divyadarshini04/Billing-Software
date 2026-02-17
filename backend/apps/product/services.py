import logging
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from .repositories import ProductRepository, CategoryRepository, InventoryRepository
from .serializers import ProductSerializer, CategorySerializer
from apps.common.helpers import get_user_owner
from apps.users.utils import has_permission

logger = logging.getLogger(__name__)

class ProductService:
    @staticmethod
    def _check_inventory_permission(user):
        if not user.is_superuser and not has_permission(user, 'manage_inventory'):
            raise PermissionDenied("You do not have permission to manage inventory.")

    @classmethod
    def list_products(cls, user, query_params):
        owner = get_user_owner(user) if not user.is_super_admin else None
        
        category_id = query_params.get("category")
        is_active_raw = query_params.get("is_active")
        is_active = None
        if is_active_raw in ["true", "True", "1"]:
            is_active = True
        elif is_active_raw in ["false", "False", "0"]:
            is_active = False
            
        search = query_params.get("search")
        ordering = query_params.get("ordering", "-created_at")
        
        return ProductRepository.get_products_queryset(
            owner=owner,
            category_id=category_id,
            is_active=is_active,
            search=search
        ).order_by(ordering)

    @classmethod
    def create_product(cls, user, data):
        cls._check_inventory_permission(user)
        owner = get_user_owner(user)
        serializer = ProductSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.save(owner=owner)

    @classmethod
    def get_product(cls, user, pk):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return ProductRepository.get_product_by_id(pk, owner=owner)

    @classmethod
    def update_product(cls, user, pk, data, partial=False):
        cls._check_inventory_permission(user)
        product = cls.get_product(user, pk)
        serializer = ProductSerializer(product, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def delete_product(cls, user, pk):
        cls._check_inventory_permission(user)
        product = cls.get_product(user, pk)
        product.delete()
        return True

    # Category methods
    @classmethod
    def list_categories(cls, user):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return CategoryRepository.get_categories_queryset(owner=owner)

    @classmethod
    def create_category(cls, user, data):
        cls._check_inventory_permission(user)
        owner = get_user_owner(user)
        serializer = CategorySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.save(owner=owner)

    @classmethod
    def get_category(cls, user, pk):
        owner = get_user_owner(user) if not user.is_super_admin else None
        return CategoryRepository.get_category_by_id(pk, owner=owner)

    @classmethod
    def update_category(cls, user, pk, data, partial=False):
        cls._check_inventory_permission(user)
        category = cls.get_category(user, pk)
        serializer = CategorySerializer(category, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        return serializer.save()

    @classmethod
    def delete_category(cls, user, pk):
        cls._check_inventory_permission(user)
        category = cls.get_category(user, pk)
        category.delete()
        return True

class StockAlertService:
    @classmethod
    def check_low_stock(cls, user):
        from apps.common.models import AppNotification, CompanyProfile
        from apps.purchase.models import SupplierNotificationLog
        from django.utils import timezone
        
        owner = get_user_owner(user)
        low_stock_products = InventoryRepository.get_low_stock_products(owner=owner)
        
        try:
            profile = CompanyProfile.objects.get(owner=owner)
            company_name = profile.company_name
        except CompanyProfile.DoesNotExist:
            company_name = "Our Company"

        alerts_generated = 0
        notifications_sent = 0
        alert_items = []

        for product in low_stock_products:
            notified = False
            
            # In-app notification
            existing_notif = AppNotification.objects.filter(
                user=user,
                title="Low Stock Alert",
                message__contains=product.name,
                is_read=False
            ).exists()
            
            if not existing_notif:
                AppNotification.objects.create(
                    user=user,
                    title="Low Stock Alert",
                    message=f"Product '{product.name}' is low on stock (Current: {product.stock}, Reorder Level: {product.reorder_level}).",
                    related_link=f"/inventory?status=Low%20Stock"
                )
                alerts_generated += 1
            
            # Supplier notification
            if product.preferred_supplier:
                today = timezone.now().date()
                already_sent = SupplierNotificationLog.objects.filter(
                    supplier=product.preferred_supplier,
                    product=product,
                    created_at__date=today
                ).exists()
                
                if not already_sent:
                    supplier = product.preferred_supplier
                    message = f"Hello {supplier.name}, We need {product.reorder_quantity} units of {product.name}. Current stock is low ({product.stock}). – {company_name}"
                    
                    SupplierNotificationLog.objects.create(
                        supplier=supplier,
                        product=product,
                        notification_type='low_stock_auto',
                        sent_via='simulated',
                        status='success',
                        message_content=message
                    )
                    notifications_sent += 1
                    notified = True
                else:
                    notified = True

            stock_status = "🔴 Out of Stock" if product.stock == 0 else "🟡 Low Stock"
            supplier_name = product.preferred_supplier.name if product.preferred_supplier else "⚠️ No Supplier Assigned"
            
            alert_items.append({
                'id': product.id,
                'name': product.name,
                'stock': product.stock,
                'reorder_level': product.reorder_level,
                'stock_status': stock_status,
                'supplier_id': product.preferred_supplier.id if product.preferred_supplier else None,
                'preferred_supplier': supplier_name,
                'notified': notified
            })
                    
        return {
            'alerts_generated': alerts_generated,
            'supplier_notifications': notifications_sent,
            'alert_items': alert_items
        }
