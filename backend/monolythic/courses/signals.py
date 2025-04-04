from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import SchoolYear, UserAvailability,Class,Subject,UserClass,CourseOfferingAction,TeacherStudentEnrollment
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
    logger.info(f"create_user_class signal triggered for user {instance.id} - created: {created}")
    
    if not created:
        logger.info(f"User {instance.id} not newly created, skipping class creation")
        return
        
    try:
        education_level = instance.education_level
        section = instance.language == 'en' and 'ANGLOPHONE' or 'FRANCOPHONE'
        logger.info(f"Processing user {instance.id} with education_level: {education_level}, section: {section}")

        if education_level == 'COLLEGE' and instance.college_class:
            logger.info(f"Attempting to find COLLEGE class: {instance.college_class}")
            class_obj = Class.objects.filter(
                name=instance.college_class,
                level=education_level,
                section=section
            ).first()
            
            if class_obj:
                logger.info(f"Found matching class {class_obj.id} for COLLEGE user {instance.id}")
                user_class = UserClass.objects.create(user=instance, class_level=class_obj)
                logger.info(f"Created UserClass {user_class.id} for user {instance.id}")
            else:
                logger.warning(f"No matching COLLEGE class found for user {instance.id}")
                
        elif education_level == 'LYCEE' and instance.lycee_class:
            logger.info(f"Attempting to find LYCEE class: {instance.lycee_class}, speciality: {instance.lycee_speciality}")
            class_obj = Class.objects.filter(
                name=instance.lycee_class,
                level=education_level,
                section=section,
                speciality=instance.lycee_speciality
            ).first()
            
            if class_obj:
                logger.info(f"Found matching class {class_obj.id} for LYCEE user {instance.id}")
                user_class = UserClass.objects.create(user=instance, class_level=class_obj)
                logger.info(f"Created UserClass {user_class.id} for user {instance.id}")
            else:
                logger.warning(f"No matching LYCEE class found for user {instance.id}")
                
        elif education_level == 'UNIVERSITY' and instance.university_year:
            logger.info(f"Attempting to find UNIVERSITY class: {instance.university_year}, level: {instance.university_level}")
            class_obj = Class.objects.filter(
                name=instance.university_year,
                level=education_level,
                section=section,
                description=instance.university_level
            ).first()
            
            if class_obj:
                logger.info(f"Found matching class {class_obj.id} for UNIVERSITY user {instance.id}")
                user_class = UserClass.objects.create(user=instance, class_level=class_obj)
                logger.info(f"Created UserClass {user_class.id} for user {instance.id}")
            else:
                logger.warning(f"No matching UNIVERSITY class found for user {instance.id}")
        else:
            logger.warning(f"User {instance.id} has incomplete education information. Level: {education_level}")

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
