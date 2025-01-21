import django_filters
from .models import Notification, EmailNotification

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