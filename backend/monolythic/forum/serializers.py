from rest_framework import serializers
from .models import Forum, Messages,Seen

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ['id', 'name','created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Messages
        fields = ['id', 'forum', 'sender', 'content', 'file', 'created_at']
        read_only_fields = ['id', 'forum', 'sender', 'created_at']

class SeenSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Seen
        fields = ['message','user','created_at']