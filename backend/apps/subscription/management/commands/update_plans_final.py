from django.core.management.base import BaseCommand
from apps.subscription.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Seeds the database with finalized subscription plans'

    def handle(self, *args, **kwargs):
        plans = [
            {
                "code": "free_trial",
                "name": "Trial Plan",
                "price": 0,
                "duration_days": 7,
                "max_staff_users": 5,
                "business_limit": "1",
                "branch_limit": "1",
                "invoice_limit": "300",
                "product_limit": "100",
                "customer_limit": "100",
                "description": "Best for: Trying the software with real staff",
                "features": [
                    "GST / Tax",
                    "Inventory (Basic)",
                    "Daily Sales Report"
                ]
            },
            # Basic Plan
            {
                "code": "basic_monthly",
                "name": "Basic Plan (Monthly)",
                "price": 699,
                "duration_days": 30,
                "max_staff_users": 8,
                "business_limit": "1",
                "branch_limit": "1",
                "invoice_limit": "Unlimited",
                "product_limit": "500",
                "customer_limit": "Unlimited",
                "description": "Best for: Regular small shops",
                "features": [
                    "GST / Multiple Tax Slabs",
                    "Complete Inventory Management",
                    "Daily Sales Report",
                    "Monthly Sales Report"
                ]
            },
            {
                "code": "basic_yearly",
                "name": "Basic Plan (Yearly)",
                "price": 6999,
                "duration_days": 365,
                "max_staff_users": 8,
                "business_limit": "1",
                "branch_limit": "1",
                "invoice_limit": "Unlimited",
                "product_limit": "500",
                "customer_limit": "Unlimited",
                "description": "Best for: Regular small shops (Yearly Savings)",
                "features": [
                    "GST / Multiple Tax Slabs",
                    "Complete Inventory Management",
                    "Daily Sales Report",
                    "Monthly Sales Report"
                ]
            },
            # Standard Plan
            {
                "code": "standard_monthly",
                "name": "Standard Plan (Monthly)",
                "price": 1999,
                "duration_days": 30,
                "max_staff_users": 15,
                "business_limit": "1",
                "branch_limit": "3",
                "invoice_limit": "Unlimited",
                "product_limit": "Unlimited",
                "customer_limit": "Unlimited",
                "description": "Best for: Growing businesses",
                "features": [
                    "Low stock alerts",
                    "Daily / Monthly Sales",
                    "Product-wise Report",
                    "Staff-wise Report",
                    "Invoice Branding",
                    "Data Export (PDF / Excel)",
                    "Support: Chat / Email"
                ]
            },
            {
                "code": "standard_yearly",
                "name": "Standard Plan (Yearly)",
                "price": 19999,
                "duration_days": 365,
                "max_staff_users": 15,
                "business_limit": "1",
                "branch_limit": "3",
                "invoice_limit": "Unlimited",
                "product_limit": "Unlimited",
                "customer_limit": "Unlimited",
                "description": "Best for: Growing businesses (Yearly Savings)",
                "features": [
                    "Low stock alerts",
                    "Daily / Monthly Sales",
                    "Product-wise Report",
                    "Staff-wise Report",
                    "Invoice Branding",
                    "Data Export (PDF / Excel)",
                    "Support: Chat / Email"
                ]
            },
            # Premium Plan
            {
                "code": "premium_monthly",
                "name": "Premium Plan (Monthly)",
                "price": 4999,
                "duration_days": 30,
                "max_staff_users": 0, # Unlimited
                "business_limit": "Multiple",
                "branch_limit": "Unlimited",
                "invoice_limit": "Unlimited",
                "product_limit": "Unlimited",
                "customer_limit": "Unlimited",
                "description": "Best for: Large stores & chains",
                "features": [
                    "Profit & Loss Reports",
                    "Tax Reports",
                    "Role & Permission Control",
                    "Custom Invoice Branding",
                    "Backup & Security",
                    "Priority Support: Phone / WhatsApp"
                ]
            },
            {
                "code": "premium_yearly",
                "name": "Premium Plan (Yearly)",
                "price": 49999,
                "duration_days": 365,
                "max_staff_users": 0, # Unlimited
                "business_limit": "Multiple",
                "branch_limit": "Unlimited",
                "invoice_limit": "Unlimited",
                "product_limit": "Unlimited",
                "customer_limit": "Unlimited",
                "description": "Best for: Large stores & chains (Yearly Savings)",
                "features": [
                    "Profit & Loss Reports",
                    "Tax Reports",
                    "Role & Permission Control",
                    "Custom Invoice Branding",
                    "Backup & Security",
                    "Priority Support: Phone / WhatsApp"
                ]
            }
        ]

        # Use atomic transactions if needed, but here simple loop is fine
        # We also want to mark old plans as inactive if they are not in the new list?
        # For now, just update or create based on code.

        existing_codes = [p['code'] for p in plans]
        SubscriptionPlan.objects.filter(is_active=True).exclude(code__in=existing_codes).update(is_active=False)

        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.update_or_create(
                code=plan_data['code'],
                defaults=plan_data
            )
            status = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{status} plan: {plan.name}"))
