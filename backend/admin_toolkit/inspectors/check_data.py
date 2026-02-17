import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auth_app.models import User
from apps.subscription.models import UserSubscription

print("=== USER COUNT ===")
all_users = User.objects.filter(is_super_admin=False)
print(f"Total non-super-admin users: {all_users.count()}")

owners_only = User.objects.filter(is_super_admin=False, parent__isnull=True)
print(f"Owners only (parent__isnull=True): {owners_only.count()}")

print("\nAll non-super-admin users:")
for u in all_users:
    parent_info = f"Parent: {u.parent.phone if u.parent else 'None (OWNER)'}"
    print(f"  - {u.phone} ({u.first_name}): {parent_info}")

print("\n=== SUBSCRIPTION COUNT ===")
active_subs = UserSubscription.objects.filter(status="ACTIVE")
print(f"Active subscriptions: {active_subs.count()}")

all_subs = UserSubscription.objects.all()
print(f"Total subscriptions: {all_subs.count()}")

if all_subs.count() > 0:
    print("\nAll subscriptions:")
    for sub in all_subs:
        print(f"  - {sub.user.phone}: {sub.plan.code} (Status: {sub.status})")
