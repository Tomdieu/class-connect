from django.dispatch import receiver
from django.db.models.signals import post_delete,post_save
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from .models import UserActivityLog
from django.utils.timezone import now
from utils.thread_local import get_request  # Get stored request
from oauth2_provider.models import AccessToken

User = get_user_model()

@receiver([post_save,post_delete],sender=User)
def invalidate_cache(sender,instance,**kwargs):
    
    if instance.id:
        # invalidate user_info cache
        cache.delete_pattern(f'*user_info*')
    
    # TODO
    cache.delete_pattern('*user_list*')

def get_client_ip(request):
    if request:
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")
    return None

@receiver(user_logged_in)
def log_login(sender, request, user, **kwargs):
    request = get_request()  # Retrieve request from thread-local storage
    UserActivityLog.objects.create(
        user=user,
        action="logged in",
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "") if request else "",
        request_method=request.method if request else "",
        request_path=request.path if request else "",
        referrer=request.META.get("HTTP_REFERER", "") if request else "",
        timestamp=now()
    )

@receiver(user_logged_out)
def log_logout(sender, request, user, **kwargs):
    request = get_request()  # Retrieve request from thread-local storage
    UserActivityLog.objects.create(
        user=user,
        action="logged out",
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "") if request else "",
        request_method=request.method if request else "",
        request_path=request.path if request else "",
        referrer=request.META.get("HTTP_REFERER", "") if request else "",
        timestamp=now()
    )

@receiver(user_login_failed)
def log_login_failed(sender, credentials, request, **kwargs):
    request = get_request()  # Retrieve request from thread-local storage
    UserActivityLog.objects.create(
        user=None,
        action=f"failed login attempt for {credentials.get('username')}",
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "") if request else "",
        request_method=request.method if request else "",
        request_path=request.path if request else "",
        referrer=request.META.get("HTTP_REFERER", "") if request else "",
        timestamp=now()
    )

@receiver(post_save, sender=AccessToken)
def log_oauth2_login(sender, instance, created, **kwargs):
    """Logs user login when an access token is generated."""
    if created:  # Only log when a new access token is created
        user = instance.user
        # Get the current request from thread local storage instead of using the instance
        request = get_request()
        UserActivityLog.objects.create(
            user=user,
            action="Connexion via OAuth2 réussie",
            timestamp=now(),
            # Use the request object, not the AccessToken instance
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "") if request else "",
            request_method=request.method if request else "",
            request_path=request.path if request else "",
            referrer=request.META.get("HTTP_REFERER", "") if request else "",
        )