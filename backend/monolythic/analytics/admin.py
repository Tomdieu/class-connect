from django.contrib import admin
from .models import DailyVisitor

@admin.register(DailyVisitor)
class DailyVisitorAdmin(admin.ModelAdmin):
    list_display = ('visitor_id', 'date', 'path', 'ip_address', 'user')
    list_filter = ('date', 'path')
    search_fields = ('visitor_id', 'ip_address', 'path', 'referrer')
    date_hierarchy = 'date'
