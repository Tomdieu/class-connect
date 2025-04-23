from rest_framework import serializers
from .models import VideoConferenceSession, SessionParticipant
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class VideoConferenceSessionSerializer(serializers.ModelSerializer):
    meeting_link = serializers.URLField(required=False)
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="instructor"
    )
    instructor = UserSerializer(read_only=True)
    attendees = UserSerializer(many=True, read_only=True)

    class Meta:
        model = VideoConferenceSession
        fields = "__all__"
        read_only_fields = ["recording_url", "created_at"]


class SessionAttendeeSerializer(serializers.Serializer):
    user_ids = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of user IDs to add/remove as attendees"
    )


class SessionParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    total_duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = SessionParticipant
        fields = ['id', 'session', 'user', 'first_joined_at', 'last_seen_at', 'total_duration', 'total_duration_seconds']
        read_only_fields = ['id', 'session', 'user', 'first_joined_at', 'last_seen_at', 'total_duration']

    def get_total_duration_seconds(self, obj):
        return obj.total_duration.total_seconds()
