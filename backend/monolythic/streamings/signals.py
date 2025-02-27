from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VideoConferenceSession
from .tasks import add_meeting_to_google_calendar

@receiver(post_save, sender=VideoConferenceSession)
def handle_new_conference_session(sender, instance, created, **kwargs):
    """
    Signal handler to trigger calendar event creation when a new video conference session is created
    """
    if created:
        # When a new conference session is created, dispatch the task to add it to participants' calendars
        add_meeting_to_google_calendar.delay(
            session_id=str(instance.id),
            title=instance.title,
            description=instance.description,
            start_time=instance.start_time.isoformat(),
            duration_minutes=instance.duration_minutes,
            meeting_link=instance.meeting_link
        )
