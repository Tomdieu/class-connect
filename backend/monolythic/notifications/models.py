from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

# Create your models here.

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('PAYMENT', 'Payment Notification'),
        ('COURSE', 'Course Update'),
        ('SESSION', 'Session Reminder'),
        ('SYSTEM', 'System Notification'),
        ('CONTACT_REPLY', 'Contact Reply'),
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

class Contact(models.Model):
    CONTACT_STATUS = [
        ('NEW', 'New'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                            help_text="User account (if the person is logged in)")
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    concerns_student = models.BooleanField(null=True, blank=True, help_text="Does this contact message concern a student?")
    status = models.CharField(max_length=20, choices=CONTACT_STATUS, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']
        
class ContactReply(models.Model):
    """
    Model for storing admin replies to contact submissions.
    When a reply is created, an email is sent to the contact person
    and a notification is created if they are a registered user.
    """
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='replies')
    admin_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='contact_replies')
    message = models.TextField()
    email_sent = models.BooleanField(default=False)
    notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Reply to {self.contact.name} ({self.created_at.strftime('%Y-%m-%d')})"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Reply'
        verbose_name_plural = 'Contact Replies'