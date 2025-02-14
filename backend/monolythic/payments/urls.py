from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.SubscriptionPlanViewSet, basename='plan')
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/', views.payment_webhook, name='payment-webhook'),
    path('plans/<str:plan_id>/payment-link/', views.PaymentLinkView.as_view(), name='plan-payment'),  # Changed from payment/ to payment-link/
    path('payment-success/', views.payment_success, name='payment-success'),
]
