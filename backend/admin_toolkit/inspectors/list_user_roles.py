import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auth_app.models import User
from apps.users.models import UserRole

print("=== ALL USERS AND ROLES ===")
users = User.objects.all()
for user in users:
    roles = UserRole.objects.filter(user=user)
    role_names = [ur.role.name for ur in roles]
    print(f"User: {user.phone}, Roles: {role_names}, SuperAdmin: {user.is_super_admin}")
