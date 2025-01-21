from rest_framework import serializers
from .models import VideoConferenceSession, SessionParticipant, ChatMessage

class VideoConferenceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoConferenceSession
        fields = '__all__'

class SessionParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionParticipant
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'