from django.apps import AppConfig


class StreamingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'streamings'

    def ready(self):
        """Import signals when the app is ready"""
        import streamings.signals
