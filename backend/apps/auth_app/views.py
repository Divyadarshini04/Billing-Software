from rest_framework.views import APIView
import logging
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from .serializers import (
    SendOTPSerializer,
    VerifyOTPSerializer,
    UserMinimalSerializer,
    ResetPasswordSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)
from .services import AuthService

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class SendOTP(APIView):
    """Send OTP Controller."""
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        otp, error = AuthService.send_otp(phone)
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST if "expired" not in error else status.HTTP_429_TOO_MANY_REQUESTS)
        
        if "Rate limit" in (error or ""):
            return Response({"detail": error}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Handle specific error status codes
        if error == "Your account is deactivated. Please contact the admin.":
             return Response({"detail": error}, status=status.HTTP_403_FORBIDDEN)

        # DEV ONLY: Return OTP in response (DEBUG mode only)
        if getattr(settings, "DEBUG", False):
            return Response(
                {"detail": "OTP sent", "phone": phone, "otp": otp.code},
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {"detail": "OTP sent successfully"},
            status=status.HTTP_201_CREATED
        )

@method_decorator(csrf_exempt, name='dispatch')
class VerifyOTP(APIView):
    """Verify OTP Controller."""
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        code = serializer.validated_data["code"]
        requested_role = request.data.get("role")

        result, error = AuthService.verify_otp(phone, code, requested_role)
        if error:
            status_code = status.HTTP_400_BAD_REQUEST
            if "not found" in error: status_code = status.HTTP_404_NOT_FOUND
            elif "inactive" in error or "Access Denied" in error or "expired" in error.lower(): status_code = status.HTTP_403_FORBIDDEN
            elif "Too many" in error: status_code = status.HTTP_429_TOO_MANY_REQUESTS
            
            return Response({"detail": error}, status=status_code)

        return Response(
            {
                "detail": "OTP verified successfully",
                "token": result["token"],
                "user": result["user"],
            },
            status=status.HTTP_200_OK
        )

class LoginView(APIView):
    """Traditional Login Controller."""
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def post(self, request):
        credential = request.data.get("phone") or request.data.get("email")
        password = request.data.get("password")
        requested_role = request.data.get("role")
        
        print(f"DEBUG: Login attempt - Credential: {credential}, Role: {requested_role}")
        
        if not credential or not password:
            return Response(
                {"detail": "Phone/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result, error = AuthService.login_with_password(credential, password, requested_role)
        if error:
            print(f"DEBUG: Login failed for {credential}. Error: {error}")
            status_code = status.HTTP_401_UNAUTHORIZED
            if "inactive" in error or "Access Denied" in error or "expired" in error.lower(): status_code = status.HTTP_403_FORBIDDEN
            return Response({"detail": error}, status=status_code)
        
        print(f"DEBUG: Login successful for {credential}")
        return Response(
            {
                "detail": "Login successful",
                "token": result["token"],
                "user": result["user"],
            },
            status=status.HTTP_200_OK
        )

class CurrentUserView(APIView):
    """Get current authenticated user information."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserMinimalSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """Handle user logout."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)

class UserLookupView(APIView):
    """Lookup user Controller."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        if not phone:
            return Response({"detail": "Phone number is required"}, status=status.HTTP_400_BAD_REQUEST)

        result, error = AuthService.lookup_user(phone)
        if error:
            status_code = status.HTTP_404_NOT_FOUND
            if "inactive" in error: status_code = status.HTTP_403_FORBIDDEN
            return Response({"detail": error}, status=status_code)
            
        return Response(result, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordView(APIView):
    """Reset Password Controller."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        success, error = AuthService.reset_password(phone, otp, new_password)
        if error:
            status_code = status.HTTP_400_BAD_REQUEST
            if "Invalid" in error: status_code = status.HTTP_400_BAD_REQUEST
            return Response({"detail": error}, status=status_code)

        return Response({"detail": "Password has been reset successfully. You can now login."}, status=status.HTTP_200_OK)

class ProfileUpdateView(APIView):
    """View to get or update current user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserMinimalSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        logger.debug(f"Profile update request from user {request.user.id}: {request.data}")
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if not serializer.is_valid():
            logger.error(f"Profile update validation failed for user {request.user.id}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            serializer.save()
            logger.info(f"Profile updated successfully for user {request.user.id}")
            return Response({
                "detail": "Profile updated successfully",
                "user": UserMinimalSerializer(request.user, context={'request': request}).data
            })
        except Exception as e:
            logger.exception(f"Error saving profile for user {request.user.id}: {e}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChangePasswordView(APIView):
    """View to change current user's password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"detail": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Password changed successfully"})
