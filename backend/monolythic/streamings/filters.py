import django_filters
from .models import VideoConferenceSession
from django.contrib.auth import get_user_model

User = get_user_model()

class VideoConferenceSessionFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=VideoConferenceSession.SESSION_STATUS)
    start_time = django_filters.DateTimeFromToRangeFilter()
    instructor = django_filters.ModelChoiceFilter(queryset=User.objects.all())
    code = django_filters.CharFilter(lookup_expr='exact')
    
    class Meta:
        model = VideoConferenceSession
        fields = ['instructor', 'status', 'duration_minutes', 'code',]
