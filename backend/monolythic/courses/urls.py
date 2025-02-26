from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    CourseCategoryViewSet, ClassViewSet, SubjectViewSet,
    ChapterViewSet, TopicViewSet, ResourceViewSet,
    UserProgressViewSet,
    UserAvailabilityViewSet,
    CourseOfferingViewSet,
    CourseOfferingActionViewSet,
    TeacherStudentEnrollmentViewSet,
    CourseDeclarationViewSet,
    # QuizResourceViewSet, QuestionViewSet, QuestionOptionViewSet,
    # QuizAttemptViewSet, QuestionResponseViewSet,
    VideoResourceViewSet, RevisionResourceViewSet, PDFResourceViewSet, ExerciseResourceViewSet
)

# Create main router
router = routers.DefaultRouter()
router.register(r'categories', CourseCategoryViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'user-progress', UserProgressViewSet)
router.register(r'user-availability', UserAvailabilityViewSet)
router.register(r'course-offerings', CourseOfferingViewSet)
# Remove the offering-actions registration since it will be nested
router.register(r'enrollments', TeacherStudentEnrollmentViewSet)
router.register(r'declarations', CourseDeclarationViewSet)
# router.register(r'quizzes', QuizResourceViewSet)
# router.register(r'questions', QuestionViewSet)
# router.register(r'question-options', QuestionOptionViewSet)
# router.register(r'quiz-attempts', QuizAttemptViewSet)
# router.register(r'question-responses', QuestionResponseViewSet)

# Create nested routers
class_router = routers.NestedDefaultRouter(router, r'classes', lookup='class')
class_router.register(r'subjects', SubjectViewSet, basename='class-subjects')

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

urlpatterns = [
    path('', include(router.urls)),
    path('', include(class_router.urls)),
    path('', include(subject_router.urls)),
    path('', include(chapter_router.urls)),
    path('', include(topic_router.urls)),
    path('', include(offering_router.urls)),
]
