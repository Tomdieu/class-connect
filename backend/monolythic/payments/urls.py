from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.SubscriptionPlanViewSet, basename='plan')
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'transactions', views.TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    
    # CamPay routes
    path('webhook/', views.payment_webhook, name='payment-webhook'),
    path('plans/<str:plan_id>/payment-link/', views.PaymentLinkView.as_view(), name='plan-payment'),
    path('payment-success/', views.payment_success, name='payment-success'),
    
    # FreemoPay routes
    path('freemo/webhook/', views.freemo_payment_webhook, name='freemo-payment-webhook'),
    path('freemo/plans/<str:plan_id>/payment-link/', views.FreemoPayLinkView.as_view(), name='freemo-plan-payment'),
    path('freemo/payment-status/<str:reference>/', views.freemo_payment_status, name='freemo-payment-status'),
    path('freemo/token/', views.generate_freemo_token, name='freemo-generate-token'),
    
    # Common routes
    path('current-plan/', views.CurrentSubscriptionView.as_view(), name='current-plan'),
    path('subscription-history/', views.SubscriptionHistoryView.as_view(), name='subscription-history'),
]
