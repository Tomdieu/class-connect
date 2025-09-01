from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
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

    @swagger_auto_schema(
        operation_description="Delete multiple notifications by IDs or delete all notifications for the user",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'notification_ids': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_INTEGER),
                    description='Array of notification IDs to delete. If not provided or empty, all user notifications will be deleted.',
                    example=[1, 2, 3, 4]
                )
            },
            example={
                'notification_ids': [1, 2, 3, 4]
            }
        ),
        responses={
            200: openapi.Response(
                description="Success response with deletion details",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING, example='success'),
                        'message': openapi.Schema(type=openapi.TYPE_STRING, example='4 notifications deleted successfully'),
                        'deleted_count': openapi.Schema(type=openapi.TYPE_INTEGER, example=4)
                    }
                )
            ),
            400: openapi.Response(description="Bad request"),
            401: openapi.Response(description="Authentication required")
        },
        tags=['notifications']
    )
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """
        Delete multiple notifications by IDs or delete all notifications for the user
        
        Request body:
        {
            "notification_ids": [1, 2, 3, 4]  # Optional: specific IDs to delete
        }
        
        If no notification_ids provided, all user's notifications will be deleted
        """
        notification_ids = request.data.get('notification_ids', [])
        
        if notification_ids:
            # Delete specific notifications by IDs
            queryset = self.get_queryset().filter(id__in=notification_ids)
            deleted_count = queryset.count()
            queryset.delete()
            return Response({
                'status': 'success',
                'message': f'{deleted_count} notifications deleted successfully',
                'deleted_count': deleted_count
            })
        else:
            # Delete all notifications for the user
            deleted_count = self.get_queryset().count()
            self.get_queryset().delete()
            return Response({
                'status': 'success',
                'message': f'All {deleted_count} notifications deleted successfully',
                'deleted_count': deleted_count
            })

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