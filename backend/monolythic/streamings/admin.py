from django.contrib import admin
from .models import VideoConferenceSession

@admin.register(VideoConferenceSession)
class VideoConferenceSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'start_time', 'status')
    list_filter = ('status', 'start_time')
    search_fields = ('title', 'description')
    filter_horizontal = ('attendees',)  # Adds a nice widget for managing many-to-many relationships
    
    def get_attendee_count(self, obj):
        """Return the number of attendees for a session"""
        return obj.attendees.count()
    
    get_attendee_count.short_description = 'Attendees'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('attendees')
    
    # You might also want to add a calendar event ID display
    readonly_fields = ('calendar_event_id',)

