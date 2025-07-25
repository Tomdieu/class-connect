# Generated by Django 5.1.4 on 2025-04-23 12:38

import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('streamings', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SessionParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_joined_at', models.DateTimeField(auto_now_add=True)),
                ('last_seen_at', models.DateTimeField(auto_now=True)),
                ('total_duration', models.DurationField(default=datetime.timedelta(0))),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='streamings.videoconferencesession')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participated_session', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('session', 'user')},
            },
        ),
        migrations.CreateModel(
            name='SessionConnection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('left_at', models.DateTimeField(blank=True, null=True)),
                ('participant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='connections', to='streamings.sessionparticipant')),
            ],
        ),
    ]
