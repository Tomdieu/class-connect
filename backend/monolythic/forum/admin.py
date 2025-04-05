from django.contrib import admin
from .models import Forum, Post, Messages, Seen, Reaction, Notification

# Custom admin classes
class PostAdmin(admin.ModelAdmin):
    list_display = ('sender', 'forum', 'content', 'created_at', 'is_comment', 'view_count')
    list_filter = ('forum', 'sender', 'created_at')
    search_fields = ('content', 'sender__username', 'forum__name')
    date_hierarchy = 'created_at'

class ForumAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

class SeenAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'created_at')
    list_filter = ('user', 'created_at')
    date_hierarchy = 'created_at'

class ReactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'reaction_type', 'created_at')
    list_filter = ('reaction_type', 'created_at')
    search_fields = ('user__username', 'post__content')

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'sender', 'notification_type', 'read', 'created_at')
    list_filter = ('notification_type', 'read', 'created_at')
    search_fields = ('recipient__username', 'sender__username')
    date_hierarchy = 'created_at'

# Register models with custom admin classes
admin.site.register(Forum, ForumAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Seen, SeenAdmin)
admin.site.register(Reaction, ReactionAdmin)
admin.site.register(Notification, NotificationAdmin)
