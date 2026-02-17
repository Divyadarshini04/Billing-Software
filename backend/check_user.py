import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auth_app.models import User

user = User.objects.filter(phone='9342547471').first()
if user:
    print(f"User ID: {user.id}")
    print(f"Date Joined: {user.date_joined}")
    print(f"Last Login: {user.last_login}")
    print(f"First Name: {user.first_name}")
    print(f"Last Name: {user.last_name}")
    print(f"Is Super Admin: {user.is_super_admin}")
else:
    print("User not found")
