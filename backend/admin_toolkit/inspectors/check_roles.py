import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role

print("=== ROLES IN DATABASE ===")
for role in Role.objects.all():
    print(f"Role: '{role.name}'")
