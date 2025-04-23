from django.contrib import admin
from .models import VideoConferenceSession, SessionParticipant, SessionConnection

@admin.register(VideoConferenceSession)
class VideoConferenceSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'start_time', 'status', 'code')
    list_filter = ('status', 'start_time')
    search_fields = ('title', 'description', 'code')
    filter_horizontal = ('attendees',)  # Adds a nice widget for managing many-to-many relationships
    
    def get_attendee_count(self, obj):
        """Return the number of attendees for a session"""
        return obj.attendees.count()
    
    get_attendee_count.short_description = 'Attendees'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('attendees')
    
    # Make calendar_event_id and code readonly after creation
    readonly_fields = ('calendar_event_id', 'code')


@admin.register(SessionParticipant)
class SessionParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'session', 'first_joined_at', 'last_seen_at', 'total_duration', 'get_connection_count')
    list_filter = ('session', 'first_joined_at', 'last_seen_at')
    search_fields = ('user__username', 'user__email', 'session__title')
    raw_id_fields = ('user', 'session')

    def get_connection_count(self, obj):
        """Return the number of connections for this participant"""
        return obj.connections.count()
    get_connection_count.short_description = 'Connection Count'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'session')


@admin.register(SessionConnection)
class SessionConnectionAdmin(admin.ModelAdmin):
    list_display = ('participant', 'joined_at', 'left_at', 'get_duration')
    list_filter = ('joined_at', 'left_at')
    raw_id_fields = ('participant',)

    def get_duration(self, obj):
        if obj.left_at and obj.joined_at:
            return obj.left_at - obj.joined_at
        return "Active"
    get_duration.short_description = 'Duration'

