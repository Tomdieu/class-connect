from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from oauth2_provider.models import Application
from django.conf import settings
import environ

env = environ.Env()

class Command(BaseCommand):
    help = 'Creates admin users, student and teacher users with predefined credentials and OAuth2 application'

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
            },
            # Student user
            {
                'email': 'student@gmail.com',
                'password': '1234',
                'first_name': 'Student',
                'last_name': 'User',
                'phone_number': '+237699999991',
                'education_level': 'COLLEGE',
                'college_class': '6eme',  # Setting a class for college student
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
                'education_level': 'PROFESSIONAL',
                'enterprise_name': 'Education Academy',
                'platform_usage_reason': 'Teaching students and creating educational content',
                'is_staff': False,
                'is_superuser': False,
            }
        ]

        # Create admin users
        for user_data in admin_users:
            # Check if this is an admin user or a regular user
            is_admin = not ('education_level' in user_data)
            
            defaults = {
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'phone_number': user_data['phone_number'],
                'email_verified': True,
                'date_joined': timezone.now(),
                'is_staff': user_data.get('is_staff', True if is_admin else False),
                'is_superuser': user_data.get('is_superuser', True if is_admin else False),
            }
            
            # Add education-specific fields for non-admin users
            if 'education_level' in user_data:
                defaults['education_level'] = user_data['education_level']
                
                # Add specific fields based on education level
                if user_data['education_level'] == 'COLLEGE' and 'college_class' in user_data:
                    defaults['college_class'] = user_data['college_class']
                elif user_data['education_level'] == 'LYCEE' and 'lycee_class' in user_data:
                    defaults['lycee_class'] = user_data['lycee_class']
                    defaults['lycee_speciality'] = user_data.get('lycee_speciality')
                elif user_data['education_level'] == 'UNIVERSITY':
                    defaults['university_level'] = user_data.get('university_level')
                    defaults['university_year'] = user_data.get('university_year')
                elif user_data['education_level'] == 'PROFESSIONAL':
                    defaults['enterprise_name'] = user_data.get('enterprise_name')
                    defaults['platform_usage_reason'] = user_data.get('platform_usage_reason')
            
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
