from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import BadHeaderError, send_mail
from .models import User, UserPasswordResetToken
from .serializers import (UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer,PasswordResetSerializer,PasswordResetConfirmSerializer,VerifyPasswordSerializer,PhoneNumberValidationSerializer)
from .filters import UserFilter
from rest_framework.permissions import IsAuthenticated,AllowAny
from social_django.models import UserSocialAuth
from django.conf import settings
from rest_framework import generics, status
import datetime
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from django.utils import timezone
from django.contrib.auth.hashers import check_password

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_class = UserFilter
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        email = request.data.get('email')
        user = get_object_or_404(User, email=email)
        user.email_verified = True
        user.save()
        return Response({'status': 'email verified'})

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.data.get("current_password")):
                return Response({"current_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({'status': 'password set'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def info(self, request):
        user = request.user
        serializer = UserSerializer(user,context={'request': request})
        return Response(serializer.data)

class PasswordResetView(generics.CreateAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [AllowAny]

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
        if UserSocialAuth.objects.filter(user=user, provider='google-oauth2').exists():
            return Response(
                {"error": "La réinitialisation du mot de passe n'est pas autorisée pour les comptes Google."},
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
                fail_silently=False  # Set to False to catch exceptions
            )
        except BadHeaderError:
            return Response(
                {"error": "L'envoi de l'e-mail a échoué en raison d'un problème d'en-tête."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {"error": f"L'envoi de l'e-mail a échoué. Veuillez réessayer plus tard. Détails: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"success": "Le code de réinitialisation du mot de passe a été envoyé à votre adresse e-mail."},
            status=status.HTTP_200_OK,
        )


class CheckEmailExistsView(APIView):

    permission_classes = [AllowAny]

    def get(self,request,email):

        exists = User.objects.filter(email=email).exists()

        return Response({"exists":exists})
    
class ValidatePhoneNumberView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=PhoneNumberValidationSerializer)
    def post(self, request, *args, **kwargs):
        serializer = PhoneNumberValidationSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"valid": True}, status=status.HTTP_200_OK)
        return Response({"valid":False}, status=status.HTTP_200_OK)
    
class VerifyCodeView(APIView):
    permission_classes = [AllowAny]

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
    @swagger_auto_schema(request_body=VerifyPasswordSerializer)
    def post(self,request):

        password = request.data.get('password')
        user = request.user
        valid = False

        if check_password(password,user.password)   :
            valid = True

        return Response({"valid":valid})
