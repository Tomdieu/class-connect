from __future__ import absolute_import,unicode_literals

from typing import Sequence,Any

from celery import shared_task
from django.core.mail import BadHeaderError, send_mail

@shared_task
def send_async_mail(subject:Any,message:Any,from_email:str|None,recipient_list:Sequence[str],fail_silently:bool):
