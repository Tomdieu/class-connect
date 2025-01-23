import django_filters
from .models import VideoConferenceSession, SessionParticipant

class VideoConferenceSessionFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=VideoConferenceSession.SESSION_STATUS)
    start_time = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = VideoConferenceSession
        fields = ['subject', 'instructor', 'status']

class SessionParticipantFilter(django_filters.FilterSet):
    joined_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = SessionParticipant
        fields = ['session', 'user']