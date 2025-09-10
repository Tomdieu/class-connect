from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class DailyVisitor(models.Model):
    visitor_id = models.CharField(max_length=255)  # from frontend
    date = models.DateField(auto_now_add=True)
    time = models.DateTimeField(auto_now_add=True)

    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    referrer = models.CharField(max_length=500, blank=True, null=True)

    path = models.CharField(max_length=255)  # page they visited
    browser_language = models.CharField(max_length=20, blank=True, null=True)
    screen_width = models.IntegerField(blank=True, null=True)
    screen_height = models.IntegerField(blank=True, null=True)

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, blank=True, null=True
    )

    class Meta:
        unique_together = ("visitor_id", "date")

    def __str__(self):
        return f"{self.visitor_id} on {self.date}"
