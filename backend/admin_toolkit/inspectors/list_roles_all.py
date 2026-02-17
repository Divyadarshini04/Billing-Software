import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auth_app.models import User
from apps.users.models import UserRole

for user in User.objects.all():
    roles = [ur.role.name for ur in user.user_roles.all()]
    print(f"USER: {user.phone} ({user.first_name}) ROLES: {roles}")
