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
from .producer import UserEventPublisher
from .utils import generate_signed_token, verify_signed_token
from django.urls import reverse


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
    @action(detail=True, methods=["post"])
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

    @swagger_auto_schema(tags=["Users"])
    @action(detail=False, methods=["get"])
    def info(self, request):
        user = request.user
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = serializer.save()
        try:
            # Publish user created event
            publisher = UserEventPublisher()
            publisher.publish_user_created(user)
            publisher.close()
        except Exception as e:
            # Log the exception
            print(f"Error publishing user created event: {e}")

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
        try:
            publisher = UserEventPublisher()
            publisher.publish_user_updated(user)
            publisher.close()
        except Exception as e:
            # Log the exception
            print(f"Error publishing user updated event: {e}")

    def perform_destroy(self, instance):
        user_id = instance.id
        instance.delete()
        try:
            publisher = UserEventPublisher()
            publisher.publish_user_deleted(user_id)
            publisher.close()
        except Exception as e:
            # Log the exception
            print(f"Error publishing user deleted event: {e}")


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Email Verification"]

    @swagger_auto_schema(tags=["Email Verification"])
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

    @swagger_auto_schema(tags=["Password Reset"])
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

    @swagger_auto_schema(tags=["Email Verification"])
    def get(self, request, email):

        exists = User.objects.filter(email=email).exists()

        return Response({"exists": exists})


class ValidatePhoneNumberView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Phone Number Validation"]

    @swagger_auto_schema(
        tags=["Phone Number Validation"], request_body=PhoneNumberValidationSerializer
    )
    def post(self, request, *args, **kwargs):
        serializer = PhoneNumberValidationSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"valid": True}, status=status.HTTP_200_OK)
        return Response({"valid": False}, status=status.HTTP_200_OK)


class VerifyCodeView(APIView):
    permission_classes = [AllowAny]
    swagger_tags = ["Password Reset"]

    @swagger_auto_schema(tags=["Password Reset"])
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
        tags=["Password Verification"], request_body=VerifyPasswordSerializer
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
        tags=["Password Reset"], request_body=PasswordResetConfirmSerializer
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
