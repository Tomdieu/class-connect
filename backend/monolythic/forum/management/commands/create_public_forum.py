from django.core.management.base import BaseCommand
from forum.models import Forum

class Command(BaseCommand):
    help = 'Automatically creates the public forum chat if it does not exist.'

    def handle(self, *args, **options):
        forum_name = "Public Forum"
        forum, created = Forum.objects.get_or_create(name=forum_name)
        if created:
            self.stdout.write(self.style.SUCCESS(f"Public forum '{forum_name}' created successfully."))
        else:
            self.stdout.write(self.style.WARNING(f"Public forum '{forum_name}' already exists."))
