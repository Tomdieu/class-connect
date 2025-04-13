from django.db import models
from django.contrib.auth import get_user_model
import string
import random

User = get_user_model()

def generate_unique_meeting_code():
    """Generate a unique meeting code for VideoConferenceSession"""
    chars = string.ascii_letters + string.digits
    code_length = 10
    
    while True:
        # Generate a random string
        code = ''.join(random.choice(chars) for _ in range(code_length))
        
        # Check if code is unique
        if not VideoConferenceSession.objects.filter(code=code).exists():
            return code

class VideoConferenceSession(models.Model):
    SESSION_STATUS = [
        ('SCHEDULED', 'Scheduled'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='online_course')
    attendees = models.ManyToManyField(User, related_name='attended_sessions', blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    duration_minutes = models.IntegerField()
    status = models.CharField(max_length=20, choices=SESSION_STATUS, default='SCHEDULED')
    code = models.CharField(
        max_length=20, 
        unique=True, 
        default=generate_unique_meeting_code,
        help_text="Unique code for joining the meeting",
        blank=True,
        null=True
    )
    meeting_link = models.URLField()
    recording_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    calendar_event_id = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.title

# class SessionParticipant(models.Model):
#     session = models.ForeignKey(VideoConferenceSession, on_delete=models.CASCADE, related_name='participants')
#     user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='participated_session')
#     joined_at = models.DateTimeField(null=True)
#     left_at = models.DateTimeField(null=True)
    
#     class Meta:
#         unique_together = ['session', 'user_id']
        
#     def __str__(self):
#         return f'{self.session_id} - {self.user_id}'
