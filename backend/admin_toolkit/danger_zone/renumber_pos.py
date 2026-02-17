# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# !!! DANGER ZONE - DESTRUCTIVE SCRIPT !!!
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# This script RENUMBERS Purchase Orders. Do not run in production without backup.
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.purchase.models import PurchaseOrder
from apps.auth_app.models import User
from django.db import transaction

def renumber_orders():
    print("Starting Purchase Order renumbering...")
    
    # Get all users who are owners (have suppliers or are referenced)
    # Actually, we can just iterate by unique owners found in POs
    
    # Group POs by owner
    # Owner is determined by supplier.owner
    
    # Get all POs with suppliers and owners
    all_pos = PurchaseOrder.objects.select_related('supplier__owner').all().order_by('created_at')
    
    # Group by owner
    owner_pos_map = {}
    
    for po in all_pos:
        if not po.supplier:
            print(f"Skipping PO {po.id}: No supplier attached")
            continue
            
        owner = po.supplier.owner
        if not owner:
            print(f"Skipping PO {po.id}: Supplier {po.supplier.name} has no owner")
            continue
            
        if owner.id not in owner_pos_map:
            owner_pos_map[owner.id] = []
        
        owner_pos_map[owner.id].append(po)
        
    
    with transaction.atomic():
        total_renamed = 0
        
        for owner_id, pos in owner_pos_map.items():
            print(f"Processing Owner ID {owner_id} - Found {len(pos)} orders.")
            
            # First pass: Rename to TEMP to avoid unique constraint collisions
            for po in pos:
                try:
                   po.po_number = f"TEMP-{po.id}"
                   po.save()
                except Exception as e:
                   print(f"Error renaming PO {po.id} to TEMP: {e}")
                   raise e
            
            # Second pass: Assign correct IDs
            for index, po in enumerate(pos):
                try:
                    seq_num = index + 1
                    date_str = po.created_at.strftime('%Y%m')
                    new_po_number = f"DIR-{date_str}{str(seq_num).zfill(6)}"
                    
                    po.po_number = new_po_number
                    po.save()
                    print(f"  - PO {po.id} -> {new_po_number}")
                    total_renamed += 1
                except Exception as e:
                    print(f"Error assigning new ID to PO {po.id}: {e}")
                    raise e
                
        print(f"Successfully renumbered {total_renamed} Purchase Orders.")

if __name__ == '__main__':
    renumber_orders()
