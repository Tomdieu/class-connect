from django.core.management.base import BaseCommand
from django.utils.timezone import now
from courses.models import SchoolYear

class Command(BaseCommand):
    help = "Generate a new school year if it doesn't exist"

    def handle(self, *args, **kwargs):
        
        today = now().date()
        current_year = today.year
        start_year = current_year if today.month >= 9 else current_year - 1  # Assume school starts in September
        end_year = start_year + 1
        
        if not SchoolYear.objects.filter(start_year=start_year, end_year=end_year).exists():
            SchoolYear.objects.create(start_year=start_year, end_year=end_year)
            self.stdout.write(self.style.SUCCESS(f"Successfully created school year {start_year}-{end_year}"))
        else:
            self.stdout.write(self.style.WARNING("School year already exists"))
