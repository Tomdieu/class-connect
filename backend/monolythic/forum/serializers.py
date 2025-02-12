from rest_framework import serializers
from .models import Forum, Messages

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Messages
        fields = ['id', 'forum', 'sender', 'content', 'file', 'created_at']
        read_only_fields = ['id', 'forum', 'sender', 'created_at']
