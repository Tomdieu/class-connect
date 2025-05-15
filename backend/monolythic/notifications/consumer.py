import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    """
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f"user_notifications_{self.user_id}"
        
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
        from .models import Notification
        
        notifications = Notification.objects.filter(
            user_id=self.user_id,
            read=False
        ).order_by('-created_at')[:10]
        
        from .serializers import NotificationSerializer
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
            'title': event['title'],
            'message': event['message'],
            'notification_type': event['notification_type'],
            'created_at': event['created_at']
        }))