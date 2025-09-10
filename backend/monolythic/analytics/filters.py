import django_filters
from .models import DailyVisitor
from django.db.models import Q

class DailyVisitorFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    path_contains = django_filters.CharFilter(field_name='path', lookup_expr='icontains')
    
    class Meta:
        model = DailyVisitor
        fields = {
            'visitor_id': ['exact'],
            'date': ['exact'],
            'ip_address': ['exact'],
            'path': ['exact', 'icontains'],
            'browser_language': ['exact'],
            'user': ['exact'],
        }
