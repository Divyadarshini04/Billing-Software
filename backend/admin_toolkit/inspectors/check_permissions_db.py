import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role, Permission, RolePermission

def check_perms():
    roles = Role.objects.all()
    print("--- ROLES ---")
    for r in roles:
        print(f"Role: {r.name}")
        perms = RolePermission.objects.filter(role=r).values_list('permission__code', flat=True)
        print(f"  Permissions: {list(perms)}")
    
    print("\n--- ALL PERMISSIONS ---")
    all_perms = Permission.objects.all().values_list('code', flat=True)
    print(list(all_perms))

    print("\n--- USERS AND ROLES ---")
    from apps.users.models import UserRole
    from apps.auth_app.models import User
    users_list = User.objects.all()
    for u in users_list:
        roles = UserRole.objects.filter(user=u).values_list('role__name', flat=True)
        print(f"User: {u.phone} ({u.first_name}) - Roles: {list(roles)}")

if __name__ == "__main__":
    check_perms()
