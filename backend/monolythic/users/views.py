from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from .models import User, UserPasswordResetToken, UserActivityLog
from .serializers import (
    PasswordResetConfirmSerializer,
    PhoneNumberValidationSerializer,
    UserActivityLogSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    ChangePasswordSerializer,
    PasswordResetSerializer,
    VerifyPasswordSerializer,
)

from .filters import UserFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from social_django.models import UserSocialAuth
from django.conf import settings
from rest_framework import generics
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
from .tasks.task import send_async_mail
from django_filters.rest_framework import DjangoFilterBackend

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.db.models.functions import ExtractMonth
from django.db.models import Count
from datetime import datetime,timedelta
import logging
from utils.mixins import ActivityLoggingMixin

from django.db.models import Sum, F,Q
from payments.models import Subscription

logger = logging.getLogger(__name__)


class UserViewSet(ActivityLoggingMixin,viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_class = UserFilter
    filter_backends = [DjangoFilterBackend]
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
        # return super().create(request, *args, **kwargs)
        response = super().create(request, *args, **kwargs)
        self.log_activity(self.request,"Created a new user", {"email": request.data.get("email")})
        return response

    @swagger_auto_schema(tags=["Users"])
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        self.log_activity(self.request,"Updated user details", {"user_id": kwargs.get("pk")})
        return response

    @swagger_auto_schema(tags=["Users"])
    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        self.log_activity(self.request,"Partially updated user", {"user_id": kwargs.get("pk")})
        return response

    @swagger_auto_schema(tags=["Users"])
    def destroy(self, request, *args, **kwargs):
        user_id = kwargs.get("pk")
        self.log_activity(self.request,"Deleted a user", {"user_id": user_id})
        return super().destroy(request, *args, **kwargs)
    
    # With cookie: cache requested url for each user for 2 hours
    @swagger_auto_schema(tags=["Users"])
    def list(self, request, *args, **kwargs):
        self.log_activity(self.request,"Viewed list of users")   
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(tags=["Users"])
    def retrieve(self, request, *args, **kwargs):
        self.log_activity(self.request,"Viewed user details", {"user_id": kwargs.get("pk")})
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
    @action(detail=True, methods=["post"], url_path='change-password')
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.data.get("current_password")):
                self.log_activity(self.request,"Failed password change attempt", {"user_id": pk})
                return Response(
                    {"current_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.data.get("new_password"))
            user.save()
            self.log_activity(self.request,"Changed password", {"user_id": pk})
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
        self.log_activity(self.request,"Viewed user information", {"user_id": str(user.id)})
        return Response(serializer.data)

    @swagger_auto_schema(
        tags=["Users"],
        responses={
            200: openapi.Response(
                description="User statistics",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        "total_students": openapi.Schema(type=openapi.TYPE_INTEGER),
                        "total_professionals": openapi.Schema(type=openapi.TYPE_INTEGER),
                        "total_admins": openapi.Schema(type=openapi.TYPE_INTEGER),
                    }
                )
            )
        }
    )
    @action(detail=False, methods=["get"])
    def stats(self, request):
        # Get counts for different user types
        
        # Count students (users with user_type STUDENT)
        # Exclude staff and superusers
        total_students = User.objects.filter(
            user_type='STUDENT',
            is_staff=False,
            is_superuser=False
        ).count()
        
        # Count professionals (users with user_type PROFESSIONAL)
        # Exclude staff and superusers
        total_professionals = User.objects.filter(
            user_type='PROFESSIONAL',
            is_staff=False,
            is_superuser=False
        ).count()
        
        # Count admins (users who are staff OR superusers)
        total_admins = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).count()
        
        # Total users
        total_users = User.objects.count()
        # Return the statistics
        data = {
            'total_students': total_students,
            'total_professionals': total_professionals,
            'total_admins': total_admins,
            'total_users': total_users,
        }
        self.log_activity(self.request,"Retrieved user statistics")
        return Response(data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        user = serializer.save()
        self.log_activity(self.request,"Created a new user account", {"user_id": str(user.id), "email": user.email})

        # Email verification is wrapped in try-except and won't break user creation
        try:
            token = generate_signed_token(user.email)
            verification_url = (
                f"{settings.FRONTEND_HOST}{reverse('verify-email', args=[token])}"
            )

            # Prepare email content
            subject = "Verify your email address"
            message_en = f"Hello {user.first_name},\n\nPlease verify your email address by clicking the link below:\n{verification_url}\n\nThank you!"
            message_fr = f"Bonjour {user.first_name},\n\nVeuillez vérifier votre adresse e-mail en cliquant sur le lien ci-dessous:\n{verification_url}\n\nMerci!"
            message = f"{message_en}\n\n{message_fr}"

            # Queue email with error handling
            send_async_mail.delay(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True
            )
        except Exception as e:
            # Just log the error and continue - don't let email issues affect user creation
            logger.error(f"Error in verification email process: {str(e)}")

    def perform_update(self, serializer):
        user = serializer.save()
        self.log_activity(self.request,"Updated user account details", {"user_id": str(user.id)})

    def perform_destroy(self, instance):
        user_id = instance.id
        self.log_activity(self.request,"Deleted a user account", {"user_id": str(user_id)})
        instance.delete()


class VerifyEmailView(ActivityLoggingMixin,APIView):
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

            self.log_activity(request,"Verify email",{'user_id':str(user.id)})

            return Response(
                {"message": "Email verified successfully"}, status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetView(ActivityLoggingMixin,generics.CreateAPIView):
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
            # Queue email with error handling
            send_async_mail.delay(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=True
            )
        except Exception as e:
            # Just log the error and continue - don't let email issues affect password reset
            logger.error(f"Error queuing password reset email: {str(e)}")

        self.log_activity(request, "Demande de réinitialisation du mot de passe")

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

        # Calculate the datetime 15 minutes ago
        fifteen_minutes_ago = current_datetime - timedelta(minutes=15)

        # Filter UserPasswordResetToken objects with created_at >= 15 minutes ago
        exists = UserPasswordResetToken.objects.filter(
            code=code, reset_at=None, created_at__gte=fifteen_minutes_ago
        ).exists()

        return Response({"exists": exists})


class VerifyPasswordView(ActivityLoggingMixin,generics.CreateAPIView):
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

        self.log_activity(request,"Verifying password",{'user_id':str(user.id)})

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
                f"{settings.FRONTEND_HOST}{reverse('verify-email', args=[token])}"
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


class UserStatsView(ActivityLoggingMixin, APIView):
    permission_classes = [IsAuthenticated]
    swagger_tags = ["Users Stats"]

    @swagger_auto_schema(
        tags=["Users Stats"],
        responses={
            200: openapi.Response(
                description="Dashboard statistics",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'total_users': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'user_growth': openapi.Schema(type=openapi.TYPE_STRING),
                        'monthly_revenue': openapi.Schema(type=openapi.TYPE_NUMBER),
                        'revenue_growth': openapi.Schema(type=openapi.TYPE_STRING),
                        'conversion_rate': openapi.Schema(type=openapi.TYPE_NUMBER),
                        'conversion_growth': openapi.Schema(type=openapi.TYPE_STRING),
                        'monthly_stats': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'month': openapi.Schema(type=openapi.TYPE_STRING),
                                    'users': openapi.Schema(type=openapi.TYPE_INTEGER),
                                }
                            )
                        )
                    }
                )
            )
        }
    )
    def get(self, request):
        current_year = datetime.now().year
        current_month = datetime.now().month
        last_month = (current_month - 1) if current_month > 1 else 12
        current_time = timezone.now()
        
        # Users statistics
        total_users = User.objects.count()
        users_last_month = User.objects.filter(
            date_joined__year=current_year,
            date_joined__month=last_month
        ).count()
        users_this_month = User.objects.filter(
            date_joined__year=current_year,
            date_joined__month=current_month
        ).count()
        user_growth = self.calculate_growth(users_last_month, users_this_month)

        # Updated Revenue statistics using subscription plan prices
        monthly_revenue = Subscription.objects.filter(
            created_at__year=current_year,
            created_at__month=current_month,
            is_active=True,
            end_date__gt=current_time
        ).annotate(
            plan_price=F('plan__price')  # Get price from related SubscriptionPlan
        ).aggregate(
            total=Sum('plan_price', default=0)
        )['total'] or 0
        
        last_month_revenue = Subscription.objects.filter(
            created_at__year=current_year,
            created_at__month=last_month,
            is_active=True,
            end_date__gt=current_time
        ).annotate(
            plan_price=F('plan__price')  # Get price from related SubscriptionPlan
        ).aggregate(
            total=Sum('plan_price', default=0)
        )['total'] or 0
        
        revenue_growth = self.calculate_growth(last_month_revenue, monthly_revenue)  # Calculate revenue growth here

        # Conversion rate statistics
        visits_this_month = User.objects.filter(
            last_login__year=current_year,
            last_login__month=current_month
        ).count()
        
        purchases_this_month = Subscription.objects.filter(
            created_at__year=current_year,
            created_at__month=current_month,
            is_active=True,
            end_date__gt=current_time
        ).values('user').distinct().count()
        
        # Calculate last month's conversion rate for growth
        visits_last_month = User.objects.filter(
            last_login__year=current_year,
            last_login__month=last_month
        ).count()
        
        purchases_last_month = Subscription.objects.filter(
            created_at__year=current_year,
            created_at__month=last_month,
            is_active=True,
            end_date__gt=current_time
        ).values('user').distinct().count()
        
        conversion_rate = round((purchases_this_month / visits_this_month * 100) if visits_this_month > 0 else 0, 2)
        last_month_conversion = (purchases_last_month / visits_last_month * 100) if visits_last_month > 0 else 0
        conversion_growth = self.calculate_growth(last_month_conversion, conversion_rate)

        # Monthly user statistics (existing code)
        monthly_stats = User.objects.filter(
            date_joined__year=current_year
        ).annotate(
            month=ExtractMonth('date_joined')
        ).values('month').annotate(
            users=Count('id')
        ).order_by('month')

        # French month names (existing code)
        month_names = {
            1: 'Jan', 2: 'Fév', 3: 'Mar', 4: 'Avr',
            5: 'Mai', 6: 'Juin', 7: 'Juil', 8: 'Août',
            9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Déc'
        }

        monthly_data = [
            {
                'month': month_names[stat['month']],
                'users': stat['users']
            }
            for stat in monthly_stats
        ]

        self.log_activity(request, "Retrieved user dashboard statistics")

        return Response({
            'total_users': total_users,
            'user_growth': user_growth,
            'monthly_revenue': float(monthly_revenue),
            'revenue_growth': revenue_growth,
            'conversion_rate': conversion_rate,
            'conversion_growth': conversion_growth,
            'monthly_stats': monthly_data
        })

    def calculate_growth(self, previous, current):
        if previous == 0:
            return '+0%' if current == 0 else '+100%'
        growth = ((current - previous) / previous) * 100
        return f"{'+' if growth >= 0 else ''}{growth:.1f}%"


class UserActivityLogViewSet(ActivityLoggingMixin, viewsets.ReadOnlyModelViewSet):
    """
    A viewset that provides `list` and `retrieve` actions for UserActivityLog.
    Allows filtering by user.
    """
    permission_classes = [IsAuthenticated]
    queryset = UserActivityLog.objects.all()
    serializer_class = UserActivityLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']
    
    def list(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed user activity logs")
        return super().list(request, *args, **kwargs)
        
    def retrieve(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed specific activity log", {"log_id": kwargs.get("pk")})
        return super().retrieve(request, *args, **kwargs)
