from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserPasswordResetToken, UserActiveToken,UserActivityLog

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'education_level', 'is_staff', 'email_verified')
    list_filter = ('is_staff', 'is_active', 'education_level', 'email_verified', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_login')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {
            'fields': (
                'first_name', 'last_name', 'phone_number', 'date_of_birth',
                'avatar', 'language', 'town', 'quarter'
            )
        }),
        (_('Education'), {
            'fields': (
                'education_level', 'college_class', 'lycee_class',
                'lycee_speciality', 'university_level', 'university_year',
                'enterprise_name', 'platform_usage_reason'
            )
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'email_verified',
                'groups', 'user_permissions'
            ),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'created_at', 'updated_at', 'date_joined')
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

@admin.register(UserPasswordResetToken)
class UserPasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'reset_at', 'created_at')
    list_filter = ('reset_at', 'created_at')
    search_fields = ('user__email', 'code')
    readonly_fields = ('created_at',)
    raw_id_fields = ('user',)
    date_hierarchy = 'created_at'

@admin.register(UserActiveToken)
class UserActiveTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_type', 'device_name', 'ip_address', 'last_activity')
    list_filter = ('device_type', 'os_name', 'browser_name', 'created_at')
    search_fields = ('user__email', 'device_name', 'ip_address')
    readonly_fields = ('created_at', 'updated_at', 'last_activity')
    raw_id_fields = ('user',)
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {
            'fields': ('user', 'token')
        }),
        (_('Device Information'), {
            'fields': (
                'device_type', 'device_name', 'os_name',
                'os_version', 'browser_name', 'browser_version'
            )
        }),
        (_('Connection Info'), {
            'fields': ('ip_address',)
        }),
        (_('Timestamps'), {
            'fields': ('last_activity', 'created_at', 'updated_at')
        }),
    )


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'ip_address', 'request_method', 'timestamp')
    search_fields = ('user__username', 'action', 'ip_address', 'request_path')
    list_filter = ('timestamp', 'request_method')