from django.db import models
from django.contrib.auth import  get_user_model
# Create your models here.

User = get_user_model()

class Forum(models.Model):
    name = models.CharField(max_length=25,unique=True)

    def __str__(self):
        return self.name

class Messages(models.Model):
    forum  = models.ForeignKey(Forum,on_delete=models.CASCADE,related_name='messages')
    sender = models.ForeignKey(User,on_delete=models.CASCADE,related_name='messages')
    content = models.TextField()
    file = models.FileField(upload_to='/chat-files/files',blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} {self.content}"

class Seen(models.Model):
    message = models.ForeignKey(Messages,related_name='seen',on_delete=models.CASCADE)
    user = models.ForeignKey(User,related_name='seen',on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user} - {self.message}"