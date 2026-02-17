
import os
import sys
import django

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.db.utils import OperationalError

def check_health():
    print("🏥 Checking System Health...")
    
    try:
        c = connection.cursor()
        print("✅ Database connection successful.")
    except OperationalError:
        print("❌ Database connection FAILED.")
        sys.exit(1)
        
    print("✅ Application environment loaded successfully.")
    print("--------------------------------------------------")
    print("Safe to run inspector scripts.")

if __name__ == "__main__":
    check_health()
