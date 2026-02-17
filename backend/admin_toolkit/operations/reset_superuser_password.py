
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.auth_app.models import User

def reset_password():
    phone = '9342547471'
    try:
        user = User.objects.get(phone=phone)
        user.set_password('admin123')
        user.save()
        print(f"Password for user {phone} has been reset to 'admin123'.")
    except User.DoesNotExist:
        print(f"User with phone {phone} does not exist.")
    except Exception as e:
        print(f"Error checking user: {e}")

if __name__ == "__main__":
    reset_password()
