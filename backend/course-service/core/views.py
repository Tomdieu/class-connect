from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import (
    CourseCategory, Class, Subject, Chapter, Topic,
    AbstractResource, UserProgress,UserAvailability,DailyTimeSlot
)
from .serializers import (
    CourseCategorySerializer, ClassSerializer, SubjectSerializer,
    ChapterSerializer, TopicSerializer, PolymorphicResourceSerializer,
    UserProgressSerializer,UserAvailabilitySerializer
)
from .pagination import CustomPagination
from .filters import (
    CourseCategoryFilter, ClassFilter, SubjectFilter,
    ChapterFilter, TopicFilter, ResourceFilter, UserProgressFilter
)


class CourseCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course categories.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseCategoryFilter


class ClassViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing classes.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ClassFilter


class SubjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing subjects within a class.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = SubjectFilter

    def get_queryset(self):
        queryset = Subject.objects.filter(class_level=self.kwargs['class_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs


class ChapterViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing chapters within a subject.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = ChapterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ChapterFilter

    def get_queryset(self):
        queryset = Chapter.objects.filter(subject=self.kwargs['subject_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs


class TopicViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing topics within a chapter.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TopicFilter

    def get_queryset(self):
        queryset = Topic.objects.filter(chapter=self.kwargs['chapter_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs


class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing resources within a topic.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = PolymorphicResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter

    def get_queryset(self):
        queryset = AbstractResource.objects.filter(topic=self.kwargs['topic_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs


class UserProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user progress.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserProgressFilter
    filterset_fields = ['user', 'topic', 'completed']

    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description="User ID", type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('topic_id', openapi.IN_QUERY, description="Topic ID", type=openapi.TYPE_INTEGER, required=False),
        ],
        responses={200: UserProgressSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='user-progress')
    def get_user_progress(self, request):
        """
        Get progress for a specific user, optionally filtered by topic.
        """
        user_id = request.query_params.get('user_id')
        topic_id = request.query_params.get('topic_id')

        if not user_id:
            return Response(
                {"error": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(user_id=user_id)
        if topic_id:
            queryset = queryset.filter(topic_id=topic_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TeacherAvailabilityViewSet(viewsets.ModelViewSet):
    
    serializer_class = UserAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    
    queryset = UserAvailability.objects.all()
    
    def perform_create(self, serializer):
        # Determine user type based on the user's role
        user_type = 'TEACHER' if self.request.user.education_level == "PROFESSIONAL" else 'STUDENT'
        serializer.save(user=self.request.user, user_type=user_type)
    
    @action(detail=True, methods=['patch'],url_path='update-time-slot')
    def update_time_slot(self, request, pk=None):
        availability = self.get_object()
        slot_id = request.data.get('slot_id')
        is_available = request.data.get('is_available')
        
        if slot_id is not None and is_available is not None:
            slot = DailyTimeSlot.objects.get(id=slot_id, availability=availability)
            slot.is_available = is_available
            slot.save()
            return Response({'status': 'updated'})
        return Response({'error': 'Invalid data'}, status=400)
    
    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('teacher_id', openapi.IN_QUERY, description="Teacher ID", type=openapi.TYPE_STRING, required=True),
        ],
        responses={200: UserAvailabilitySerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='teacher-availability')
    def get_teacher_availability(self, request):
        teacher_id = request.query_params.get('teacher_id')
        if teacher_id:
            queryset = self.queryset.filter(teacher_id=teacher_id)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({'error': 'teacher_id is required'}, status=400)