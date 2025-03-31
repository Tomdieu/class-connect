from rest_framework import serializers
from .models import Forum, Messages, Seen
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ["id", "name", "created_at"]

class MessageNestedSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Messages
        fields = ["id", "sender","file", "content", "created_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    seen_by = serializers.SerializerMethodField(read_only=True)
    parent = serializers.SerializerMethodField()
    parent_id = serializers.PrimaryKeyRelatedField(
        queryset=Messages.objects.all(),
        source="parent",
        write_only=True,
        required=False,
        allow_null=True,
        help_text="ID of the parent message if this is a reply."
    )
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Messages
        fields = [
            "id",
            "parent",
            "parent_id",
            "forum",
            "sender",
            "content",
            "file",
            "created_at",
            "seen_by",
            "replies"
        ]
        read_only_fields = [
            "id",
            "sender",
            "created_at",
            "seen_by",
        ]  # Remove forum from read_only fields

    def get_seen_by(self, obj):
        seen_by_ids = list(
            Seen.objects.filter(message=obj).values_list("user_id", flat=True)
        )
        return seen_by_ids
    
    def get_parent(self,obj:Messages):
        if obj.parent:
            return MessageSerializer(obj.parent).data
        return None
    
    def get_replies(self, obj):
        replies = obj.replies.all()
        return MessageNestedSerializer(replies, many=True).data


class SeenSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Seen
        fields = ["message", "user", "created_at"]
        read_only_fields = ["user", "created_at"]
