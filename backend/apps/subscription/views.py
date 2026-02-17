from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SubscriptionPlan, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer
from .services import SubscriptionService

class IsSuperAdmin(permissions.BasePermission):
    """Allow access only to super admins"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_super_admin or request.user.is_superuser)

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    CRUD for Subscription Plans (Controller).
    """
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsSuperAdmin()]

class UserSubscriptionViewSet(viewsets.ModelViewSet):
    """
    Manage User Subscriptions (Controller).
    """
    queryset = UserSubscription.objects.all()
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_super_admin:
            return UserSubscription.objects.all()
        return UserSubscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if not self.request.user.is_super_admin:
            raise permissions.PermissionDenied("Only admins can manually assign subscriptions.")
        serializer.save()

    @action(detail=False, methods=['post'])
    def assign_trial(self, request):
        """Assign free trial."""
        result, error = SubscriptionService.assign_trial(request.user)
        if error:
            status_code = status.HTTP_400_BAD_REQUEST
            if "missing" in error: status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response({"error": error}, status=status_code)
        
        return Response(result, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def auto_upgrade_trials(self, request):
        """Auto-upgrade expired trials (Admin only)."""
        result, error = SubscriptionService.auto_upgrade_trials(request.user)
        if error:
            status_code = status.HTTP_403_FORBIDDEN
            if "not found" in error: status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
            return Response({"error": error}, status=status_code)

        return Response({
            'message': f"Successfully upgraded {result['upgraded_count']} users from Free Trial to Basic",
            **result
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def my_subscription(self, request):
        """Get the current user's active subscription."""
        result, error = SubscriptionService.get_user_subscription(request.user)
        if error:
            return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def upgrade(self, request):
        """Upgrade plan."""
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({"error": "plan_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        result, error = SubscriptionService.upgrade_subscription(request.user, plan_id, request.data)
        if error:
            status_code = status.HTTP_400_BAD_REQUEST
            if "not found" in error: status_code = status.HTTP_404_NOT_FOUND
            return Response({"error": error}, status=status_code)
            
        return Response({
            "message": "Successfully upgraded plan",
            "subscription": result
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def cancel(self, request):
        """Cancel subscription."""
        result, error = SubscriptionService.cancel_subscription(request.user)
        if error and "already" not in error:
            return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)
            
        message = "Subscription cancelled successfully"
        if error: # already cancelled or similar
             message = error

        return Response({
            "message": message,
            "subscription": result
        }, status=status.HTTP_200_OK)
