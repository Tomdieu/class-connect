"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
import sys
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

# Import the websocket routing for the forum public chat and notifications
from forum.routing import websocket_urlpatterns as forum_websocket_urlpatterns
from notifications.routing import websocket_urlpatterns as notifications_websocket_urlpatterns
from oauth2_provider.models import AccessToken  # used for token authentication

# Debug prints
print("Forum WebSocket patterns:", forum_websocket_urlpatterns, file=sys.stderr)
print("Notifications WebSocket patterns:", notifications_websocket_urlpatterns, file=sys.stderr)

# Combine WebSocket URL patterns from different apps
all_websocket_urlpatterns = forum_websocket_urlpatterns + notifications_websocket_urlpatterns
print("All WebSocket patterns:", all_websocket_urlpatterns, file=sys.stderr)

# Define a sync function to get user from token
@database_sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken.objects.select_related("user").get(token=token)
        return access_token.user
    except AccessToken.DoesNotExist:
        return AnonymousUser()

# Custom middleware to extract token from the query string and authenticate
class Oauth2TokenMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Debug print for incoming request
        print(f"Incoming WebSocket request for path: {scope.get('path', 'unknown')}", file=sys.stderr)
        
        query_string = scope.get("query_string", b"").decode()
        qs = parse_qs(query_string)
        token = qs.get("token", [None])[0]
        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()
        return await self.inner(scope, receive, send)

def Oauth2TokenAuthMiddleware(inner):
    return Oauth2TokenMiddleware(inner)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": Oauth2TokenAuthMiddleware(
        URLRouter(
            all_websocket_urlpatterns
        )
    ),
})
