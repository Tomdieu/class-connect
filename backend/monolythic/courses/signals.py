from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import UserAvailability,Class,Subject,UserClass
from django.core.cache import cache
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

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
    
# create a user class when a user is created and put the user in the correct class
@receiver(post_save,sender=User)
def create_user_class(sender, instance, created, **kwargs):
    """Create a user class association when a user is created"""
    if not created:
        return
        
    try:
        education_level = instance.education_level
        section = instance.language == 'en' and 'ANGLOPHONE' or 'FRANCOPHONE'

        if education_level == 'COLLEGE' and instance.college_class:
            class_obj = Class.objects.filter(
                name=instance.college_class,
                level=education_level,
                section=section
            ).first()
            
            if class_obj:
                UserClass.objects.create(user=instance, class_level=class_obj)
                
        elif education_level == 'LYCEE' and instance.lycee_class:
            class_obj = Class.objects.filter(
                name=instance.lycee_class,
                level=education_level,
                section=section,
                speciality=instance.lycee_speciality
            ).first()
            
            if class_obj:
                UserClass.objects.create(user=instance, class_level=class_obj)
                
        elif education_level == 'UNIVERSITY' and instance.university_year:
            class_obj = Class.objects.filter(
                name=instance.university_year,
                level=education_level,
                section=section,
                description=instance.university_level
            ).first()
            
            if class_obj:
                UserClass.objects.create(user=instance, class_level=class_obj)

    except Exception as e:
        logger.error(f"Error creating user class for user {instance.id}: {str(e)}")