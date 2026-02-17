# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# !!! DANGER ZONE - DESTRUCTIVE SCRIPT !!!
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# This script FLUSHES the database and LOADS data. Do not run in production.
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import os
import sys
import django
from django.db.models.signals import post_save
from django.core.management import call_command

# Add backend to path so we can import apps
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.auth_app.models import User

def load_data_safely():
    print("Backing up post_save receivers...")
    # Filter out receivers connected to User model
    # The receivers list contains tuples of (ref(receiver), dispatch_uid)
    # But simpler is to empty the list locally for the User sender.
    # However, post_save.receivers is a list of all receivers for ALL senders.
    # We only want to block User ones.
    
    # Strategy: Disconnect all functions from User sender temporarily
    # Since we can't easily find specifically the subscription one without importing it (and potentially running app ready code)
    # We will just suppress ALL post_save for User.
    
    # Actually, loaddata might wrap things in transaction.
    # Let's try to just clear post_save.receivers temporarily. 
    # It affects everything but that's fine for a data load script.
    
    original_receivers = post_save.receivers[:]
    post_save.receivers = []
    
    print("Signals disconnected. Flushing and Loading data...")
    try:
        call_command('flush', '--no-input')
        call_command('loaddata', 'datadump.json')
        print("Data loaded successfully.")
    except Exception as e:
        print(f"Error loading data: {e}")
    finally:
        post_save.receivers = original_receivers
        print("Signals restored.")

if __name__ == "__main__":
    load_data_safely()
