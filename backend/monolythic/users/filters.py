import django_filters
from .models import User

class UserFilter(django_filters.FilterSet):
    email = django_filters.CharFilter(lookup_expr='icontains')
    first_name = django_filters.CharFilter(lookup_expr='icontains')
    last_name = django_filters.CharFilter(lookup_expr='icontains')
    phone_number = django_filters.CharFilter(lookup_expr='icontains')
    education_level = django_filters.ChoiceFilter(choices=User.EDUCATION_LEVELS)
    lycee_class = django_filters.CharFilter(lookup_expr='icontains')
    university_level = django_filters.CharFilter(lookup_expr='icontains')
    university_year = django_filters.CharFilter(lookup_expr='icontains')
    enterprise_name = django_filters.CharFilter(lookup_expr='icontains')
    platform_usage_reason = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    date_joined = django_filters.DateFromToRangeFilter()

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone_number', 'education_level', 
            'lycee_class', 'university_level', 'university_year', 'enterprise_name', 
            'platform_usage_reason', 'is_active', 'date_joined'
        ]
