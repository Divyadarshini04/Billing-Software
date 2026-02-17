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

confirm_execution("update_branding.py")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.common.models import CompanyProfile

try:
    # Update active company profile to Greenheap branding
    # Use the first one or all
    profiles = CompanyProfile.objects.all()
    for profile in profiles:
        profile.company_name = "Greenheap Enterprises"
        profile.logo_url = None # Force fallback to /logo.png (verified as Greenheap)
        profile.save()
        print(f"Updated branding for {profile.company_code}")
except Exception as e:
    print(f"Error: {e}")
