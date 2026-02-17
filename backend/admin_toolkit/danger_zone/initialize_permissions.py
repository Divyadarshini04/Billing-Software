# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# !!! DANGER ZONE - DESTRUCTIVE SCRIPT !!!
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# This script RESETS/RE-INITIALIZES permissions. Proceed with caution.
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import Role, Permission, RolePermission

def initialize():
    # Define All Permissions from frontend PermissionsContext.js
    permissions_list = [
        # Dashboard
        {"code": "view_dashboard", "description": "View Dashboard"},
        {"code": "manage_dashboard", "description": "Manage Dashboard Widgets"},
        # Customers
        {"code": "view_customers", "description": "View Customers"},
        {"code": "manage_customers", "description": "Add/Edit/Delete Customers"},
        {"code": "export_customers", "description": "Export Customers"},
        {"code": "import_customers", "description": "Import Customers"},
        # Inventory
        {"code": "view_inventory", "description": "View Inventory"},
        {"code": "manage_inventory", "description": "Add/Edit/Delete Inventory"},
        {"code": "export_inventory", "description": "Export Inventory"},
        {"code": "import_inventory", "description": "Import Inventory"},
        # POS Billing
        {"code": "view_pos", "description": "View POS Billing"},
        {"code": "manage_pos", "description": "Manage POS Billing"},
        {"code": "export_pos", "description": "Export POS Data"},
        # Invoices
        {"code": "view_invoices", "description": "View Invoices"},
        {"code": "manage_invoices", "description": "Add/Edit/Delete Invoices"},
        {"code": "export_invoices", "description": "Export Invoices"},
        # Subscription
        {"code": "view_subscription", "description": "View Subscription"},
        {"code": "manage_subscription", "description": "Manage Subscription Plans"},
        # User Management
        {"code": "manage_users", "description": "Add/Edit/Delete Users"},
        {"code": "assign_roles", "description": "Assign User Roles"},
        # Settings
        {"code": "manage_settings", "description": "Manage Application Settings"},
        {"code": "view_audit_logs", "description": "View Audit Logs"},
        # Data Management
        {"code": "export_all", "description": "Export All Data"},
        {"code": "import_all", "description": "Import All Data"},
        # Reports
        {"code": "view_reports", "description": "View Reports"},
        {"code": "export_reports", "description": "Export Reports"},
        # Loyalty
        {"code": "view_loyalty", "description": "View Loyalty Program"},
        {"code": "manage_loyalty", "description": "Manage Loyalty Program"},
        # Support
        {"code": "view_support", "description": "View Support"},
    ]

    print("Populating Permissions...")
    created_perms = []
    for p_data in permissions_list:
        perm, created = Permission.objects.get_or_create(
            code=p_data["code"],
            defaults={"description": p_data["description"]}
        )
        if created:
            print(f"  Created permission: {perm.code}")
        created_perms.append(perm)

    # Roles
    owner_role, _ = Role.objects.get_or_create(name="OWNER", defaults={"description": "Business Owner"})
    sales_role, _ = Role.objects.get_or_create(name="SALES_EXECUTIVE", defaults={"description": "Sales Staff"})
    super_role, _ = Role.objects.get_or_create(name="SUPERADMIN", defaults={"description": "Super Administrator"})

    # Assign ALL to OWNER
    print(f"Assigning all permissions to {owner_role.name}...")
    for perm in created_perms:
        RolePermission.objects.get_or_create(role=owner_role, permission=perm)

    # Assign ALL to SUPERADMIN
    print(f"Assigning all permissions to {super_role.name}...")
    for perm in created_perms:
        RolePermission.objects.get_or_create(role=super_role, permission=perm)

    # Assign subset to SALES_EXECUTIVE
    sales_perms_codes = [
        "view_pos", "manage_pos", 
        "view_customers", "manage_customers", 
        "view_invoices", "manage_invoices",
        "view_support"
    ]
    print(f"Assigning limited permissions to {sales_role.name}...")
    for perm in created_perms:
        if perm.code in sales_perms_codes:
            RolePermission.objects.get_or_create(role=sales_role, permission=perm)

    print("Done!")

if __name__ == "__main__":
    initialize()
