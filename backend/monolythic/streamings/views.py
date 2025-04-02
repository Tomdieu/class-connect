from django.shortcuts import render
import django_filters
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from .models import VideoConferenceSession
from .serializers import VideoConferenceSessionSerializer, SessionAttendeeSerializer
from .filters import VideoConferenceSessionFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

User = get_user_model()

class VideoConferenceSessionViewSet(viewsets.ModelViewSet):
    queryset = VideoConferenceSession.objects.all()
    serializer_class = VideoConferenceSessionSerializer
    filterset_class = VideoConferenceSessionFilter
    filter_backends = [DjangoFilterBackend]
    permission_classes = [IsAuthenticated]

    def create_google_meet_link(self, title, start_time, duration_minutes):
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
            'conferenceData': {
                'createRequest': {
                    'requestId': f"meet_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            }
        }
        
        event = service.events().insert(
            calendarId='primary',
            conferenceDataVersion=1,
            body=event
        ).execute()
        
        return event.get('hangoutLink')

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title')
        start_time = serializer.validated_data.get('start_time')
        duration_minutes = serializer.validated_data.get('duration_minutes')
        
        meeting_link = self.create_google_meet_link(title, start_time, duration_minutes)
        serializer.save(meeting_link=meeting_link)
        
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
            
            return Response({'status': 'attendees added'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
            
            return Response({'status': 'attendees removed'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
