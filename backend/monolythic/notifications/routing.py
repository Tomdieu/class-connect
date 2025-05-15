from django.urls import re_path
from .consumer import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'^ws/user-notifications/(?P<user_id>[\w-]+)/$', NotificationConsumer.as_asgi()),
    # Alternative pattern without the leading caret
    re_path(r'ws/user-notifications/(?P<user_id>[\w-]+)/$', NotificationConsumer.as_asgi()),
]