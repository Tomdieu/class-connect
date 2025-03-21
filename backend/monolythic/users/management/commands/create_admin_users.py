from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from oauth2_provider.models import Application
from django.conf import settings
import environ

env = environ.Env()

class Command(BaseCommand):
    help = 'Creates two admin users with predefined credentials and OAuth2 application'

    def handle(self, *args, **options):
        admin_users = [
            {
                'email': 'admin@gmail.com',
                'password': '1234',
                'first_name': 'Admin',
                'last_name': 'User',
                'phone_number': '+237699999990',
            },
            {
                'email': 'stevenoudo@yahoo.fr',
                'password': '#Yannick25',
                'first_name': 'Steven',
                'last_name': 'Oudo',
                'phone_number': '+237699999999',
            }
        ]

        # Create admin users
        for user_data in admin_users:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'password': user_data['password'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'phone_number': user_data['phone_number'],
                    'email_verified': True,
                    'date_joined': timezone.now(),
                    'is_staff': True,
                    'is_superuser': True,
                    'is_admin': True  # Add this if your User model has this field
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created admin user: {user.email}'))
            else:
                self.stdout.write(self.style.WARNING(f'Admin user already exists: {user.email}'))

        # Create OAuth2 application
        try:
            client_id = settings.CLASSCONNECT_CLIENT_ID
            client_secret = settings.CLASSCONNECT_CLIENT_SECRETE

            app, created = Application.objects.get_or_create(
                client_id=client_id,
                defaults={
                    'name': 'Class Connect Frontend',
                    'client_secret': client_secret,  # In a real application, this should not be exposed in logs
                    'client_type': 'confidential',
                    'authorization_grant_type': 'password',
                    'user': User.objects.get(email='admin@gmail.com'),  # Use an admin user
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS('Successfully created OAuth2 application'))
            else:
                self.stdout.write(self.style.WARNING('OAuth2 application already exists'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to create OAuth2 application: {str(e)}'))
