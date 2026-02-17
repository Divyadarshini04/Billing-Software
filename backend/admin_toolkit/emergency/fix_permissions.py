import os
import sys

# Add parent directory to path to import core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core import admin_tool, logger

@admin_tool(name="Fix Permissions", destructive=True)
def fix_permissions():
    from apps.users.models import Role, Permission, RolePermission
    from apps.auth_app.models import User
    from apps.users.models import UserRole
    
    role_name = "SALES_EXECUTIVE"
    try:
        role = Role.objects.get(name=role_name)
    except Role.DoesNotExist:
        logger.error(f"Role {role_name} not found!")
        return

    # List of permissions that Sales Executive MUST have
    required_permissions = [
        "view_dashboard",
        "view_customers", "manage_customers", "export_customers",
        "view_inventory", "export_inventory",
        "view_pos", "manage_pos", "export_pos",
        "view_invoices", "manage_invoices", "export_invoices",
        "view_reports",
        "view_loyalty",
        "view_support"
    ]

    logger.info(f"Checking permissions for {role_name}...")

    for code in required_permissions:
        # Ensure permission exists
        perm, created = Permission.objects.get_or_create(code=code)
        if created:
            logger.info(f"Created permission: {code}")
        
        # Ensure assignment
        rp, assigned = RolePermission.objects.get_or_create(role=role, permission=perm)
        if assigned:
            logger.info(f"Assigned {code} to {role_name}")
        else:
            logger.debug(f"Verified {code} is assigned")

    # ALSO GRANT ALL PERMS TO OWNER (Backup if bypass fails)
    owner_role, _ = Role.objects.get_or_create(name="OWNER")
    logger.info("Ensuring OWNER has all permissions...")
    for code in required_permissions:
        perm, _ = Permission.objects.get_or_create(code=code)
        RolePermission.objects.get_or_create(role=owner_role, permission=perm)
    
    logger.info("Owner permissions updated.")

    phone = "9894151501" # Correct format
    try:
        user = User.objects.get(phone=phone)
        owner_role, _ = Role.objects.get_or_create(name="OWNER")
        
        # Check if already assigned
        if not UserRole.objects.filter(user=user, role=owner_role).exists():
            UserRole.objects.create(user=user, role=owner_role)
            logger.info(f"Assigned OWNER role to {user.first_name}")
        else:
            logger.info(f"{user.first_name} is already OWNER")
            
    except User.DoesNotExist:
        logger.warning(f"User {phone} not found")

if __name__ == '__main__':
    fix_permissions()
