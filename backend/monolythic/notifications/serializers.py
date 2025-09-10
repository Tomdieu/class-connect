from rest_framework import serializers
from .models import Notification, EmailNotification, Contact, ContactReply
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        # Add explicit ref_name to avoid Swagger collision with forum app
        ref_name = "SystemNotification"

class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = '__all__'

class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user information for nested serialization"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.email

class ContactReplySerializer(serializers.ModelSerializer):
    admin_user_details = UserMinimalSerializer(source='admin_user', read_only=True)
    
    class Meta:
        model = ContactReply
        fields = ['id', 'contact', 'admin_user', 'admin_user_details', 'message', 
                 'email_sent', 'notification_sent', 'created_at']
        read_only_fields = ['email_sent', 'notification_sent', 'created_at']

class ContactSerializer(serializers.ModelSerializer):
    replies = ContactReplySerializer(many=True, read_only=True)
    user_details = UserMinimalSerializer(source='user', read_only=True)
    
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['status', 'created_at', 'updated_at', 'replies', 'user_details']