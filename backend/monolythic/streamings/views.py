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
from .serializers import VideoConferenceSessionSerializer
from .filters import VideoConferenceSessionFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

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

# class SessionParticipantViewSet(viewsets.ModelViewSet):
#     serializer_class = SessionParticipantSerializer
#     filterset_class = SessionParticipantFilter
    
#     def get_queryset(self):
#         if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
#             return SessionParticipant.objects.none()  # Return empty queryset for swagger
            
#         session_id = self.kwargs.get('session_pk')
#         if session_id:
#             return SessionParticipant.objects.filter(session_id=session_id)
#         return SessionParticipant.objects.all()
    
#     def perform_create(self, serializer):
#         session_id = self.kwargs.get('session_pk')
#         if session_id:
#             serializer.save(session_id=session_id)
#         else:
#             serializer.save()
