from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyVisitorViewSet

router = DefaultRouter()
router.register(r'visitors', DailyVisitorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
