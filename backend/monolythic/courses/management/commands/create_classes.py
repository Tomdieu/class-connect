from django.core.management.base import BaseCommand
from courses.models import Class
from users.models import User

class Command(BaseCommand):
    help = 'Create all the different Class instances based on the attributes in the User model'

    def handle(self, *args, **kwargs):
        sections = ['FRANCOPHONE', 'ANGLOPHONE']
        specialities = ['scientifique', 'litteraire']

        # Create College classes
        for section in sections:
            for college_class in dict(User.COLLEGE_CLASSES).keys():
                Class.objects.get_or_create(
                    name=college_class, 
                    level='COLLEGE',
                    section=section
                )

        # Create Lycée classes with specialities
        for section in sections:
            for lycee_class in dict(User.LYCEE_CLASSES).keys():
                for speciality in specialities:
                    Class.objects.get_or_create(
                        name=lycee_class, 
                        level='LYCEE',
                        section=section,
                        speciality=speciality
                    )

        # Create University levels
        for section in sections:
            # Create Licence years
            for year in dict(User.LICENCE_YEARS).keys():
                Class.objects.get_or_create(
                    name=year,
                    description='licence',
                    level='UNIVERSITY',
                    section=section
                )
            
            # Create Master years
            for year in dict(User.MASTER_YEARS).keys():
                Class.objects.get_or_create(
                    name=year,
                    description='master',
                    level='UNIVERSITY',
                    section=section
                )
            
            # Create Doctorat
            Class.objects.get_or_create(
                name='doctorat',
                description='doctorat',
                level='UNIVERSITY',
                section=section
            )

        self.stdout.write(self.style.SUCCESS('Successfully created all Class instances'))
