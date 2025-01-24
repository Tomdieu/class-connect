from django.contrib import admin
from .models import Notification, EmailNotification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user_id', 'notification_type', 'read', 'created_at')
    list_filter = ('notification_type', 'read')
    search_fields = ('title', 'message')

@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = ('subject', 'user_id', 'status', 'sent_at', 'created_at')
    list_filter = ('status',)
    search_fields = ('subject', 'content')
