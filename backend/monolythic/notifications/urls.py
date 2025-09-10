from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, EmailNotificationViewSet, ContactViewSet, ContactReplyViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)
router.register(r'email-notifications', EmailNotificationViewSet)
router.register(r'contacts', ContactViewSet)
router.register(r'contact-replies', ContactReplyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
