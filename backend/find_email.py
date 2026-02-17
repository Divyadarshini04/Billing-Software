import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auth_app.models import User

email_to_check = 'divyadarshini2704@gmail.com'
users = User.objects.filter(email=email_to_check)
if users.exists():
    for user in users:
        print(f"Found User: ID={user.id}, Phone={user.phone}, Email={user.email}, Name={user.first_name} {user.last_name}")
else:
    print(f"No user found with email: {email_to_check}")
