from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import UserAvailability,Class,Subject
from django.core.cache import cache

@receiver(post_save, sender=UserAvailability)
def create_time_slots(sender, instance:UserAvailability, created, **kwargs):
    """Signal to create time slots when availability is created"""
    if created and instance.is_available:
        instance.create_default_slots()

# invalidate caches when ever we add or remove a  class,subject
@receiver([post_save,post_delete],sender=Class)
def invalidate_class_cache(sender,instance,**kwargs):
    
    if instance.id:
        # invalidate user_info cache
        cache.delete_pattern(f'*class_detail*')
    
    # TODO
    cache.delete_pattern('*class_list*')
    
@receiver([post_save,post_delete],sender=Subject)
def invalidate_subjects_cache(sender,instance,**kwargs):
    
    if instance.id:
        # invalidate user_info cache
        cache.delete_pattern(f'*subjects_list*')
    
    # TODO
    cache.delete_pattern('*class_list*')