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

confirm_execution("update_company_logo.py")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.common.models import CompanyProfile
from apps.auth_app.models import User

try:
    # Update ALL active company profiles to use null logo (so it falls back to /logo.png)
    # OR better, if they want specific greenheap logo, maybe they want the name changed too?
    # I'll just clear the logo for now as requested.
    count = CompanyProfile.objects.all().update(logo_url=None)
    print(f"Updated {count} company profiles. Logo cleared to fallback to /logo.png (Greenheap).")
    
    # Also update company name if it looks like a placeholder
    # profile = CompanyProfile.objects.filter(is_active=True).first()
    # if profile and profile.company_name == "Burger King":
    #     profile.company_name = "Greenheap Enterprises"
    #     profile.save()
    #     print("Updated company name to Greenheap Enterprises")
except Exception as e:
    print(f"Error: {e}")
