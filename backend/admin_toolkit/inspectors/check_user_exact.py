import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.auth_app.models import User

def check():
    u = User.objects.get(phone='9894151501')
    print(f"User: {u.first_name} {u.last_name}")
    print(f"is_super_admin: {u.is_super_admin}")
    print(f"is_staff: {u.is_staff}")
    print(f"is_superuser: {u.is_superuser}")
    print(f"parent: {u.parent}")
    print(f"max_staff_allowed: {u.get_max_staff_allowed()}")
    
    # Check subscription
    try:
        sub = u.subscription
        print(f"Subscription: {sub.plan.name} (Status: {sub.status})")
    except:
        print("No subscription object found.")

if __name__ == "__main__":
    check()
