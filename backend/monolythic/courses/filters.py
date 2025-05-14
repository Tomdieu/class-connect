import django_filters
from .models import (
    Class, Subject, Chapter, Topic, AbstractResource,
    VideoResource, RevisionResource,
    PDFResource, ExerciseResource, UserProgress, CourseCategory, User,
    CourseOffering, CourseOfferingAction, CourseDeclaration, TeacherStudentEnrollment, UserClass, SchoolYear,
    Section, EducationLevel, Speciality, LevelClassDefinition
)

class CourseCategoryFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = CourseCategory
        fields = ['name', 'parent']

class ClassFilter(django_filters.FilterSet):
    variant = django_filters.CharFilter(lookup_expr='icontains')
    description = django_filters.CharFilter(lookup_expr='icontains')
    definition = django_filters.NumberFilter(field_name='definition__id')
    education_level = django_filters.NumberFilter(field_name='definition__education_level__id')
    section = django_filters.NumberFilter(field_name='definition__education_level__section__id')
    speciality = django_filters.NumberFilter(field_name='definition__speciality__id')
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Class
        fields = ['variant', 'description', 'definition', 'education_level', 'section', 'speciality']

class SectionFilter(django_filters.FilterSet):
    code = django_filters.CharFilter(lookup_expr='exact')
    label = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Section
        fields = ['code', 'label']

class EducationLevelFilter(django_filters.FilterSet):
    code = django_filters.CharFilter(lookup_expr='exact')
    label = django_filters.CharFilter(lookup_expr='icontains')
    section = django_filters.NumberFilter(field_name='section__id')
    
    class Meta:
        model = EducationLevel
        fields = ['code', 'label', 'section']

class SpecialityFilter(django_filters.FilterSet):
    code = django_filters.CharFilter(lookup_expr='exact')
    label = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Speciality
        fields = ['code', 'label']

class LevelClassDefinitionFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    education_level = django_filters.NumberFilter(field_name='education_level__id')
    section = django_filters.NumberFilter(field_name='education_level__section__id')
    speciality = django_filters.NumberFilter(field_name='speciality__id')
    
    class Meta:
        model = LevelClassDefinition
        fields = ['name', 'education_level', 'speciality']

class SubjectFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    class_id = django_filters.NumberFilter(field_name='class_level__id')
    education_level = django_filters.NumberFilter(field_name='class_level__definition__education_level__id')
    section = django_filters.NumberFilter(field_name='class_level__definition__education_level__section__id')

    class Meta:
        model = Subject
        fields = ['name', 'class_level', 'class_id', 'education_level', 'section']

class ChapterFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    subject = django_filters.ModelChoiceFilter(queryset=Subject.objects.all())
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Chapter
        fields = ['title', 'subject']

class TopicFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    chapter = django_filters.ModelChoiceFilter(queryset=Chapter.objects.all())
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Topic
        fields = ['title', 'chapter']

class ResourceFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    topic = django_filters.ModelChoiceFilter(queryset=Topic.objects.all())
    created_at = django_filters.DateTimeFromToRangeFilter()
    resource_type = django_filters.CharFilter(method='filter_resource_type')
    
    class Meta:
        model = AbstractResource
        fields = ['title', 'topic']
        
    def filter_resource_type(self, queryset, name, value):
        resource_types = {
            'video': VideoResource,
            'revision': RevisionResource,
            'pdf': PDFResource,
            'exercise': ExerciseResource
        }
        if value.lower() in resource_types:
            return queryset.instance_of(resource_types[value.lower()])
        return queryset

class UserProgressFilter(django_filters.FilterSet):
    user = django_filters.UUIDFilter()
    topic = django_filters.ModelChoiceFilter(queryset=Topic.objects.all())
    completed = django_filters.BooleanFilter()
    last_accessed = django_filters.DateTimeFromToRangeFilter()
    progress_percentage = django_filters.RangeFilter()
    
    class Meta:
        model = UserProgress
        fields = ['user', 'topic', 'completed', 'progress_percentage']

class CourseOfferingFilter(django_filters.FilterSet):
    subject = django_filters.ModelChoiceFilter(queryset=Subject.objects.all())
    class_level = django_filters.ModelChoiceFilter(queryset=Class.objects.all())
    education_level = django_filters.NumberFilter(field_name='class_level__definition__education_level__id')
    section = django_filters.NumberFilter(field_name='class_level__definition__education_level__section__id')
    start_date = django_filters.DateFromToRangeFilter()
    hourly_rate = django_filters.RangeFilter()
    is_available = django_filters.BooleanFilter()

    class Meta:
        model = CourseOffering
        fields = ['subject', 'class_level', 'is_available', 'student', 'education_level', 'section']

class CourseOfferingActionFilter(django_filters.FilterSet):
    action = django_filters.ChoiceFilter(choices=CourseOfferingAction.ACTIONS)
    created_at = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = CourseOfferingAction
        fields = ['teacher', 'offer', 'action']

class TeacherStudentEnrollmentFilter(django_filters.FilterSet):
    teacher_id = django_filters.UUIDFilter(field_name='teacher__id')
    student_id = django_filters.UUIDFilter(field_name='offer__student__id')
    school_year = django_filters.CharFilter(method='filter_by_school_year')
    created_at = django_filters.DateTimeFromToRangeFilter()
    has_class_end = django_filters.BooleanFilter()

    class Meta:
        model = TeacherStudentEnrollment
        fields = ['teacher', 'teacher_id', 'student_id', 'has_class_end', 'status']
        
    def filter_by_school_year(self, queryset, name, value):
        """
        Filters the enrollments based on a school year string 'YYYY-YYYY'.
        """
        try:
            start_year, end_year = map(int, value.split('-'))
            return queryset.filter(school_year__start_year=start_year, school_year__end_year=end_year)
        except ValueError:
            return queryset.none()

class CourseDeclarationFilter(django_filters.FilterSet):
    user_id = django_filters.UUIDFilter(method='filter_by_user')
    status = django_filters.ChoiceFilter(choices=CourseDeclaration.ACTIONS)
    declaration_date_from = django_filters.DateFilter(field_name='declaration_date', lookup_expr='gte')
    declaration_date_to = django_filters.DateFilter(field_name='declaration_date', lookup_expr='lte')
    
    def filter_by_user(self, queryset, name, value):
        """
        Filter course declarations by the teacher's user ID
        """
        return queryset.filter(
            teacher_student_enrollment__teacher__id=value
        )
    
    class Meta:
        model = CourseDeclaration
        fields = ['status', 'declaration_date_from', 'declaration_date_to', 'user_id']

class UserClassFilter(django_filters.FilterSet):
    class_level = django_filters.NumberFilter(field_name='class_level__id')
    school_year = django_filters.CharFilter(method='filter_by_school_year')
    education_level = django_filters.NumberFilter(field_name='class_level__definition__education_level__id')
    section = django_filters.NumberFilter(field_name='class_level__definition__education_level__section__id')
    no_assign_teacher = django_filters.BooleanFilter(method='filter_no_assign_teacher')
    
    class Meta:
        model = UserClass
        fields = ['class_level', 'school_year', 'user', 'education_level', 'section', 'no_assign_teacher']
    
    def filter_by_school_year(self, queryset, name, value):
        try:
            start_year, end_year = value.split('-')
            school_year = SchoolYear.objects.get(start_year=start_year, end_year=end_year)
            return queryset.filter(school_year=school_year)
        except (ValueError, SchoolYear.DoesNotExist):
            return queryset.none()
            
    def filter_no_assign_teacher(self, queryset, name, value):
        """
        Filter to find students without assigned teachers
        If value is True: return students NOT linked to active TeacherStudentEnrollment
        If value is False: return students WITH active TeacherStudentEnrollment
        """
        import sys
        
        # Get current school year
        current_school_year = SchoolYear.current_year()
        # print("FILTER DEBUG:", file=sys.stderr)
        # print(f"Filtering for school year: {current_school_year}", file=sys.stderr)
        
        # Get all users who have active course offerings with teacher enrollments
        tse_query = TeacherStudentEnrollment.objects.filter(
            status=TeacherStudentEnrollment.ACTIVE,
            school_year=current_school_year,
            has_class_end=False
        )
        
        # print(f"TeacherStudentEnrollment Query: {tse_query.query}", file=sys.stderr)
        
        users_with_teachers_ids = list(tse_query.values_list('offer__student_id', flat=True).distinct())
        
        # print(f"Users with teachers: {users_with_teachers_ids}", file=sys.stderr)
        
        if value:  # If True, find students WITHOUT teachers
            # print("Finding students WITHOUT teachers", file=sys.stderr)
            result = queryset.exclude(user_id__in=users_with_teachers_ids)
        else:  # If False, find students WITH teachers
            # print("Finding students WITH teachers", file=sys.stderr)
            result = queryset.filter(user_id__in=users_with_teachers_ids)
        
        # print(f"SQL Query: {str(result.query)}", file=sys.stderr)
        # print(f"Result count: {result.count()}", file=sys.stderr)
        
        # Return the filtered queryset
        return result
