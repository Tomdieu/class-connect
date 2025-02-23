from django.core.management.base import BaseCommand
from payments.models import SubscriptionPlan

class Command(BaseCommand):
    help = 'Creates default subscription plans'

    def handle(self, *args, **kwargs):
        plans = [
            {
                'name': 'BASIC',
                'price': 5000.00,
                'duration_days': 30,
                'description': 'Forfait de base avec fonctionnalités essentielles',
                'features': {
                    'courses_access': 'Limité',
                    'downloadable_content': False,
                    'support': 'Email uniquement',
                    'max_courses': 5
                }
            },
            {
                'name': 'STANDARD',
                'price': 10000.00,
                'duration_days': 30,
                'description': 'Forfait standard avec plus de fonctionnalités',
                'features': {
                    'courses_access': 'Illimité',
                    'downloadable_content': True,
                    'support': 'Email + Chat',
                    'max_courses': 15
                }
            },
            {
                'name': 'PREMIUM',
                'price': 20000.00,
                'duration_days': 30,
                'description': 'Forfait premium avec toutes les fonctionnalités',
                'features': {
                    'courses_access': 'Illimité',
                    'downloadable_content': True,
                    'support': 'Support prioritaire 24/7',
                    'max_courses': 'Illimité',
                    'offline_access': True,
                    'certificate': True
                }
            }
        ]

        for plan_data in plans:
            plan, created = SubscriptionPlan.objects.get_or_create(
                name=plan_data['name'],
                defaults={
                    'price': plan_data['price'],
                    'duration_days': plan_data['duration_days'],
                    'description': plan_data['description'],
                    'features': plan_data['features']
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created {plan.name} plan')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Plan {plan.name} already exists')
                )
