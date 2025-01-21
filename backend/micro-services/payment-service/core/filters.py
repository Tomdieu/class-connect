import django_filters
from .models import Subscription, Payment

class SubscriptionFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter()
    start_date = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Subscription
        fields = ['user_id', 'plan', 'is_active', 'auto_renew']

class PaymentFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Payment.PAYMENT_STATUS)
    payment_date = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Payment
        fields = ['user_id', 'payment_method', 'status']