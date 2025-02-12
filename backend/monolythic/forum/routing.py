from django.urls import re_path
from .consumer import PublicChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/$', PublicChatConsumer.as_asgi()),
]
