from django.contrib import admin
from .models import Notification, EmailNotification, Contact, ContactReply

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

class ContactReplyInline(admin.TabularInline):
    model = ContactReply
    extra = 0
    readonly_fields = ('created_at', 'email_sent', 'notification_sent')

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'status', 'user', 'concerns_student', 'created_at')
    list_filter = ('status', 'concerns_student', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ContactReplyInline]
    
    def has_add_permission(self, request):
        # Contacts are typically created through the API, not manually in the admin
        return False

@admin.register(ContactReply)
class ContactReplyAdmin(admin.ModelAdmin):
    list_display = ('contact', 'admin_user', 'email_sent', 'notification_sent', 'created_at')
    list_filter = ('email_sent', 'notification_sent', 'created_at')
    search_fields = ('message', 'contact__name', 'contact__email', 'contact__subject')
    readonly_fields = ('created_at', 'email_sent', 'notification_sent')
