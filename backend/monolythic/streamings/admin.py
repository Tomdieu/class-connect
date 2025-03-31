from django.contrib import admin
from .models import VideoConferenceSession#, SessionParticipant

@admin.register(VideoConferenceSession)
class VideoConferenceSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'instructor', 'start_time', 'status')
    list_filter = ('status', 'start_time')
    search_fields = ('title', 'description')

# @admin.register(SessionParticipant)
# class SessionParticipantAdmin(admin.ModelAdmin):
#     list_display = ('session', 'user', 'joined_at', 'left_at')
#     list_filter = ('joined_at', 'left_at')

