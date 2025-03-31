from rest_framework import serializers
from .models import Forum, Messages, Seen
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ['id', 'name', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    seen_by = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Messages
        fields = ['id', 'forum', 'sender', 'content', 'file', 'created_at', 'seen_by']
        read_only_fields = ['id', 'sender', 'created_at', 'seen_by']  # Remove forum from read_only fields

    def get_seen_by(self, obj):
        seen_by_ids = list(Seen.objects.filter(message=obj).values_list('user_id', flat=True))
        return seen_by_ids

class SeenSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Seen
        fields = ['message', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']