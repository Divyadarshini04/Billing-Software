from datetime import timedelta
from django.utils import timezone
from .repositories import SubscriptionRepository
from .serializers import UserSubscriptionSerializer
import logging

logger = logging.getLogger(__name__)

class SubscriptionService:
    @classmethod
    def assign_trial(cls, user):
        """Assign free trial to a user if eligible."""
        if SubscriptionRepository.get_subscription_by_user(user):
            return None, "User already has a subscription history"

        free_plan = SubscriptionRepository.get_plan_by_code("FREE")
        if not free_plan:
            return None, "Free plan configuration missing"

        subscription = SubscriptionRepository.create_subscription(
            user=user,
            plan=free_plan,
            status="ACTIVE"
            # Note: start_date and end_date are handled by model save or defaults if any
        )
        return UserSubscriptionSerializer(subscription).data, None

    @classmethod
    def auto_upgrade_trials(cls, admin_user):
        """Auto-upgrade expired trials to BASIC plan."""
        if not (admin_user.is_super_admin or admin_user.is_superuser):
            return None, "Only admins can trigger auto-upgrades"

        free_trial_plan = SubscriptionRepository.get_plan_by_code('FREE')
        basic_plan = SubscriptionRepository.get_plan_by_code('BASIC')

        if not free_trial_plan or not basic_plan:
            return None, "Required subscription plans (FREE or BASIC) not found"

        expired_trials = SubscriptionRepository.get_expired_trials('FREE')
        
        upgraded_count = 0
        upgraded_users = []
        
        for subscription in expired_trials:
            try:
                subscription.plan = basic_plan
                subscription.status = 'ACTIVE'
                subscription.start_date = timezone.now()
                subscription.end_date = timezone.now() + timedelta(days=basic_plan.duration_days)
                subscription.auto_renew = False
                subscription.save()

                upgraded_count += 1
                upgraded_users.append({
                    'phone': subscription.user.phone,
                    'name': f"{subscription.user.first_name} {subscription.user.last_name}".strip(),
                    'new_plan': basic_plan.name
                })
            except Exception as e:
                logger.error(f"Failed to auto-upgrade user {subscription.user.phone}: {str(e)}")

        return {
            'upgraded_count': upgraded_count,
            'upgraded_users': upgraded_users
        }, None

    @classmethod
    def get_user_subscription(cls, user):
        """Get active subscription for a user."""
        subscription = SubscriptionRepository.get_active_subscription(user)
        if not subscription:
            return None, "No active subscription found"
        return UserSubscriptionSerializer(subscription).data, None

    @classmethod
    def upgrade_subscription(cls, user, plan_id, payment_data=None):
        """Upgrade user to a new plan."""
        plan = SubscriptionRepository.get_plan_by_id(plan_id)
        if not plan:
            return None, "Plan not found"

        start_date = timezone.now()
        if plan.duration_days == 0:  # Unlimited
            end_date = start_date + timedelta(days=365*10)
        else:
            end_date = start_date + timedelta(days=plan.duration_days)

        payment_method = payment_data.get('payment_method') if payment_data else None
        payment_details = payment_data.get('payment_details', {}) if payment_data else {}

        subscription, _ = SubscriptionRepository.update_or_create_subscription(
            user=user,
            plan=plan,
            status='ACTIVE',
            start_date=start_date,
            end_date=end_date,
            auto_renew=False,
            payment_method=payment_method,
            payment_details=payment_details
        )
        
        return UserSubscriptionSerializer(subscription).data, None

    @classmethod
    def cancel_subscription(cls, user):
        """Cancel user's active subscription."""
        subscription = SubscriptionRepository.get_active_subscription(user)
        
        if not subscription and user.parent is None:
            # Check if any staff has it? Legacy logic had this but it was commented out in views too.
            # Sticking to views.py behavior.
            pass

        if not subscription:
            return None, "No active subscription record found."

        if subscription.status != 'ACTIVE':
            return UserSubscriptionSerializer(subscription).data, f"Subscription is already {subscription.status}"

        subscription.status = 'CANCELLED'
        subscription.auto_renew = False
        subscription.save()
            
        return UserSubscriptionSerializer(subscription).data, None
