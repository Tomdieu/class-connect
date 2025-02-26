from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('PAYMENT', 'Payment Notification'),
        ('COURSE', 'Course Update'),
        ('SESSION', 'Session Reminder'),
        ('SYSTEM', 'System Notification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class EmailNotification(models.Model):
    EMAIL_STATUS = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=EMAIL_STATUS, default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)