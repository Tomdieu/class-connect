from rest_framework import serializers
from .models import Notification, EmailNotification

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