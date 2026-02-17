import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role

with open('exact_roles.txt', 'w') as f:
    for role in Role.objects.all():
        f.write(f"ROLE_NAME: >>>{role.name}<<<\n")
