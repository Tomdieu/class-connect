from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import VideoConferenceSessionViewSet, SessionParticipantViewSet

# Main router for sessions
router = DefaultRouter()
router.register(r'online-courses', VideoConferenceSessionViewSet, basename='online-courses')

# Nested router for participants under sessions
sessions_router = routers.NestedDefaultRouter(router, r'online-courses', lookup='session')
sessions_router.register(r'participants', SessionParticipantViewSet, basename='session-participants')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(sessions_router.urls)),
]
