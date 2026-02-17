from .models import SubscriptionPlan, UserSubscription
from django.utils import timezone

class SubscriptionRepository:
    @staticmethod
    def get_plan_by_code(code):
        try:
            return SubscriptionPlan.objects.get(code=code)
        except SubscriptionPlan.DoesNotExist:
            return None

    @staticmethod
    def get_plan_by_id(plan_id):
        try:
            return SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return None

    @staticmethod
    def get_all_plans():
        return SubscriptionPlan.objects.all()

    @staticmethod
    def get_active_subscription(user):
        """Get current active subscription for a user."""
        return UserSubscription.objects.filter(user=user, status='ACTIVE').first()

    @staticmethod
    def get_subscription_by_user(user):
        """Get any subscription record for a user."""
        return UserSubscription.objects.filter(user=user).first()

    @staticmethod
    def get_expired_trials(trial_plan_code, cutoff_date=None):
        """Find expired trials for a specific plan code."""
        if cutoff_date is None:
            cutoff_date = timezone.now()
            
        return UserSubscription.objects.filter(
            plan__code=trial_plan_code,
            status='EXPIRED',
            end_date__lte=cutoff_date
        )

    @staticmethod
    def update_or_create_subscription(user, plan, **kwargs):
        subscription, created = UserSubscription.objects.update_or_create(
            user=user,
            defaults={
                'plan': plan,
                **kwargs
            }
        )
        return subscription, created

    @staticmethod
    def create_subscription(user, plan, **kwargs):
        return UserSubscription.objects.create(
            user=user,
            plan=plan,
            **kwargs
        )
