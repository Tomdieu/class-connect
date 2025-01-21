from rest_framework.authentication import BaseAuthentication
import requests
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed

from .models import User

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.META.get('Authorization')
        if not token:
            return None
        url = settings.AUTH_SERVICE_URL + '/api/users/info/'
        try:
            response = requests.get(url, headers={'Authorization': token})
            response.raise_for_status()
            user_info = response.json()
        except requests.exceptions.RequestException as e:
            raise AuthenticationFailed('Authentication failed. Error: {}'.format(str(e)))
                    
        # Check if the authenticated data exists in the service, if not create it
        user,_ = User.objects.get_or_create(email=user_info['email'], defaults=user_info)
        
        # Manually set is_authenticated to True
        user.is_authenticated = True
        
        return user, None