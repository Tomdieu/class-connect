from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment,Transaction
from users.serializers import UserSerializer

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        
class SubscriptionDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    plan = SubscriptionPlanSerializer()
    class Meta:
        model = Subscription
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'