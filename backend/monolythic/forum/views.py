from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db.models import Count, Q, F, Case, When, IntegerField, Value
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta

from .models import Forum, Post, Messages, Seen, Reaction, Notification, ReactionType
from .serializers import (
    PostSerializer,
    MessageSerializer,
    SeenSerializer,
    ForumSerializer,
    ReactionSerializer,
    NotificationSerializer,
    CommentSerializer,
)

# Create your views here.


class PostPagination(PageNumberPagination):
    """Custom pagination for posts"""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ForumViewSet(viewsets.ModelViewSet):
    """
    API endpoint for forum management.
    """

    queryset = Forum.objects.all()
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Forum"]

    @swagger_auto_schema(
        operation_description="List all forums",
        responses={200: ForumSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new forum",
        request_body=ForumSerializer,
        responses={201: ForumSerializer()},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Get forum details",
        responses={200: ForumSerializer(), 404: "Forum not found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update forum details",
        request_body=ForumSerializer,
        responses={
            200: ForumSerializer(),
            400: "Invalid request data",
            404: "Forum not found",
        },
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update forum details",
        request_body=ForumSerializer(partial=True),
        responses={
            200: ForumSerializer(),
            400: "Invalid request data",
            404: "Forum not found",
        },
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a forum",
        responses={204: "Forum deleted successfully", 404: "Forum not found"},
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class PublicChatViewSet(viewsets.GenericViewSet):
    """
    API endpoint for public chat forum.
    """

    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Forum"]

    @swagger_auto_schema(
        operation_description="Get or create the public forum",
        responses={200: ForumSerializer()},
    )
    def list(self, request):
        public_forum, created = Forum.objects.get_or_create(name="Public Forum")
        serializer = self.get_serializer(public_forum)
        return Response(serializer.data)


class NewsFeedViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for the news feed (Facebook-style posts)
    """

    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Posts"]
    pagination_class = PostPagination

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_queryset(self):
        """
        Implement a simple news feed algorithm:
        1. Show posts from all forums
        2. Order by engagement (reactions, comments) and recency
        3. Boost posts with more engagement
        """
        # Check if this is a schema generation request
        if getattr(self, "swagger_fake_view", False):
            return Post.objects.none()

        # Base queryset - only top-level posts (not comments)
        queryset = Post.objects.filter(parent=None)

        # Get time threshold for "recent" posts (last 7 days)
        recent_threshold = timezone.now() - timedelta(days=7)

        # Add engagement metrics
        queryset = queryset.annotate(
            reaction_count=Count("reactions"),
            total_comments=Count("comments"),  # Changed from comment_count to total_comments
            # Calculate engagement score - more weight to recent posts
            # Using Case/When instead of direct F comparison
            recency_score=Case(
                When(created_at__gt=recent_threshold, then=Value(5)),
                default=Value(0),
                output_field=IntegerField(),
            ),
            engagement_score=Count("reactions")
            + Count("comments") * 2
            + F("recency_score"),
        )

        # Order by engagement score (higher is better)
        return queryset.order_by("-engagement_score", "-created_at")

    @action(detail=False, methods=["get"])
    def trending(self, request):
        recent_threshold = timezone.now() - timedelta(hours=24)

        # Get posts with reactions or comments in last 24 hours
        queryset = (
            Post.objects.filter(
                Q(reactions__created_at__gte=recent_threshold)
                | Q(comments__created_at__gte=recent_threshold),
                parent=None,
            )
            .annotate(
                recent_reactions=Count(
                    "reactions", filter=Q(reactions__created_at__gte=recent_threshold)
                ),
                recent_comments=Count(
                    "comments", filter=Q(comments__created_at__gte=recent_threshold)
                ),
                total_comments=Count("comments"),  # Add this for consistency
                trending_score=F("recent_reactions") + F("recent_comments") * 2,
            )
            .order_by("-trending_score", "-created_at")
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)


class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for posts (replaces message API)
    """

    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Posts"]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["forum", "sender"]
    search_fields = ["content"]
    pagination_class = PostPagination

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new post",
        request_body=PostSerializer,
        responses={201: PostSerializer(), 400: "Invalid request data"},
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Get a specific post",
        responses={200: PostSerializer(), 404: "Post not found"},
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Update a post",
        request_body=PostSerializer,
        responses={
            200: PostSerializer(),
            400: "Invalid request data",
            403: "Permission denied",
            404: "Post not found",
        },
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Partially update a post",
        request_body=PostSerializer(partial=True),
        responses={
            200: PostSerializer(),
            400: "Invalid request data",
            403: "Permission denied",
            404: "Post not found",
        },
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Delete a post",
        responses={
            204: "Post deleted successfully",
            403: "Permission denied",
            404: "Post not found",
        },
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        # Check if this is a schema generation request
        if getattr(self, "swagger_fake_view", False):
            return Post.objects.none()

        return Post.objects.filter(parent=None).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @swagger_auto_schema(
        operation_description="React to a post (like, love, etc.)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "reaction_type": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=[choice[0] for choice in ReactionType.choices],
                    description="Type of reaction",
                )
            },
        ),
        responses={
            200: ReactionSerializer(),
            400: "Invalid reaction type",
            404: "Post not found",
        },
    )
    @action(detail=True, methods=["post"])
    def react(self, request, pk=None):
        post = self.get_object()
        user = request.user
        reaction_type = request.data.get("reaction_type", ReactionType.LIKE)

        # Validate reaction type
        if reaction_type not in [choice[0] for choice in ReactionType.choices]:
            return Response(
                {
                    "detail": f"Invalid reaction type. Choices are: {[c[0] for c in ReactionType.choices]}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user already has a reaction to this post
        previous_reaction = None
        try:
            existing_reaction = Reaction.objects.get(post=post, user=user)
            previous_reaction = existing_reaction.reaction_type
        except Reaction.DoesNotExist:
            pass

        # Get or create reaction
        reaction, created = Reaction.objects.update_or_create(
            post=post, user=user, defaults={"reaction_type": reaction_type}
        )

        # Create notification for post owner if not the same user
        if created and post.sender != user:
            Notification.objects.create(
                recipient=post.sender,
                sender=user,
                post=post,
                notification_type="REACTION",
            )

        serializer = ReactionSerializer(reaction)
        response_data = serializer.data
        
        # Add information about what happened
        if created:
            response_data["action"] = "created"
            response_data["message"] = f"Added {reaction_type} reaction"
        else:
            response_data["action"] = "updated"
            response_data["message"] = f"Changed reaction from {previous_reaction} to {reaction_type}"
            
        return Response(response_data)

    @swagger_auto_schema(
        operation_description="Remove a reaction from a post",
        responses={204: "Reaction removed successfully", 404: "Reaction not found"},
    )
    @action(detail=True, methods=["delete"])
    def unreact(self, request, pk=None):
        post = self.get_object()
        user = request.user

        try:
            reaction = Reaction.objects.get(post=post, user=user)
            reaction.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Reaction.DoesNotExist:
            return Response(
                {"detail": "You have not reacted to this post."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @swagger_auto_schema(
        operation_description="Récupérer tous les commentaires d'un post",
        responses={200: CommentSerializer(many=True), 404: "Post not found"},
    )
    @action(detail=True, methods=["get"])
    def comments(self, request, pk=None):
        post = self.get_object()
        print(f"Fetching comments for post ID: {post.id}")
        
        # Ensure we're using a direct ID filter rather than object instance
        # This can sometimes cause issues with ORM
        comments = Post.objects.filter(parent_id=post.id).order_by("-created_at")
        
        # Debug: print the query and count
        print(f"Comment query: {comments.query}")
        print(f"Comment count: {comments.count()}")
        
        # Check if pagination is working correctly
        page = self.paginate_queryset(comments)
        if page is not None:
            print(f"Page size: {len(page)}")
            serializer = CommentSerializer(
                page, many=True, context={"request": request}
            )
            serialized_data = serializer.data
            print(f"Serialized data length: {len(serialized_data)}")
            return self.get_paginated_response(serialized_data)

        # If no pagination, return all comments
        serializer = CommentSerializer(
            comments, many=True, context={"request": request}
        )
        serialized_data = serializer.data
        print(f"Serialized data length (no pagination): {len(serialized_data)}")
        return Response(serialized_data)

    @swagger_auto_schema(
        operation_description="Add a comment to a post",
        request_body=CommentSerializer,
        responses={
            201: CommentSerializer(),
            400: "Invalid request data",
            404: "Post not found",
        },
    )
    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        parent_post = self.get_object()
        user = request.user

        serializer = CommentSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            # Get the forum from the parent post to prevent NULL forum_id error
            comment = serializer.save(
                sender=user,
                parent=parent_post,
                forum=parent_post.forum  # Add the forum from parent post
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Mark a post as viewed and increment view count",
        responses={
            200: openapi.Response(
                description="Post viewed",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"status": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            404: "Post not found",
        },
    )
    @action(detail=True, methods=["post"])
    def view(self, request, pk=None):
        post = self.get_object()
        user = request.user

        # Create or get seen record
        seen, created = Seen.objects.get_or_create(post=post, user=user)

        # Increment view count if this is a new view
        if created:
            post.view_count = F("view_count") + 1
            post.save(update_fields=["view_count"])

        return Response({"status": "success"})


class MessageAPIView(APIView):
    """
    API view for listing and creating messages (for backward compatibility).
    """

    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Forum"]

    
    def get(self, request, forum_id):
        """List all messages for a forum"""
        forum = get_object_or_404(Forum, id=forum_id)
        messages = Post.objects.filter(forum=forum).order_by("-created_at")
        serializer = PostSerializer(messages, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request, forum_id):
        """Create a new message in the forum"""
        forum = get_object_or_404(Forum, id=forum_id)

        # Create a mutable copy of the data
        data = request.data.copy()

        # If forum ID is not in data or is different from URL parameter, set it
        if "forum" not in data or str(data["forum"]) != str(forum_id):
            data["forum"] = forum_id

        serializer = PostSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            # We override forum just to be safe, using the one from the URL path
            serializer.save(forum=forum, sender=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageDetailAPIView(APIView):
    """
    API view for message details (for backward compatibility).
    """

    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Forum"]

    @swagger_auto_schema(
        operation_description="Get a specific message",
        responses={
            200: openapi.Response(
                description="Message details", schema=PostSerializer()
            ),
            404: "Message not found",
        },
    )
    def get(self, request, forum_id, message_id):
        """Get a specific message"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Post, id=message_id, forum=forum)
        serializer = PostSerializer(message, context={"request": request})
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Update a specific message partially",
        request_body=PostSerializer(partial=True),
        responses={
            200: openapi.Response(
                description="Message updated successfully", schema=PostSerializer()
            ),
            400: "Invalid request data",
            403: "Permission denied",
            404: "Message not found",
        },
    )
    def patch(self, request, forum_id, message_id):
        """Update a specific message partially"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Post, id=message_id, forum=forum)

        # Check if user is the message sender
        if message.sender != request.user:
            return Response(
                {"detail": "You don't have permission to edit this message."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PostSerializer(
            message, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Update a specific message completely",
        request_body=PostSerializer,
        responses={
            200: openapi.Response(
                description="Message updated successfully", schema=PostSerializer()
            ),
            400: "Invalid request data",
            403: "Permission denied",
            404: "Message not found",
        },
    )
    def put(self, request, forum_id, message_id):
        """Update a specific message completely"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Post, id=message_id, forum=forum)

        # Check if user is the message sender
        if message.sender != request.user:
            return Response(
                {"detail": "You don't have permission to edit this message."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PostSerializer(
            message, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Delete a specific message",
        responses={
            204: "Message deleted successfully",
            403: "Permission denied",
            404: "Message not found",
        },
    )
    def delete(self, request, forum_id, message_id):
        """Delete a specific message"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Post, id=message_id, forum=forum)

        # Check if user is the message sender
        if message.sender != request.user:
            return Response(
                {"detail": "You don't have permission to delete this message."},
                status=status.HTTP_403_FORBIDDEN,
            )

        message.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageSeenAPIView(APIView):
    """
    API view for tracking message views (for backward compatibility).
    """

    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Forum"]

    @swagger_auto_schema(
        operation_description="Mark a message as seen",
        responses={
            200: openapi.Response(
                description="Message marked as seen", schema=SeenSerializer()
            ),
            404: "Message not found",
        },
    )
    def post(self, request, forum_id, message_id):
        """Mark a message as seen"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Post, id=message_id, forum=forum)

        seen, created = Seen.objects.get_or_create(post=message, user=request.user)

        # Increment view count if this is a new view
        if created:
            message.view_count = F("view_count") + 1
            message.save(update_fields=["view_count"])

        serializer = SeenSerializer(seen)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Get users who have seen a message",
        responses={
            200: openapi.Response(
                description="List of users who have seen the message",
                schema=SeenSerializer(many=True),
            ),
            404: "Message not found",
        },
    )
    def get(self, request, forum_id, message_id):
        """Get users who have seen a message"""
        forum = get_object_or_404(Forum, id=forum_id)
        message = get_object_or_404(Post, id=message_id, forum=forum)

        seen_records = Seen.objects.filter(post=message)
        serializer = SeenSerializer(seen_records, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for user notifications
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    swagger_tags = ["Forum Notifications"]

    
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def get_queryset(self):
        # Check if this is a schema generation request
        if getattr(self, "swagger_fake_view", False):
            return Notification.objects.none()

        return Notification.objects.filter(recipient=self.request.user).order_by(
            "-created_at"
        )

    @swagger_auto_schema(
        operation_description="Mark a notification as read",
        responses={
            200: openapi.Response(
                description="Notification marked as read",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"status": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            ),
            404: "Notification not found",
        },
    )
    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({"status": "notification marked as read"})

    @swagger_auto_schema(
        operation_description="Mark all notifications as read",
        responses={
            200: openapi.Response(
                description="All notifications marked as read",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={"status": openapi.Schema(type=openapi.TYPE_STRING)},
                ),
            )
        },
    )
    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().update(read=True)
        return Response({"status": "all notifications marked as read"})
