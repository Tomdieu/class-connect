from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from .models import VideoConferenceSession, SessionParticipant, ChatMessage
from .serializers import VideoConferenceSessionSerializer, SessionParticipantSerializer, ChatMessageSerializer
from .filters import VideoConferenceSessionFilter, SessionParticipantFilter

class VideoConferenceSessionViewSet(viewsets.ModelViewSet):
    queryset = VideoConferenceSession.objects.all()
    serializer_class = VideoConferenceSessionSerializer
    filterset_class = VideoConferenceSessionFilter

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

class SessionParticipantViewSet(viewsets.ModelViewSet):
    queryset = SessionParticipant.objects.all()
    serializer_class = SessionParticipantSerializer
    filterset_class = SessionParticipantFilter

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        return ChatMessage.objects.filter(session_id=self.kwargs['session_pk'])
