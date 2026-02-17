from apps.auth_app.models import User
from django.contrib.auth.hashers import check_password

def check_staff_credentials(phone, raw_password):
    try:
        user = User.objects.get(phone=phone)
        is_correct = user.check_password(raw_password)
        print(f"User: {user.phone}")
        print(f"Raw Password: {raw_password}")
        print(f"Password in DB (hash): {user.password[:30]}...")
        print(f"Match: {is_correct}")
        print(f"Role Validation (SALES_EXECUTIVE): {user.parent is not None}")
    except User.DoesNotExist:
        print(f"User with phone {phone} not found.")

if __name__ == "__main__":
    # Test with common passwords if known, or just check the current state
    import sys
    phone = sys.argv[1] if len(sys.argv) > 1 else '9894151502'
    password = sys.argv[2] if len(sys.argv) > 2 else '123456' # Try common default
    check_staff_credentials(phone, password)
