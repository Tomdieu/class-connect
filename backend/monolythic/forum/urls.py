from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicChatViewSet, 
    ForumViewSet, 
    MessageAPIView,
    MessageDetailAPIView,
    MessageSeenAPIView,
    PostViewSet,
    NewsFeedViewSet,
    NotificationViewSet
)

# Create a router for viewsets
router = DefaultRouter()
router.register(r'forums', ForumViewSet, basename='forum')
router.register(r'public-chat', PublicChatViewSet, basename='public-chat')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'feed', NewsFeedViewSet, basename='feed')
router.register(r'fnotifications', NotificationViewSet, basename='fnotification')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Direct URL patterns for message endpoints (for backward compatibility)
    path('forums/<int:forum_id>/messages/', MessageAPIView.as_view(), name='forum-messages'),
    path('forums/<int:forum_id>/messages/<int:message_id>/', MessageDetailAPIView.as_view(), name='forum-message-detail'),
    path('forums/<int:forum_id>/messages/<int:message_id>/seen/', MessageSeenAPIView.as_view(), name='forum-message-seen'),
]
