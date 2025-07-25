# Generated by Django 5.1.4 on 2025-05-26 17:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0004_transaction_message_transaction_provider'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='endpoint',
            field=models.CharField(choices=[('collect', 'Collection'), ('withdraw', 'Withdrawal'), ('DEPOSIT', 'Deposit'), ('freemopay_init', 'FreemoPay Initialization'), ('freemopay_callback', 'FreemoPay Callback')], max_length=20),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='operator',
            field=models.CharField(choices=[('MTN', 'MTN Money'), ('ORANGE', 'Orange Money'), ('DEPOSIT', 'Deposit')], max_length=20),
        ),
    ]
