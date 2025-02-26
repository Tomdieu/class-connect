from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from oauth2_provider.models import Application
from django.conf import settings
import environ
import os

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
        created_admin = None
        for user_data in admin_users:
            try:
                if not User.objects.filter(email=user_data['email']).exists():
                    user = User.objects.create_superuser(
                        email=user_data['email'],
                        password=user_data['password'],
                        first_name=user_data['first_name'],
                        last_name=user_data['last_name'],
                        phone_number=user_data['phone_number'],
                        email_verified=True,
                        date_joined=timezone.now()
                    )
                    created_admin = user
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully created admin user: {user.email}')
                    )
                else:
                    user = User.objects.get(email=user_data['email'])
                    created_admin = user
                    self.stdout.write(
                        self.style.WARNING(f'Admin user already exists: {user_data["email"]}')
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Failed to create admin user {user_data["email"]}: {str(e)}')
                )

        # Create OAuth2 application
        try:
            client_id = "6SIonR86OqADNfEuVIughdkJrMvOI65RjnjK6Guu"
            client_secret = "JDJmm6N4h8Nw8TQuyIC7vFX61NNZNEPe68BhMaIzoRgzB5gPTsrYe8SdJdV59jbiO6WleFwkQ4BfmrsUEUCpKTeRDCImfwTBjvlMkHVHIiFsk2NO6CsFBQFCWxqJS4pj"

            if not Application.objects.filter(client_id=client_id).exists():
                Application.objects.create(
                    name='Class Connect Frontend',
                    client_id=client_id,
                    client_secret=client_secret,
                    client_type='confidential',
                    authorization_grant_type='password',
                    user=created_admin
                )
                self.stdout.write(
                    self.style.SUCCESS('Successfully created OAuth2 application')
                )
            else:
                self.stdout.write(
                    self.style.WARNING('OAuth2 application already exists')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create OAuth2 application: {str(e)}')
            )
