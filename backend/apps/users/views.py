from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.db import IntegrityError
import logging

from .models import User, Role, Permission
from .serializers import (
    PermissionSerializer,
    RolePermissionSerializer,
    UserRoleSerializer,
    UserSerializer,
    StaffCreateSerializer,
    RoleSerializer
)
from apps.auth_app.serializers import UserMinimalSerializer
from apps.auth_app.permissions import IsAdminOrHasPermission, IsAdmin, IsAuthenticated
from .services import RbacService, StaffService

logger = logging.getLogger(__name__)

class CreateRole(APIView):
    """Create a new role Controller."""
    permission_classes = [IsAdminOrHasPermission]
    required_permission = "create_role"

    def post(self, request):
        try:
            role = RbacService.create_role(
                request.data.get('name'), 
                request.data.get('description'),
                request.user.id
            )
            serializer = RoleSerializer(role)
            return Response(
                {"detail": "Role created", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CreatePermission(APIView):
    """Create a new permission Controller."""
    permission_classes = [IsAdminOrHasPermission]
    required_permission = "create_permission"

    def post(self, request):
        try:
            permission = RbacService.create_permission(
                request.data.get('code'), 
                request.data.get('description'),
                request.user.id
            )
            serializer = PermissionSerializer(permission)
            return Response(
                {"detail": "Permission created", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AssignPermissionToRole(APIView):
    """Assign permission Controller."""
    permission_classes = [IsAdminOrHasPermission]
    required_permission = "assign_permission"

    def post(self, request):
        try:
            RbacService.assign_permission_to_role(
                request.data.get('role'),
                request.data.get('permission'),
                request.user.id
            )
            return Response({"detail": "Permission assigned to role"}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AssignRoleToUser(APIView):
    """Assign role Controller."""
    permission_classes = [IsAdminOrHasPermission]
    required_permission = "assign_role"

    def post(self, request):
        try:
            RbacService.assign_role_to_user(
                request.data.get('user'),
                request.data.get('role'),
                request.user.id
            )
            return Response({"detail": "Role assigned to user"}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserList(APIView):
    """List users Controller."""
    permission_classes = [IsAdminOrHasPermission]
    required_permission = "view_users"

    def get(self, request):
        users = User.objects.prefetch_related("user_roles__role").all().order_by("id")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RoleList(APIView):
    """List roles Controller."""
    permission_classes = [IsAdmin]

    def get(self, request):
        roles = Role.objects.all().order_by("created_at")
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PermissionList(APIView):
    """List permissions Controller."""
    permission_classes = [IsAdmin]

    def get(self, request):
        permissions = Permission.objects.all().order_by("created_at")
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StaffManagementViewSet(viewsets.ModelViewSet):
    """Staff management ViewSet (Controller)."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return StaffCreateSerializer
        if self.action in ['update', 'partial_update']:
            return UserSerializer
        return UserMinimalSerializer

    def get_queryset(self):
        return User.objects.filter(parent=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            data = StaffService.create_staff(request.user, request.data)
            return Response(data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"detail": str(e)}, status=getattr(e, 'status_code', status.HTTP_400_BAD_REQUEST))

class RolePermissionMatrix(APIView):
    """RBAC Matrix Controller."""
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAdminOrHasPermission()]
    
    required_permission = "manage_settings"

    def get(self, request):
        matrix = RbacService.get_permission_matrix()
        return Response(matrix, status=status.HTTP_200_OK)

    def post(self, request):
        result, error = RbacService.update_permission_matrix(
            request.data.get('role'),
            request.data.get('permission'),
            request.data.get('enabled'),
            request.user.id
        )
        if error:
            return Response({"detail": error}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({"detail": "Permission updated"}, status=status.HTTP_200_OK)
