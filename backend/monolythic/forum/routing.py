from django.urls import re_path
from .consumer import PublicChatConsumer, PostConsumer, NotificationConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/$', PublicChatConsumer.as_asgi()),
    re_path(r'ws/posts/$', PostConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\w+)/$', NotificationConsumer.as_asgi()),
]
