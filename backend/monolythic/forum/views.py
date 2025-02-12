from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Forum, Messages
from .serializers import MessageSerializer

# Create your views here.

class PublicChatView(generics.ListCreateAPIView):
    """
    API endpoint for public chat.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the public forum (create if necessary)
        public_forum, created = Forum.objects.get_or_create(name="Public Forum")
        return Messages.objects.filter(forum=public_forum).order_by('created_at')
    
    def perform_create(self, serializer):
        public_forum, _ = Forum.objects.get_or_create(name="Public Forum")
        serializer.save(sender=self.request.user, forum=public_forum)
