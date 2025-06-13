import django_filters
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import PaymentReference, SubscriptionPlan, Subscription, Payment,Transaction
from .serializers import SubscriptionDetailSerializer, SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer, TransactionSerializer
from .filters import SubscriptionFilter, PaymentFilter, SubscriptionPlanFilter,TransactionFilter
from .lib.campay import CamPayManager
from django.urls import reverse
import uuid
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
import json
# Import with fully qualified path to avoid task registration issues
from payments.tasks.process_payments import process_payment_task
import hashlib
import hmac
from rest_framework.authentication import TokenAuthentication
from django.core.cache import cache
from .pagination import CustomPagination
from rest_framework.decorators import action
from utils.mixins import ActivityLoggingMixin
from payments.lib import FreemoPayManager

class SubscriptionPlanViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.filter(active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    filterset_class = SubscriptionPlanFilter
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    lookup_url_kwarg = None  # Remove this line or set to None

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [permissions.AllowAny()]
        return super().get_permissions()

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
    
    # Add logging for authenticated actions
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        self.log_activity(request, "Created a new subscription plan", {"plan_id": response.data.get('id')})
        return response
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        self.log_activity(request, "Updated subscription plan", {"plan_id": kwargs.get('pk')})
        return response
    
    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        self.log_activity(request, "Partially updated subscription plan", {"plan_id": kwargs.get('pk')})
        return response
    
    def destroy(self, request, *args, **kwargs):
        plan_id = kwargs.get('pk')
        self.log_activity(request, "Deleted subscription plan", {"plan_id": plan_id})
        return super().destroy(request, *args, **kwargs)

class PaymentLinkView(ActivityLoggingMixin, APIView):
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
            
            # Check amount limit for demo environment
            if settings.CAMPAY_ENVIRONMENT == "DEV" and float(plan.price) > 100.00:
                return Response(
                    {'error': 'In demo mode, maximum amount is limited to 100.00 XAF'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initialize CamPay client
            campay = CamPayManager(
                app_username=settings.CAMPAY_APP_USERNAME,
                app_password=settings.CAMPAY_APP_PASSWORD,
                environment=settings.CAMPAY_ENVIRONMENT
            )
            
            # Generate internal reference for tracking
            internal_reference = self.generate_short_reference(plan.id, request.user.id)
            
            # Generate proper UUID for external reference and the Transaction model
            transaction_uuid = uuid.uuid4()
            external_reference = str(transaction_uuid)
            
            # Create a PaymentReference record to store the mapping
            payment_reference = PaymentReference.objects.create(
                external_reference=transaction_uuid,  # Use UUID object
                internal_reference=internal_reference,
                user=request.user,
                plan=plan,
                amount=plan.price,
                phone_number=phone_number.replace('+', ''),
                metadata={
                    'user_email': request.user.email,
                    'user_first_name': request.user.first_name,
                    'user_last_name': request.user.last_name,
                    'plan_name': plan.name,
                    'created_at': str(timezone.now())
                }
            )
            
            # Still store in Redis cache as a backup
            reference_data = {
                'plan_id': str(plan.id),
                'user_id': str(request.user.id),
                'uuid': external_reference,
                'internal_reference': internal_reference,
                'phone_number': phone_number.replace('+', ''),
                'amount': str(plan.price),
                'user_email': request.user.email,
                'user_first_name': request.user.first_name,
                'user_last_name': request.user.last_name,
                'plan_name': plan.name,
                'created_at': str(timezone.now())
            }
            
            # Store in Redis with 24-hour expiry as backup
            cache_key_external = f"payment_ref_{external_reference}"
            cache.set(cache_key_external, json.dumps(reference_data), timeout=86400)
            
            # Create payment description
            description = f"Subscription to {plan.name} plan"
            
            # Get success and failure URLs
            success_url = request.data.get('success_url') or request.build_absolute_uri(reverse('payment-success'))
            failure_url = request.data.get('failure_url') or request.build_absolute_uri(reverse('payment-failure'))
            
            try:
                # Create payment link
                payment_link = campay.create_payment_link(
                    amount=str(plan.price),
                    description=description,
                    external_reference=external_reference,  # Using UUID format required by CamPay
                    redirect_url=success_url,
                    failure_redirect_url=failure_url,
                    first_name=request.user.first_name,
                    last_name=request.user.last_name,
                    email=request.user.email,
                    phone=phone_number.replace('+', '')  # Remove + if present
                )
                
                # Create pending transaction record with enhanced error handling
                try:
                    # Print the data we're about to use for Transaction creation
                    print(f"Creating Transaction with reference={external_reference}, external_reference={internal_reference}")
                    
                    # Create the transaction object and save it
                    transaction = Transaction(
                        reference=external_reference,  # Use the UUID string
                        status='PENDING',
                        amount=plan.price,
                        app_amount=plan.price,
                        currency='XAF',
                        operator='MTN',  # Default to MTN, can be updated later
                        endpoint='collect',
                        code='',
                        operator_reference='',
                        phone_number=phone_number.replace('+', ''),
                        external_reference=internal_reference  # Store our internal reference for tracking
                    )
                    
                    # Explicitly save the transaction without accessing ID afterward
                    transaction.save()
                    
                    # Log success without accessing ID
                    print(f"Successfully created transaction with reference={external_reference}")
                    print(f"Transaction external_reference (internal): {internal_reference}")
                    print(f"Created PaymentReference with ID: {payment_reference.id}")
                    
                    # Store in Redis without transaction ID
                    cache.set(cache_key_external, json.dumps(reference_data), timeout=86400)
                    
                except Exception as tx_error:
                    # Enhanced error logging
                    print(f"Transaction creation error: {str(tx_error)}")
                    print(f"Error type: {type(tx_error).__name__}")
                    
                    # Return more detailed error information for debugging
                    return Response({
                        'payment_link': payment_link['link'],
                        'transaction_id': internal_reference,
                        'external_reference': external_reference,
                        'success_url': success_url,
                        'failure_url': failure_url,
                        'warning': f'Payment link created, but transaction recording failed: {str(tx_error)}'
                    })
                
                # Log the payment link creation attempt
                self.log_activity(request, "Generated payment link", {
                    "plan_id": plan_id,
                    "amount": str(plan.price) if 'plan' in locals() else None
                })
                
                return Response({
                    'payment_link': payment_link['link'],
                    'transaction_id': internal_reference,
                    'external_reference': external_reference,
                    'success_url': success_url,
                    'failure_url': failure_url
                })
                
            except Exception as campay_error:
                # Clean up the payment reference if payment link creation fails
                payment_reference.delete()
                
                print(f"CamPay Error: {str(campay_error)}")
                # Extract the CamPay error message
                if isinstance(campay_error, dict) and 'message' in campay_error:
                    error_message = campay_error['message']
                else:
                    error_message = str(campay_error)
                
                return Response(
                    {'error': f"Payment service error: {error_message}", 'campay_error': True},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            print("Error : ", str(e))
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class FreemoPayLinkView(ActivityLoggingMixin, APIView):
    permission_classes = [IsAuthenticated]
    
    
    def generate_short_reference(self, plan_id, user_id):
        """Generate a short but unique reference string"""
        # Combine the IDs with a timestamp for uniqueness
        combined = f"{plan_id}-{user_id}-{int(timezone.now().timestamp())}"
        # Create a hash of the combined string
        hash_object = hashlib.md5(combined.encode())
        # Take first 12 characters of the hash
        short_hash = hash_object.hexdigest()[:12]
        # Combine with IDs in a shorter format
        return f"fp{plan_id}u{user_id}h{short_hash}"  # 'fp' prefix for FreemoPay

    @swagger_auto_schema(
        operation_description="Create a FreemoPay payment link for a subscription plan",
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
            required=['phone_number'],
            properties={
                'phone_number': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Phone number in international format (e.g., 237650039773)'
                ),
                'callback': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='Callback URL for payment notifications (optional)'
                ),
            }
        ),
        responses={200: "Payment link created successfully"}
    )
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
            
            # Generate internal reference for tracking
            internal_reference = self.generate_short_reference(plan.id, request.user.id)
            
            # Generate unique reference ID for FreemoPay
            transaction_uuid = uuid.uuid4()
            
            # Create a PaymentReference record to store the mapping
            payment_reference = PaymentReference.objects.create(
                external_reference=transaction_uuid,  # Use UUID object
                internal_reference=internal_reference,
                user=request.user,
                plan=plan,
                amount=plan.price,
                phone_number=phone_number.replace('+', ''),
                provider='freemopay',  # Mark this as FreemoPay transaction
                metadata={
                    'user_email': request.user.email,
                    'user_first_name': request.user.first_name,
                    'user_last_name': request.user.last_name,
                    'plan_name': plan.name,
                    'created_at': str(timezone.now())
                }
            )
            
            # Store reference data in Redis cache for backup
            reference_data = {
                'plan_id': str(plan.id),
                'user_id': str(request.user.id),
                'uuid': str(transaction_uuid),
                'internal_reference': internal_reference,
                'phone_number': phone_number.replace('+', ''),
                'amount': str(plan.price),
                'user_email': request.user.email,
                'user_first_name': request.user.first_name,
                'user_last_name': request.user.last_name,
                'plan_name': plan.name,
                'created_at': str(timezone.now()),
                'provider': 'freemopay'
            }
            
            # Store in Redis with 24-hour expiry as backup
            cache_key = f"freemo_payment_ref_{internal_reference}"
            cache.set(cache_key, json.dumps(reference_data), timeout=86400)
            
            # Create payment description
            description = f"Subscription to {plan.name} plan"
            
            # Get callback URL (default to webhook endpoint if not provided)
            callback_url = request.data.get('callback') or request.build_absolute_uri(reverse('freemo-payment-webhook'))
            
            # Initialize FreemoPay client
            freemopay = FreemoPayManager(
                app_key=settings.FREEMOPAY_APP_KEY,
                secret_key=settings.FREEMOPAY_SECRET_KEY,
                base_url=settings.FREEMOPAY_BASE_URL
            )
            
            try:
                # Initialize payment
                payment_response = freemopay.init_payment(
                    payer=phone_number.replace('+', ''),  # Remove + if present
                    amount=str(plan.price),
                    external_id=internal_reference,  # Using our internal reference for tracking
                    description=description,
                    callback=callback_url,
                    use_token=False  # Use basic auth for initial implementation
                )
                
                # Create pending transaction record
                try:
                    transaction = Transaction(
                        reference=str(payment_response.get('reference', '')),
                        status='PENDING',
                        amount=plan.price,
                        app_amount=plan.price,
                        currency='XAF',
                        operator='MTN',  # Default to MTN, can be updated later
                        endpoint='freemopay_init',
                        code='',
                        operator_reference='',
                        phone_number=phone_number.replace('+', ''),
                        external_reference=internal_reference,  # Store our internal reference
                        provider='freemopay'  # Mark as FreemoPay transaction
                    )
                    
                    # Save the transaction
                    transaction.save()
                    
                except Exception as tx_error:
                    # Enhanced error logging
                    print(f"FreemoPay transaction creation error: {str(tx_error)}")
                    
                    # Return transaction info even if recording failed
                    payment_response['internal_reference'] = internal_reference
                    payment_response['warning'] = f'Payment initialized, but transaction recording failed: {str(tx_error)}'
                    return Response(payment_response)
                
                # Log the payment initiation attempt
                self.log_activity(request, "Initialized FreemoPay payment", {
                    "plan_id": plan_id,
                    "amount": str(plan.price),
                    "reference": payment_response.get('reference', '')
                })
                
                # Return the FreemoPay response along with our internal reference
                payment_response['internal_reference'] = internal_reference
                return Response(payment_response)
                
            except Exception as fp_error:
                # Clean up the payment reference if payment initialization fails
                payment_reference.delete()
                
                print(f"FreemoPay Error: {str(fp_error)}")
                
                # Extract error message
                if isinstance(fp_error, dict) and 'message' in fp_error:
                    error_message = fp_error['message']
                else:
                    error_message = str(fp_error)
                
                return Response(
                    {'error': f"Payment service error: {error_message}", 'freemopay_error': True},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            print(f"FreemoPay payment link error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class CurrentSubscriptionView(ActivityLoggingMixin, APIView):
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
        self.log_activity(request, "Checked current subscription status")
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

class SubscriptionHistoryView(ActivityLoggingMixin, APIView):
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
        self.log_activity(request, "Viewed subscription history")
        subscriptions = Subscription.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        paginator = CustomPagination()
        paginated_subscriptions = paginator.paginate_queryset(subscriptions, request)
        
        serializer = SubscriptionDetailSerializer(paginated_subscriptions, many=True)
        return paginator.get_paginated_response(serializer.data)

class SubscriptionViewSet(ActivityLoggingMixin, viewsets.ReadOnlyModelViewSet):
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
    
    def list(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed list of subscriptions")
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed subscription details", {"subscription_id": kwargs.get('pk')})
        return super().retrieve(request, *args, **kwargs)
    
    @action(methods=['GET'], detail=False,url_path='my-subscriptions',url_name='my-subscriptions')
    def my_subscriptions(self,request):
        self.log_activity(request, "Viewed personal subscriptions")
        subscriptions = Subscription.objects.filter(user=request.user)
        serializer = SubscriptionDetailSerializer(subscriptions, many=True)
        return Response(serializer.data)

class PaymentViewSet(ActivityLoggingMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = PaymentFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return Payment.objects.none()  # Return empty queryset for swagger
        return Payment.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed payment history")
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed payment details", {"payment_id": kwargs.get('pk')})
        return super().retrieve(request, *args, **kwargs)
    
class TransactionViewSet(ActivityLoggingMixin, viewsets.ReadOnlyModelViewSet):
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
        self.log_activity(request, "Viewed transaction list")
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        self.log_activity(request, "Viewed transaction details", {"transaction_id": kwargs.get('pk')})
        return super().retrieve(request, *args, **kwargs)

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
        
        # Log the webhook data for debugging
        print(f"Received webhook data: {webhook_data}")
        
        # Queue payment processing using Celery
        result = process_payment_task.delay(webhook_data)
        
        print(f"Task queued with ID: {result.id}")
        
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

@csrf_exempt
@api_view(['POST'])
@swagger_auto_schema(
    operation_description="Webhook endpoint for receiving FreemoPay payment notifications",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'status': openapi.Schema(type=openapi.TYPE_STRING, description='Payment status (SUCCESS or FAILED)'),
            'reference': openapi.Schema(type=openapi.TYPE_STRING, description='FreemoPay transaction reference'),
            'externalId': openapi.Schema(type=openapi.TYPE_STRING, description='External ID (your internal reference)'),
            'amount': openapi.Schema(type=openapi.TYPE_NUMBER, description='Transaction amount'),
            'transactionType': openapi.Schema(type=openapi.TYPE_STRING, description='Type of transaction'),
            'message': openapi.Schema(type=openapi.TYPE_STRING, description='Additional message for failed transactions'),
        }
    ),
    responses={200: "Webhook processed successfully"}
)
@permission_classes([AllowAny])
def freemo_payment_webhook(request):
    """
    Webhook to handle payment notifications from FreemoPay
    """
    try:
        # Get webhook data from request body
        if request.content_type == 'application/json':
            webhook_data = request.data
        else:
            webhook_data = request.POST.dict()
        
        # Log the webhook data for debugging
        print(f"Received FreemoPay webhook data: {webhook_data}")
        
        # Validate webhook data
        if not webhook_data or not isinstance(webhook_data, dict):
            return Response({"status": "error", "message": "Invalid webhook data"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract important fields
        payment_status = webhook_data.get('status')
        reference = webhook_data.get('reference')
        external_id = webhook_data.get('externalId')
        amount = webhook_data.get('amount')
        transaction_type = webhook_data.get('transactionType')
        message = webhook_data.get('message', '')
        
        # Validate required fields
        if not all([payment_status, reference, external_id, amount, transaction_type]):
            return Response({"status": "error", "message": "Missing required webhook parameters"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the payment reference by internal reference (external_id in FreemoPay callback)
        try:
            payment_ref = PaymentReference.objects.get(internal_reference=external_id)
        except PaymentReference.DoesNotExist:
            # Try fetching from Redis cache if DB record not found
            cache_key = f"freemo_payment_ref_{external_id}"
            cached_data = cache.get(cache_key)
            
            if not cached_data:
                return Response({"status": "error", "message": "Payment reference not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Parse cached reference data
            ref_data = json.loads(cached_data)
            print(f"Retrieved payment reference from cache: {ref_data}")
            
            # Process from cache data
            if payment_status == 'SUCCESS':
                # Create a Transaction record
                transaction = Transaction.objects.create(
                    reference=reference,
                    status='SUCCESSFUL',
                    amount=float(ref_data.get('amount', 0)),
                    app_amount=float(ref_data.get('amount', 0)),
                    currency='XAF',
                    operator=transaction_type,
                    endpoint='freemopay_callback',
                    code='',
                    operator_reference=reference,
                    phone_number=ref_data.get('phone_number', ''),
                    external_reference=external_id,
                    provider='freemopay'
                )
                
                # Queue payment processing
                process_payment_task.delay({
                    'provider': 'freemopay',
                    'status': payment_status,
                    'reference': reference,
                    'amount': amount,
                    'external_id': external_id,
                    'plan_id': ref_data.get('plan_id'),
                    'user_id': ref_data.get('user_id'),
                })
                
                return Response({"status": "success", "message": "Payment processed from cache"})
            else:
                # Failed payment
                Transaction.objects.create(
                    reference=reference,
                    status='FAILED',
                    amount=float(ref_data.get('amount', 0)),
                    app_amount=float(ref_data.get('amount', 0)),
                    currency='XAF',
                    operator=transaction_type,
                    endpoint='freemopay_callback',
                    code='',
                    operator_reference=reference,
                    phone_number=ref_data.get('phone_number', ''),
                    external_reference=external_id,
                    provider='freemopay',
                    message=message
                )
                
                return Response({"status": "error", "message": f"Payment failed: {message}"})
        
        # Payment reference found in database
        print(f"Found payment reference: {payment_ref.id} for user: {payment_ref.user.id} and plan: {payment_ref.plan.id}")
        
        # Update transaction record
        transaction = Transaction.objects.filter(external_reference=external_id).first()
        if transaction:
            transaction.status = 'SUCCESSFUL' if payment_status == 'SUCCESS' else 'FAILED'
            transaction.operator_reference = reference
            transaction.message = message
            transaction.save()
            print(f"Updated transaction {transaction.reference} status to {transaction.status}")
        else:
            # Create new transaction record if not found
            transaction = Transaction.objects.create(
                reference=reference,
                status='SUCCESSFUL' if payment_status == 'SUCCESS' else 'FAILED',
                amount=payment_ref.amount,
                app_amount=payment_ref.amount,
                currency='XAF',
                operator=transaction_type,
                endpoint='freemopay_callback',
                code='',
                operator_reference=reference,
                phone_number=payment_ref.phone_number,
                external_reference=external_id,
                provider='freemopay',
                message=message
            )
            print(f"Created new transaction with reference {transaction.reference}")
        
        # For successful payments, process subscription
        if payment_status == 'SUCCESS':
            try:
                # First create subscription
                subscription = Subscription.objects.create(
                    user=payment_ref.user,
                    plan=payment_ref.plan,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timezone.timedelta(days=payment_ref.plan.duration_days),
                    auto_renew=False,
                    is_active=True
                )
                
                # Then create payment record with subscription field
                payment = Payment.objects.create(
                    user=payment_ref.user,
                    subscription=subscription,  # Link to subscription
                    amount=payment_ref.amount,
                    transaction_id=external_id,
                    payment_method='FreemoPay',
                    status='SUCCESSFUL'
                )
                
                print(f"Created subscription {subscription.id} until {subscription.end_date}")
                
            except Exception as sub_error:
                print(f"Error processing subscription: {str(sub_error)}")
                return Response({
                    "status": "error", 
                    "message": f"Error creating subscription: {str(sub_error)}",
                    "payment_processed": True
                })
        
        return Response({"status": "success", "message": "Webhook processed successfully"})
        
    except Exception as e:
        print(f"FreemoPay webhook error: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@swagger_auto_schema(
    operation_description="Check the status of a FreemoPay payment transaction",
    manual_parameters=[
        openapi.Parameter(
            'reference',
            openapi.IN_PATH,
            description="FreemoPay transaction reference",
            type=openapi.TYPE_STRING,
            required=True
        )
    ],
    responses={
        200: openapi.Response(
            description="Payment status retrieved successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'reference': openapi.Schema(type=openapi.TYPE_STRING, description='FreemoPay transaction reference'),
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='Payment status'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='Additional status message')
                }
            )
        ),
        400: "Error checking payment status"
    }
)
def freemo_payment_status(request, reference):
    """
    Check the status of a FreemoPay payment
    """
    try:
        # Initialize FreemoPay client
        freemopay = FreemoPayManager(
            app_key=settings.FREEMOPAY_APP_KEY,
            secret_key=settings.FREEMOPAY_SECRET_KEY,
            base_url=settings.FREEMOPAY_BASE_URL
        )
        
        # Query payment status
        payment_status = freemopay.check_payment_status(reference)
        
        # Log the request
        print(f"Checking FreemoPay payment status for reference: {reference}")
        
        return Response(payment_status)
        
    except Exception as e:
        print(f"Error checking FreemoPay payment status: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
@swagger_auto_schema(
    operation_description="Generate a FreemoPay authentication token (Admin only)",
    responses={
        200: openapi.Response(
            description="Token generated successfully",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, description='Operation status'),
                    'token': openapi.Schema(type=openapi.TYPE_STRING, description='FreemoPay authorization token'),
                    'expires_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, description='Token expiration date/time')
                }
            )
        ),
        400: "Error generating token",
        403: "Permission denied - Admin access required"
    }
)
def generate_freemo_token(request):
    """
    Generate a FreemoPay authentication token
    (Admin only endpoint)
    """
    try:
        # Initialize FreemoPay client
        freemopay = FreemoPayManager(
            app_key=settings.FREEMOPAY_APP_KEY,
            secret_key=settings.FREEMOPAY_SECRET_KEY,
            base_url=settings.FREEMOPAY_BASE_URL
        )
        
        # Generate token
        token_response = freemopay.generate_token()
        
        return Response({
            'status': 'success',
            'token': token_response.get('token'),
            'expires_at': (timezone.now() + timezone.timedelta(seconds=3600)).isoformat()
        })
        
    except Exception as e:
        print(f"Error generating FreemoPay token: {str(e)}")
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
