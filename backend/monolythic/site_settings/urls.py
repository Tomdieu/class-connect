from django.urls import path
from .views import SiteConfigurationView

urlpatterns = [
    path("settings/",SiteConfigurationView.as_view(),name="site-configuration")
]