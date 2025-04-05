import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync

User = get_user_model()

class PublicChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "public_chat"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    @database_sync_to_async
    def get_public_forum(self):
        from forum.models import Forum
        forum, _ = Forum.objects.get_or_create(name="Public Forum")
        return forum

    @database_sync_to_async
    def store_post(self, forum, sender, content, image=None, file=None):
        from forum.models import Post
        return Post.objects.create(
            forum=forum, 
            sender=sender, 
            content=content,
            image=image,
            file=file
        )

    @database_sync_to_async
    def serialize_post(self, post):
        from forum.serializers import PostSerializer
        from rest_framework.renderers import JSONRenderer
        serializer = PostSerializer(post)
        return json.loads(JSONRenderer().render(serializer.data).decode('utf-8'))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')
        user = self.scope.get("user")
        
        if not user or not user.is_authenticated:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Authentication required'
            }))
            return
            
        forum = await self.get_public_forum()
        
        if message_type == 'message':
            content = data.get('message', '')
            image = data.get('image')
            file = data.get('file')
            
            # Store post in the database
            post = await self.store_post(forum, user, content, image, file)
            
            # Serialize the post to include all necessary data
            post_data = await self.serialize_post(post)
            
            # Send post to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_post',
                    'post': post_data,
                    'user_id': str(user.id)
                }
            )
        elif message_type == 'reaction':
            # Handle reactions
            post_id = data.get('post_id')
            reaction_type = data.get('reaction_type', 'LIKE')
            
            if post_id:
                await self.handle_reaction(user, post_id, reaction_type)
        elif message_type == 'comment':
            # Handle comments
            post_id = data.get('post_id')
            content = data.get('content', '')
            
            if post_id and content:
                await self.handle_comment(user, post_id, content)
        
    async def chat_post(self, event):
        # Send the post to the WebSocket
        await self.send(text_data=json.dumps({
            'type': 'post',
            'post': event['post'],
            'user_id': event['user_id']
        }))
        
    async def chat_message(self, event):
        # For backward compatibility
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'username': event['username'],
        }))
    
    @database_sync_to_async
    def handle_reaction(self, user, post_id, reaction_type):
        from forum.models import Post, Reaction, Notification
        
        try:
            post = Post.objects.get(id=post_id)
            # Create or update reaction
            reaction, created = Reaction.objects.update_or_create(
                post=post,
                user=user,
                defaults={'reaction_type': reaction_type}
            )
            
            # Create notification for post owner if not the same user
            if created and post.sender != user:
                notification = Notification.objects.create(
                    recipient=post.sender,
                    sender=user,
                    post=post,
                    notification_type='REACTION'
                )
                
                # Notify the recipient via WebSocket
                async_to_sync(self.channel_layer.group_send)(
                    f"notifications_{post.sender.id}",
                    {
                        'type': 'notification',
                        'notification_id': notification.id,
                        'message': f"{user.first_name} {user.last_name} reacted to your post"
                    }
                )
                
            # Notify room about the reaction
            serialized_reaction = {
                'id': reaction.id,
                'post_id': post.id,
                'user_id': str(user.id),
                'user_name': f"{user.first_name} {user.last_name}",
                'reaction_type': reaction.reaction_type
            }
            
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'post_reaction',
                    'reaction': serialized_reaction
                }
            )
            
            return reaction
        except Post.DoesNotExist:
            return None
    
    @database_sync_to_async
    def handle_comment(self, user, post_id, content):
        from forum.models import Post, Notification
        
        try:
            parent_post = Post.objects.get(id=post_id)
            
            # Create comment as a Post with parent
            comment = Post.objects.create(
                sender=user,
                parent=parent_post,
                forum=parent_post.forum,
                content=content
            )
            
            # Create notification
            if parent_post.sender != user:
                notification_type = 'COMMENT'
                if parent_post.parent:  # This is a reply to a comment
                    notification_type = 'REPLY'
                
                notification = Notification.objects.create(
                    recipient=parent_post.sender,
                    sender=user,
                    post=comment,
                    notification_type=notification_type
                )
                
                # Notify the recipient via WebSocket
                async_to_sync(self.channel_layer.group_send)(
                    f"notifications_{parent_post.sender.id}",
                    {
                        'type': 'notification',
                        'notification_id': notification.id,
                        'message': f"{user.first_name} {user.last_name} commented on your post"
                    }
                )
            
            # Serialize and broadcast the comment
            from forum.serializers import CommentSerializer
            from rest_framework.renderers import JSONRenderer
            
            serializer = CommentSerializer(comment)
            comment_data = json.loads(JSONRenderer().render(serializer.data).decode('utf-8'))
            
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'post_comment',
                    'comment': comment_data,
                    'parent_post_id': str(parent_post.id)
                }
            )
            
            return comment
        except Post.DoesNotExist:
            return None
            
    async def post_reaction(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'reaction': event['reaction']
        }))
        
    async def post_comment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment',
            'comment': event['comment'],
            'parent_post_id': event['parent_post_id']
        }))


class PostConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time post updates
    """
    async def connect(self):
        self.room_group_name = "posts_feed"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    @database_sync_to_async
    def get_trending_posts(self, limit=10):
        from forum.models import Post
        from django.db.models import Count
        from django.utils import timezone
        import datetime
        
        recent_threshold = timezone.now() - datetime.timedelta(hours=24)
        
        posts = Post.objects.filter(
            parent=None,
            created_at__gte=recent_threshold
        ).annotate(
            reaction_count=Count('reactions'),
            comment_count=Count('comments')
        ).order_by('-reaction_count', '-comment_count', '-created_at')[:limit]
        
        from forum.serializers import PostSerializer
        from rest_framework.renderers import JSONRenderer
        
        serializer = PostSerializer(posts, many=True)
        return json.loads(JSONRenderer().render(serializer.data).decode('utf-8'))
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')
        
        if command == 'get_trending':
            trending_posts = await self.get_trending_posts()
            await self.send(text_data=json.dumps({
                'type': 'trending_posts',
                'posts': trending_posts
            }))
    
    async def new_post(self, event):
        # Send notification about new post
        await self.send(text_data=json.dumps({
            'type': 'new_post',
            'post': event['post']
        }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    """
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f"notifications_{self.user_id}"
        
        # Check permission - only the owner can connect to their notification channel
        user = self.scope.get("user")
        if not user or not user.is_authenticated or str(user.id) != self.user_id:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    
    @database_sync_to_async
    def get_unread_notifications(self):
        from forum.models import Notification
        
        notifications = Notification.objects.filter(
            recipient_id=self.user_id,
            read=False
        ).order_by('-created_at')[:10]
        
        from forum.serializers import NotificationSerializer
        from rest_framework.renderers import JSONRenderer
        
        serializer = NotificationSerializer(notifications, many=True)
        return json.loads(JSONRenderer().render(serializer.data).decode('utf-8'))
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        command = data.get('command')
        
        if command == 'get_notifications':
            notifications = await self.get_unread_notifications()
            await self.send(text_data=json.dumps({
                'type': 'unread_notifications',
                'notifications': notifications
            }))
    
    async def notification(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification_id': event['notification_id'],
            'message': event['message']
        }))
