from django.contrib import admin
from .models import SubscriptionPlan, Subscription, Payment, Transaction

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_days', 'active')
    list_filter = ('active', 'name')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active', 'auto_renew')
    list_filter = ('auto_renew', 'plan')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'subscription', 'amount', 'payment_method', 'status', 'payment_date')
    list_filter = ('status', 'payment_method')
    search_fields = ('transaction_id',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'reference',
        'status',
        'amount',
        'operator',
        'endpoint',
        'phone_number',
        'created_at'
    )
    list_filter = (
        'status',
        'operator',
        'endpoint',
        'currency',
        'created_at'
    )
    search_fields = (
        'reference',
        'phone_number',
        'code',
        'operator_reference',
        'external_reference',
        'email',
        'first_name',
        'last_name'
    )
    readonly_fields = (
        'reference',
        'created_at',
        'updated_at',
        'signature'
    )
    fieldsets = (
        ('Transaction Details', {
            'fields': (
                'reference',
                'status',
                'amount',
                'app_amount',
                'currency',
                'operator',
                'endpoint',
                'code',
                'operator_reference',
                'external_reference'
            )
        }),
        ('Customer Information', {
            'fields': (
                'phone_number',
                'first_name',
                'last_name',
                'email',
                'external_user'
            )
        }),
        ('Security & Timestamps', {
            'fields': (
                'signature',
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    def has_add_permission(self, request):
        # Disable manual creation of transactions
        return False
