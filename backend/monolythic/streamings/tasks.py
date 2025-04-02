from celery import shared_task
from django.conf import settings
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build
import logging
from django.contrib.auth import get_user_model

from .models import VideoConferenceSession

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def add_meeting_to_google_calendar(session_id, title, description, start_time, duration_minutes, meeting_link):
    """
    Celery task to add a Google Meet session to the calendar of the instructor and attendees.
    
    Parameters:
    - session_id: ID of the VideoConferenceSession
    - title: Title of the meeting
    - description: Description of the meeting
    - start_time: ISO-formatted start time
    - duration_minutes: Duration of the meeting in minutes
    - meeting_link: Link to the Google Meet session
    """
    try:
        # Get the session
        session = VideoConferenceSession.objects.get(id=session_id)
        
        # Collect participants (instructor and attendees)
        participants = [session.instructor] + list(session.attendees.all())
        
        # Process start time
        start_time_dt = datetime.fromisoformat(start_time)
        end_time_dt = start_time_dt + timedelta(minutes=int(duration_minutes))
        
        # Configure the Google Calendar API
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        credentials = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )
        
        service = build('calendar', 'v3', credentials=credentials)
        
        # Base event object
        event = {
            'summary': title,
            'description': f"{description}\n\nJoin the meeting: {meeting_link}",
            'start': {
                'dateTime': start_time_dt.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time_dt.isoformat(),
                'timeZone': 'UTC',
            },
            'conferenceData': {
                'entryPoints': [{
                    'entryPointType': 'video',
                    'uri': meeting_link,
                    'label': 'Google Meet'
                }]
            }
        }
        
        # Add attendees
        attendees = []
        for user in participants:
            attendees.append({'email': user.email})
        
        if attendees:
            event['attendees'] = attendees
        
        # Insert the event
        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1,
            sendUpdates='all'  # Send emails to attendees
        ).execute()
        
        logger.info(f"Event created: {created_event.get('htmlLink')}")
        
        # Store the event ID in the session for future reference
        session.calendar_event_id = created_event.get('id')
        session.save(update_fields=['calendar_event_id'])
        
        return created_event.get('id')
        
    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
        raise

@shared_task
def update_calendar_event_attendees(session_id):
    """
    Update the attendees of a calendar event when they change in the session
    """
    try:
        # Get the session
        session = VideoConferenceSession.objects.get(id=session_id)
        
        # If there's no stored calendar event ID, we can't update
        if not hasattr(session, 'calendar_event_id') or not session.calendar_event_id:
            logger.warning(f"No calendar event ID for session {session_id}, can't update attendees")
            return
        
        # Collect participants (instructor and attendees)
        participants = [session.instructor] + list(session.attendees.all())
        
        # Configure the Google Calendar API
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        credentials = service_account.Credentials.from_service_account_file(
            settings.GOOGLE_SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )
        
        service = build('calendar', 'v3', credentials=credentials)
        
        # Get the current event
        event = service.events().get(
            calendarId='primary',
            eventId=session.calendar_event_id
        ).execute()
        
        # Update attendees
        attendees = []
        for user in participants:
            attendees.append({'email': user.email})
        
        event['attendees'] = attendees
        
        # Update the event
        updated_event = service.events().update(
            calendarId='primary',
            eventId=session.calendar_event_id,
            body=event,
            sendUpdates='all'  # Send emails to new/removed attendees
        ).execute()
        
        logger.info(f"Event updated: {updated_event.get('htmlLink')}")
        
        return updated_event.get('id')
        
    except Exception as e:
        logger.error(f"Error updating calendar event attendees: {str(e)}")
        raise
