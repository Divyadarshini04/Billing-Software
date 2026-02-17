import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role, RolePermission

try:
    role = Role.objects.get(name='SALES_EXECUTIVE')
    perms = RolePermission.objects.filter(role=role)
    with open('sales_exec_perms.txt', 'w') as f:
        f.write(f"=== PERMISSIONS FOR {role.name} ===\n")
        if not perms.exists():
            f.write("No permissions assigned!\n")
        for rp in perms:
            f.write(f"- {rp.permission.code} ({rp.permission.description})\n")
    print("Done. Check sales_exec_perms.txt")
except Role.DoesNotExist:
    print("Role SALES_EXECUTIVE not found!")
except Exception as e:
    print(f"Error: {e}")
