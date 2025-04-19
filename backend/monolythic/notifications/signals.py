from django.db.models.signals import post_save
from django.dispatch import receiver

from payments.models import Subscription
from courses.models import CourseDeclaration, CourseOfferingAction
from .models import Notification

@receiver(post_save, sender=Subscription)
def create_subscription_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a subscription is activated.
    This function listens for changes to the Subscription model and creates 
    a notification when the subscription becomes active.
    """
    # Check if subscription was just activated or updated to active state
    if instance.is_active and (created or instance.status == "ACTIVE"):
        # Create notification for the user
        Notification.objects.create(
            user=instance.user,
            title=f"Subscription to {instance.plan.name} Plan Successful",
            message=f"Your subscription to the {instance.plan.name} plan has been activated and will be valid until {instance.end_date.strftime('%d %B, %Y')}.",
            notification_type='PAYMENT',
        )

@receiver(post_save, sender=CourseDeclaration)
def create_course_declaration_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a CourseDeclaration is paid or accepted.
    """
    # Skip on creation since no status change has happened yet
    if created:
        return
    
    enrollment = instance.teacher_student_enrollment
    
    # Notification for when declaration is paid
    if instance.status == CourseDeclaration.PAID:
        # Notify the teacher that their declaration has been paid
        Notification.objects.create(
            user=enrollment.teacher,
            title="Payment Received for Course Declaration",
            message=f"Your course declaration for {enrollment.offer.subject.name} with {enrollment.offer.student.get_full_name()} has been marked as paid. Date: {instance.declaration_date}",
            notification_type='PAYMENT',
        )
    
    # Notification for when declaration is accepted
    elif instance.status == CourseDeclaration.ACCEPTED:
        # Notify the teacher that their declaration has been accepted
        Notification.objects.create(
            user=enrollment.teacher,
            title="Course Declaration Accepted",
            message=f"Your course declaration for {enrollment.offer.subject.name} with {enrollment.offer.student.get_full_name()} has been accepted and is pending payment.",
            notification_type='COURSE',
        )

@receiver(post_save, sender=CourseOfferingAction)
def create_course_offering_action_notification(sender, instance, created, **kwargs):
    """
    Create a notification when a CourseOfferingAction is accepted.
    """
    # Only notify when an offer is accepted
    if instance.action == CourseOfferingAction.ACCEPTED:
        # Notify the student that their course offer has been accepted
        Notification.objects.create(
            user=instance.offer.student,
            title="Course Offer Accepted",
            message=f"Your course offering for {instance.offer.subject.name} has been accepted by {instance.teacher.get_full_name()}.",
            notification_type='COURSE',
        )
        
        # Also notify the teacher as a confirmation
        Notification.objects.create(
            user=instance.teacher,
            title="Course Offer Acceptance Confirmed",
            message=f"You have accepted the course offering for {instance.offer.subject.name} from {instance.offer.student.get_full_name()}.",
            notification_type='COURSE',
        )
