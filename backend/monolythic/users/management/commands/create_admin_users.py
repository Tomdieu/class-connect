from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from oauth2_provider.models import Application
from django.conf import settings
import environ
from courses.models import Class

env = environ.Env()

class Command(BaseCommand):
    help = 'Creates admin users, student and teacher users with predefined credentials and OAuth2 application'

    def handle(self, *args, **options):
        # First, try to get a default class for student users
        default_class = None
        try:
            default_class = Class.objects.filter(definition__education_level__code__contains='COLLEGE').first()
            if default_class:
                self.stdout.write(self.style.SUCCESS(f'Found default class: {default_class}'))
            else:
                self.stdout.write(self.style.WARNING('No suitable class found for student users'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error finding default class: {str(e)}'))

        admin_users = [
            {
                'email': 'admin@gmail.com',
                'password': '1234',
                'first_name': 'Admin',
                'last_name': 'User',
                'phone_number': '+237699999990',
                'is_staff': True,
                'is_superuser': True,
                'user_type': 'ADMIN',
            },
            {
                'email': 'stevenoudo@yahoo.fr',
                'password': '#Yannick25',
                'first_name': 'Steve',
                'last_name': 'Noudo',
                'phone_number': '+237699999999',
                'is_staff': True,
                'is_superuser': True,
                'user_type': 'ADMIN',
            },
            # Student user
            {
                'email': 'student@gmail.com',
                'password': '1234',
                'first_name': 'Student',
                'last_name': 'User',
                'phone_number': '+237699999991',
                'user_type': 'STUDENT',
                'class_enrolled': default_class,  # Directly use the class object
                'is_staff': False,
                'is_superuser': False,
            },
            # Teacher/Professional user
            {
                'email': 'teacher@gmail.com',
                'password': '1234',
                'first_name': 'Teacher',
                'last_name': 'User',
                'phone_number': '+237699999992',
                'user_type': 'PROFESSIONAL',
                'enterprise_name': 'Education Academy',
                'platform_usage_reason': 'Teaching students and creating educational content',
                'is_staff': False,
                'is_superuser': False,
            }
        ]

        # Create users
        for user_data in admin_users:
            # Check if this is an admin user or a regular user
            is_admin = user_data.get('is_staff', False) or user_data.get('is_superuser', False)
            
            defaults = {
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'phone_number': user_data['phone_number'],
                'email_verified': True,
                'date_joined': timezone.now(),
                'is_staff': user_data.get('is_staff', False),
                'is_superuser': user_data.get('is_superuser', False),
                'user_type': 'ADMIN' if is_admin else user_data.get('user_type', 'STUDENT'),
                'class_enrolled': user_data.get('class_enrolled', None),
                'enterprise_name': user_data.get('enterprise_name', None),
                'platform_usage_reason': user_data.get('platform_usage_reason', None),
            }
            
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=defaults
            )

            if created:
                # Set the password after creating the user
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully created user: {user.email}'))
            else:
                self.stdout.write(self.style.WARNING(f'User already exists: {user.email}'))

        # Create OAuth2 application
        try:
            client_id = settings.CLASSCONNECT_CLIENT_ID
            client_secret = settings.CLASSCONNECT_CLIENT_SECRETE

            app, created = Application.objects.get_or_create(
                client_id=client_id,
                defaults={
                    'name': 'Class Connect Frontend',
                    'client_secret': client_secret,
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
