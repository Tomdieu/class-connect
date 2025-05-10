from django.db.models.signals import post_save
from django.dispatch import receiver

from payments.models import Subscription
from courses.models import CourseDeclaration, CourseOfferingAction
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

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
            title=f"Abonnement au Plan {instance.plan.name} Réussi",
            message=f"🇫🇷 Votre abonnement au plan {instance.plan.name} a été activé et sera valide jusqu'au {instance.end_date.strftime('%d %B, %Y')}.\n\n"
                   f"🇬🇧 Your subscription to the {instance.plan.name} plan has been activated and will be valid until {instance.end_date.strftime('%d %B, %Y')}.",
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
            title="Paiement Reçu pour la Déclaration de Cours",
            message=f"🇫🇷 Votre déclaration de cours pour {enrollment.offer.subject.name} avec {enrollment.offer.student.get_full_name()} a été marquée comme payée. Date : {instance.declaration_date}\n\n"
                   f"🇬🇧 Your course declaration for {enrollment.offer.subject.name} with {enrollment.offer.student.get_full_name()} has been marked as paid. Date: {instance.declaration_date}",
            notification_type='PAYMENT',
        )
    
    # Notification for when declaration is accepted
    elif instance.status == CourseDeclaration.ACCEPTED:
        # Notify the teacher that their declaration has been accepted
        Notification.objects.create(
            user=enrollment.teacher,
            title="Déclaration de Cours Acceptée",
            message=f"🇫🇷 Votre déclaration de cours pour {enrollment.offer.subject.name} avec {enrollment.offer.student.get_full_name()} a été acceptée et est en attente de paiement.\n\n"
                   f"🇬🇧 Your course declaration for {enrollment.offer.subject.name} with {enrollment.offer.student.get_full_name()} has been accepted and is pending payment.",
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
            title="Offre de Cours Acceptée",
            message=f"🇫🇷 Votre offre de cours pour {instance.offer.subject.name} a été acceptée par {instance.teacher.get_full_name()}.\n\n"
                   f"🇬🇧 Your course offering for {instance.offer.subject.name} has been accepted by {instance.teacher.get_full_name()}.",
            notification_type='COURSE',
        )
        
        # Also notify the teacher as a confirmation
        Notification.objects.create(
            user=instance.teacher,
            title="Acceptation de l'Offre de Cours Confirmée",
            message=f"🇫🇷 Vous avez accepté l'offre de cours pour {instance.offer.subject.name} de {instance.offer.student.get_full_name()}.\n\n"
                   f"🇬🇧 You have accepted the course offering for {instance.offer.subject.name} from {instance.offer.student.get_full_name()}.",
            notification_type='COURSE',
        )

@receiver(post_save, sender=User)
def notify_admins_of_new_user(sender, instance, created, **kwargs):
    """
    Create notifications for all admin users when a new user registers.
    """
    if created:  # Only trigger when a new user is created, not on updates
        # Get all admin users
        admin_users = User.objects.filter(is_staff=True)
        
        # Create a notification for each admin
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                title="Nouvel Utilisateur Inscrit",
                message=f"🇫🇷 Un nouvel utilisateur '{instance.get_full_name()}' ({instance.email}) s'est inscrit. Type d'utilisateur: {instance.user_type}.\n\n"
                       f"🇬🇧 A new user '{instance.get_full_name()}' ({instance.email}) has registered. User type: {instance.user_type}.",
                notification_type='SYSTEM',
            )
