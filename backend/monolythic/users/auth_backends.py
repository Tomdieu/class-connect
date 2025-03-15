from oauth2_provider.models import AccessToken
from django.contrib.auth import get_user_model
from social_django.models import UserSocialAuth
from drf_social_oauth2.backends import DjangoOAuth2

User = get_user_model()

class CustomDjangoOAuth2(DjangoOAuth2):
    """
    Custom OAuth2 backend to ensure correct user authentication
    """
    
    def authenticate(self, request=None, token=None, **kwargs):
        """
        Authenticates a user based on the token provided
        """
        if not token:
            return None
            
        try:
            access_token = AccessToken.objects.select_related('user').get(token=token)
            return access_token.user
        except AccessToken.DoesNotExist:
            return None
            
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
