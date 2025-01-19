from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserAvailability

@receiver(post_save, sender=UserAvailability)
def create_time_slots(sender, instance:UserAvailability, created, **kwargs):
    """Signal to create time slots when availability is created"""
    if created and instance.is_available:
        instance.create_default_slots()