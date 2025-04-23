from django.shortcuts import get_object_or_404
from django.db import models
from django.core.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import string
import random
from .models import VideoConferenceSession, SessionParticipant, SessionConnection
from .serializers import (
    VideoConferenceSessionSerializer, 
    SessionAttendeeSerializer,
    SessionParticipantSerializer
)
from .filters import VideoConferenceSessionFilter
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from utils.mixins import ActivityLoggingMixin

User = get_user_model()

class VideoConferenceSessionViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = VideoConferenceSession.objects.all()
    serializer_class = VideoConferenceSessionSerializer
    filterset_class = VideoConferenceSessionFilter
    filter_backends = [DjangoFilterBackend]
    permission_classes = [IsAuthenticated]
    lookup_value_regex = '[^/]+'  # Allow any character except forward slash

    def generate_unique_code(self, length=10):
        """Generate a unique code for the meeting session"""
        chars = string.ascii_letters + string.digits
        while True:
            # Generate a random string of specified length
            code = ''.join(random.choice(chars) for _ in range(length))
            
            # Check if code is unique
            if not VideoConferenceSession.objects.filter(code=code).exists():
                return code

    def create_jitsi_meeting_link(self, code):
        """Create a Jitsi meeting link using the unique code"""
        # Use the configured Jitsi server or default to meet.jit.si
        jitsi_server = getattr(settings, 'JITSI_SERVER', 'meet.classconnect.cm')
        return f"https://{jitsi_server}/{code}"

    def create_google_meet_link(self, title, start_time, duration_minutes):
        """Create a Google Meet link for the session (kept for future use)"""
        import logging
        logger = logging.getLogger(__name__)
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        credentials = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )
        service = build('calendar', 'v3', credentials=credentials)
        event = {
            'summary': title,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': (start_time + timedelta(minutes=duration_minutes)).isoformat(),
                'timeZone': 'UTC',
            },
        }
        # Only add conferenceData if enabled and supported
        if getattr(settings, 'ENABLE_GOOGLE_MEET', False):
            event['conferenceData'] = {
                'createRequest': {
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'},  # leave as is if supported by your Google Workspace domain
                    'requestId': f"meet_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                }
            }
            conference_version = 1
        else:
            conference_version = 0

        try:
            created_event = service.events().insert(
                calendarId='primary',
                conferenceDataVersion=conference_version,
                body=event
            ).execute()
            link = created_event.get('hangoutLink', '')
            # Fallback: search in conferenceData.entryPoints if hangoutLink is empty
            if not link and created_event.get('conferenceData'):
                for entry in created_event['conferenceData'].get('entryPoints', []):
                    if entry.get('entryPointType') == 'video' and entry.get('uri'):
                        link = entry.get('uri')
                        break
            return link
        except Exception as e:
            logger.error(f"Error creating meeting event: {str(e)}")
            # Fallback: create event without conference data if error relates to conference
            if conference_version == 1:
                logger.info("Retrying without conferenceData")
                event.pop('conferenceData', None)
                created_event = service.events().insert(
                    calendarId='primary',
                    conferenceDataVersion=0,
                    body=event
                ).execute()
                return created_event.get('hangoutLink', '')
            raise

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title')
        start_time = serializer.validated_data.get('start_time')
        duration_minutes = serializer.validated_data.get('duration_minutes')
        
        # Save the session first to generate the code using the model's default
        session = serializer.save()
        
        # Create a Jitsi meeting link using the generated code
        meeting_link = self.create_jitsi_meeting_link(session.code)
        
        # Update the session with the meeting link
        session.meeting_link = meeting_link
        session.save()
        
        # Log the activity
        self.log_activity(self.request, "Created new video conference session", {
            "session_id": str(session.id),
            "title": title,
            "start_time": str(start_time),
            "meeting_code": session.code
        })
    
    def list(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed list of video conference sessions")
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        self.log_activity(request, "Viewed video conference session details", {
            "session_id": kwargs.get('pk')
        })
        return response
        
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        self.log_activity(request, "Updated video conference session", {
            "session_id": kwargs.get('pk')
        })
        return response
        
    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        self.log_activity(request, "Partially updated video conference session", {
            "session_id": kwargs.get('pk')
        })
        return response
        
    def destroy(self, request, *args, **kwargs):
        session_id = kwargs.get('pk')
        self.log_activity(request, "Deleted video conference session", {
            "session_id": session_id
        })
        return super().destroy(request, *args, **kwargs)
        
    @swagger_auto_schema(
        method='post',
        request_body=SessionAttendeeSerializer,
        responses={
            200: 'Attendees added successfully',
            400: 'Invalid request data'
        },
        operation_description="Add attendees to a video conference session"
    )
    @action(detail=True, methods=['post'], url_path='add-attendees')
    def add_attendees(self, request, pk=None):
        """
        Add attendees to a video conference session
        """
        session = self.get_object()
        serializer = SessionAttendeeSerializer(data=request.data)
        
        if serializer.is_valid():
            user_ids = serializer.validated_data['user_ids']
            users = User.objects.filter(id__in=user_ids)
            
            # Add users as attendees
            session.attendees.add(*users)
            
            # Trigger calendar update if needed
            from .tasks import update_calendar_event_attendees
            update_calendar_event_attendees.delay(
                session_id=str(session.id)
            )
            
            # Log the activity
            self.log_activity(request, "Added attendees to video conference session", {
                "session_id": pk,
                "user_ids": [str(uid) for uid in user_ids]
            })
            
            return Response({'status': 'attendees added'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        method='post',
        request_body=SessionAttendeeSerializer,
        responses={
            200: 'Attendees removed successfully',
            400: 'Invalid request data'
        },
        operation_description="Remove attendees from a video conference session"
    )
    @action(detail=True, methods=['post'], url_path='remove-attendees')
    def remove_attendees(self, request, pk=None):
        """
        Remove attendees from a video conference session
        """
        session = self.get_object()
        serializer = SessionAttendeeSerializer(data=request.data)
        
        if serializer.is_valid():
            user_ids = serializer.validated_data['user_ids']
            users = User.objects.filter(id__in=user_ids)
            
            # Remove users from attendees
            session.attendees.remove(*users)
            
            # Trigger calendar update if needed
            from .tasks import update_calendar_event_attendees
            update_calendar_event_attendees.delay(
                session_id=str(session.id)
            )
            
            # Log the activity
            self.log_activity(request, "Removed attendees from video conference session", {
                "session_id": pk,
                "user_ids": [str(uid) for uid in user_ids]
            })
            
            return Response({'status': 'attendees removed'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        method='get',
        responses={
            200: VideoConferenceSessionSerializer,
            404: 'Session not found'
        },
        operation_description="Retrieve a session by its unique code"
    )
    @action(detail=False, methods=['get'], url_path='code/(?P<code>[^/.]+)')
    def get_by_code(self, request, code=None):
        """
        Get a video conference session by its unique code
        """
        try:
            session = VideoConferenceSession.objects.get(code=code)
            serializer = self.get_serializer(session)
            
            # Log the activity
            self.log_activity(request, "Retrieved video conference session by code", {
                "session_id": str(session.id),
                "code": code
            })
            
            return Response(serializer.data)
        except VideoConferenceSession.DoesNotExist:
            return Response(
                {"detail": "Session with this code does not exist."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def get_object(self):
        """
        Returns the object the view is displaying.
        Handles both UUID and code lookups.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get the lookup value from the URL
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        try:
            # Try getting object by ID first
            obj = queryset.get(id=lookup_value)
        except (ValueError, ValidationError, VideoConferenceSession.DoesNotExist):
            # If that fails, try getting by code
            obj = queryset.get(code=lookup_value)
        
        # May raise a PermissionDenied exception
        self.check_object_permissions(self.request, obj)
        return obj

class SessionParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = SessionParticipantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return VideoConferenceSession.objects.none()
        # Get the session using either id or code
        session_lookup = self.kwargs['session_pk']
        try:
            session = VideoConferenceSession.objects.get(
                models.Q(id=session_lookup) | models.Q(code=session_lookup)
            )
        except (ValueError, ValidationError):
            session = VideoConferenceSession.objects.get(code=session_lookup)

        return SessionParticipant.objects.filter(
            session=session
        ).select_related('user', 'session')

    def create(self, request, *args, **kwargs):
        """
        Override create to handle existing participants gracefully
        """
        session_lookup = self.kwargs['session_pk']
        try:
            session = VideoConferenceSession.objects.get(
                models.Q(id=session_lookup) | models.Q(code=session_lookup)
            )
        except (ValueError, ValidationError):
            session = VideoConferenceSession.objects.get(code=session_lookup)

        # Check if participant already exists
        existing_participant = SessionParticipant.objects.filter(
            session=session,
            user=request.user
        ).first()

        if existing_participant:
            # If participant exists, return the existing record
            serializer = self.get_serializer(existing_participant)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If participant doesn't exist, create new one
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """Create a new participant entry"""
        session_lookup = self.kwargs['session_pk']
        try:
            session = VideoConferenceSession.objects.get(
                models.Q(id=session_lookup) | models.Q(code=session_lookup)
            )
        except (ValueError, ValidationError):
            session = VideoConferenceSession.objects.get(code=session_lookup)

        serializer.save(
            session=session,
            user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def join(self, request, *args, **kwargs):
        participant = self.get_object()
        participant.add_connection()
        return Response({'status': 'joined'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def leave(self, request, *args, **kwargs):
        participant = self.get_object()
        participant.end_current_connection()
        return Response({'status': 'left'}, status=status.HTTP_200_OK)
