import django_filters
from .models import Notification, EmailNotification, Contact, ContactReply

class NotificationFilter(django_filters.FilterSet):
    notification_type = django_filters.ChoiceFilter(choices=Notification.NOTIFICATION_TYPES)
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Notification
        fields = ['user_id', 'notification_type', 'read']

class EmailNotificationFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=EmailNotification.EMAIL_STATUS)
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = EmailNotification
        fields = ['user_id', 'status']

class ContactFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Contact.CONTACT_STATUS)
    created_at = django_filters.DateTimeFromToRangeFilter()
    concerns_student = django_filters.BooleanFilter()
    has_user = django_filters.BooleanFilter(field_name='user', lookup_expr='isnull', exclude=True)
    
    class Meta:
        model = Contact
        fields = ['status', 'concerns_student', 'created_at', 'user']
        
class ContactReplyFilter(django_filters.FilterSet):
    created_at = django_filters.DateTimeFromToRangeFilter()
    email_sent = django_filters.BooleanFilter()
    notification_sent = django_filters.BooleanFilter()
    
    class Meta:
        model = ContactReply
        fields = ['contact', 'admin_user', 'created_at', 'email_sent', 'notification_sent']