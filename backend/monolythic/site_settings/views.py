from django.shortcuts import render
from rest_framework.generics import RetrieveUpdateAPIView
from .serializers import SiteConfigurationSerializer
from .models import SiteConfiguration

# Create your views here.

class SiteConfigurationView(RetrieveUpdateAPIView):
    serializer_class = SiteConfigurationSerializer
    
    def get_object(self):
        return SiteConfiguration.get_solo()
