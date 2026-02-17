
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

confirm_execution("backfill_customer_ids.py")

import os
import django
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.customer.models import Customer

def backfill():
    # Find customers with NO customer_id
    customers_to_update = Customer.objects.filter(customer_id__isnull=True).order_by('created_at')

    print(f"Found {customers_to_update.count()} customers to update.")

    current_id = 1001

    # Check database for highest existing ID to avoid conflicts
    existing_ids = Customer.objects.filter(customer_id__startswith='CUS-')
    max_val = 0
    for c in existing_ids:
        try:
            val = int(c.customer_id.split('-')[1])
            if val > max_val:
                max_val = val
        except:
            pass
    
    if max_val >= 1001:
        current_id = max_val + 1

    for customer in customers_to_update:
        customer.customer_id = f"CUS-{current_id}"
        customer.save(update_fields=['customer_id']) # Optimize save
        print(f"Assigned {customer.customer_id} to {customer.name}")
        current_id += 1

    print("Backfill complete.")

if __name__ == '__main__':
    backfill()
