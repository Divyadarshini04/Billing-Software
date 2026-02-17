
import os
import django
import sys

# Setup Django environment
sys.path.append(r'd:\Billing-Software\backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.auth_app.models import Role, Permission

try:
    role = Role.objects.get(name='SALES_EXECUTIVE')
    # Use 'permissions' or whatever the field name is. Based on common practice it's 'permissions' or related_name.
    # Checking if it's ManyToManyField.
    permissions = role.permissions.all()
    print(f"Role: {role.name}")
    print(f"Permissions Count: {permissions.count()}")
    for p in permissions:
        # Assuming Permission model has 'codename'
        print(f" - {p.name} ({p.codename})")
except Role.DoesNotExist:
    print("Role 'SALES_EXECUTIVE' not found.")
except Exception as e:
    print(f"Error: {e}")
