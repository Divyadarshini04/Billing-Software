import logging
from django.db import transaction, IntegrityError
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Role, Permission, RolePermission, UserRole
from apps.auth_app.models import User
from .repositories import (
    RoleRepository, 
    PermissionRepository, 
    RolePermissionRepository, 
    UserRoleRepository,
    StaffRepository
)
from .serializers import UserSerializer, StaffCreateSerializer, RolePermissionSerializer, UserRoleSerializer, PermissionSerializer
from apps.auth_app.serializers import UserMinimalSerializer

logger = logging.getLogger(__name__)
audit_logger = logging.getLogger('audit')

class RbacService:
    @classmethod
    def create_role(cls, name, description, user_id):
        role = RoleRepository.create_role(name, description)
        audit_logger.info(f"Role created: name={name}, user={user_id}")
        return role

    @classmethod
    def create_permission(cls, code, description, user_id):
        permission = PermissionRepository.create_permission(code, description)
        audit_logger.info(f"Permission created: code={code}, user={user_id}")
        return permission

    @classmethod
    def assign_permission_to_role(cls, role_id, permission_id, user_id):
        role = Role.objects.get(id=role_id)
        permission = Permission.objects.get(id=permission_id)
        rp, created = RolePermissionRepository.assign_permission(role, permission)
        if not created:
             raise IntegrityError("This permission is already assigned to this role")
        audit_logger.info(f"Permission assigned to role: role_id={role_id}, permission_id={permission_id}, user={user_id}")
        return rp

    @classmethod
    def assign_role_to_user(cls, user_id_to_assign, role_id, assigned_by_id):
        user = User.objects.get(id=user_id_to_assign)
        role = Role.objects.get(id=role_id)
        ur, created = UserRoleRepository.assign_role(user, role)
        if not created:
             raise IntegrityError("This role is already assigned to this user")
        audit_logger.info(f"Role assigned to user: user_id={user_id_to_assign}, role_id={role_id}, assigned_by={assigned_by_id}")
        return ur

    @classmethod
    def get_permission_matrix(cls):
        return RolePermissionRepository.get_matrix()

    @classmethod
    def update_permission_matrix(cls, role_name, perm_code, enabled, user_id):
        role = RoleRepository.get_role_by_name(role_name)
        permission = PermissionRepository.get_permission_by_code(perm_code)
        
        if not role or not permission:
            return None, "Role or Permission not found"

        if enabled:
            RolePermissionRepository.assign_permission(role, permission)
            audit_logger.info(f"Permission granted: role={role.name}, permission={permission.code}, user={user_id}")
        else:
            RolePermissionRepository.revoke_permission(role, permission)
            audit_logger.info(f"Permission revoked: role={role.name}, permission={permission.code}, user={user_id}")
            
        return True, None

class StaffService:
    @classmethod
    def create_staff(cls, owner, serializer_data):
        # 1. Permission Check
        if not owner.is_superuser:
            from .utils import has_permission
            if not has_permission(owner, 'manage_users'):
                raise PermissionDenied("You do not have permission to manage users.")

        # 2. Check Staff Limit
        max_staff = owner.get_max_staff_allowed()
        if max_staff != -1:
            current_count = StaffRepository.get_active_staff_count(owner)
            if current_count >= max_staff:
                if max_staff == 0:
                    raise ValidationError({"detail": "You must subscribe to a plan to add team members."})
                raise ValidationError(
                    {"detail": f"You have reached the maximum number of staff members ({max_staff}) allowed for your current plan. Please upgrade to add more staff."}
                )

        # 3. Create Staff User
        with transaction.atomic():
            serializer = StaffCreateSerializer(data=serializer_data)
            serializer.is_valid(raise_exception=True)
            staff_user = serializer.save(parent=owner)
            
            # 4. Assign Role
            role = RoleRepository.get_role_by_name("SALES_EXECUTIVE")
            if role:
                UserRoleRepository.assign_role(staff_user, role)
            else:
                logger.error("SALES_EXECUTIVE role not found during staff creation")

            return UserMinimalSerializer(staff_user).data
