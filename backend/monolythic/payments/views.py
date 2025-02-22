import django_filters
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import SubscriptionPlan, Subscription, Payment,Transaction
from .serializers import SubscriptionDetailSerializer, SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer, TransactionSerializer
from .filters import SubscriptionFilter, PaymentFilter,TransactionFilter
from .lib.campay import CamPayManager
from django.urls import reverse
import uuid
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
import json
from .tasks.process_payments import process_payment_task
import hashlib
import hmac
from rest_framework.authentication import TokenAuthentication
from django.core.cache import cache
from .pagination import CustomPagination

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
            required=['phone_number'],  # Make phone_number required
            properties={
                'phone_number': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Phone number in international format (e.g., 237650039773)'
                ),
                'success_url': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Success redirect URL',
                    default='http://your-domain.com/payment/success'
                ),
                'failure_url': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Failure redirect URL',
                    default='http://your-domain.com/payment/failure'
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="Success",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'payment_link': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Generated payment link'
                        ),
                        'transaction_id': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Generated transaction ID'
                        ),
                        'success_url': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Success redirect URL'
                        ),
                        'failure_url': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Failure redirect URL'
                        ),
                    }
                )
            ),
            404: openapi.Response(
                description="Subscription plan not found",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(
                description="Bad request",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Error message'
                        ),
                        'active': openapi.Schema(
                            type=openapi.TYPE_BOOLEAN,
                            description='Indicates if error is due to active subscription',
                            default=False
                        ),
                    }
                )
            )
        }
    )
    def generate_short_reference(self, plan_id, user_id):
        """Generate a short but unique reference string"""
        # Combine the IDs with a timestamp for uniqueness
        combined = f"{plan_id}-{user_id}-{int(timezone.now().timestamp())}"
        # Create a hash of the combined string
        hash_object = hashlib.md5(combined.encode())
        # Take first 12 characters of the hash
        short_hash = hash_object.hexdigest()[:12]
        # Combine with IDs in a shorter format
        return f"p{plan_id}u{user_id}h{short_hash}"

    def post(self, request, plan_id):
        try:
            # Check if user has active subscription
            if Subscription.has_active_subscription(request.user):
                return Response(
                    {
                        'error': 'You already have an active subscription. Please wait for it to expire before subscribing to a new plan.',
                        'active': True
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate phone number
            phone_number = request.data.get('phone_number')
            if not phone_number:
                return Response(
                    {'error': 'Phone number is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

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
            
            # Initialize CamPay client
            campay = CamPayManager(
                app_username=settings.CAMPAY_APP_USERNAME,
                app_password=settings.CAMPAY_APP_PASSWORD,
                environment=settings.CAMPAY_ENVIRONMENT
            )
            
            # Generate short transaction ID
            transaction_id = self.generate_short_reference(plan.id, request.user.id)
            
            # Store the full reference data in Redis for later lookup
            reference_data = {
                'plan_id': str(plan.id),
                'user_id': str(request.user.id),
                'uuid': str(uuid.uuid4())
            }
            
            # Store in Redis with 24-hour expiry
            cache_key = f"payment_ref_{transaction_id}"
            cache.set(cache_key, json.dumps(reference_data), timeout=86400)  # 24 hours
            
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
                external_reference=transaction_id,  # Using short reference
                redirect_url=success_url,
                failure_redirect_url=failure_url,
                first_name=request.user.first_name,
                last_name=request.user.last_name,
                email=request.user.email,
                phone=phone_number.replace('+', '')  # Use provided phone number
            )
            
            # Create pending transaction record
            transaction = Transaction.objects.create(
                reference=transaction_id,
                status='PENDING',
                amount=plan.price,
                app_amount=plan.price,
                currency='XAF',
                operator='MTN',  # Default to MTN, can be updated later
                endpoint='collect',
                code='',
                operator_reference='',
                phone_number=phone_number.replace('+', ''),
                external_reference=transaction_id,
            )
            
            return Response({
                'payment_link': payment_link['link'],
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

class CurrentSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Get user's current active subscription plan",
        responses={
            200: SubscriptionDetailSerializer(),
            200: openapi.Response(
                description="Response when no active subscription",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'subscription': openapi.Schema(type=openapi.TYPE_OBJECT, nullable=True),
                        'has_active_subscription': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            )
        }
    )
    def get(self, request):
        try:
            subscription = Subscription.objects.filter(
                user=request.user,
                is_active=True,
                end_date__gt=timezone.now()
            ).latest('start_date')
            serializer = SubscriptionDetailSerializer(subscription)
            return Response({
                'subscription': serializer.data,
                'has_active_subscription': True
            })
        except Subscription.DoesNotExist:
            return Response({
                'subscription': None,
                'has_active_subscription': False
            }, status=status.HTTP_200_OK)

class SubscriptionHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Get user's subscription history",
        manual_parameters=[
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Page number",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'page_size',
                openapi.IN_QUERY,
                description="Number of results per page",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: openapi.Response(
                description="Success",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'count': openapi.Schema(
                            type=openapi.TYPE_INTEGER,
                            description='Total number of items'
                        ),
                        'next': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            format=openapi.FORMAT_URI,
                            description='URL to next page (null if no next page)',
                            nullable=True
                        ),
                        'previous': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            format=openapi.FORMAT_URI,
                            description='URL to previous page (null if no previous page)',
                            nullable=True
                        ),
                        'results': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                # Define the subscription properties here
                                properties={
                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'user': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'plan': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'start_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
                                    'end_date': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
                                    'auto_renew': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                    'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                                }
                            )
                        )
                    }
                )
            )
        }
    )
    def get(self, request):
        subscriptions = Subscription.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        paginator = CustomPagination()
        paginated_subscriptions = paginator.paginate_queryset(subscriptions, request)
        
        serializer = SubscriptionDetailSerializer(paginated_subscriptions, many=True)
        return paginator.get_paginated_response(serializer.data)

class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = SubscriptionFilter
    
    def get_serializer_class(self):
        if self.action in ['list']:
            return SubscriptionDetailSerializer
        return SubscriptionSerializer

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
    
class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = TransactionFilter
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, django_filters.rest_framework.DjangoFilterBackend]
    search_fields = ['phone_number', 'reference']
    ordering_fields = ['created_at', 'amount']
    pagination_class = CustomPagination

    def get_queryset(self):
        """
        Return all transactions.
        """
        return Transaction.objects.all()
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'created_at_after',
                openapi.IN_QUERY,
                description="Filter by created_at after this datetime (format: YYYY-MM-DD HH:MM:SS)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATETIME,
            ),
            openapi.Parameter(
                'created_at_before',
                openapi.IN_QUERY,
                description="Filter by created_at before this datetime (format: YYYY-MM-DD HH:MM:SS)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATETIME,
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])  # This will allow any request to access the endpoint
def payment_webhook(request):
    """
    Webhook to handle payment notifications from payment providers
    """
    try:
        # Get webhook data and convert QueryDict to dict
        webhook_data = request.GET.dict()
        
        # # Log the webhook data for debugging
        # print(f"Received webhook data: {webhook_data}")
        
        # Queue payment processing using Celery
        result = process_payment_task.delay(webhook_data)
        
        return Response({
            'status': 'success',
            'message': 'Payment queued for processing',
            'task_id': result.id
        })
        
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
            subscription = Subscription.objects.create(
                user=payment.user,
                plan=SubscriptionPlan.objects.get(id=payment.plan_id),
                start_date=timezone.now(),
                end_date=timezone.now() + timezone.timedelta(days=payment.plan.duration_days),
                auto_renew=False
            )
            
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
