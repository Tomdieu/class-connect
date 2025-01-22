from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from .models import SubscriptionPlan, Subscription, Payment
from .serializers import SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer
from .filters import SubscriptionFilter, PaymentFilter
from django_filters.rest_framework import DjangoFilterBackend

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = SubscriptionFilter

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = PaymentFilter

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)

@csrf_exempt
@api_view(['POST'])
def payment_webhook(request):
    """
    Webhook to handle payment notifications from payment providers
    """
    try:
        # Extract payment details from request
        transaction_id = request.data.get('transaction_id')
        status = request.data.get('status')

        # Update payment status
        payment = Payment.objects.get(transaction_id=transaction_id)
        payment.status = status
        payment.save()

        return Response({'status': 'success'})
    except Payment.DoesNotExist:
        return Response({'status': 'error', 'message': 'Payment not found'}, status=404)
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=400)
