from django.core.management.base import BaseCommand
from forum.models import Forum

class Command(BaseCommand):
    help = 'Creates a public forum'

    def add_arguments(self, parser):
        parser.add_argument('--name', type=str, help='The name of the public forum', default='Public Forum')

    def handle(self, *args, **options):
        forum_name = options['name']
        try:
            forum = Forum.objects.create(name=forum_name)
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created public forum "{forum_name}"')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create forum: {str(e)}')
            )
