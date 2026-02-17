from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from apps.subscription.models import UserSubscription
from apps.super_admin.models import SystemNotification

class Command(BaseCommand):
    help = "Checks for expired subscriptions and updates their status. Notifies Super Admin and Owner."

    def handle(self, *args, **options):
        now = timezone.now()
        
        # 1. Process Expired Subscriptions
        expired_subs = UserSubscription.objects.filter(
            status="ACTIVE",
            end_date__lt=now
        )
        
        count = expired_subs.count()
        if count > 0:
            self.stdout.write(self.style.SUCCESS(f"Found {count} expired subscriptions."))
            
            for sub in expired_subs:
                # Update status
                sub.status = "EXPIRED"
                sub.save()
                
                # 2. Create notification for Super Admin
                try:
                    SystemNotification.objects.create(
                        title="Plan Expired",
                        message=f"Subscription for {sub.user.first_name or sub.user.phone} ({sub.plan.name}) has expired.",
                        severity="WARNING",
                        related_user=sub.user
                    )
                except Exception as e:
                    self.stderr.write(f"Failed to create Super Admin notification: {str(e)}")
                
                # 3. Notify Owner via Email
                if sub.user.email:
                    try:
                        send_mail(
                            subject="Your Geo Billing Subscription Has Exired",
                            message=(
                                f"Hello {sub.user.first_name or 'there'},\n\n"
                                f"Your subscription for {sub.plan.name} has expired on {sub.end_date.strftime('%Y-%m-%d')}.\n\n"
                                "Please upgrade your plan to continue using the system (POS, Reports, Inventory, etc.).\n\n"
                                "Thank you,\nGeo Billing Team"
                            ),
                            from_email=None,
                            recipient_list=[sub.user.email],
                            fail_silently=True
                        )
                    except Exception as e:
                        self.stderr.write(f"Failed to send email to {sub.user.email}: {str(e)}")
                
            self.stdout.write(self.style.SUCCESS(f"Successfully processed {count} subscriptions."))
        else:
            self.stdout.write("No newly expired subscriptions found.")
