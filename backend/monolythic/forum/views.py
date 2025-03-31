from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Forum, Messages, Seen
from .serializers import MessageSerializer, SeenSerializer, ForumSerializer

# Create your views here.

class ForumViewSet(viewsets.ModelViewSet):
    """
    API endpoint for forum management.
    """
    queryset = Forum.objects.all()
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Forum']

class PublicChatViewSet(viewsets.GenericViewSet):
    """
    API endpoint for public chat forum.
    """
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Forum']

    def list(self, request):
        public_forum, created = Forum.objects.get_or_create(name="Public Forum")
        serializer = self.get_serializer(public_forum)
        return Response(serializer.data)

class MessageAPIView(APIView):
    """
    API view for listing and creating messages.
    """
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Forum']

    def get(self, request, forum_id):
        """List all messages for a forum"""
        forum = get_object_or_404(Forum, id=forum_id)
        messages = Messages.objects.filter(forum=forum).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    def post(self, request, forum_id):
        """Create a new message in the forum"""
        forum = get_object_or_404(Forum, id=forum_id)
        
        # Create a mutable copy of the data
        data = request.data.copy()
        
        print("Request data:", data)
        
        # If forum ID is not in data or is different from URL parameter, set it
        if 'forum' not in data or str(data['forum']) != str(forum_id):
            data['forum'] = forum_id
        
        serializer = MessageSerializer(data=data)
        
        if serializer.is_valid():
            # We override forum just to be safe, using the one from the URL path
            serializer.save(forum=forum, sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Print validation errors for debugging
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageDetailAPIView(APIView):
    """
    API view for message details.
    """
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Forum']

    def get(self, request, forum_id, message_id):
        """Get a specific message"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Messages, id=message_id, forum=forum)
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    
    def patch(self, request, forum_id, message_id):
        """Update a specific message partially"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Messages, id=message_id, forum=forum)
        
        # Check if user is the message sender
        if message.sender != request.user:
            return Response(
                {"detail": "You don't have permission to edit this message."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = MessageSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, forum_id, message_id):
        """Update a specific message completely"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Messages, id=message_id, forum=forum)
        
        # Check if user is the message sender
        if message.sender != request.user:
            return Response(
                {"detail": "You don't have permission to edit this message."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = MessageSerializer(message, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, forum_id, message_id):
        """Delete a specific message"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Messages, id=message_id, forum=forum)
        
        # Check if user is the message sender
        if message.sender != request.user:
            return Response(
                {"detail": "You don't have permission to delete this message."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class MessageSeenAPIView(APIView):
    """
    API view for tracking message views.
    """
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ['Forum']
    
    def post(self, request, forum_id, message_id):
        """Mark a message as seen"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Messages, id=message_id, forum=forum)
        
        seen, created = Seen.objects.get_or_create(
            message=message,
            user=request.user
        )
        
        serializer = SeenSerializer(seen)
        return Response(serializer.data)
    
    def get(self, request, forum_id, message_id):
        """Get users who have seen a message"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Messages, id=message_id, forum=forum)
        
        seen_records = Seen.objects.filter(message=message)
        serializer = SeenSerializer(seen_records, many=True)
        return Response(serializer.data)
