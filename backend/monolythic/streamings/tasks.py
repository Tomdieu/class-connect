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
    Celery task to add a Google Meet session to the calendars of students in the same class as the course.
    
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
        
        # Find students who are in the same subject
        # This assumes there's a way to find students for a subject
        # You might need to adjust this based on your actual data model
        subject = session.subject
        class_level = subject.class_level
        
        # Get students from this class/subject
        # Here we would query based on your app's specific relationships
        # This is a simplified example - you'll need to adapt it to your data model
        from courses.models import TeacherStudentEnrollment, CourseOffering
        
        # Find course offerings for this subject and class
        course_offerings = CourseOffering.objects.filter(
            subject=subject,
            class_level=class_level,
            is_available=True
        )
        
        # Get students from enrollments
        enrollments = TeacherStudentEnrollment.objects.filter(
            offer__in=course_offerings,
            status="ACTIVE"
        )
        
        # Collect unique students (the ones who should receive calendar invites)
        students = set()
        for enrollment in enrollments:
            students.add(enrollment.offer.student)
        
        # Add the instructor as well
        students.add(session.instructor)
        
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
        
        # Add attendees (if they have Google accounts/emails)
        attendees = []
        for user in students:
            attendees.append({'email': user.email})
        
        if attendees:
            event['attendees'] = attendees
        
        # Insert the event
        # Note: In a real implementation, you would need to access each user's calendar
        # This example assumes a service account with delegated access or a shared calendar
        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1,
            sendUpdates='all'  # Send emails to attendees
        ).execute()
        
        logger.info(f"Event created: {created_event.get('htmlLink')}")
        
        return created_event.get('id')
        
    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
        raise
