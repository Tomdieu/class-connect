from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, DateField
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.db.models.functions import ExtractMonth, ExtractYear, ExtractDay
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import datetime
from .models import DailyVisitor
from .serializers import DailyVisitorSerializer
from .filters import DailyVisitorFilter
from utils.mixins import ActivityLoggingMixin

class DailyVisitorViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = DailyVisitor.objects.all()
    serializer_class = DailyVisitorSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DailyVisitorFilter
    swagger_tags = ["Analytics"]

    def get_permissions(self):
        if self.action == 'create':
            # Allow anyone to create a visitor record
            permission_classes = [AllowAny]
        else:
            # Only authenticated users can view visitor data
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        # Get the client IP from the request
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')
            
        # Add IP address to the data if not provided
        if 'ip_address' not in request.data:
            request.data['ip_address'] = ip_address
            
        # Add the user if they are authenticated
        if request.user.is_authenticated and 'user' not in request.data:
            request.data['user'] = request.user.id
            
        return super().create(request, *args, **kwargs)
        
    @swagger_auto_schema(
        tags=["Analytics"],
        responses={
            200: openapi.Response(
                description="Visitor statistics",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'daily_visits': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'date': openapi.Schema(type=openapi.TYPE_STRING),
                                    'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                                }
                            )
                        ),
                        'total_visits': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'unique_visitors': openapi.Schema(type=openapi.TYPE_INTEGER),
                    }
                )
            )
        }
    )
    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Get visitor statistics for the past 30 days
        """
        # Only authenticated users can access statistics
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        end_date = timezone.now().date()
        start_date = end_date - datetime.timedelta(days=30)
        
        # Daily visits
        daily_visits = DailyVisitor.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Total visits in period
        total_visits = DailyVisitor.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).count()
        
        # Unique visitors (based on visitor_id)
        unique_visitors = DailyVisitor.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('visitor_id').distinct().count()
        
        self.log_activity(request, "Retrieved visitor statistics")
        
        return Response({
            'daily_visits': daily_visits,
            'total_visits': total_visits,
            'unique_visitors': unique_visitors
        })
