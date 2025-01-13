from django.urls import path, include
from rest_framework_nested import routers
from .views import (
    CourseCategoryViewSet, ClassViewSet, SubjectViewSet,
    ChapterViewSet, TopicViewSet, ResourceViewSet,
    UserProgressViewSet,
    TeacherAvailabilityViewSet
)

# Create main router
router = routers.DefaultRouter()
router.register(r'categories', CourseCategoryViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'user-progress', UserProgressViewSet)
router.register(r'teacher-availability', TeacherAvailabilityViewSet)

# Create nested routers
class_router = routers.NestedDefaultRouter(router, r'classes', lookup='class')
class_router.register(r'subjects', SubjectViewSet, basename='class-subjects')

subject_router = routers.NestedDefaultRouter(class_router, r'subjects', lookup='subject')
subject_router.register(r'chapters', ChapterViewSet, basename='subject-chapters')

chapter_router = routers.NestedDefaultRouter(subject_router, r'chapters', lookup='chapter')
chapter_router.register(r'topics', TopicViewSet, basename='chapter-topics')

topic_router = routers.NestedDefaultRouter(chapter_router, r'topics', lookup='topic')
topic_router.register(r'resources', ResourceViewSet, basename='topic-resources')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(class_router.urls)),
    path('', include(subject_router.urls)),
    path('', include(chapter_router.urls)),
    path('', include(topic_router.urls)),
]
