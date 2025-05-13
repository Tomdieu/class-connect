from django.urls import path, include
from rest_framework_nested import routers
from rest_framework.routers import DefaultRouter
from .views import (
    CourseCategoryViewSet, ClassViewSet, SchoolYearViewSet, SubjectViewSet,
    ChapterViewSet, TopicViewSet, ResourceViewSet, DirectResourceViewSet,
    UserProgressViewSet,
    UserAvailabilityViewSet,
    CourseOfferingViewSet,
    CourseOfferingActionViewSet,
    TeacherStudentEnrollmentViewSet,
    CourseDeclarationViewSet,
    CourseDeclarationDirectViewSet,
    VideoResourceViewSet, RevisionResourceViewSet, PDFResourceViewSet, ExerciseResourceViewSet,
    UserClassViewSet,
    SectionViewSet, EducationLevelViewSet, SpecialityViewSet,
    LevelClassDefinitionViewSet, SectionHierarchyViewSet
)

# Create main router
router = DefaultRouter()
router.register(r'categories', CourseCategoryViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'user-progress', UserProgressViewSet)
router.register(r'user-availability', UserAvailabilityViewSet)
router.register(r'course-offerings', CourseOfferingViewSet)
router.register(r'school-year', SchoolYearViewSet)
router.register(r'enrollments', TeacherStudentEnrollmentViewSet)
router.register(r'user-classes', UserClassViewSet)  # Add the new viewset
router.register(r'resources', DirectResourceViewSet)  # Add direct resource access
router.register(r'course-declarations', CourseDeclarationDirectViewSet)  # Add the new route
router.register(r'sections', SectionViewSet)
router.register(r'education-levels', EducationLevelViewSet)
router.register(r'specialities', SpecialityViewSet)
router.register(r'class-definitions', LevelClassDefinitionViewSet)
router.register(r'section-hierarchy', SectionHierarchyViewSet, basename='section-hierarchy')

# Create nested routers
class_router = routers.NestedDefaultRouter(router, r'classes', lookup='class')
class_router.register(r'subjects', SubjectViewSet, basename='class-subjects')
class_router.register(r'students', UserClassViewSet, basename='class-students')  # Add nested route for students by class

subject_router = routers.NestedDefaultRouter(class_router, r'subjects', lookup='subject')
subject_router.register(r'chapters', ChapterViewSet, basename='subject-chapters')

chapter_router = routers.NestedDefaultRouter(subject_router, r'chapters', lookup='chapter')
chapter_router.register(r'topics', TopicViewSet, basename='chapter-topics')

topic_router = routers.NestedDefaultRouter(chapter_router, r'topics', lookup='topic')
topic_router.register(r'resources', ResourceViewSet, basename='topics')
topic_router.register(r'videos', VideoResourceViewSet, basename='topic-videos')
# topic_router.register(r'quizs', QuizResourceViewSet, basename='topic-quizs')
topic_router.register(r'revisions', RevisionResourceViewSet, basename='topic-revisions')
topic_router.register(r'pdfs', PDFResourceViewSet, basename='topic-pdfs')
topic_router.register(r'exercises', ExerciseResourceViewSet, basename='topic-exercises')

# Add nested router for course offering actions
offering_router = routers.NestedDefaultRouter(router, r'course-offerings', lookup='offering')
offering_router.register(r'actions', CourseOfferingActionViewSet, basename='offering-actions')

# Create nested router for course declarations under enrollments
enrollment_router = routers.NestedDefaultRouter(router, r'enrollments', lookup='enrollment')
enrollment_router.register(r'declarations', CourseDeclarationViewSet, basename='enrollment-declarations')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(class_router.urls)),
    path('', include(subject_router.urls)),
    path('', include(chapter_router.urls)),
    path('', include(topic_router.urls)),
    path('', include(offering_router.urls)),
    path('', include(enrollment_router.urls)),  # Add the enrollment router
]
