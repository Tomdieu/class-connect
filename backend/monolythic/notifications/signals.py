from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from django.utils.timezone import localtime

from payments.models import Subscription
from courses.models import CourseDeclaration, CourseOfferingAction
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

# Function to send a notification via WebSocket
def send_notification_to_websocket(notification):
    channel_layer = get_channel_layer()
    # Send to the user's notification group
    async_to_sync(channel_layer.group_send)(
        f"user_notifications_{notification.user.id}",
        {
            'type': 'notification',
            'notification_id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'notification_type': notification.notification_type,
            'created_at': localtime(notification.created_at).isoformat()
        }
    )

@receiver(post_save, sender=Notification)
def notification_created_handler(sender, instance, created, **kwargs):
    """Send notification to WebSocket when a new notification is created"""
    if created:
        send_notification_to_websocket(instance)

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
            message=f"Votre abonnement au plan {instance.plan.name} a été activé et sera valide jusqu'au {instance.end_date.strftime('%d %B, %Y')}.",
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
            message=f"Votre déclaration de cours pour {enrollment.offer.subject.name} avec {enrollment.offer.student.get_full_name()} a été marquée comme payée. Date : {instance.declaration_date}",
            notification_type='PAYMENT',
        )
    
    # Notification for when declaration is accepted
    elif instance.status == CourseDeclaration.ACCEPTED:
        # Notify the teacher that their declaration has been accepted
        Notification.objects.create(
            user=enrollment.teacher,
            title="Déclaration de Cours Acceptée",
            message=f"Votre déclaration de cours pour {enrollment.offer.subject.name} avec {enrollment.offer.student.get_full_name()} a été acceptée et est en attente de paiement.",
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
            message=f"Votre offre de cours pour {instance.offer.subject.name} a été acceptée par {instance.teacher.get_full_name()}.",
            notification_type='COURSE',
        )
        
        # Also notify the teacher as a confirmation
        Notification.objects.create(
            user=instance.teacher,
            title="Acceptation de l'Offre de Cours Confirmée",
            message=f"Vous avez accepté l'offre de cours pour {instance.offer.subject.name} de {instance.offer.student.get_full_name()}.",
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
                message=f"Un nouvel utilisateur '{instance.get_full_name()}' ({instance.email}) s'est inscrit. Type d'utilisateur: {instance.user_type}.",
                notification_type='SYSTEM',
            )

from django.core.mail import send_mail
from django.conf import settings
from users.tasks.task import send_async_mail
from .models import ContactReply
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=ContactReply)
def handle_contact_reply(sender, instance, created, **kwargs):
    """
    When a contact reply is created:
    1. Send an email to the contact person
    2. Create a notification if the contact is associated with a user
    """
    if not created:
        # Only run on creation, not updates
        return
    
    # Get the related contact
    contact = instance.contact
    reply_content = instance.message
    admin_name = instance.admin_user.get_full_name() if instance.admin_user else "Admin"
    
    # Update contact status to RESOLVED if it's not already closed
    if contact.status not in ['RESOLVED', 'CLOSED']:
        contact.status = 'RESOLVED'
        contact.save(update_fields=['status'])
    
    # 1. Send email to the contact person
    subject = f"Re: {contact.subject} - Response from {settings.SITE_NAME}"
    email_message = f"""
Hello {contact.name},

Thank you for contacting us about "{contact.subject}".

{admin_name} has replied to your inquiry:

"{reply_content}"

If you have any further questions, please feel free to reply to this email or submit another contact form on our website.

Best regards,
The {settings.SITE_NAME} Team
"""
    
    try:
        # Queue email sending via Celery
        send_async_mail.delay(
            subject=subject,
            message=email_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[contact.email],
            fail_silently=True
        )
        # Mark as sent
        instance.email_sent = True
        instance.save(update_fields=['email_sent'])
    except Exception as e:
        logger.error(f"Error sending contact reply email: {str(e)}")
    
    # 2. Create notification if the contact is associated with a user
    if contact.user:
        try:
            notification = Notification.objects.create(
                user=contact.user,
                title=f"Response to your inquiry: {contact.subject}",
                message=f"An administrator has responded to your inquiry. {reply_content[:100]}{'...' if len(reply_content) > 100 else ''}",
                notification_type='CONTACT_REPLY',
            )
            # Mark notification as sent
            instance.notification_sent = True
            instance.save(update_fields=['notification_sent'])
        except Exception as e:
            logger.error(f"Error creating notification for contact reply: {str(e)}")
