from django.contrib import admin
from .models import Forum, Messages, Seen

# Custom admin classes
class MessagesAdmin(admin.ModelAdmin):
    list_display = ('sender', 'forum', 'content', 'created_at')
    list_filter = ('forum', 'sender', 'created_at')
    search_fields = ('content', 'sender__username', 'forum__name')
    date_hierarchy = 'created_at'

class ForumAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

class SeenAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'created_at')
    list_filter = ('user', 'created_at')
    date_hierarchy = 'created_at'

# Register models with custom admin classes
admin.site.register(Forum, ForumAdmin)
admin.site.register(Messages, MessagesAdmin)
admin.site.register(Seen, SeenAdmin)
