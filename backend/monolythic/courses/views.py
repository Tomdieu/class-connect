from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import (
    CourseCategory, Class, Subject, Chapter, Topic,
    AbstractResource, UserProgress,UserAvailability,DailyTimeSlot,
    CourseOffering, CourseOfferingAction, TeacherStudentEnrollment, CourseDeclaration,
    QuizResource, Question, QuestionOption, QuizAttempt, QuestionResponse,
    VideoResource, RevisionResource, PDFResource, ExerciseResource
)
from .serializers import (
    CourseCategorySerializer, ClassSerializer, SubjectSerializer,
    ChapterSerializer, TopicSerializer, PolymorphicResourceSerializer,
    UserProgressSerializer,UserAvailabilitySerializer,
    CourseOfferingSerializer, CourseOfferingActionSerializer,
    TeacherStudentEnrollmentSerializer, CourseDeclarationSerializer,DailyTimeSlotSerializer,DailyTimeSlotUpdateSerializer,
    QuizResourceSerializer, QuestionSerializer, QuestionOptionSerializer, QuizAttemptSerializer, QuestionResponseSerializer,
    VideoResourceSerializer, RevisionResourceSerializer, PDFResourceSerializer, ExerciseResourceSerializer,
    BulkQuestionSerializer
)
from .pagination import CustomPagination
from .filters import (
    CourseCategoryFilter, ClassFilter, SubjectFilter,
    ChapterFilter, TopicFilter, ResourceFilter, UserProgressFilter,
    CourseOfferingFilter, CourseOfferingActionFilter,
    TeacherStudentEnrollmentFilter, CourseDeclarationFilter
)
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import serializers

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
    # pagination_class = CustomPagination
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ClassFilter
    
    
    method_decorator(cache_page(60*60*2,key_prefix='class_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    method_decorator(cache_page(60*60*2,key_prefix='class_detail'))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class SubjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing subjects within a class.
    """
    permission_classes = [IsAuthenticated]
    # pagination_class = CustomPagination
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = SubjectFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return Subject.objects.none()  # Return empty queryset for swagger
        queryset = Subject.objects.filter(class_level=self.kwargs['class_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs

    @method_decorator(cache_page(60*60*2,key_prefix='subjects_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class ChapterViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing chapters within a subject.
    """
    permission_classes = [IsAuthenticated]
    # pagination_class = CustomPagination
    serializer_class = ChapterSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ChapterFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return Chapter.objects.none()  # Return empty queryset for swagger
        queryset = Chapter.objects.filter(subject=self.kwargs['subject_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs


class TopicViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing topics within a chapter.
    """
    permission_classes = [IsAuthenticated]
    # pagination_class = CustomPagination
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TopicFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return Topic.objects.none()  # Return empty queryset for swagger
        queryset = Topic.objects.filter(chapter=self.kwargs['chapter_pk'])
        return self.filterset_class(self.request.GET, queryset=queryset).qs


class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing resources within a topic.
    """
    permission_classes = [IsAuthenticated]
    # pagination_class = CustomPagination
    serializer_class = PolymorphicResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return AbstractResource.objects.none()  # Return empty queryset for swagger
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


class UserAvailabilityViewSet(viewsets.ModelViewSet):
    
    serializer_class = UserAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    
    queryset = UserAvailability.objects.all()
    
    def perform_create(self, serializer):
        # Determine user type based on the user's role
        user_type = 'TEACHER' if self.request.user.education_level == "PROFESSIONAL" else 'STUDENT'
        serializer.save(user=self.request.user, user_type=user_type)
        
    @action(methods=['get'],detail=False)
    def my_availability(self,request):
        user_type = 'TEACHER' if request.user.education_level == "PROFESSIONAL" else 'STUDENT'
        availaibility = UserAvailability.objects.get_or_create(user=request.user)
    
    @swagger_auto_schema(
        method='patch',
        request_body=DailyTimeSlotUpdateSerializer,
        responses={200: 'Time slot updated successfully', 400: 'Invalid data or error occurred'},
    )
    @action(detail=True, methods=['patch'],url_path='update-time-slot')
    def update_time_slot(self, request, pk=None):
        availability = self.get_object()
        slot_id = request.data.get('slot_id')
        is_available = request.data.get('is_available')
        
        if slot_id is None or is_available is None:
            return Response({'error': 'Invalid data provided'}, status=400)

        try:
            slot = DailyTimeSlot.objects.get(id=slot_id, availability=availability)
            slot.is_available = is_available
            slot.save()
            return Response({'status': 'Time slot updated successfully'})
        except DailyTimeSlot.DoesNotExist:
            return Response({'error': 'Time slot not found'}, status=404)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=500)
    
    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description="USER ID", type=openapi.TYPE_STRING, required=True),
        ],
        responses={200: UserAvailabilitySerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='user-availability')
    def get_user_availability(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            queryset = self.queryset.filter(user_id=user_id)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id is required'}, status=400)


class CourseOfferingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course offerings.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = CourseOffering.objects.all()
    serializer_class = CourseOfferingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseOfferingFilter

    @swagger_auto_schema(
        method='get',
        responses={200: CourseOfferingSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def available_offerings(self, request):
        """Get all available course offerings."""
        queryset = self.queryset.filter(is_available=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class CourseOfferingActionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course offering actions.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = CourseOfferingAction.objects.all()
    serializer_class = CourseOfferingActionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseOfferingActionFilter

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)

class TeacherStudentEnrollmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing teacher-student enrollments.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = TeacherStudentEnrollment.objects.all()
    serializer_class = TeacherStudentEnrollmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TeacherStudentEnrollmentFilter

    @swagger_auto_schema(
        method='get',
        responses={200: TeacherStudentEnrollmentSerializer(many=True)}
    )
    @action(detail=False, methods=['get'],url_path='my-students')
    def my_students(self, request):
        """Get all students enrolled with the current teacher."""
        queryset = self.queryset.filter(teacher=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='get',
        responses={200: TeacherStudentEnrollmentSerializer(many=True)},
        operation_description="Get all teachers for the current student"
    )
    @action(detail=False, methods=['get'],url_path='my-teachers')
    def my_teachers(self, request):
        """Get all teachers associated with the current student."""
        queryset = self.queryset.filter(
            offer__student=request.user,
            has_class_end=False  # Only get active enrollments
        )
        serializer = self.get_serializer(queryset, many=True)
        
        # Enhance response with additional teacher details
        response_data = []
        for enrollment in serializer.data:
            teacher_data = enrollment.copy()
            teacher_data['subject'] = enrollment['offer']['subject']
            teacher_data['class_level'] = enrollment['offer']['class_level']
            teacher_data['hourly_rate'] = enrollment['offer']['hourly_rate']
            response_data.append(teacher_data)
            
        return Response(response_data)
    
    @swagger_auto_schema(
        method='get',
        responses={200:CourseDeclarationSerializer(many=True)},
        operation_description="Get all course declaration"
    )
    @action(detail=True,methods=['get'],url_path='cource-declaration')
    def course_declaration(self,request):
        teacher_student_enrollment = self.get_object()
        course_declaration = CourseDeclaration.objects.filter(teacher_student_enrollment=teacher_student_enrollment)
        serializer = CourseDeclarationSerializer(course_declaration,many=True)
        return Response(serializer.data)

class CourseDeclarationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course declarations.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = CourseDeclaration.objects.all()
    serializer_class = CourseDeclarationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseDeclarationFilter

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update the status of a course declaration."""
        declaration = self.get_object()
        status = request.data.get('status')
        if status in dict(CourseDeclaration.ACTIONS):
            declaration.status = status
            declaration.save()
            return Response({'status': 'updated'})
        return Response({'error': 'Invalid status'}, status=400)

class QuizResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing quiz resources.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = QuizResource.objects.all()
    serializer_class = QuizResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter

    @swagger_auto_schema(
        method='post',
        request_body=BulkQuestionSerializer,
        responses={201: QuestionSerializer(many=True)},
        operation_description="Bulk create questions for a quiz"
    )
    @action(detail=True, methods=['post'], url_path='create-questions')
    def create_questions(self, request, pk=None):
        quiz = self.get_object()
        
        serializer = BulkQuestionSerializer(
            data=request.data,
            context={'quiz': quiz}
        )
        
        if serializer.is_valid():
            try:
                questions = serializer.create(serializer.validated_data)
                response_serializer = QuestionSerializer(questions, many=True)
                return Response(
                    response_serializer.data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing questions within a quiz.
    """
    permission_classes = [IsAuthenticated]
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quiz']

class QuestionOptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing question options.
    """
    permission_classes = [IsAuthenticated]
    queryset = QuestionOption.objects.all()
    serializer_class = QuestionOptionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['question']

class QuizAttemptViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing quiz attempts.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quiz', 'user', 'is_completed']

    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, description="User ID", type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('quiz_id', openapi.IN_QUERY, description="Quiz ID", type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={200: QuizAttemptSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='user-attempts')
    def get_user_attempts(self, request):
        """
        Get quiz attempts for a specific user and quiz.
        """
        user_id = request.query_params.get('user_id')
        quiz_id = request.query_params.get('quiz_id')

        if not user_id or not quiz_id:
            return Response(
                {"error": "user_id and quiz_id are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = self.queryset.filter(user_id=user_id, quiz_id=quiz_id)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class QuestionResponseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing question responses.
    """
    permission_classes = [IsAuthenticated]
    queryset = QuestionResponse.objects.all()
    serializer_class = QuestionResponseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['attempt', 'question', 'is_correct']

class VideoResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing video resources.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = VideoResource.objects.all()
    serializer_class = VideoResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter

class RevisionResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing revision resources.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = RevisionResource.objects.all()
    serializer_class = RevisionResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter

class PDFResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing PDF resources.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = PDFResource.objects.all()
    serializer_class = PDFResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter

class ExerciseResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing exercise resources.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = ExerciseResource.objects.all()
    serializer_class = ExerciseResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter