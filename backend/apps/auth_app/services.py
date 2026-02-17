import jwt
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.contrib.auth.models import update_last_login
from .repositories import OTPRepository, UserRepository
from .serializers import UserMinimalSerializer

logger = logging.getLogger(__name__)
audit_logger = logging.getLogger('audit')

class AuthService:
    OTP_EXPIRY_MINUTES = getattr(settings, "OTP_EXPIRES_MINUTES", 5)
    RATE_LIMIT_KEY = "otp_rate_{phone}"
    RATE_LIMIT_WINDOW = 60 * 60  # 1 hour
    MAX_OTP_PER_HOUR = getattr(settings, "OTP_MAX_PER_HOUR", 5)
    JWT_EXPIRY_SECONDS = getattr(settings, "JWT_EXPIRY_SECONDS", 86400)

    @classmethod
    def send_otp(cls, phone):
        """Handle OTP generation and rate limiting."""
        # 1. Rate Limiting
        cache_key = cls.RATE_LIMIT_KEY.format(phone=phone)
        counter = cache.get(cache_key, 0)
        if counter >= cls.MAX_OTP_PER_HOUR:
            logger.warning(f"OTP rate limit exceeded for phone: {phone}")
            return None, "Rate limit exceeded. Try again later."
        cache.set(cache_key, counter + 1, cls.RATE_LIMIT_WINDOW)

        # 2. User Status Check
        user = UserRepository.get_user_by_phone(phone)
        if user and not user.is_active:
            return None, "Your account is deactivated. Please contact the admin."

        # 3. Cleanup and Invalidate previous
        OTPRepository.clear_old_otps()
        OTPRepository.invalidate_previous_otps(phone)

        # 4. Create new OTP
        otp = OTPRepository.create_otp(phone, cls.OTP_EXPIRY_MINUTES)
        audit_logger.info(f"OTP send request: phone={phone}")

        return otp, None

    @classmethod
    def verify_otp(cls, phone, code, requested_role=None):
        """Verify OTP, validate role, and generate token."""
        # 1. Brute-force protection
        verify_attempts_key = f"otp_verify_attempts_{phone}_{code}"
        verify_lock_key = f"otp_verify_lock_{phone}_{code}"
        
        if cache.get(verify_lock_key):
            return None, "Too many failed attempts. Please try again later."
        
        max_attempts = getattr(settings, "OTP_MAX_VERIFY_ATTEMPTS", 5)
        verify_attempts = cache.get(verify_attempts_key, 0)
        
        if verify_attempts >= max_attempts:
            lock_duration = getattr(settings, "OTP_LOCK_DURATION_SECONDS", 300)
            cache.set(verify_lock_key, True, lock_duration)
            return None, "Too many failed attempts. Please try again later."

        # 2. Verify OTP atomically
        otp_obj = None
        try:
            with transaction.atomic():
                otp_obj = OTPRepository.get_active_otp(phone, code)
                if otp_obj:
                    otp_obj.mark_used()
                else:
                    raise Exception("Invalid or expired OTP")
        except Exception as e:
            cache.set(verify_attempts_key, verify_attempts + 1, 3600)
            logger.warning(f"OTP verification failed: phone={phone}, attempt={verify_attempts + 1}")
            return None, str(e)

        # 3. Clear attempt counter
        cache.delete(verify_attempts_key)
        cache.delete(verify_lock_key)

        # 4. Get User
        user = UserRepository.get_user_by_phone(phone)
        if not user:
            return None, "User not found. Please contact your administrator."
        
        if not user.is_active:
            return None, "User account is inactive"

        # Subscription check for Sales Executives
        if requested_role == "SALES_EXECUTIVE" and user.parent:
            owner = user.parent
            try:
                subscription = owner.subscription
                if not subscription or subscription.status != 'ACTIVE' or not subscription.is_active():
                     return None, "Your plan has expired. Please contact your Owner to upgrade the subscription."
            except Exception:
                return None, "Your plan has expired. Please contact your Owner to upgrade the subscription."

        # 5. Role Validation
        if requested_role:
            has_role = cls._validate_role(user, requested_role)
            if not has_role:
                logger.warning(f"Role mismatch for user {phone}. Requested: {requested_role}")
                return None, f"Access Denied: You are not authorized as {requested_role}."

        # 6. Success
        audit_logger.info(f"OTP verified successfully: phone={phone}, user_id={user.id}")
        update_last_login(None, user)
        token = cls._generate_token(user)
        
        return {
            "token": token,
            "user": UserMinimalSerializer(user).data
        }, None

    @classmethod
    def login_with_password(cls, credential, password, requested_role=None):
        """Handle traditional login."""
        user = UserRepository.get_user_by_credential(credential)
        
        if not user or not user.check_password(password):
            return None, "Invalid credentials"
        
        if not user.is_active:
            return None, "User account is inactive"

        # Subscription check for Sales Executives
        if requested_role == "SALES_EXECUTIVE" and user.parent:
            owner = user.parent
            try:
                subscription = owner.subscription
                if not subscription or subscription.status != 'ACTIVE' or not subscription.is_active():
                     return None, "Your plan has expired. Please contact your Owner to upgrade the subscription."
            except Exception:
                return None, "Your plan has expired. Please contact your Owner to upgrade the subscription."

        if requested_role:
            has_role = cls._validate_role(user, requested_role)
            if not has_role:
                return None, f"Access Denied: You are not authorized as {requested_role}."

        update_last_login(None, user)
        token = cls._generate_token(user)
        return {
            "token": token,
            "user": UserMinimalSerializer(user).data
        }, None

    @classmethod
    def lookup_user(cls, phone):
        """Lookup user details by phone number."""
        user = UserRepository.get_user_by_phone(phone)
        if not user:
            return None, "User not found"
        if not user.is_active:
            return None, "User is inactive"
            
        return {
            "found": True,
            "name": user.first_name,
            "id": user.id
        }, None

    @staticmethod
    def _validate_role(user, requested_role):
        """Strict Role Validation Logic."""
        if requested_role == "SUPERADMIN":
            return user.is_super_admin or user.user_roles.filter(role__name="SUPERADMIN").exists()
        
        elif requested_role == "OWNER":
            # Owner must be root and not super admin
            if user.parent is None and not user.is_super_admin:
                return True
            return user.user_roles.filter(role__name="OWNER").exists() and user.parent is None
            
        elif requested_role == "SALES_EXECUTIVE":
            # Sales Executive must have a parent AND the role assigned
            if user.parent is None:
                return False
            return user.user_roles.filter(role__name="SALES_EXECUTIVE").exists()
            
        # Generic role check
        return user.user_roles.filter(role__name=requested_role).exists()

    @classmethod
    def _generate_token(cls, user):
        payload = {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(seconds=cls.JWT_EXPIRY_SECONDS),
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    @classmethod
    def reset_password(cls, phone, code, new_password):
        """Reset password using verified OTP."""
        # This basically combines verify_otp logic with password set
        
        otp_obj = OTPRepository.get_active_otp(phone, code)
        if not otp_obj:
            return None, "Invalid or expired OTP"
            
        user = UserRepository.get_user_by_phone(phone)
        if not user:
            return None, "User not found"
            
        if not user.is_active:
            return None, "User account is inactive"

        try:
            with transaction.atomic():
                otp_obj.mark_used()
                user.set_password(new_password)
                user.save()
                
                # Log this critical action
                audit_logger.info(f"Password reset successfully for user: {phone} ({user.id})")
                
                return True, None
        except Exception as e:
            logger.error(f"Error resetting password for {phone}: {e}")
            return None, "An error occurred while resetting password"
