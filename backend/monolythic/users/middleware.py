from django.http import JsonResponse
from rest_framework import status
from .models import UserActiveToken
from django.conf import settings
import user_agents
import threading
from urllib.parse import parse_qs
from .models import UserActivityLog
from django.utils.timezone import now

# Thread local storage
_thread_locals = threading.local()

def get_current_request():
    return getattr(_thread_locals, 'request', None)

class RequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Store request in thread local storage
        _thread_locals.request = request
        response = self.get_response(request)
        # Clean up
        if hasattr(_thread_locals, 'request'):
            del _thread_locals.request
        return response

class SingleSessionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/') and not request.path.startswith('/api/auth/'):
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                user = request.user

                if user and user.is_authenticated:
                    try:
                        active_token = UserActiveToken.objects.get(user=user)
                        if active_token.token != token:
                            return JsonResponse(
                                {
                                    'error': 'This account is being used on another device.',
                                    'device_info': {
                                        'device_type': active_token.device_type,
                                        'device_name': active_token.device_name,
                                        'last_activity': active_token.last_activity
                                    },
                                    'code': 'invalid_session'
                                }, 
                                status=status.HTTP_401_UNAUTHORIZED
                            )
                    except UserActiveToken.DoesNotExist:
                        pass

        response = self.get_response(request)
        return response

    @staticmethod
    def get_device_info(request):
        if not request:
            return {}
            
        user_agent_string = request.META.get('HTTP_USER_AGENT', '')
        user_agent = user_agents.parse(user_agent_string)
        
        return {
            'device_type': 'mobile' if user_agent.is_mobile else 'tablet' if user_agent.is_tablet else 'desktop',
            'device_name': user_agent.device.family,
            'os_name': user_agent.os.family,
            'os_version': user_agent.os.version_string,
            'browser_name': user_agent.browser.family,
            'browser_version': user_agent.browser.version_string,
            'ip_address': request.META.get('REMOTE_ADDR'),
        }

class UserActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            UserActivityLog.objects.create(
                user=request.user,
                action=f"visited {request.path}",
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                request_method=request.method,
                request_path=request.path,
                referrer=request.META.get("HTTP_REFERER", ""),
                timestamp=now()
            )
        
        return response

    def get_client_ip(self, request):
        """ Get the real IP address of the user. """
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")