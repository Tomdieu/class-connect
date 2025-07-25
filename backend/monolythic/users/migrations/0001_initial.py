# Generated by Django 5.1.4 on 2025-04-22 15:27

import django.db.models.deletion
import django.utils.timezone
import phonenumber_field.modelfields
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email address')),
                ('first_name', models.CharField(max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(max_length=150, verbose_name='last name')),
                ('phone_number', phonenumber_field.modelfields.PhoneNumberField(max_length=128, region='CM', unique=True)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('education_level', models.CharField(blank=True, choices=[('COLLEGE', 'Collège'), ('LYCEE', 'Lycée'), ('UNIVERSITY', 'Université'), ('PROFESSIONAL', 'Professionnel'), ('ADMIN', 'Administrator')], max_length=20, null=True)),
                ('college_class', models.CharField(blank=True, choices=[('6eme', '6ème'), ('5eme', '5ème'), ('4eme', '4ème'), ('3eme', '3ème')], help_text='Class for college students', max_length=20, null=True)),
                ('lycee_class', models.CharField(blank=True, choices=[('2nde', '2nde'), ('1ere', '1ère'), ('terminale', 'Terminale')], help_text='Class for lycee students', max_length=20, null=True)),
                ('lycee_speciality', models.CharField(blank=True, choices=[('scientifique', 'scientifique'), ('litteraire', 'litteraire')], max_length=255, null=True)),
                ('university_level', models.CharField(blank=True, choices=[('licence', 'Licence'), ('master', 'Master'), ('doctorat', 'Doctorat')], max_length=20, null=True)),
                ('university_year', models.CharField(blank=True, choices=[('L1', 'L1'), ('L2', 'L2'), ('L3', 'L3'), ('M1', 'M1'), ('M2', 'M2')], max_length=2, null=True)),
                ('enterprise_name', models.CharField(blank=True, max_length=255, null=True)),
                ('platform_usage_reason', models.TextField(blank=True, null=True)),
                ('email_verified', models.BooleanField(default=False)),
                ('avatar', models.ImageField(blank=True, help_text='User profile picture', null=True, upload_to='avatars/', verbose_name='Avatar')),
                ('language', models.CharField(choices=[('en', 'English'), ('fr', 'French')], default='fr', max_length=2)),
                ('town', models.CharField(blank=True, max_length=100, null=True)),
                ('quarter', models.CharField(blank=True, max_length=100, null=True)),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active.', verbose_name='active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'User',
                'verbose_name_plural': 'Users',
            },
        ),
        migrations.CreateModel(
            name='UserActiveToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.TextField()),
                ('device_type', models.CharField(blank=True, max_length=50, null=True)),
                ('device_name', models.CharField(blank=True, max_length=255, null=True)),
                ('os_name', models.CharField(blank=True, max_length=50, null=True)),
                ('os_version', models.CharField(blank=True, max_length=50, null=True)),
                ('browser_name', models.CharField(blank=True, max_length=50, null=True)),
                ('browser_version', models.CharField(blank=True, max_length=50, null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('last_activity', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'User Active Token',
                'verbose_name_plural': 'User Active Tokens',
            },
        ),
        migrations.CreateModel(
            name='UserActivityLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.TextField()),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True, null=True)),
                ('request_method', models.CharField(blank=True, max_length=10, null=True)),
                ('request_path', models.TextField(blank=True, null=True)),
                ('referrer', models.TextField(blank=True, null=True)),
                ('extra_data', models.JSONField(blank=True, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserPasswordResetToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(blank=True, help_text='A six digit code', max_length=6, null=True)),
                ('reset_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reset_token', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
