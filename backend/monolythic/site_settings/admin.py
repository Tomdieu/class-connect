from django.contrib import admin
from .models import SiteConfiguration
# Register your models here.

@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ('id', 'site_name', 'site_url', 'created_at', 'updated_at')
    search_fields = ('site_name', 'site_url')
    ordering = ('-created_at',)
