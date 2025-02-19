from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, PasswordResetView, CheckEmailExistsView, ValidatePhoneNumberView, VerifyCodeView, VerifyPasswordView, VerifyEmailView, ResendVerificationEmailView, PasswordResetConfirmView, UserStatsView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('accounts/', include([
        path('', include(router.urls)),
        path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
        path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
        path('check-email/<str:email>/', CheckEmailExistsView.as_view(), name='check-email'),
        path('validate-phone/', ValidatePhoneNumberView.as_view(), name='validate-phone'),
        path('verify-code/<str:code>/', VerifyCodeView.as_view(), name='verify-code'),
        path('verify-password/', VerifyPasswordView.as_view(), name='verify-password'),
        path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
        path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend-verification-email'),
    ])),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    # path('', include(router.urls)),
    # path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    # path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    # path('check-email/<str:email>/', CheckEmailExistsView.as_view(), name='check-email'),
    # path('validate-phone/', ValidatePhoneNumberView.as_view(), name='validate-phone'),
    # path('verify-code/<str:code>/', VerifyCodeView.as_view(), name='verify-code'),
    # path('verify-password/', VerifyPasswordView.as_view(), name='verify-password'),
    # path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    # path('resend-verification-email/', ResendVerificationEmailView.as_view(), name='resend-verification-email'),
]
