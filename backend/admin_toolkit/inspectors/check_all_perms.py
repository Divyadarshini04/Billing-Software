import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Permission

with open('all_perms.txt', 'w') as f:
    f.write("=== ALL PERMISSIONS ===\n")
    for perm in Permission.objects.all():
        f.write(f"- {perm.code} ({perm.description})\n")
print("Done. Check all_perms.txt")
