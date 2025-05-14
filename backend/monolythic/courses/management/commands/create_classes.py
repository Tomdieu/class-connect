from django.core.management.base import BaseCommand
from courses.models import Section, EducationLevel, Speciality, LevelClassDefinition, Class

class Command(BaseCommand):
    help = 'Create all the different Class instances based on the French and English education systems'

    def handle(self, *args, **kwargs):
        # Create Sections
        francophone, _ = Section.objects.get_or_create(
            code=Section.FRANCOPHONE,
            defaults={'label': 'Francophone'}
        )
        anglophone, _ = Section.objects.get_or_create(
            code=Section.ANGLOPHONE,
            defaults={'label': 'Anglophone'}
        )
        
        # Create Specialities
        scientifique, _ = Speciality.objects.get_or_create(
            code=Speciality.SCIENTIFIQUE,
            defaults={'label': 'Scientifique'}
        )
        litteraire, _ = Speciality.objects.get_or_create(
            code=Speciality.LITTERAIRE,
            defaults={'label': 'Littéraire'}
        )
        
        # ---- FRANCOPHONE SECTION ----
        # French Education Levels - use section-specific codes
        fr_college, _ = EducationLevel.objects.get_or_create(
            code=f"FR_{EducationLevel.COLLEGE}",
            section=francophone,
            defaults={'label': 'Collège'}
        )
        
        fr_lycee, _ = EducationLevel.objects.get_or_create(
            code=f"FR_{EducationLevel.LYCEE}",
            section=francophone,
            defaults={'label': 'Lycée'}
        )
        
        fr_university, _ = EducationLevel.objects.get_or_create(
            code=f"FR_{EducationLevel.UNIVERSITY}",
            section=francophone,
            defaults={'label': 'Université'}
        )
        
        # French College classes (Collège)
        fr_college_classes = ['6ème', '5ème', '4ème', '3ème']
        for class_name in fr_college_classes:
            definition, _ = LevelClassDefinition.objects.get_or_create(
                education_level=fr_college,
                name=class_name,
                defaults={'speciality': None}
            )
            
            # Create a single class without variants
            Class.objects.get_or_create(
                definition=definition,
                variant=""
            )
        
        # French Lycée classes
        fr_lycee_classes = ['2nde', '1ère', 'Tle']
        for class_name in fr_lycee_classes:
            for speciality in [scientifique, litteraire]:
                definition, _ = LevelClassDefinition.objects.get_or_create(
                    education_level=fr_lycee,
                    name=class_name,
                    speciality=speciality
                )
                
                # Create variants like A, B, C, D
                variants = ['C','D'] if speciality == scientifique else ['A']
                for variant in variants:
                    Class.objects.get_or_create(
                        definition=definition,
                        variant=variant
                    )
        
        # ---- ANGLOPHONE SECTION ----
        # English Education Levels - use section-specific codes
        en_college, _ = EducationLevel.objects.get_or_create(
            code=f"EN_{EducationLevel.COLLEGE}",
            section=anglophone,
            defaults={'label': 'Secondary School'}
        )
        
        en_lycee, _ = EducationLevel.objects.get_or_create(
            code=f"EN_{EducationLevel.LYCEE}",
            section=anglophone,
            defaults={'label': 'High School'}
        )
        
        en_university, _ = EducationLevel.objects.get_or_create(
            code=f"EN_{EducationLevel.UNIVERSITY}",
            section=anglophone,
            defaults={'label': 'University'}
        )
        
        # English College classes (Secondary School)
        en_college_classes = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5']
        for class_name in en_college_classes:
            definition, _ = LevelClassDefinition.objects.get_or_create(
                education_level=en_college,
                name=class_name,
                defaults={'speciality': None}
            )
            
            # Create a single class without variants
            Class.objects.get_or_create(
                definition=definition,
                variant=""
            )
        
        # English Lycée classes (High School)
        en_lycee_classes = ['Lower Sixth', 'Upper Sixth']
        for class_name in en_lycee_classes:
            for speciality in [scientifique, litteraire]:
                definition, _ = LevelClassDefinition.objects.get_or_create(
                    education_level=en_lycee,
                    name=class_name,
                    speciality=speciality
                )
                
                Class.objects.get_or_create(
                        definition=definition,
                        variant=""
                )
        
        # ---- UNIVERSITY (BOTH SECTIONS) ----
        for university_level in [fr_university, en_university]:
            section_prefix = "Licence" if university_level == fr_university else "Bachelor"
            
            # Create Licence/Bachelor years (L1, L2, L3)
            licence_def, _ = LevelClassDefinition.objects.get_or_create(
                education_level=university_level,
                name=f"{section_prefix}",
                defaults={'speciality': None}
            )
            
            licence_years = ['L1', 'L2', 'L3']
            for year in licence_years:
                for speciality in [scientifique, litteraire]:
                    Class.objects.get_or_create(
                        definition=licence_def,
                        variant=year,
                        description=f"{section_prefix}"
                    )
            
            # Create Master years (M1, M2)
            master_def, _ = LevelClassDefinition.objects.get_or_create(
                education_level=university_level,
                name="Master",
                defaults={'speciality': None}
            )
            
            master_years = ['M1', 'M2']
            for year in master_years:
                for speciality in [scientifique, litteraire]:
                    Class.objects.get_or_create(
                        definition=master_def,
                        variant=year,
                        description="Master"
                    )
            
            # Create Doctorat/PhD
            doctorat_def, _ = LevelClassDefinition.objects.get_or_create(
                education_level=university_level,
                name='Doctorat',
                defaults={'speciality': None}
            )
            
            # Create a single doctorate class without variants
            Class.objects.get_or_create(
                definition=doctorat_def,
                description='Doctorat/PhD'
            )

        self.stdout.write(self.style.SUCCESS('Successfully created all Class instances for French and English education systems'))
