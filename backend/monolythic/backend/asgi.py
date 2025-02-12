"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

# Import the websocket routing for the forum public chat
from forum.routing import websocket_urlpatterns
from oauth2_provider.models import AccessToken  # used for token authentication

# Custom middleware to extract token from the query string and authenticate
class Oauth2TokenMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        qs = parse_qs(query_string)
        token = qs.get("token", [None])[0]
        if token:
            try:
                access_token = AccessToken.objects.select_related("user").get(token=token)
                scope["user"] = access_token.user
            except AccessToken.DoesNotExist:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()
        return await self.inner(scope, receive, send)

def Oauth2TokenAuthMiddleware(inner):
    return Oauth2TokenMiddleware(inner)

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": Oauth2TokenAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
