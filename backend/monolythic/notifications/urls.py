from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, EmailNotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)
router.register(r'email-notifications', EmailNotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
