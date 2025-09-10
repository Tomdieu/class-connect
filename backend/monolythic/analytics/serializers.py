from rest_framework import serializers
from .models import DailyVisitor

class DailyVisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyVisitor
        fields = [
            'id', 'visitor_id', 'date', 'time', 'ip_address', 'user_agent', 
            'referrer', 'path', 'browser_language', 'screen_width', 'screen_height', 'user'
        ]
        read_only_fields = ['date', 'time']
