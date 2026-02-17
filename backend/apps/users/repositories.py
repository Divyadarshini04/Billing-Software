from .models import Role, Permission, RolePermission, UserRole
from apps.auth_app.models import User
from django.db import IntegrityError

class RoleRepository:
    @staticmethod
    def get_role_by_name(name):
        try:
            return Role.objects.get(name=name)
        except Role.DoesNotExist:
            return None

    @staticmethod
    def get_all_roles():
        return Role.objects.all().order_by("created_at")

    @staticmethod
    def create_role(name, description=None):
        return Role.objects.create(name=name, description=description)

class PermissionRepository:
    @staticmethod
    def get_permission_by_code(code):
        try:
            return Permission.objects.get(code=code)
        except Permission.DoesNotExist:
            return None

    @staticmethod
    def get_all_permissions():
        return Permission.objects.all().order_by("created_at")

    @staticmethod
    def create_permission(code, description=None):
        return Permission.objects.create(code=code, description=description)

class RolePermissionRepository:
    @staticmethod
    def get_role_permissions(role):
        return RolePermission.objects.filter(role=role)

    @staticmethod
    def assign_permission(role, permission):
        return RolePermission.objects.get_or_create(role=role, permission=permission)

    @staticmethod
    def revoke_permission(role, permission):
        return RolePermission.objects.filter(role=role, permission=permission).delete()

    @staticmethod
    def get_matrix():
        roles = Role.objects.all()
        matrix = {}
        for role in roles:
            role_perms = RolePermission.objects.filter(role=role).values_list('permission__code', flat=True)
            matrix[role.name] = list(role_perms)
        return matrix

class UserRoleRepository:
    @staticmethod
    def get_user_roles(user):
        return UserRole.objects.filter(user=user)

    @staticmethod
    def assign_role(user, role):
        return UserRole.objects.get_or_create(user=user, role=role)

    @staticmethod
    def revoke_role(user, role):
        return UserRole.objects.filter(user=user, role=role).delete()

class StaffRepository:
    @staticmethod
    def get_staff_by_owner(owner):
        return User.objects.filter(parent=owner)

    @staticmethod
    def get_active_staff_count(owner):
        return User.objects.filter(parent=owner, is_active=True).count()
