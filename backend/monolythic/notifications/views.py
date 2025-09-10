from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Notification, EmailNotification, Contact, ContactReply
from .serializers import (
    NotificationSerializer, EmailNotificationSerializer, 
    ContactSerializer, ContactReplySerializer
)
from .filters import NotificationFilter, EmailNotificationFilter, ContactFilter, ContactReplyFilter

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

class ContactViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing contact form submissions.
    Anyone can create a contact submission.
    Authenticated users can view their own submissions.
    Admins can view, update, or delete all submissions.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ContactFilter
    
    def get_permissions(self):
        """
        - Create action (POST) is allowed for anyone
        - List/Retrieve actions are allowed for authenticated users (they'll only see their own)
        - Update/Delete actions require staff permissions
        """
        if self.action == 'create':
            return [permissions.AllowAny()]
        elif self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
        
    def get_queryset(self):
        """
        - Admin users can see all contacts
        - Regular authenticated users can only see their own contacts
        """
        if self.request.user.is_staff:
            return Contact.objects.all()
        elif self.request.user.is_authenticated:
            return Contact.objects.filter(user=self.request.user)
        return Contact.objects.none()
    
    @swagger_auto_schema(
        operation_description="Submit a new contact form. Available to anyone, authenticated or not.",
        request_body=ContactSerializer,
        responses={
            201: ContactSerializer,
            400: "Bad Request"
        },
        tags=['contact']
    )
    def create(self, request, *args, **kwargs):
        # If user is authenticated, automatically associate the contact with their account
        if request.user.is_authenticated:
            # Create a mutable copy of request.data
            data = request.data.copy() if hasattr(request.data, 'copy') else request.data
            
            # Set the name and email from the user if not provided
            if not data.get('name'):
                data['name'] = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email
            if not data.get('email'):
                data['email'] = request.user.email
                
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    @swagger_auto_schema(
        operation_description="Reply to a contact submission",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['message'],
            properties={
                'message': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Reply message content'
                )
            }
        ),
        responses={
            201: ContactReplySerializer,
            400: "Bad Request",
            404: "Contact not found",
            403: "Permission denied"
        },
        tags=['contact']
    )
    def reply(self, request, pk=None):
        """
        Create a reply to a contact submission. 
        This will:
        1. Create a ContactReply record
        2. Send an email to the contact person
        3. Create a notification if the contact is a registered user
        4. Update the contact status to RESOLVED
        """
        contact = self.get_object()
        message = request.data.get('message')
        
        if not message:
            return Response(
                {'error': 'Message content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the reply
        reply = ContactReply.objects.create(
            contact=contact,
            admin_user=request.user,
            message=message
        )
        
        # Serializer to return in response
        serializer = ContactReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    @swagger_auto_schema(
        operation_description="Get all replies for a specific contact submission",
        responses={
            200: ContactReplySerializer(many=True),
            404: "Contact not found",
            403: "Permission denied"
        },
        tags=['contact']
    )
    def replies(self, request, pk=None):
        """Get all replies for a specific contact submission"""
        contact = self.get_object()
        
        # Get all replies for this contact
        replies = contact.replies.all().order_by('created_at')
        
        # Serialize and return
        serializer = ContactReplySerializer(replies, many=True)
        return Response(serializer.data)
        
    @swagger_auto_schema(
        operation_description="Update contact status",
        responses={
            200: ContactSerializer,
            404: "Contact not found",
            403: "Permission denied"
        },
        tags=['contact']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="List contact submissions. Regular users see only their own submissions, admins see all.",
        manual_parameters=[
            openapi.Parameter('status', openapi.IN_QUERY, description="Filter by status", type=openapi.TYPE_STRING),
            openapi.Parameter('concerns_student', openapi.IN_QUERY, description="Filter by student concern", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('has_user', openapi.IN_QUERY, description="Filter contacts with user accounts (true) or anonymous contacts (false)", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('user', openapi.IN_QUERY, description="Filter by specific user ID (admin only)", type=openapi.TYPE_INTEGER),
        ],
        responses={
            200: ContactSerializer(many=True),
            401: "Authentication required",
            403: "Permission denied"
        },
        tags=['contact']
    )
    def list(self, request, *args, **kwargs):
        # Use django-filter-backend for filtering
        # This will be handled by the ContactFilter class
        
        # Apply query parameters directly
        status_filter = request.query_params.get('status')
        concerns_student = request.query_params.get('concerns_student')
        has_user = request.query_params.get('has_user')
        user_id = request.query_params.get('user')
        
        queryset = self.queryset
        
        # Apply filters manually for better control
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        if concerns_student is not None:
            concerns_student_bool = concerns_student.lower() == 'true'
            queryset = queryset.filter(concerns_student=concerns_student_bool)
            
        if has_user is not None:
            has_user_bool = has_user.lower() == 'true'
            queryset = queryset.filter(user__isnull=not has_user_bool)
            
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        self.queryset = queryset
        return super().list(request, *args, **kwargs)
        
class ContactReplyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing contact replies.
    - Only staff users can create, update, or delete contact replies.
    - Authenticated users can view replies to their own contact submissions.
    """
    queryset = ContactReply.objects.all()
    serializer_class = ContactReplySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ContactReplyFilter
    
    def get_permissions(self):
        """
        - Create/Update/Delete actions require staff permissions
        - List/Retrieve actions are allowed for authenticated users (they'll only see replies to their own contacts)
        """
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
    
    @swagger_auto_schema(
        operation_description="Create a reply to a contact",
        request_body=ContactReplySerializer,
        responses={
            201: ContactReplySerializer,
            400: "Bad Request",
            403: "Permission denied"
        },
        tags=['contact-replies']
    )
    def create(self, request, *args, **kwargs):
        # Set the admin_user automatically
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(admin_user=request.user)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        """
        - Admin users can see all replies
        - Regular authenticated users can only see replies to their own contacts
        - Filter replies by contact if contact_id is provided in query params
        """
        queryset = ContactReply.objects.all()
        
        if not self.request.user.is_staff:
            # Regular users can only see replies to their own contacts
            queryset = queryset.filter(contact__user=self.request.user)
        
        contact_id = self.request.query_params.get('contact')
        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)
            
        return queryset