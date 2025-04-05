from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, F
from django.utils import timezone

# Create your models here.

User = get_user_model()

class Forum(models.Model):
    name = models.CharField(max_length=25, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Post(models.Model):
    """
    Renamed from Messages to better reflect Facebook style posts
    """
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='posts')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    file = models.FileField(upload_to='posts/files', blank=True, null=True)
    image = models.ImageField(upload_to='posts/images', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Fields for tracking engagement
    view_count = models.PositiveIntegerField(default=0)
    
    @property
    def reaction_counts(self):
        """Get counts of each reaction type for this post"""
        return Reaction.objects.filter(post=self).values('reaction_type').annotate(
            count=Count('reaction_type')
        )
    
    @property
    def comment_count(self):
        """Get count of comments for this post"""
        return Post.objects.filter(parent=self).count()
    
    @property 
    def is_comment(self):
        """Check if this post is a comment"""
        return self.parent is not None

    def __str__(self):
        return f"{self.sender} - {self.content[:30]}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'

# Keep Messages as a proxy model for backward compatibility
class Messages(Post):
    class Meta:
        proxy = True
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

class ReactionType(models.TextChoices):
    LIKE = 'LIKE', 'Like'
    LOVE = 'LOVE', 'Love'
    HAHA = 'HAHA', 'Haha'
    WOW = 'WOW', 'Wow'
    SAD = 'SAD', 'Sad'
    ANGRY = 'ANGRY', 'Angry'

class Reaction(models.Model):
    """
    Reactions to posts (like, love, haha, etc.)
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    reaction_type = models.CharField(
        max_length=10, 
        choices=ReactionType.choices,
        default=ReactionType.LIKE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensure a user can only have one reaction per post
        unique_together = ('post', 'user')
        
    def __str__(self):
        return f"{self.user} {self.reaction_type} on {self.post}"

class Seen(models.Model):
    """
    Track when users have seen posts
    """
    post = models.ForeignKey(Post, related_name='seen', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='seen_posts', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')
        
    def __str__(self):
        return f"{self.user} - {self.post}"

class Notification(models.Model):
    """
    User notifications for activity on posts
    """
    NOTIFICATION_TYPES = [
        ('REACTION', 'Someone reacted to your post'),
        ('COMMENT', 'Someone commented on your post'),
        ('REPLY', 'Someone replied to your comment'),
        ('MENTION', 'Someone mentioned you in a post'),
    ]
    
    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_notifications', on_delete=models.CASCADE)
    post = models.ForeignKey(Post, related_name='notifications', on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.notification_type} for {self.recipient} from {self.sender}"
    
    class Meta:
        ordering = ['-created_at']