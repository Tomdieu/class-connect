import django_filters
from django_filters.rest_framework import filters
from .models import User

class UserFilter(django_filters.FilterSet):
    email = django_filters.CharFilter(lookup_expr='icontains')
    first_name = django_filters.CharFilter(lookup_expr='icontains')
    last_name = django_filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(method='filter_by_name')
    phone_number = django_filters.CharFilter(lookup_expr='icontains')
    education_level = django_filters.ChoiceFilter(choices=User.EDUCATION_LEVELS)
    lycee_class = django_filters.CharFilter(lookup_expr='icontains')
    university_level = django_filters.CharFilter(lookup_expr='icontains')
    university_year = django_filters.CharFilter(lookup_expr='icontains')
    enterprise_name = django_filters.CharFilter(lookup_expr='icontains')
    platform_usage_reason = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    date_joined = django_filters.DateFromToRangeFilter()
    is_student = django_filters.BooleanFilter(method='filter_is_student')

    def filter_by_name(self, queryset, name, value):
        return queryset.filter(
            django_filters.Q(first_name__icontains=value) | 
            django_filters.Q(last_name__icontains=value)
        )
        
    def filter_is_student(self, queryset, name, value):
        if value:  # If True, return students (not PROFESSIONAL)
            return queryset.exclude(education_level='PROFESSIONAL')
        else:  # If False, return professionals
            return queryset.filter(education_level='PROFESSIONAL')

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'name', 'phone_number', 'education_level', 
            'lycee_class', 'university_level', 'university_year', 'enterprise_name', 
            'platform_usage_reason', 'is_active', 'date_joined', 'is_student'
        ]
