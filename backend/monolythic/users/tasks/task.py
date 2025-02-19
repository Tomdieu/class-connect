from __future__ import absolute_import,unicode_literals
from typing import Sequence,Any
from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_async_mail(self, subject: Any, message: Any, from_email: str|None, recipient_list: Sequence[str], fail_silently: bool = True):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=True  # Always set to True to prevent exceptions
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        try:
            # Try to retry the task
            self.retry(countdown=60 * 5, exc=e)  # Retry after 5 minutes
        except:
            # If retry fails, just log it and continue
            logger.error("Max retries reached for sending email")
        return False