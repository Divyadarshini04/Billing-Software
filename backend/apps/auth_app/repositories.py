from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import OTP
from django.db import transaction

User = get_user_model()

class UserRepository:
    @staticmethod
    def get_user_by_phone(phone):
        try:
            return User.objects.get(phone=phone)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user_by_credential(credential):
        """Find user by phone or email."""
        user = User.objects.filter(phone=credential).first()
        if not user:
            user = User.objects.filter(email=credential).first()
        return user

class OTPRepository:
    @staticmethod
    def get_active_otp(phone, code):
        """Fetch an active, non-expired OTP atomically."""
        now = timezone.now()
        # Note: We use select_for_update in the service's atomic transaction if needed
        return OTP.objects.filter(
            phone=phone, 
            code=code, 
            used=False, 
            expires_at__gte=now
        ).first()

    @staticmethod
    def invalidate_previous_otps(phone):
        """Invalidate all previous active OTPs for a phone number."""
        now = timezone.now()
        return OTP.objects.filter(
            phone=phone, 
            used=False, 
            expires_at__gt=now
        ).update(expires_at=now)

    @staticmethod
    def clear_old_otps():
        """Delete expired and used OTPs."""
        return OTP.delete_old()

    @staticmethod
    def create_otp(phone, expires_minutes):
        """Create a new OTP."""
        return OTP.objects.create_otp(phone=phone, expires_minutes=expires_minutes)
