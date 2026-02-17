
import os
import django
import sys

# Setup Django environment
sys.path.append(r'd:\Billing-Software\backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.auth_app.models import User
from apps.users.models import Role, UserRole

def fix_missing_roles():
    try:
        sales_role = Role.objects.get(name='SALES_EXECUTIVE')
    except Role.DoesNotExist:
        print("Error: SALES_EXECUTIVE role does not exist.")
        return

    # Find users who have a parent (Staff) but NO role assigned
    staff_users = User.objects.filter(parent__isnull=False)
    
    print(f"Found {staff_users.count()} staff users.")
    
    fixed_count = 0
    for user in staff_users:
        # Check if they have ANY role
        user_roles = UserRole.objects.filter(user=user)
        has_sales_role = user_roles.filter(role=sales_role).exists()
        
        if not has_sales_role:
            print(f"User {user.phone} ({user.first_name}) is missing SALES_EXECUTIVE role. Fixing...")
            UserRole.objects.create(user=user, role=sales_role)
            fixed_count += 1
        else:
            print(f"User {user.phone} ({user.first_name}) has correct role.")

    print(f"Fixed {fixed_count} users.")

if __name__ == "__main__":
    fix_missing_roles()
