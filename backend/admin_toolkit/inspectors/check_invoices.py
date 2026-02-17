
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'billing_project.settings')
django.setup()

from apps.billing.models import Invoice

def check_latest_invoices():
    print("Checking latest 5 invoices...")
    invoices = Invoice.objects.all().order_by('-created_at')[:5]
    
    if not invoices:
        print("No invoices found.")
        return

    for inv in invoices:
        print(f"Invoice: {inv.invoice_number} | Status: {inv.status} | Total: {inv.total_amount} | Date: {inv.invoice_date}")

if __name__ == "__main__":
    check_latest_invoices()
