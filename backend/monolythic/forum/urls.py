from django.urls import path
from .views import PublicChatView

urlpatterns = [
    path('api/public-chat/', PublicChatView.as_view(), name='public-chat'),
]
