from rest_framework import serializers
from .models import VideoConferenceSession, SessionParticipant

class VideoConferenceSessionSerializer(serializers.ModelSerializer):
    meeting_link = serializers.URLField(required=False)
    
    class Meta:
        model = VideoConferenceSession
        fields = '__all__'
        read_only_fields = ['recording_url', 'created_at']

class SessionParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionParticipant
        fields = '__all__'