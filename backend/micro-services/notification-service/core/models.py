from django.db import models

# Create your models here.

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('PAYMENT', 'Payment Notification'),
        ('COURSE', 'Course Update'),
        ('SESSION', 'Session Reminder'),
        ('SYSTEM', 'System Notification'),
    ]
    
    user_id = models.IntegerField()  # Reference to User service
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
    
    user_id = models.IntegerField()  # Reference to User service
    subject = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=EMAIL_STATUS, default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)