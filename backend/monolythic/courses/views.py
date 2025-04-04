from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import (
    CourseCategory, Class, SchoolYear, Subject, Chapter, Topic,
    AbstractResource, UserProgress,UserAvailability,DailyTimeSlot,
    CourseOffering, CourseOfferingAction, TeacherStudentEnrollment, CourseDeclaration,
    # QuizResource, Question, QuestionOption, QuizAttempt, QuestionResponse,
    VideoResource, RevisionResource, PDFResource, ExerciseResource, UserClass
)
from .serializers import (
    CourseCategorySerializer, ClassSerializer, SchoolYearSerializer, SubjectSerializer,
    ChapterSerializer, TopicSerializer, PolymorphicResourceSerializer, UserAvailabilityCreateSerializer,
    UserProgressSerializer,UserAvailabilitySerializer,
    CourseOfferingSerializer, CourseOfferingActionSerializer,
    TeacherStudentEnrollmentSerializer, CourseDeclarationSerializer,DailyTimeSlotSerializer,DailyTimeSlotUpdateSerializer,
    VideoResourceSerializer, RevisionResourceSerializer, PDFResourceSerializer, ExerciseResourceSerializer,
    EnhancedTeacherEnrollmentSerializer, UserClassSerializer,
)
from .pagination import CustomPagination
from .filters import (
    CourseCategoryFilter, ClassFilter, SubjectFilter,
    ChapterFilter, TopicFilter, ResourceFilter, UserProgressFilter,
    CourseOfferingFilter, CourseOfferingActionFilter,
    TeacherStudentEnrollmentFilter, CourseDeclarationFilter, UserClassFilter
)
from django.utils.decorators import method_decorator
# from django.views.decorators.cache import cache_page
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
    # permission_classes = [IsAuthenticated]ss
    # pagination_class = CustomPagination
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ClassFilter
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        school_year_param = self.request.query_params.get('school_year')
        if school_year_param:
            try:
                start_year, end_year = school_year_param.split('-')
                school_year = SchoolYear.objects.filter(
                    start_year=start_year,
                    end_year=end_year
                ).first()
                if school_year:
                    context['school_year'] = school_year
            except (ValueError, SchoolYear.DoesNotExist):
                pass
        return context
    
    @swagger_auto_schema(
        method='get',
        operation_description="Get classes organized by section and level",
        manual_parameters=[
            openapi.Parameter('school_year', openapi.IN_QUERY, 
                            description="School year in format YYYY-YYYY to count students for",
                            type=openapi.TYPE_STRING, required=False),
        ],
        responses={
            200: openapi.Response(
                description="Classes organized hierarchically",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'FRANCOPHONE': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'COLLEGE': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'classes': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        )
                                    }
                                ),
                                'LYCEE': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'scientifique': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'speciality': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        ),
                                        'litteraire': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'speciality': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        )
                                    }
                                ),
                                'UNIVERSITY': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'licence': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        ),
                                        'master': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        ),
                                        'doctorat': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        )
                                    }
                                )
                            }
                        ),
                        'ANGLOPHONE': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'COLLEGE': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'classes': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                    'name': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'level': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'section': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'description': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'student_count': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                }
                                            )
                                        )
                                    }
                                ),
                                # ... rest of ANGLOPHONE structure mirrors FRANCOPHONE
                            }
                        )
                    }
                )
            )
        }
    )
    @action(detail=False, methods=['get'])
    def formatted_classes(self, request):
        classes = self.get_queryset().exclude(level='PROFESSIONAL')
        formatted_data = {}

        # Use the same context as the viewset to ensure student_count is included
        context = self.get_serializer_context()

        for class_obj in classes:
            section = class_obj.section
            level = class_obj.level

            if section not in formatted_data:
                formatted_data[section] = {}

            if level not in formatted_data[section]:
                formatted_data[section][level] = {}

            if level == 'LYCEE':
                speciality = class_obj.speciality or 'NO_SPECIALITY'
                if speciality not in formatted_data[section][level]:
                    formatted_data[section][level][speciality] = []
                formatted_data[section][level][speciality].append(
                    self.serializer_class(class_obj, context=context).data
                )
            elif level == 'UNIVERSITY':
                univ_level = class_obj.description or 'OTHER'
                if univ_level not in formatted_data[section][level]:
                    formatted_data[section][level][univ_level] = []
                formatted_data[section][level][univ_level].append(
                    self.serializer_class(class_obj, context=context).data
                )
            else:
                if 'classes' not in formatted_data[section][level]:
                    formatted_data[section][level]['classes'] = []
                formatted_data[section][level]['classes'].append(
                    self.serializer_class(class_obj, context=context).data
                )

        return Response(formatted_data)
    
    # @method_decorator(cache_page(60*60*2,key_prefix='class_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    # @method_decorator(cache_page(60*60*2,key_prefix='class_detail'))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        method='get',
        responses={200: PolymorphicResourceSerializer(many=True)},
        operation_description="Get all resources associated with a specific class except video resources"
    )
    @action(detail=True, methods=['get'], url_path='resources')
    def resources(self, request, pk=None):
        """Get all resources associated with a specific class except videos."""
        class_obj = self.get_object()
        
        # Get all subjects for this class
        subjects = Subject.objects.filter(class_level=class_obj)
        
        # Get all chapters for these subjects
        chapters = Chapter.objects.filter(subject__in=subjects)
        
        # Get all topics for these chapters
        topics = Topic.objects.filter(chapter__in=chapters)
        
        # Get all resources for these topics except videos
        resources = AbstractResource.objects.filter(topic__in=topics).exclude(
            polymorphic_ctype__model='videoresource'
        )
        
        # Paginate the results
        page = self.paginate_queryset(resources)
        if page is not None:
            serializer = PolymorphicResourceSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = PolymorphicResourceSerializer(resources, many=True, context={'request': request})
        return Response(serializer.data)
    
    @swagger_auto_schema(
        method='get',
        responses={200: VideoResourceSerializer(many=True)},
        operation_description="Get all video resources associated with a specific class"
    )
    @action(detail=True, methods=['get'], url_path='videos')
    def videos(self, request, pk=None):
        """Get all video resources associated with a specific class."""
        class_obj = self.get_object()
        
        # Get all subjects for this class
        subjects = Subject.objects.filter(class_level=class_obj)
        
        # Get all chapters for these subjects
        chapters = Chapter.objects.filter(subject__in=subjects)
        
        # Get all topics for these chapters
        topics = Topic.objects.filter(chapter__in=chapters)
        
        # Get all video resources for these topics
        videos = VideoResource.objects.filter(topic__in=topics)
        
        # Paginate the results
        page = self.paginate_queryset(videos)
        if page is not None:
            serializer = VideoResourceSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = VideoResourceSerializer(videos, many=True, context={'request': request})
        return Response(serializer.data)

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

    # @method_decorator(cache_page(60*60*2,key_prefix='subjects_list'))
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


class DirectResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for directly accessing resources by ID.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = AbstractResource.objects.all()
    serializer_class = PolymorphicResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResourceFilter
    
    @swagger_auto_schema(
        responses={200: PolymorphicResourceSerializer()},
        operation_description="Get a resource directly by ID"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


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
    permission_classes = [IsAuthenticated]
    
    queryset = UserAvailability.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['create', 'update','patch']:
            return UserAvailabilityCreateSerializer
        return UserAvailabilitySerializer
    
    def perform_create(self, serializer):
        # Determine user type based on the user's role
        user_type = 'TEACHER' if self.request.user.education_level == "PROFESSIONAL" else 'STUDENT'
        serializer.save(user=self.request.user, user_type=user_type)
    
    @swagger_auto_schema(
        method='get',
        responses={200: UserAvailabilitySerializer(many=False)},
        operation_description="Get or create current user's availability"
    )    
    @action(methods=['get'],detail=False)
    def my_availability(self,request):
        availability, created = UserAvailability.objects.get_or_create(user=request.user)
        serializer = UserAvailabilitySerializer(availability)
        return Response(serializer.data)
        
    
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
        responses={200: UserAvailabilitySerializer(many=False)},
        operation_description="Get or create availability for a specific user"
    )
    @action(detail=False, methods=['get'], url_path='user-availability')
    def get_user_availability(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            availability, created = UserAvailability.objects.get_or_create(user_id=user_id)
            serializer = self.get_serializer(availability)
            return Response(serializer.data)
        return Response({'error': 'user_id is required'}, status=400)


class CourseOfferingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course offerings.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    queryset = CourseOffering.objects.all()  # Add this line
    serializer_class = CourseOfferingSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseOfferingFilter
    
    def get_queryset(self):
        # Your existing method code remains the same
        queryset = CourseOffering.objects.all()
        user = self.request.user
        
        if not user.is_staff or user.is_superuser:
            # Get the course offerings that have the CANCELLED action by the user
            cancelled_course_offerings = CourseOffering.objects.filter(courseofferingaction_set__action=CourseOfferingAction.CANCELLED)
            
            # Exclude these course offerings from the queryset
            queryset = queryset.exclude(id__in=cancelled_course_offerings.values('id'))
        
        return queryset

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

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CourseOfferingAction.objects.none()
        return CourseOfferingAction.objects.filter(offer=self.kwargs['offering_pk'])

    def perform_create(self, serializer):
        serializer.save(
            teacher=self.request.user,
            offer_id=self.kwargs['offering_pk']
        )
        
class SchoolYearViewSet(viewsets.ModelViewSet):
    """
    API endpoint to list school year
    """
    permission_classes = [IsAuthenticated]
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    

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
    
    def get_queryset(self):
        qs = TeacherStudentEnrollment.objects.all()
        teacher_id = self.request.query_params.get('teacher_id')
        student_id = self.request.query_params.get('student_id')
        if teacher_id:
            qs = qs.filter(teacher__id=teacher_id)
        if student_id:
            qs = qs.filter(offer__student__id=student_id)
        return qs

    @action(detail=True,methods=['post'])
    def complete(self,request):
        instance = self.get_object()
        instance.status = TeacherStudentEnrollment.COMPLETED
        instance.save()
        
        return Response(TeacherStudentEnrollmentSerializer(instance).data)
        
    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('school_year', openapi.IN_QUERY, 
                             description="School Year in format 'YYYY-YYYY' (defaults to current school year if not provided)", 
                             type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: TeacherStudentEnrollmentSerializer(many=True)}
    )
    @action(detail=False, methods=['get'],url_path='my-students')
    def my_students(self, request):
        """Get all students enrolled with the current teacher, defaulting to current school year."""
        school_year = request.query_params.get('school_year')
        
        queryset = self.queryset.filter(teacher=request.user)
        
        # If no school year specified, use the current school year
        if not school_year:
            current_school_year = SchoolYear.current_year()
            school_year = f"{current_school_year.start_year}-{current_school_year.end_year}"
        
        # Apply the school_year filter using the existing filter method
        filterset = self.filterset_class(data={'school_year': school_year}, queryset=queryset)
        queryset = filterset.qs
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('school_year', openapi.IN_QUERY, 
                             description="School Year in format 'YYYY-YYYY' (defaults to current school year if not provided)", 
                             type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: EnhancedTeacherEnrollmentSerializer(many=True)},
        operation_description="Get all teachers associated with the current student"
    )
    @action(detail=False, methods=['get'],url_path='my-teachers')
    def my_teachers(self, request):
        """Get all teachers associated with the current student, defaulting to current school year."""
        school_year = request.query_params.get('school_year')
        
        queryset = self.queryset.filter(
            offer__student=request.user,
            has_class_end=False  # Only get active enrollments
        )
        
        # If no school year specified, use the current school year
        if not school_year:
            current_school_year = SchoolYear.current_year()
            school_year = f"{current_school_year.start_year}-{current_school_year.end_year}"
        
        # Apply the school_year filter using the existing filter method
        filterset = self.filterset_class(data={'school_year': school_year}, queryset=queryset)
        queryset = filterset.qs
        
        serializer = EnhancedTeacherEnrollmentSerializer(queryset, many=True)
        return Response(serializer.data)
    
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
    API endpoint for managing course declarations for a specific teacher-student enrollment.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination
    serializer_class = CourseDeclarationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseDeclarationFilter

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return CourseDeclaration.objects.none()
        return CourseDeclaration.objects.filter(
            teacher_student_enrollment=self.kwargs['enrollment_pk']
        )

    def perform_create(self, serializer):
        serializer.save(teacher_student_enrollment_id=self.kwargs['enrollment_pk'])

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

class CourseDeclarationDirectViewSet(viewsets.ModelViewSet):
    """
    API endpoint for directly accessing course declarations with filtering by user ID.
    This allows retrieving all declarations made by a professional user.
    """
    permission_classes = [IsAuthenticated]
    # pagination_class = CustomPagination
    queryset = CourseDeclaration.objects.all()
    serializer_class = CourseDeclarationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = CourseDeclarationFilter
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('user_id', openapi.IN_QUERY, 
                             description="Teacher's user ID to filter declarations", 
                             type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('status', openapi.IN_QUERY, 
                             description="Filter by declaration status", 
                             type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('declaration_date_after', openapi.IN_QUERY, 
                             description="Filter by declarations after this date (YYYY-MM-DD)", 
                             type=openapi.TYPE_STRING, required=False),
            openapi.Parameter('declaration_date_before', openapi.IN_QUERY, 
                             description="Filter by declarations before this date (YYYY-MM-DD)", 
                             type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: CourseDeclarationSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """
        Get course declarations with optional filtering by user ID
        """
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Ensure user can only see their own declarations if not staff
        """
        if getattr(self, 'swagger_fake_view', False):  # Check if this is a swagger request
            return CourseDeclaration.objects.none()
        queryset = super().get_queryset()
        user = self.request.user
        
        # Staff can see all declarations
        if user.is_staff or user.is_superuser:
            return queryset
            
        # Otherwise, users can only see their own declarations
        if user.education_level == 'PROFESSIONAL':
            return queryset.filter(teacher_student_enrollment__teacher=user)
        else:
            # Students can see declarations made for them
            return queryset.filter(teacher_student_enrollment__offer__student=user)

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

# class QuizResourceViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for managing quiz resources.
#     """
#     permission_classes = [IsAuthenticated]
#     pagination_class = CustomPagination
#     queryset = QuizResource.objects.all()
#     serializer_class = QuizResourceSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_class = ResourceFilter

#     @swagger_auto_schema(
#         method='post',
#         request_body=BulkQuestionSerializer,
#         responses={201: QuestionSerializer(many=True)},
#         operation_description="Bulk create questions for a quiz"
#     )
#     @action(detail=True, methods=['post'], url_path='create-questions')
#     def create_questions(self, request, pk=None):
#         quiz = self.get_object()
        
#         serializer = BulkQuestionSerializer(
#             data=request.data,
#             context={'quiz': quiz}
#         )
        
#         if serializer.is_valid():
#             try:
#                 questions = serializer.create(serializer.validated_data)
#                 response_serializer = QuestionSerializer(questions, many=True)
#                 return Response(
#                     response_serializer.data,
#                     status=status.HTTP_201_CREATED
#                 )
#             except Exception as e:
#                 return Response(
#                     {'error': str(e)},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
                
#         return Response(
#             serializer.errors,
#             status=status.HTTP_400_BAD_REQUEST
#         )

# class QuestionViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for managing questions within a quiz.
#     """
#     permission_classes = [IsAuthenticated]
#     queryset = Question.objects.all()
#     serializer_class = QuestionSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ['quiz']

# class QuestionOptionViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for managing question options.
#     """
#     permission_classes = [IsAuthenticated]
#     queryset = QuestionOption.objects.all()
#     serializer_class = QuestionOptionSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ['question']

# class QuizAttemptViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for managing quiz attempts.
#     """
#     permission_classes = [IsAuthenticated]
#     pagination_class = CustomPagination
#     queryset = QuizAttempt.objects.all()
#     serializer_class = QuizAttemptSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ['quiz', 'user', 'is_completed']

#     @swagger_auto_schema(
#         method='get',
#         manual_parameters=[
#             openapi.Parameter('user_id', openapi.IN_QUERY, description="User ID", type=openapi.TYPE_STRING, required=True),
#             openapi.Parameter('quiz_id', openapi.IN_QUERY, description="Quiz ID", type=openapi.TYPE_INTEGER, required=True),
#         ],
#         responses={200: QuizAttemptSerializer(many=True)}
#     )
#     @action(detail=False, methods=['get'], url_path='user-attempts')
#     def get_user_attempts(self, request):
#         """
#         Get quiz attempts for a specific user and quiz.
#         """
#         user_id = request.query_params.get('user_id')
#         quiz_id = request.query_params.get('quiz_id')

#         if not user_id or not quiz_id:
#             return Response(
#                 {"error": "user_id and quiz_id are required"}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         queryset = self.queryset.filter(user_id=user_id, quiz_id=quiz_id)
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             return self.get_paginated_response(serializer.data)

#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data)

# class QuestionResponseViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint for managing question responses.
#     """
#     permission_classes = [IsAuthenticated]
#     queryset = QuestionResponse.objects.all()
#     serializer_class = QuestionResponseSerializer
#     filter_backends = [DjangoFilterBackend]
#     filterset_fields = ['attempt', 'question', 'is_correct']

class UserClassViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user classes.
    """
    permission_classes = [IsAuthenticated]
    queryset = UserClass.objects.all()
    serializer_class = UserClassSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserClassFilter
    
    def get_queryset(self):
        """
        Adjust queryset when accessed through the nested route.
        """
        queryset = UserClass.objects.all()
        
        # When accessed through /classes/{class_pk}/students/
        if 'class_pk' in self.kwargs:
            queryset = queryset.filter(class_level_id=self.kwargs['class_pk'])
            
            # Filter by school_year if provided in query params
            school_year_param = self.request.query_params.get('school_year')
            if school_year_param:
                try:
                    start_year, end_year = school_year_param.split('-')
                    school_year = SchoolYear.objects.filter(
                        start_year=start_year,
                        end_year=end_year
                    ).first()
                    if school_year:
                        queryset = queryset.filter(school_year=school_year)
                except (ValueError, SchoolYear.DoesNotExist):
                    pass
            else:
                # Default to current school year
                queryset = queryset.filter(school_year=SchoolYear.current_year())
                
        return queryset
    
    def perform_create(self, serializer):
        """
        If school_year is not provided, use the current school year.
        When created through nested route, set class_level automatically.
        """
        if 'class_pk' in self.kwargs:
            serializer.validated_data['class_level_id'] = self.kwargs['class_pk']
            
        if not serializer.validated_data.get('school_year'):
            serializer.validated_data['school_year'] = SchoolYear.current_year()
            
        serializer.save()
    
    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('school_year', openapi.IN_QUERY, 
                             description="School year in format YYYY-YYYY", 
                             type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: UserClassSerializer(many=True)},
        operation_description="Get all students for a specific class level for the given school year"
    )
    @action(detail=False, methods=['get'], url_path='students-by-class')
    def students_by_class(self, request):
        """Get all students enrolled in a specific class level for a given school year."""
        class_level_id = request.query_params.get('class_level')
        school_year_param = request.query_params.get('school_year')
        
        if not class_level_id:
            return Response(
                {"error": "class_level parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = UserClass.objects.filter(class_level_id=class_level_id)
        
        if school_year_param:
            try:
                start_year, end_year = school_year_param.split('-')
                school_year_obj = SchoolYear.objects.filter(
                    start_year=start_year,
                    end_year=end_year
                ).first()
                if school_year_obj:
                    queryset = queryset.filter(school_year=school_year_obj)
            except (ValueError, SchoolYear.DoesNotExist):
                return Response(
                    {"error": "Invalid school_year format. Use YYYY-YYYY"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Default to current school year
            queryset = queryset.filter(school_year=SchoolYear.current_year())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(   
        method='get',
        responses={200: UserClassSerializer(many=True)},
        operation_description="Get current student's class information"
    )
    @action(detail=False, methods=['get'], url_path='my-class')
    def my_class(self, request):
        """Get the current user's class if they are a student."""
        user = request.user
        
        # Check if user is not a professional (thus a student)
        if user.education_level != 'PROFESSIONAL':
            # Get the current user class for the current school year
            user_class = UserClass.objects.filter(
                user=user,
                school_year=SchoolYear.current_year()
            ) # Only get the first one if exist
            
            if user_class:
                serializer = self.get_serializer(user_class,many=True)  # Single object, not many=True
                return Response(serializer.data)
            else:
                return Response(
                    {"message": "No class found for the current user in the current school year"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            return Response(
                {"error": "Only students can access this endpoint"}, 
                status=status.HTTP_403_FORBIDDEN
            )
    
    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('class_id', openapi.IN_QUERY, 
                             description="Class ID to filter subjects", 
                             type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={200: SubjectSerializer(many=True)},
        operation_description="Get subjects for a specific class"
    )
    @action(detail=False, methods=['get'], url_path='class-subjects')
    def class_subjects(self, request):
        """Get all subjects for a specific class."""
        class_id = request.query_params.get('class_id')
        
        if not class_id:
            return Response(
                {"error": "class_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            class_obj = Class.objects.get(id=class_id)
            subjects = Subject.objects.filter(class_level=class_obj)
            serializer = SubjectSerializer(subjects, many=True)
            return Response(serializer.data)
        except Class.DoesNotExist:
            return Response(
                {"error": "Class not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @swagger_auto_schema(
        method='get',
        manual_parameters=[
            openapi.Parameter('class_level', openapi.IN_QUERY, description="Class Level ID", type=openapi.TYPE_INTEGER, required=True),
            openapi.Parameter('school_year', openapi.IN_QUERY, description="School Year in format YYYY-YYYY", type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: UserClassSerializer(many=True)},
        operation_description="Get all students enrolled in a specific class level for a given school year"
    )
    @action(detail=False, methods=['get'], url_path='students-by-class')
    def students_by_class(self, request):
        """Get all students enrolled in a specific class level for a given school year."""
        class_level_id = request.query_params.get('class_level')
        school_year_param = request.query_params.get('school_year')
        
        if not class_level_id:
            return Response(
                {"error": "class_level parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = UserClass.objects.filter(class_level_id=class_level_id)
        
        if school_year_param:
            try:
                start_year, end_year = school_year_param.split('-')
                school_year_obj = SchoolYear.objects.filter(
                    start_year=start_year,
                    end_year=end_year
                ).first()
                if school_year_obj:
                    queryset = queryset.filter(school_year=school_year_obj)
            except (ValueError, SchoolYear.DoesNotExist):
                return Response(
                    {"error": "Invalid school_year format. Use YYYY-YYYY"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Default to current school year
            queryset = queryset.filter(school_year=SchoolYear.current_year())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
