from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (VideoConferenceSessionViewSet, SessionParticipantViewSet,
                   ChatMessageViewSet)

router = DefaultRouter()
router.register(r'sessions', VideoConferenceSessionViewSet)
router.register(r'participants', SessionParticipantViewSet)
router.register(r'messages', ChatMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]