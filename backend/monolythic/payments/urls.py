from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.SubscriptionPlanViewSet)
router.register(r'subscriptions', views.SubscriptionViewSet, basename='subscription')
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/', views.payment_webhook, name='payment-webhook'),
]
