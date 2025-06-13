from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
import uuid
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()

class SubscriptionPlan(models.Model):
    PLAN_TYPES = [
        ('BASIC', 'Basic'),
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
    ]
    
    name = models.CharField(max_length=50, choices=PLAN_TYPES,unique=True)
    slug = models.SlugField(max_length=50, unique=False, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_days = models.IntegerField()
    description = models.TextField()
    features = models.JSONField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Subscription(models.Model):
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    auto_renew = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)  # New field
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def status(self):
        if not self.is_active:
            return "PENDING"
        if self.end_date > timezone.now():
            return "ACTIVE"
        return "EXPIRED"
    
    def activate(self):
        """Activate subscription and set dates"""
        self.is_active = True
        self.start_date = timezone.now()
        self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        self.save()
    
    @classmethod
    def has_active_subscription(cls, user):
        """Check if user has any active subscription"""
        now = timezone.now()
        return cls.objects.filter(
            user=user,
            is_active=True,
            end_date__gt=now
        ).exists()
    
    def __str__(self):
        return f'{self.user.email} - {self.plan.name} ({self.status})'

    class Meta:
        ordering = ['-created_at']  # Add default ordering

class Payment(models.Model):
    PAYMENT_METHODS = [
        ('MTN', 'MTN Money'),
        ('ORANGE', 'Orange Money'),
    ]
    
    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('SUCCESSFUL', 'Successful'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    subscription = models.OneToOneField(Subscription, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    transaction_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')
    payment_date = models.DateTimeField(auto_now_add=True)
    
    # New fields to store webhook data
    currency = models.CharField(max_length=3, default='XAF')
    operator_reference = models.CharField(max_length=100, blank=True)
    operator_code = models.CharField(max_length=100, blank=True)
    signature = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    app_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    
    def __str__(self):
        return f'{self.user.email} - {self.subscription.plan.name} ({self.status})'
    
    def process_successful_payment(self, webhook_data):
        """Process a successful payment and activate subscription"""
        # Update payment details
        self.status = 'SUCCESSFUL'
        self.payment_method = 'MTN' if webhook_data.get('operator') == 'MTN' else 'ORANGE'
        self.currency = webhook_data.get('currency', 'XAF')
        self.operator_reference = webhook_data.get('operator_reference', '')
        self.operator_code = webhook_data.get('code', '')
        self.signature = webhook_data.get('signature', '')
        self.phone_number = webhook_data.get('phone_number', '')
        self.app_amount = webhook_data.get('app_amount')
        self.save()
        
        # Activate subscription
        self.subscription.activate()

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('collect', 'Collection'),
        ('withdraw', 'Withdrawal'),
        ('DEPOSIT', 'Deposit'),  # Add FreemoPay transaction types
        ('freemopay_init', 'FreemoPay Initialization'),
        ('freemopay_callback', 'FreemoPay Callback'),
    ]
    
    TRANSACTION_STATUS = [
        ('SUCCESSFUL', 'Successful'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending'),
    ]
    
    OPERATORS = [
        ('MTN', 'MTN Money'),
        ('ORANGE', 'Orange Money'),
        ('DEPOSIT', 'Deposit'),  # Add FreemoPay operator type
    ]
    
    CURRENCIES = [
        ('XAF', 'CFA Franc'),
    ]

    # Core transaction fields
    reference = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    app_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCIES, default='XAF')
    operator = models.CharField(max_length=20, choices=OPERATORS)  # Increased max_length from 10 to 20
    endpoint = models.CharField(max_length=20, choices=TRANSACTION_TYPES)  # Increased max_length from 10 to 20
    provider = models.CharField(max_length=50, default='campay')  # Add provider field
    
    # Reference numbers
    code = models.CharField(max_length=50)  # Transaction code (e.g., D250214D0016GM)
    operator_reference = models.CharField(max_length=50)  # Operator's reference number
    external_reference = models.CharField(max_length=255, null=True, blank=True)  # Changed to CharField
    
    # Customer information
    phone_number = models.CharField(max_length=15)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    external_user = models.CharField(max_length=100, blank=True, null=True)
    
    # Security and verification
    signature = models.TextField()  # JWT signature for verification
    message = models.TextField(blank=True, null=True)  # Message from provider
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['phone_number']),
            models.Index(fields=['operator']),
            models.Index(fields=['status']),
            models.Index(fields=['endpoint']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.endpoint.title()} - {self.reference} ({self.status})"
    
    @property
    def transaction_type_display(self):
        return "Collection" if self.endpoint == 'collect' else "Withdrawal"
    
    @property
    def is_successful(self):
        return self.status == 'SUCCESSFUL'
    
    @property
    def formatted_amount(self):
        return f"{self.amount:,.2f} {self.currency}"

class PaymentReference(models.Model):
    """
    Stores mapping between internal and external payment references
    for reliable reference lookup during webhook processing.
    """
    # The UUID sent to payment provider as external_reference
    external_reference = models.UUIDField(unique=True, db_index=True)
    
    # Our internal reference (p{plan_id}u{user_id}h{hash})
    internal_reference = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Related data for quick access
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan = models.ForeignKey('SubscriptionPlan', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=20)
    provider = models.CharField(max_length=50, default='campay')  # Default to 'campay' for backward compatibility
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Payment Reference"
        verbose_name_plural = "Payment References"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.internal_reference} → {self.external_reference}"
    
    @classmethod
    def get_by_reference(cls, reference):
        """
        Find a payment reference by either external or internal reference,
        safely handling UUID conversion
        """
        # First try direct lookup by external_reference UUID
        try:
            return cls.objects.get(external_reference=reference)
        except (cls.DoesNotExist, ValueError):
            # If that fails, try string comparison for external_reference
            try:
                for pr in cls.objects.all():
                    if str(pr.external_reference) == reference:
                        return pr
            except Exception:
                pass
            
            # If still not found, try internal reference
            try:
                return cls.objects.get(internal_reference=reference)
            except cls.DoesNotExist:
                return None