from users.models import UserActivityLog
from django.utils.timezone import now

class ActivityLoggingMixin:
    def log_activity(self, request, action, extra_data=None):
        """ Log API activity with more details """
        if request.user.is_authenticated:
            UserActivityLog.objects.create(
                user=request.user,
                action=action,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", ""),
                request_method=request.method,
                request_path=request.path,
                referrer=request.META.get("HTTP_REFERER", ""),
                extra_data=extra_data or {},
                timestamp=now()
            )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0]
        return request.META.get("REMOTE_ADDR")
