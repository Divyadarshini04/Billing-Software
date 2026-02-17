
import os
import sys
import django

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils import confirm_execution

# ==============================================================================
# ⚠️ DANGER ZONE: DESTRUCTIVE SCRIPT ⚠️
# ==============================================================================
# This script is capable of modifying or deleting data.
# Do NOT run this script unless you understand exactly what it does.
# ==============================================================================

confirm_execution("fix_salesman_ids.py")

import os
import django
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def backfill():
    # Find users who are NOT super admins and have NO salesman_id
    # We assume 'is_super_admin' flag distinguishes staff from top-level admins.
    # Adjust filter if necessary based on roles.
    users_to_update = User.objects.filter(is_super_admin=False, salesman_id__isnull=True).order_by('date_joined')

    print(f"Found {users_to_update.count()} users to update.")

    current_id = 1001

    # Check if there are any existing IDs to start after
    existing = User.objects.filter(salesman_id__startswith='SE-')
    # Typo in filter above? 'startswith'. Correcting logic below without filter typo relies on python.
    
    # robust finding of max id
    all_users_with_id = User.objects.filter(salesman_id__isnull=False)
    max_val = 0
    for u in all_users_with_id:
        if u.salesman_id and u.salesman_id.startswith('SE-'):
            try:
                val = int(u.salesman_id.split('-')[1])
                if val > max_val:
                    max_val = val
            except:
                pass
    
    if max_val >= 1001:
        current_id = max_val + 1

    for user in users_to_update:
        # Double check role if needed? 
        # For now, assigning to all non-super-admin is safe as per request "Sales Executive ID"
        # If there are other roles (e.g. Suppliers as users?), we might need to check.
        # But User model usually implies staff/login users here.
        
        user.salesman_id = f"SE-{current_id}"
        user.save()
        print(f"Assigned {user.salesman_id} to {user.first_name} {user.last_name} ({user.phone})")
        current_id += 1

if __name__ == '__main__':
    backfill()
