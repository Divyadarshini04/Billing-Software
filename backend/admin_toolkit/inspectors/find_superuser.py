
import os
import django
import sys

sys.path.append('c:/Users/divya/Downloads/Billing-Application-main-2/backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.auth_app.models import User

users = User.objects.filter(is_superuser=True)
if users.exists():
    with open('superuser_details.txt', 'w', encoding='utf-8') as f:
        f.write("Found Superusers:\n")
        for u in users:
            f.write(f"ID: {u.id}, Phone: {u.phone}, Email: {u.email}, Name: {u.first_name} {u.last_name}\n")
else:
    print("No superusers found.")
