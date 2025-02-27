from django.db import models
from django.contrib.auth import get_user_model
from courses.models import Subject

User = get_user_model()

class VideoConferenceSession(models.Model):
    SESSION_STATUS = [
        ('SCHEDULED', 'Scheduled'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    subject = models.ForeignKey(Subject,on_delete=models.CASCADE,related_name='online_course')
    instructor = models.ForeignKey(User,on_delete=models.CASCADE,related_name='online_course')
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_time = models.DateTimeField()
    duration_minutes = models.IntegerField()
    status = models.CharField(max_length=20, choices=SESSION_STATUS, default='SCHEDULED')
    meeting_link = models.URLField()
    recording_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class SessionParticipant(models.Model):
    session = models.ForeignKey(VideoConferenceSession, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='participated_session')
    joined_at = models.DateTimeField(null=True)
    left_at = models.DateTimeField(null=True)
    
    class Meta:
        unique_together = ['session', 'user_id']
        
    def __str__(self):
        return f'{self.session_id} - {self.user_id}'
