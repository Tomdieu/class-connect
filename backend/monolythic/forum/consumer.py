import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

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
    def store_message(self, forum, sender, content):
        from forum.models import Messages
        return Messages.objects.create(forum=forum, sender=sender, content=content)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data.get('message')
        user = self.scope.get("user")
        forum = await self.get_public_forum()
        if user and user.is_authenticated:
            await self.store_message(forum, user, message_text)
            username = user.username
        else:
            username = "Anonymous"
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_text,
                'username': username,
            }
        )
        
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
        }))
