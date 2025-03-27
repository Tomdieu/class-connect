import django_filters
from django_filters.rest_framework import filters
from .models import User
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
import logging

# Setup logging
logger = logging.getLogger(__name__)

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
    is_professional = django_filters.BooleanFilter(method='filter_is_professional')
    is_admin = django_filters.BooleanFilter(method='filter_is_admin')

    def filter_by_name(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value) | 
            Q(last_name__icontains=value)
        )
        
    def filter_is_student(self, queryset, name, value):
        # Debug the incoming value
        logger.debug(f"is_student filter received value: {value}, type: {type(value)}")
        
        student_education_levels = ['COLLEGE', 'LYCEE', 'UNIVERSITY']
        
        # Handle boolean parameter
        is_student = self._parse_boolean(value)
        logger.debug(f"is_student parsed to: {is_student}")
        
        if is_student:
            # If True, return only users who have education_level in student levels
            result = queryset.filter(education_level__in=student_education_levels)
            logger.debug(f"is_student filter returned {result.count()} records")
            return result
        else:
            # If False, return only users who don't have education_level in student levels
            result = queryset.exclude(education_level__in=student_education_levels)
            logger.debug(f"is_student filter returned {result.count()} records")
            return result
    
    def filter_is_professional(self, queryset, name, value):
        # Debug the incoming value
        logger.debug(f"is_professional filter received value: {value}, type: {type(value)}")
        
        # Handle boolean parameter
        is_professional = self._parse_boolean(value)
        logger.debug(f"is_professional parsed to: {is_professional}")
        
        if is_professional:
            # If True, return only professionals
            result = queryset.filter(education_level='PROFESSIONAL')
            logger.debug(f"is_professional filter returned {result.count()} records")
            return result
        else:
            # If False, return only non-professionals
            result = queryset.exclude(education_level='PROFESSIONAL')
            logger.debug(f"is_professional filter returned {result.count()} records")
            return result
            
    def filter_is_admin(self, queryset, name, value):
        # Debug the incoming value
        logger.debug(f"is_admin filter received value: {value}, type: {type(value)}")
        
        # Handle boolean parameter
        is_admin = self._parse_boolean(value)
        logger.debug(f"is_admin parsed to: {is_admin}")
        
        if is_admin:
            # If True, return users who are staff OR superusers
            result = queryset.filter(Q(is_staff=True) | Q(is_superuser=True))
            logger.debug(f"is_admin filter returned {result.count()} records")
            return result
        else:
            # If False, return users who are neither staff NOR superusers
            result = queryset.filter(is_staff=False, is_superuser=False)
            logger.debug(f"is_admin filter returned {result.count()} records")
            return result
    
    def _parse_boolean(self, value):
        """
        Parse various string representations of boolean values
        """
        if isinstance(value, bool):
            return value
            
        true_values = ['true', 't', 'yes', 'y', '1']
        
        if isinstance(value, str) and value.lower() in true_values:
            return True
        return False

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'name', 'phone_number', 'education_level', 
            'lycee_class', 'university_level', 'university_year', 'enterprise_name', 
            'platform_usage_reason', 'is_active', 'date_joined', 'is_student',
            'is_professional', 'is_admin'
        ]
