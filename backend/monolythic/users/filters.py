import django_filters
from django_filters.rest_framework import filters
from .models import User
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import logging
from datetime import timedelta

# Setup logging
logger = logging.getLogger(__name__)

class UserFilter(django_filters.FilterSet):
    email = django_filters.CharFilter(lookup_expr='icontains')
    first_name = django_filters.CharFilter(lookup_expr='icontains')
    last_name = django_filters.CharFilter(lookup_expr='icontains')
    name = filters.CharFilter(method='filter_by_name')
    phone_number = django_filters.CharFilter(lookup_expr='icontains')
    user_type = django_filters.ChoiceFilter(choices=User.USER_TYPES)
    enterprise_name = django_filters.CharFilter(lookup_expr='icontains')
    platform_usage_reason = django_filters.CharFilter(lookup_expr='icontains')
    is_active = django_filters.BooleanFilter()
    date_joined = django_filters.DateFromToRangeFilter()
    is_student = django_filters.BooleanFilter(method='filter_is_student')
    is_professional = django_filters.BooleanFilter(method='filter_is_professional')
    is_admin = django_filters.BooleanFilter(method='filter_is_admin')
    has_subscription = django_filters.BooleanFilter(method='filter_has_subscription')
    subscription_expiring = django_filters.BooleanFilter(method='filter_subscription_expiring')
    subscription_expired = django_filters.BooleanFilter(method='filter_subscription_expired')
    subscription_plan = django_filters.ChoiceFilter(
        choices=[('BASIC', 'Basic'), ('STANDARD', 'Standard'), ('PREMIUM', 'Premium')],
        method='filter_subscription_plan'
    )
    # New filters for class and section relationships
    class_level = django_filters.NumberFilter(field_name='class_enrolled__id')
    section = django_filters.CharFilter(method='filter_by_section')
    education_level = django_filters.CharFilter(method='filter_by_education_level')
    class_name = django_filters.CharFilter(method='filter_by_class_name')

    def filter_by_name(self, queryset, name, value):
        return queryset.filter(
            Q(first_name__icontains=value) | 
            Q(last_name__icontains=value)
        )
        
    def filter_by_section(self, queryset, name, value):
        """Filter users by the section name or code of their enrolled class"""
        logger.debug(f"filter_by_section received value: {value}")
        # Look up the section by name or code
        return queryset.filter(
            Q(class_enrolled__definition__education_level__section__code__iexact=value) |
            Q(class_enrolled__definition__education_level__section__label__icontains=value)
        )
    
    def filter_by_education_level(self, queryset, name, value):
        """Filter users by the education level name or code of their enrolled class"""
        logger.debug(f"filter_by_education_level received value: {value}")
        return queryset.filter(
            Q(class_enrolled__definition__education_level__code__iexact=value) |
            Q(class_enrolled__definition__education_level__label__icontains=value)
        )
    
    def filter_by_class_name(self, queryset, name, value):
        """Filter users by their class name, including variant"""
        logger.debug(f"filter_by_class_name received value: {value}")
        return queryset.filter(
            Q(class_enrolled__definition__name__icontains=value) |
            Q(class_enrolled__variant__icontains=value)
        )
        
    def filter_is_student(self, queryset, name, value):
        # Debug the incoming value
        logger.debug(f"is_student filter received value: {value}, type: {type(value)}")
        
        # Handle boolean parameter
        is_student = self._parse_boolean(value)
        logger.debug(f"is_student parsed to: {is_student}")
        
        if is_student:
            # If True, return only users who are students
            # Exclude staff and superusers
            result = queryset.filter(
                user_type='STUDENT', 
                is_staff=False, 
                is_superuser=False
            )
            logger.debug(f"is_student filter returned {result.count()} records")
            return result
        else:
            # If False, return only users who are not students
            # Or are staff/superusers
            result = queryset.filter(
                Q(~Q(user_type='STUDENT')) | 
                Q(is_staff=True) | 
                Q(is_superuser=True)
            )
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
            # Exclude staff and superusers
            result = queryset.filter(
                user_type='PROFESSIONAL',
                is_staff=False,
                is_superuser=False
            )
            logger.debug(f"is_professional filter returned {result.count()} records")
            return result
        else:
            # If False, return only non-professionals
            # Or are staff/superusers
            result = queryset.filter(
                Q(~Q(user_type='PROFESSIONAL')) | 
                Q(is_staff=True) | 
                Q(is_superuser=True)
            )
            logger.debug(f"is_professional filter returned {result.count()} records")
            return result
            
    def filter_is_admin(self, queryset, name, value):
        # Debug the incoming value
        logger.debug(f"is_admin filter received value: {value}, type: {type(value)}")
        
        # Handle boolean parameter
        is_admin = self._parse_boolean(value)
        logger.debug(f"is_admin parsed to: {is_admin}")
        
        if is_admin:
            # If True, return users who are ADMIN user_type OR staff OR superusers
            result = queryset.filter(
                Q(user_type='ADMIN') | Q(is_staff=True) | Q(is_superuser=True)
            )
            logger.debug(f"is_admin filter returned {result.count()} records")
            return result
        else:
            # If False, return users who are not ADMIN user_type AND not staff AND not superusers
            result = queryset.filter(
                ~Q(user_type='ADMIN'), 
                is_staff=False, 
                is_superuser=False
            )
            logger.debug(f"is_admin filter returned {result.count()} records")
            return result
    
    def filter_has_subscription(self, queryset, name, value):
        """
        Filter users based on whether they have active subscriptions.
        """
        logger.debug(f"has_subscription filter received value: {value}, type: {type(value)}")
        has_subscription = self._parse_boolean(value)
        logger.debug(f"has_subscription parsed to: {has_subscription}")
        
        now = timezone.now()
        
        # Use user IDs with active subscriptions to filter
        if has_subscription:
            # Get users with active subscriptions
            return queryset.filter(
                subscriptions__is_active=True,
                subscriptions__end_date__gt=now
            ).distinct()
        else:
            # Get users without active subscriptions
            users_with_subscription = User.objects.filter(
                subscriptions__is_active=True,
                subscriptions__end_date__gt=now
            ).distinct()
            return queryset.exclude(id__in=users_with_subscription)
    
    def filter_subscription_expiring(self, queryset, name, value):
        """
        Filter users based on whether their subscriptions are expiring soon (within 7 days).
        """
        logger.debug(f"subscription_expiring filter received value: {value}, type: {type(value)}")
        expiring_soon = self._parse_boolean(value)
        logger.debug(f"subscription_expiring parsed to: {expiring_soon}")
        
        now = timezone.now()
        seven_days_later = now + timedelta(days=7)
        
        if expiring_soon:
            # Get users whose subscriptions are expiring in the next 7 days
            return queryset.filter(
                subscriptions__is_active=True,
                subscriptions__end_date__gt=now,
                subscriptions__end_date__lte=seven_days_later
            ).distinct()
        else:
            # Get users whose subscriptions are not expiring in the next 7 days
            users_expiring_soon = User.objects.filter(
                subscriptions__is_active=True,
                subscriptions__end_date__gt=now,
                subscriptions__end_date__lte=seven_days_later
            ).distinct()
            return queryset.exclude(id__in=users_expiring_soon)
    
    def filter_subscription_expired(self, queryset, name, value):
        """
        Filter users based on whether they have expired subscriptions.
        """
        logger.debug(f"subscription_expired filter received value: {value}, type: {type(value)}")
        expired = self._parse_boolean(value)
        logger.debug(f"subscription_expired parsed to: {expired}")
        
        now = timezone.now()
        
        if expired:
            # Get users with expired subscriptions (had subscriptions that ended)
            return queryset.filter(
                subscriptions__end_date__lte=now
            ).distinct()
        else:
            # Get users without expired subscriptions
            users_expired = User.objects.filter(
                subscriptions__end_date__lte=now
            ).distinct()
            return queryset.exclude(id__in=users_expired)
    
    def filter_subscription_plan(self, queryset, name, value):
        """
        Filter users by their subscription plan type (BASIC, STANDARD, PREMIUM).
        """
        logger.debug(f"subscription_plan filter received value: {value}")
        
        now = timezone.now()
        
        # Filter users who have an active subscription with the specified plan type
        return queryset.filter(
            subscriptions__is_active=True,
            subscriptions__end_date__gt=now,
            subscriptions__plan__name=value
        ).distinct()
    
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
            'email', 'first_name', 'last_name', 'name', 'phone_number', 'user_type',
            'enterprise_name', 'platform_usage_reason', 'is_active', 'date_joined', 
            'is_student', 'is_professional', 'is_admin', 'has_subscription', 
            'subscription_expiring', 'subscription_expired', 'subscription_plan',
            'class_level', 'section', 'education_level', 'class_name'
        ]
