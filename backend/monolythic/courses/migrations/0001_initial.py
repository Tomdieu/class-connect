# Generated by Django 5.1.4 on 2025-04-22 15:27

import datetime
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='AbstractResource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('slug', models.SlugField(blank=True, null=True, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('polymorphic_ctype', models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='polymorphic_%(app_label)s.%(class)s_set+', to='contenttypes.contenttype')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='Chapter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='Class',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('level', models.CharField(choices=[('COLLEGE', 'College'), ('LYCEE', 'Lycée'), ('UNIVERSITY', 'Université'), ('PROFESSIONAL', 'Professionnel')], max_length=20)),
                ('section', models.CharField(choices=[('FRANCOPHONE', 'Francophone'), ('ANGLOPHONE', 'Anglophone')], default='FRANCOPHONE', max_length=20)),
                ('speciality', models.CharField(blank=True, choices=[('scientifique', 'Scientifique'), ('litteraire', 'Litteraire')], max_length=20, null=True)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Classes',
            },
        ),
        migrations.CreateModel(
            name='CourseDeclaration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.PositiveIntegerField(verbose_name='Duration in minutes')),
                ('declaration_date', models.DateField(default=datetime.date.today, verbose_name='Declaration Date')),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected'), ('PAID', 'Paid')], default='PENDING', max_length=20)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('proof_of_payment', models.FileField(blank=True, null=True, upload_to='declarations/')),
                ('payment_comment', models.TextField(blank=True, null=True)),
                ('payment_date', models.DateField(blank=True, null=True, verbose_name='Payment Date')),
            ],
        ),
        migrations.CreateModel(
            name='CourseOffering',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('duration', models.PositiveIntegerField(verbose_name='Duration in minutes')),
                ('frequency', models.PositiveIntegerField(verbose_name='Frequency in days (e.g x/week)')),
                ('start_date', models.DateField(verbose_name='Start Date')),
                ('hourly_rate', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Hourly Rate')),
                ('is_available', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='CourseOfferingAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('PENDING', 'Pending'), ('ACCEPTED', 'Accepted'), ('REJECTED', 'Rejected'), ('CANCELLED', 'Cancelled')], default='PENDING', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='DailyTimeSlot',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.CharField(choices=[('lun', 'Lundi'), ('mar', 'Mardi'), ('mer', 'Mercredi'), ('jeu', 'Jeudi'), ('ven', 'Vendredi'), ('sam', 'Samedi'), ('dim', 'Dimanche')], max_length=3)),
                ('time_slot', models.CharField(choices=[('matin', 'Matin'), ('13h-14h', '13h-14h'), ('14h-15h', '14h-15h'), ('15h-16h', '15h-16h'), ('16h-17h', '16h-17h'), ('17h-18h', '17h-18h'), ('18h-19h', '18h-19h'), ('19h-20h', '19h-20h')], max_length=10)),
                ('is_available', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'Daily Time Slot',
                'verbose_name_plural': 'Daily Time Slots',
            },
        ),
        migrations.CreateModel(
            name='SchoolYear',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_year', models.PositiveIntegerField()),
                ('end_year', models.PositiveIntegerField()),
            ],
            options={
                'ordering': ['-start_year'],
            },
        ),
        migrations.CreateModel(
            name='Subject',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='TeacherStudentEnrollment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('has_class_end', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('COMPLETED', 'Completed')], default='ACTIVE', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='UserAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_type', models.CharField(choices=[('TEACHER', 'Teacher'), ('STUDENT', 'Student')], max_length=10)),
                ('is_available', models.BooleanField(default=True)),
                ('last_updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'User Availability',
                'verbose_name_plural': 'User Availabilities',
            },
        ),
        migrations.CreateModel(
            name='UserClass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('completed', models.BooleanField(default=False)),
                ('current_page', models.PositiveIntegerField(blank=True, null=True)),
                ('total_pages', models.PositiveIntegerField(blank=True, null=True)),
                ('current_time', models.PositiveIntegerField(blank=True, null=True)),
                ('total_duration', models.PositiveIntegerField(blank=True, null=True)),
                ('progress_percentage', models.IntegerField(default=0)),
                ('last_accessed', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='ExerciseResource',
            fields=[
                ('abstractresource_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='courses.abstractresource')),
                ('instructions', models.TextField()),
                ('solution_file', models.FileField(blank=True, null=True, upload_to='exercises/solutions/')),
                ('exercise_file', models.FileField(blank=True, null=True, upload_to='exercises/')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            bases=('courses.abstractresource',),
        ),
        migrations.CreateModel(
            name='PDFResource',
            fields=[
                ('abstractresource_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='courses.abstractresource')),
                ('pdf_file', models.FileField(upload_to='pdfs/')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            bases=('courses.abstractresource',),
        ),
        migrations.CreateModel(
            name='RevisionResource',
            fields=[
                ('abstractresource_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='courses.abstractresource')),
                ('content', models.TextField()),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            bases=('courses.abstractresource',),
        ),
        migrations.CreateModel(
            name='VideoResource',
            fields=[
                ('abstractresource_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='courses.abstractresource')),
                ('video_file', models.FileField(blank=True, null=True, upload_to='videos/')),
            ],
            options={
                'abstract': False,
                'base_manager_name': 'objects',
            },
            bases=('courses.abstractresource',),
        ),
        migrations.CreateModel(
            name='CourseCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='courses.coursecategory')),
            ],
        ),
    ]
