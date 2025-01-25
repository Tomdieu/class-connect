from django.core.management.base import BaseCommand
from courses.models import Class
from users.models import User

class Command(BaseCommand):
    help = 'Create all the different Class instances based on the attributes in the User model'

    def handle(self, *args, **kwargs):
        # Create Lycée classes
        for lycee_class in dict(User.LYCEE_CLASSES).keys():
            Class.objects.get_or_create(name=lycee_class, level='LYCEE')

        # Create University levels and years
        for university_level in dict(User.UNIVERSITY_LEVELS).keys():
            Class.objects.get_or_create(name=university_level, level='UNIVERSITY')
            if university_level == 'licence':
                for year in dict(User.LICENCE_YEARS).keys():
                    Class.objects.get_or_create(name=f"{year}",description=f"{university_level}", level='UNIVERSITY')
            elif university_level == 'master':
                for year in dict(User.MASTER_YEARS).keys():
                    Class.objects.get_or_create(name=f"{year}",description=f"{university_level}", level='UNIVERSITY')

        # Create Professional level
        Class.objects.get_or_create(name='Professional', level='PROFESSIONAL')

        self.stdout.write(self.style.SUCCESS('Successfully created all Class instances'))
