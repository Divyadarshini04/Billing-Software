import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role, RolePermission

def get_matrix():
    roles = Role.objects.exclude(name='SUPERADMIN')
    matrix = {}
    for role in roles:
        role_perms = RolePermission.objects.filter(role=role).values_list('permission__code', flat=True)
        matrix[role.name] = list(role_perms)
    return matrix

if __name__ == "__main__":
    print(json.dumps(get_matrix(), indent=2))
