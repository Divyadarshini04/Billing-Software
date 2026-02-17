
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role, Permission, RolePermission

def sync_sales_exec_permissions():
    role_name = "SALES_EXECUTIVE"
    
    # NEW LEAN PERMISSION SET
    essential_permissions = [
        'view_pos', 'manage_pos', 'export_pos',
        'view_customers', 'manage_customers',
        'view_support'
    ]
    
    try:
        role = Role.objects.get(name=role_name)
    except Role.DoesNotExist:
        print(f"Error: Role {role_name} not found!")
        return

    print(f"Syncing permissions for {role_name}...")
    
    # 1. Clear existing assignments for this role
    RolePermission.objects.filter(role=role).delete()
    print("Cleared existing permissions.")

    # 2. Assign essential permissions
    for code in essential_permissions:
        try:
            perm = Permission.objects.get(code=code)
            RolePermission.objects.create(role=role, permission=perm)
            print(f"Granted: {code}")
        except Permission.DoesNotExist:
            print(f"Warning: Permission {code} does not exist in database!")

    print("Sync complete.")

if __name__ == '__main__':
    sync_sales_exec_permissions()
