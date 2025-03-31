import django_filters
from .models import VideoConferenceSession
from courses.models import Subject, TeacherStudentEnrollment
from django.contrib.auth import get_user_model

User = get_user_model()

class VideoConferenceSessionFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=VideoConferenceSession.SESSION_STATUS)
    start_time = django_filters.DateTimeFromToRangeFilter()
    subject = django_filters.ModelChoiceFilter(queryset=Subject.objects.all())
    instructor = django_filters.ModelChoiceFilter(queryset=User.objects.all())
    teacher_student_enrollment = django_filters.ModelChoiceFilter(queryset=TeacherStudentEnrollment.objects.all())
    
    class Meta:
        model = VideoConferenceSession
        fields = ['subject', 'instructor', 'status', 'teacher_student_enrollment','duration_minutes',]

# class SessionParticipantFilter(django_filters.FilterSet):
#     joined_at = django_filters.DateTimeFromToRangeFilter()
    
#     class Meta:
#         model = SessionParticipant
#         fields = ['session', 'user']