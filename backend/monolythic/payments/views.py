from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import SubscriptionPlan, Subscription, Payment
from .serializers import SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer
from .filters import SubscriptionFilter, PaymentFilter
from django_filters.rest_framework import DjangoFilterBackend
from .lib.campay import CamPayManager
from django.urls import reverse
import uuid
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    lookup_url_kwarg = None  # Remove this line or set to None

    def get_object(self):
        """
        Allow getting object by either id or slug
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]

        # Try to fetch by ID first
        try:
            if lookup_value.isdigit():
                return self.queryset.get(id=lookup_value)
        except (SubscriptionPlan.DoesNotExist, ValueError):
            pass

        # If not found or not numeric, try slug
        return self.queryset.get(slug=lookup_value)

class PaymentLinkView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Create a payment link for a subscription plan",
        manual_parameters=[
            openapi.Parameter(
                'plan_id',
                openapi.IN_PATH,
                description="ID or slug of the subscription plan",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success_url': openapi.Schema(type=openapi.TYPE_STRING, description='Success redirect URL'),
                'failure_url': openapi.Schema(type=openapi.TYPE_STRING, description='Failure redirect URL'),
            }
        ),
        responses={
            200: openapi.Response(
                description="Success",
                examples={
                    "application/json": {
                        "payment_link": "https://checkout.campay.net/...",
                        "transaction_id": "uuid-string",
                        "success_url": "https://...",
                        "failure_url": "https://..."
                    }
                }
            ),
            404: "Subscription plan not found",
            400: "Bad request"
        }
    )
    def post(self, request, plan_id):
        try:
            # Try to get plan by ID first, then by slug
            try:
                if plan_id.isdigit():
                    plan = SubscriptionPlan.objects.get(id=plan_id, active=True)
                else:
                    plan = SubscriptionPlan.objects.get(slug=plan_id, active=True)
            except SubscriptionPlan.DoesNotExist:
                return Response(
                    {'error': 'Subscription plan not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create subscription first (but don't activate it yet)
            subscription = Subscription.objects.create(
                user=request.user,
                plan=plan,
                start_date=timezone.now(),
                end_date=timezone.now() + timezone.timedelta(days=plan.duration_days),
                auto_renew=False
            )
            
            # Initialize CamPay client
            campay = CamPayManager(
                app_username=settings.CAMPAY_APP_USERNAME,
                app_password=settings.CAMPAY_APP_PASSWORD,
                environment=settings.CAMPAY_ENVIRONMENT
            )
            
            # Generate unique transaction reference
            transaction_id = str(uuid.uuid4())
            
            # Create payment description
            description = f"Subscription to {plan.name} plan"
            
            # Get the base URL from settings or request
            base_url = request.build_absolute_uri('/')[:-1]
            
            # Get success and failure URLs from request or use defaults
            success_url = request.data.get('success_url') or request.build_absolute_uri(reverse('payment-success'))
            failure_url = request.data.get('failure_url') or request.build_absolute_uri(reverse('payment-failure'))
            
            # Create payment link
            payment_link = campay.create_payment_link(
                amount=str(plan.price),
                description=description,
                external_reference=transaction_id,
                redirect_url=success_url,
                failure_redirect_url=failure_url,
                first_name=request.user.first_name,
                last_name=request.user.last_name,
                email=request.user.email,
                phone=str(request.user.phone_number).replace('+', '')
            )
            
            # Create pending payment record with subscription
            payment = Payment.objects.create(
                user=request.user,
                subscription=subscription,  # Link the subscription
                amount=plan.price,
                payment_method='MTN',  # Default to MTN, can be updated later
                transaction_id=transaction_id,
                status='PENDING'
            )
            
            return Response({
                'payment_link': payment_link['payment_url'],
                'transaction_id': transaction_id,
                'success_url': success_url,
                'failure_url': failure_url
            })
            
        except Exception as e:
            print(e)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = SubscriptionFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return Subscription.objects.none()  # Return empty queryset for swagger
        return Subscription.objects.filter(user=self.request.user)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = PaymentFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return Payment.objects.none()  # Return empty queryset for swagger
        return Payment.objects.filter(user=self.request.user)
    
@csrf_exempt
@api_view(['POST', 'GET'])
def payment_webhook(request):
    """
    Webhook to handle payment notifications from payment providers
    """
    try:
        # Get all data from request
        webhook_data = request.GET
        
        # Find the payment
        external_reference = webhook_data.get('external_reference')
        payment = Payment.objects.get(transaction_id=external_reference)
        
        if webhook_data.get('status') == 'SUCCESSFUL':
            payment.process_successful_payment(webhook_data)
            
            return Response({
                'status': 'success',
                'message': 'Payment processed successfully',
                'data': {
                    'amount': payment.amount,
                    'operator': payment.payment_method,
                    'reference': payment.operator_reference,
                    'subscription_plan': payment.subscription.plan.name,
                    'valid_until': payment.subscription.end_date
                }
            })
        else:
            payment.status = 'FAILED'
            payment.save()
            return Response({
                'status': 'error',
                'message': 'Payment was not successful'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Payment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Payment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Payment webhook error: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def payment_success(request):
    """
    Handle successful payment callback
    """
    try:
        # Extract relevant parameters from query string
        external_reference = request.GET.get('external_reference')
        status = request.GET.get('status')
        amount = request.GET.get('amount')
        operator = request.GET.get('operator')
        operator_reference = request.GET.get('operator_reference')
        
        # Find the payment by transaction_id (external_reference)
        payment = Payment.objects.get(transaction_id=external_reference)
        
        if status == 'SUCCESSFUL':
            # Update payment details
            payment.status = 'SUCCESSFUL'
            payment.payment_method = 'MTN' if operator == 'MTN' else 'ORANGE'
            payment.save()
            
            # Activate the subscription
            subscription = payment.subscription
            if subscription:
                subscription.start_date = timezone.now()
                subscription.end_date = timezone.now() + timezone.timedelta(days=subscription.plan.duration_days)
                subscription.save()
            
            return Response({
                'status': 'success',
                'message': 'Payment processed successfully',
                'data': {
                    'amount': amount,
                    'operator': operator,
                    'reference': operator_reference,
                    'subscription_plan': subscription.plan.name if subscription else None,
                    'valid_until': subscription.end_date if subscription else None
                }
            })
        else:
            payment.status = 'FAILED'
            payment.save()
            return Response({
                'status': 'error',
                'message': 'Payment was not successful'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Payment.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Payment not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Payment success error: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
