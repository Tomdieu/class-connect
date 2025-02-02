from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import UserAvailability,Class,Subject,UserClass
from django.core.cache import cache
from django.contrib.auth import get_user_model

User = get_user_model()

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
    
# create a user class when a user is created
@receiver(post_save,sender=User)
def create_user_class(sender,instance,created,**kwargs):
    if created:
        education_level = instance.education_level
        if education_level == 'LYCEE':
            class_name = instance.lycee_class
            if class_name:
                class_obj = Class.objects.get_or_create(name=class_name,education_level=education_level)
                UserClass.objects.create(user=instance,class_name=class_obj)
            else:
                pass
        if education_level == 'UNIVERSITY':
            class_name = instance.university_year
            if class_name:
                class_obj = Class.objects.get_or_create(name=class_name,education_level=education_level)
                UserClass.objects.create(user=instance,class_name=class_obj)
            else:
                pass