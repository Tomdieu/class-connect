from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserPasswordResetToken, UserActiveToken, UserActivityLog

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'user_type')
    list_filter = ('is_staff', 'is_superuser', 'user_type')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'date_of_birth', 'avatar')}),
        ('User Type', {'fields': ('user_type', 'class_enrolled')}),
        ('Professional', {'fields': ('enterprise_name', 'platform_usage_reason')}),
        ('Contact', {'fields': ('town', 'quarter')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Other', {'fields': ('language', 'email_verified')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'phone_number'),
        }),
        ('User Type', {
            'fields': ('user_type', 'class_enrolled'),
        }),
    )

admin.site.register(User, UserAdmin)
admin.site.register(UserPasswordResetToken)
admin.site.register(UserActiveToken)
admin.site.register(UserActivityLog)