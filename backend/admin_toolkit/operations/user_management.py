import os
import sys
import getpass

# Add parent directory to path to import core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core import admin_tool, logger

def create_super_admin():
    """Safely create a new Super Admin user"""
    from apps.auth_app.models import User
    
    logger.info("Initiating Super Admin creation process.")
    
    phone = input("Enter phone number: ").strip()
    first_name = input("Enter first name: ").strip()
    last_name = input("Enter last name: ").strip()
    email = input("Enter email: ").strip()
    
    # Check if user exists
    if User.objects.filter(phone=phone).exists():
        logger.warning(f"Super Admin creation failed: Phone {phone} already exists.")
        print(f"❌ User with phone {phone} already exists!")
        return False
    
    # Get password
    password = getpass.getpass("Enter password: ")
    password_confirm = getpass.getpass("Confirm password: ")
    
    if password != password_confirm:
        print("❌ Passwords don't match!")
        return False
    
    # Create user
    try:
        user = User.objects.create_user(
            phone=phone,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            is_super_admin=True,
            is_active=True
        )
        logger.info(f"Super Admin {user.phone} created successfully.")
        print(f"\n✅ Super Admin created successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to create Super Admin: {e}")
        return False

def reset_user_password():
    """Safely reset a user's password"""
    from apps.auth_app.models import User
    
    phone = input("Enter user phone number: ").strip()
    
    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        print(f"❌ User with phone {phone} not found!")
        return False
    
    # Get new password
    password = getpass.getpass("Enter new password: ")
    password_confirm = getpass.getpass("Confirm password: ")
    
    if password != password_confirm:
        print("❌ Passwords don't match!")
        return False
    
    try:
        user.set_password(password)
        user.save()
        logger.info(f"Password reset for user {user.phone}.")
        print(f"✅ Password reset successfully for {user.phone}!")
        return True
    except Exception as e:
        logger.error(f"Failed to reset password for {phone}: {e}")
        return False

@admin_tool(name="User Management", destructive=True)
def main():
    from apps.auth_app.models import User
    
    while True:
        print("\nUSER MANAGEMENT MENU")
        print("-" * 40)
        print("1. Create Super Admin")
        print("2. Reset User Password")
        print("3. List Super Admins")
        print("4. Exit")
        print("-" * 40)
        
        choice = input("Select option (1-4): ").strip()
        
        if choice == "1":
            create_super_admin()
        elif choice == "2":
            reset_user_password()
        elif choice == "3":
            super_admins = User.objects.filter(is_super_admin=True)
            if not super_admins.exists():
                print("No Super Admins found.")
            for admin in super_admins:
                print(f"  - {admin.get_full_name()} ({admin.phone})")
        elif choice == "4":
            break
        else:
            print("Invalid option!")

if __name__ == "__main__":
    main()
