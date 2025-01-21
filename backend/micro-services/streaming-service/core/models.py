from django.db import models


class VideoConferenceSession(models.Model):
    SESSION_STATUS = [
        ('SCHEDULED', 'Scheduled'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    course_id = models.IntegerField()  # Reference to Course service
    instructor_id = models.IntegerField()  # Reference to User service
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
    user_id = models.IntegerField()  # Reference to User service
    joined_at = models.DateTimeField(null=True)
    left_at = models.DateTimeField(null=True)
    
    class Meta:
        unique_together = ['session', 'user_id']
        
    def __str__(self):
        return f'{self.session_id} - {self.user_id}'

class ChatMessage(models.Model):
    session = models.ForeignKey(VideoConferenceSession, on_delete=models.CASCADE, related_name='messages')
    user_id = models.IntegerField()  # Reference to User service
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.session_id} - {self.user_id}'
