from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Notification, EmailNotification
from .serializers import NotificationSerializer, EmailNotificationSerializer
from .filters import NotificationFilter, EmailNotificationFilter

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = NotificationFilter
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(read=True)
        return Response({'status': 'all notifications marked as read'})

class EmailNotificationViewSet(viewsets.ModelViewSet):
    queryset = EmailNotification.objects.all()
    serializer_class = EmailNotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EmailNotificationFilter
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return EmailNotification.objects.all()
        return EmailNotification.objects.filter(user_id=self.request.user.id)

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        email_notification = self.get_object()
        # Add email resending logic here
        return Response({'status': 'email queued for resending'})