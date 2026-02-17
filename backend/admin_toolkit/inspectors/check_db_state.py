import os
import sys

# Add parent directory to path to import core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core import admin_tool, logger

def check_user(phone):
    from apps.users.models import User, UserRole
    try:
        user = User.objects.get(phone=phone)
        logger.info(f"Checking user: {user.phone} (ID: {user.id})")
        print(f"User: {user.phone} (ID: {user.id})")
        print(f"Is Superuser: {user.is_superuser}")
        
        roles = UserRole.objects.filter(user=user)
        print("Roles:")
        for ur in roles:
            print(f"  - {ur.role.name}")
            
        return user
    except User.DoesNotExist:
        print(f"User with phone {phone} not found.")
        return None

def check_roles():
    from apps.users.models import Role
    print("\nAll Roles:")
    for role in Role.objects.all():
        print(f"  - {role.name}")

def check_permissions():
    from apps.users.models import Permission
    print("\nSome Permissions:")
    for perm in Permission.objects.all()[:10]:
        print(f"  - {perm.code}")
        
    manage_settings = Permission.objects.filter(code="manage_settings").exists()
    print(f"\n'manage_settings' exists: {manage_settings}")

@admin_tool(name="Check DB State", destructive=False)
def main():
    check_user("9894151501")
    check_roles()
    check_permissions()

if __name__ == "__main__":
    main()
