from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import SchoolYear, UserAvailability,Class,Subject,UserClass,CourseOfferingAction,TeacherStudentEnrollment, Section, EducationLevel, LevelClassDefinition, Speciality
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
@receiver(post_save, sender=User)
def create_user_class(sender, instance, created, **kwargs):
    """Create a user class association when a user is created"""
    logger.info(f"create_user_class signal triggered for user {instance.id} - created: {created}")
    
    if not created:
        logger.info(f"User {instance.id} not newly created, skipping class creation")
        return
    
    try:
        # If class_enrolled is already set, just create the UserClass entry
        if instance.class_enrolled:
            logger.info(f"User {instance.id} already has class_enrolled set to {instance.class_enrolled.id}")
            user_class = UserClass.objects.create(
                user=instance, 
                class_level=instance.class_enrolled
            )
            logger.info(f"Created UserClass {user_class.id} for user {instance.id}")
            return
            
        # Otherwise, leave it to be set through other means
        logger.info(f"User {instance.id} has no class_enrolled set, skipping UserClass creation")
    
    except Exception as e:
        logger.error(f"Error creating user class for user {instance.id}: {str(e)}", exc_info=True)

@receiver(post_save,sender=CourseOfferingAction)
def create_teacher_enrollment_when_offering_action_mark_as_accepted(sender, instance, created, **kwargs):
    """Create a teacher enrollment when the offering action is marked as accepted"""
    logger.info(f"create_teacher_enrollment signal triggered for action {instance.id} - created: {created}")
    
    if created:
        logger.info(f"Offering action {instance.id} newly created, no enrollment needed yet")
        pass
    else:
        logger.info(f"Offering action {instance.id} updated, action: {instance.action}")
        if instance.action == CourseOfferingAction.ACCEPTED:
            logger.info(f"Offering action {instance.id} marked as ACCEPTED")
            try:
                # Check if the enrollment already exists
                enrollment = TeacherStudentEnrollment.objects.filter(
                    offer=instance.offer,
                    teacher=instance.teacher
                ).first()
                
                if not enrollment:
                    logger.info(f"Creating new enrollment for offer {instance.offer.id}, teacher {instance.teacher.id}")
                    enrollment = TeacherStudentEnrollment.objects.create(
                        offer=instance.offer,
                        teacher=instance.teacher,
                        school_year=SchoolYear.current_year()  # Add parentheses to call the method
                    )
                    logger.info(f"Created enrollment {enrollment.id}")
                
                # Set the offer's is_available to False
                logger.info(f"Setting offer {instance.offer.id} to unavailable")
                instance.offer.is_available = False
                instance.offer.save()
                logger.info(f"Successfully updated offer {instance.offer.id}")
                    
            except Exception as e:
                logger.error(f"Error creating teacher enrollment for offering action {instance.id}: {str(e)}", exc_info=True)
        else:
            logger.info(f"Offering action {instance.id} not marked as ACCEPTED, no enrollment created")
