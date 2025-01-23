from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import VideoConferenceSessionViewSet, SessionParticipantViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register(r'sessions', VideoConferenceSessionViewSet)
router.register(r'participants', SessionParticipantViewSet)

sessions_router = routers.NestedDefaultRouter(router, r'sessions', lookup='session')
sessions_router.register(r'messages', ChatMessageViewSet, basename='session-messages')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(sessions_router.urls)),
]
