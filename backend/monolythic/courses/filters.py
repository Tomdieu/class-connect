import django_filters
from .models import (
    Class, Subject, Chapter, Topic, AbstractResource,
    VideoResource, RevisionResource,
    PDFResource, ExerciseResource, UserProgress, CourseCategory, User,
    CourseOffering,CourseOfferingAction,CourseDeclaration,TeacherStudentEnrollment
)

# Filter for the Course model
# class CourseFilter(django_filters.FilterSet):
#     level = django_filters.ChoiceFilter(choices=Course.COURSE_LEVELS, label="Niveau")
#     title = django_filters.CharFilter(lookup_expr='icontains', label="Titre")
#     category = django_filters.ModelChoiceFilter(
#         queryset=Course.objects.values_list('category', flat=True).distinct(),
#         label="Catégorie"
#     )
#     instructor = django_filters.ModelChoiceFilter(
#         queryset=User.objects.all(), 
#         label="Instructeur"
#     )

#     class Meta:
#         model = Course
#         fields = ['level', 'title', 'category', 'instructor', 'minimum_subscription_plan_id']

class CourseCategoryFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = CourseCategory
        fields = ['name', 'parent']

class ClassFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    level = django_filters.ChoiceFilter(choices=Class.EDUCATION_LEVELS)
    created_at = django_filters.DateTimeFromToRangeFilter()
    speciality = django_filters.CharFilter(method='filter_speciality')
    
    def filter_speciality(self, queryset, name, value):
        return queryset.filter(speciality__icontains=value)
    
    class Meta:
        model = Class
        fields = ['name', 'level']

class SubjectFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    class_level = django_filters.ModelChoiceFilter(queryset=Class.objects.all())
    created_at = django_filters.DateTimeFromToRangeFilter()
    
    class Meta:
        model = Subject
        fields = ['name', 'class_level']

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
    start_date = django_filters.DateFromToRangeFilter()
    hourly_rate = django_filters.RangeFilter()
    is_available = django_filters.BooleanFilter()

    class Meta:
        model = CourseOffering
        fields = ['subject', 'class_level', 'is_available', 'student']

class CourseOfferingActionFilter(django_filters.FilterSet):
    action = django_filters.ChoiceFilter(choices=CourseOfferingAction.ACTIONS)
    created_at = django_filters.DateTimeFromToRangeFilter()

    class Meta:
        model = CourseOfferingAction
        fields = ['teacher', 'offer', 'action']

class TeacherStudentEnrollmentFilter(django_filters.FilterSet):
    school_year = django_filters.CharFilter(method='filter_by_school_year')
    created_at = django_filters.DateTimeFromToRangeFilter()
    has_class_end = django_filters.BooleanFilter()

    class Meta:
        model = TeacherStudentEnrollment
        fields = ['teacher', 'has_class_end','status']
        
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
    status = django_filters.ChoiceFilter(choices=CourseDeclaration.ACTIONS)
    declaration_date = django_filters.DateFromToRangeFilter()

    class Meta:
        model = CourseDeclaration
        fields = ['status', 'declaration_date']
