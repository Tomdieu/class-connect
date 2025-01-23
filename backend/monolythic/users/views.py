from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import BadHeaderError, send_mail
from .models import User, UserPasswordResetToken
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ChangePasswordSerializer,
    PasswordResetSerializer,
    VerifyPasswordSerializer,
    PhoneNumberValidationSerializer,
    PasswordResetConfirmSerializer,
)
from .filters import UserFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from social_django.models import UserSocialAuth
from django.conf import settings
from rest_framework import generics, status
import datetime
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from .utils import generate_signed_token, verify_signed_token
from django.urls import reverse
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from oauth2_provider.models import AccessToken as OAuth2AccessToken
from .models import UserActiveToken
from .middleware import get_current_request, SingleSessionMiddleware


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_class = UserFilter
    swagger_tags = ["Users"]

    def get_permissions(self):
        if self.action in ["create"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == "create":
            return UserRegistrationSerializer
        return UserSerializer

    @swagger_auto_schema(tags=["Users"])
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(tags=["Users"])
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(tags=["Users"])
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(tags=["Users"])
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @swagger_auto_schema(tags=["Users"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(tags=["Users"])
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=["Users"],
        request_body=ChangePasswordSerializer,
        responses={
            200: openapi.Response(
                "Password changed successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"status": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            )
        },
    )
    @action(detail=True, methods=["post"],url_path='change-password')
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.data.get("current_password")):
                return Response(
                    {"current_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"status": "password set"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        tags=["Users"],
        responses={
            200: openapi.Response(
                description="User information retrieved successfully",
                schema=UserSerializer
            )
        }
    )
    @action(detail=False, methods=["get"])
    def info(self, request):
        user = request.user
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = serializer.save()

        try:
            # Generate verification token
            token = generate_signed_token(user.email)
            verification_url = (
                f"{settings.BACKEND_HOST}{reverse('verify-email', args=[token])}"
            )

            # Send verification email
            subject = "Verify your email address"
            message_en = f"Hello {user.first_name},\n\nPlease verify your email address by clicking the link below:\n{verification_url}\n\nThank you!"
            message_fr = f"Bonjour {user.first_name},\n\nVeuillez vérifier votre adresse e-mail en cliquant sur le lien ci-dessous:\n{verification_url}\n\nMerci!"
            message = f"{message_en}\n\n{message_fr}"

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,  # Set to False to catch exceptions
            )
        except Exception as e:
            # Log the exception
            print(f"Error sending verification email: {e}")

    def perform_update(self, serializer):
        user = serializer.save()

    def perform_destroy(self, instance):
        user_id = instance.id
        instance.delete()


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Email Verification"]

    @swagger_auto_schema(
        tags=["Email Verification"],
        responses={
            200: openapi.Response(
                description="Email verified successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "message": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(
                description="Invalid or expired token",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            500: openapi.Response(
                description="Internal server error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
        }
    )
    def get(self, request, token):
        try:
            email = verify_signed_token(token)
            if not email:
                return Response(
                    {"error": "Invalid or expired token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = get_object_or_404(User, email=email)
            user.email_verified = True
            user.save()

            return Response(
                {"message": "Email verified successfully"}, status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetView(generics.CreateAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]
    swagger_tags = ["Password Reset"]

    @swagger_auto_schema(
        tags=["Password Reset"],
        request_body=PasswordResetSerializer,
        responses={
            200: openapi.Response(
                description="Password reset code sent successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "success": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            404: openapi.Response(
                description="Email not found",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(
                description="Password reset not allowed for Google accounts",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            500: openapi.Response(
                description="Internal server error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
        }
    )
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "L'adresse e-mail fournie n'existe pas."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if the user registered with Google
        if UserSocialAuth.objects.filter(user=user, provider="google-oauth2").exists():
            return Response(
                {
                    "error": "La réinitialisation du mot de passe n'est pas autorisée pour les comptes Google."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_password_reset_token = UserPasswordResetToken.objects.create(user=user)

        subject = "Code de réinitialisation du mot de passe"
        message = f"Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe pour l'application E-learning. Veuillez copier le code suivant et le coller dans le champ approprié : {user_password_reset_token.code}\n\nVeuillez noter que ce code expirera dans 15 minutes.\n\nSi vous n'avez pas fait cette demande, veuillez ignorer cet e-mail.\n\nCordialement,\nL'équipe Ongolaphone"

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,  # Set to False to catch exceptions
            )
        except BadHeaderError:
            return Response(
                {
                    "error": "L'envoi de l'e-mail a échoué en raison d'un problème d'en-tête."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {
                    "error": f"L'envoi de l'e-mail a échoué. Veuillez réessayer plus tard. Détails: {str(e)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "success": "Le code de réinitialisation du mot de passe a été envoyé à votre adresse e-mail."
            },
            status=status.HTTP_200_OK,
        )


class CheckEmailExistsView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Email Verification"]

    @swagger_auto_schema(
        tags=["Email Verification"],
        responses={
            200: openapi.Response(
                description="Email existence check result",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "exists": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            )
        }
    )
    def get(self, request, email):

        exists = User.objects.filter(email=email).exists()

        return Response({"exists": exists})


class ValidatePhoneNumberView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Phone Number Validation"]

    @swagger_auto_schema(
        tags=["Phone Number Validation"],
        request_body=PhoneNumberValidationSerializer,
        responses={
            200: openapi.Response(
                description="Phone number validation result",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "valid": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            )
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = PhoneNumberValidationSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"valid": True}, status=status.HTTP_200_OK)
        return Response({"valid": False}, status=status.HTTP_200_OK)


class VerifyCodeView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Password Reset"]

    @swagger_auto_schema(
        tags=["Password Reset"],
        responses={
            200: openapi.Response(
                description="Verification result",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "exists": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            )
        }
    )
    def post(self, request, code):

        current_datetime = timezone.now()

        # Calculate the datetime 4 hours ago
        fiveteen_minutes_ago = current_datetime - datetime.timedelta(minutes=15)

        # Filter UserPasswordResetToken objects with created_at <= 15 minutes ago
        exists = UserPasswordResetToken.objects.filter(
            code=code, reset_at=None, created_at__gte=fiveteen_minutes_ago
        ).exists()

        return Response({"exists": exists})


class VerifyPasswordView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ["Password Verification"]

    @swagger_auto_schema(
        tags=["Password Verification"],
        request_body=VerifyPasswordSerializer,
        responses={
            200: openapi.Response(
                description="Password verification result",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "valid": openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            )
        }
    )
    def post(self, request):

        password = request.data.get("password")
        user = request.user
        valid = False

        if check_password(password, user.password):
            valid = True

        return Response({"valid": valid})


class ResendVerificationEmailView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Email Verification"]

    @swagger_auto_schema(
        tags=["Email Verification"],
        manual_parameters=[
            openapi.Parameter(
                "email",
                openapi.IN_QUERY,
                description="Email address to resend verification",
                type=openapi.TYPE_STRING,
            )
        ],
        responses={
            200: openapi.Response(
                description="Verification email sent successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "message": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(
                description="Bad request",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            500: openapi.Response(
                description="Internal server error",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
        }
    )
    def post(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response(
                {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = get_object_or_404(User, email=email)
            if user.email_verified:
                return Response(
                    {"message": "Email is already verified"}, status=status.HTTP_200_OK
                )

            # Generate verification token
            token = generate_signed_token(user.email)
            verification_url = (
                f"{settings.BACKEND_HOST}{reverse('verify-email', args=[token])}"
            )

            # Send verification email
            subject = "Verify your email address"
            message_en = f"Hello {user.first_name},\n\nPlease verify your email address by clicking the link below:\n{verification_url}\n\nThank you!"
            message_fr = f"Bonjour {user.first_name},\n\nVeuillez vérifier votre adresse e-mail en cliquant sur le lien ci-dessous:\n{verification_url}\n\nMerci!"
            message = f"{message_en}\n\n{message_fr}"

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,  # Set to False to catch exceptions
            )

            return Response(
                {"message": "Verification email sent successfully"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Password Reset"]

    @swagger_auto_schema(
        tags=["Password Reset"],
        request_body=PasswordResetConfirmSerializer,
        responses={
            200: openapi.Response(
                description="Password reset successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "message": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(
                description="Invalid or expired reset code",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "error": openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
        }
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data.get("code")
            new_password = serializer.validated_data.get("new_password")

            try:
                token = UserPasswordResetToken.objects.get(code=code, reset_at=None)
                user = token.user
                user.set_password(new_password)
                user.save()

                token.reset_at = timezone.now()
                token.save()

                return Response(
                    {"message": "Password reset successfully"},
                    status=status.HTTP_200_OK,
                )

            except UserPasswordResetToken.DoesNotExist:
                return Response(
                    {"error": "Invalid or expired reset code"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@receiver(post_save, sender=OAuth2AccessToken)
def update_user_active_token(sender, instance, created, **kwargs):
    if created and instance.user:
        request = get_current_request()
        device_info = SingleSessionMiddleware.get_device_info(request)
        UserActiveToken.objects.update_or_create(
            user=instance.user,
            defaults={
                'token': instance.token,
                **device_info
            }
        )

@receiver(post_delete, sender=OAuth2AccessToken)
def delete_user_active_token(sender, instance, **kwargs):
    if instance.user:
        UserActiveToken.objects.filter(user=instance.user).delete()
