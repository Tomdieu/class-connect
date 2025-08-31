from django.contrib import admin
from .models import SiteConfiguration
# Register your models here.

@admin.register(SiteConfiguration)
class SiteConfigurationAdmin(admin.ModelAdmin):
    list_display = ('id', 'site_name','email','currency','tax_rate')
    search_fields = ('site_name',)
