import django_filters
from .models import Subscription, Payment, Transaction,SubscriptionPlan


class SubscriptionPlanFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    price = django_filters.NumberFilter()
    duration_days = django_filters.NumberFilter()
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = SubscriptionPlan
        fields = ['name', 'price', 'duration_days', 'created_at']
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

class TransactionFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Transaction.TRANSACTION_STATUS)
    endpoint = django_filters.ChoiceFilter(choices=Transaction.TRANSACTION_TYPES)
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Transaction
        fields = ['status', 'endpoint', 'operator', 'phone_number']