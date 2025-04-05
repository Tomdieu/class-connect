from rest_framework import serializers
from .models import Forum, Post, Messages, Seen, Reaction, Notification, ReactionType
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model
from django.db.models import Count

User = get_user_model()

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        fields = ["id", "name", "created_at"]

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user'
    )
    reaction_choices = serializers.SerializerMethodField()
    
    class Meta:
        model = Reaction
        fields = ['id', 'post', 'user', 'user_id', 'reaction_type', 'created_at', 'reaction_choices']
        read_only_fields = ['id', 'created_at']
    
    def get_reaction_choices(self, obj):
        return {choice[0]: choice[1] for choice in ReactionType.choices}

class ReactionCountSerializer(serializers.Serializer):
    reaction_type = serializers.CharField()
    count = serializers.IntegerField()

class CommentSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    reaction_counts = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id", 
            "sender", 
            "content", 
            "created_at", 
            "updated_at", 
            "file", 
            "image",
            "reaction_counts",
            "user_reaction"
        ]
    
    def get_reaction_counts(self, obj):
        counts = obj.reaction_counts
        return ReactionCountSerializer(counts, many=True).data
    
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                reaction = Reaction.objects.get(post=obj, user=request.user)
                return ReactionSerializer(reaction).data
            except Reaction.DoesNotExist:
                return None
        return None

class PostSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    seen_by = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            "id",
            "forum",
            "sender",
            "content",
            "file",
            "image",
            "created_at",
            "updated_at",
            "comments",
            "comment_count",
            "reaction_counts",
            "user_reaction",
            "seen_by",
            "view_count"
        ]
        read_only_fields = [
            "id",
            "sender",
            "created_at",
            "updated_at",
            "comments",
            "comment_count",
            "reaction_counts",
            "user_reaction", 
            "seen_by",
            "view_count"
        ]
    
    def get_comments(self, obj):
        # Get top level comments for this post
        top_comments = Post.objects.filter(parent=obj).order_by('-created_at')[:3]
        return CommentSerializer(top_comments, many=True, context=self.context).data

    def get_comment_count(self, obj):
        # Use the annotated total_comments if available, otherwise fall back to property
        if hasattr(obj, 'total_comments'):
            return obj.total_comments
        return Post.objects.filter(parent=obj).count()

    def get_reaction_counts(self, obj):
        counts = obj.reaction_counts
        return ReactionCountSerializer(counts, many=True).data
    
    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                reaction = Reaction.objects.get(post=obj, user=request.user)
                return ReactionSerializer(reaction).data
            except Reaction.DoesNotExist:
                return None
        return None
    
    def get_seen_by(self, obj):
        seen_by_ids = list(Seen.objects.filter(post=obj).values_list("user_id", flat=True))
        return seen_by_ids

# For backward compatibility
class MessageSerializer(PostSerializer):
    class Meta(PostSerializer.Meta):
        model = Messages

class SeenSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Seen
        fields = ["post", "user", "created_at"]
        read_only_fields = ["user", "created_at"]

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'post', 'notification_type', 'read', 'created_at']
        read_only_fields = ['id', 'created_at']
        ref_name = "ForumNotification"
