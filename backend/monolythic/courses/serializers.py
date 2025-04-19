import datetime
from rest_framework import serializers

from .models import (
    CourseCategory,
    UserProgress,
    Class,
    Subject,
    Chapter,
    AbstractResource,
    ExerciseResource,
    PDFResource,
    # QuizResource,
    VideoResource,
    RevisionResource,
    Topic,
    UserAvailability,
    DailyTimeSlot,
    CourseOffering,
    CourseOfferingAction,
    TeacherStudentEnrollment,
    CourseDeclaration,
    SchoolYear,
    UserClass,
    # Question, QuestionOption, QuizAttempt, QuestionResponse
)
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = "__all__"


class ClassSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = "__all__"

    def get_student_count(self, obj):
        school_year = self.context.get("school_year")
        queryset = UserClass.objects.filter(class_level=obj)
        if school_year:
            queryset = queryset.filter(school_year=school_year)
        return queryset.count()


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = "__all__"


class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = "__all__"


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = "__all__"


def __str__(self):
    return f"{self.user.email} - {self.user_type} Availability"


class AbstractResourceSerializer(serializers.ModelSerializer):
    resource_type = serializers.SerializerMethodField()

    class Meta:
        model = AbstractResource
        fields = [
            "id",
            "topic",
            "title",
            "description",
            "created_at",
            "updated_at",
            "resource_type",
        ]

    def get_resource_type(self, obj):
        return obj.__class__.__name__


# class QuestionOptionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuestionOption
#         fields = "__all__"

# class QuestionSerializer(serializers.ModelSerializer):
#     options = QuestionOptionSerializer(many=True)

#     class Meta:
#         model = Question
#         fields = "__all__"

# class QuizResourceSerializer(AbstractResourceSerializer):
#     questions = QuestionSerializer(many=True, read_only=True)

#     class Meta:
#         model = QuizResource
#         fields = AbstractResourceSerializer.Meta.fields + [
#             "duration_minutes", "passing_score",
#             "show_correct_answers","shuffle_questions",
#             "questions"
#         ]


class VideoResourceSerializer(AbstractResourceSerializer):
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = VideoResource
        fields = AbstractResourceSerializer.Meta.fields + ["video_file", "video_url"]

    def get_video_url(self, obj):
        return obj.get_video_url() if obj.video_file else None


class RevisionResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = RevisionResource
        fields = AbstractResourceSerializer.Meta.fields + ["content"]


class PDFResourceSerializer(AbstractResourceSerializer):
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = PDFResource
        fields = AbstractResourceSerializer.Meta.fields + ["pdf_file", "pdf_url"]

    def get_pdf_url(self, obj):
        return obj.get_pdf_url() if obj.pdf_file else None


class ExerciseResourceSerializer(AbstractResourceSerializer):
    exercise_url = serializers.SerializerMethodField()
    solution_url = serializers.SerializerMethodField()

    class Meta:
        model = ExerciseResource
        fields = AbstractResourceSerializer.Meta.fields + [
            "instructions",
            "exercise_file",
            "solution_file",
            "exercise_url",
            "solution_url",
        ]

    def get_exercise_url(self, obj):
        return obj.get_exercise_url() if obj.exercise_file else None

    def get_solution_url(self, obj):
        return obj.get_solution_url() if obj.solution_file else None


class PolymorphicResourceSerializer(serializers.ModelSerializer):
    resource = serializers.SerializerMethodField()

    class Meta:
        model = AbstractResource
        fields = ["id", "resource"]

    def get_resource(self, obj):
        if isinstance(obj, VideoResource):
            return VideoResourceSerializer(obj, context=self.context).data
        # elif isinstance(obj, QuizResource):
        #     return QuizResourceSerializer(obj, context=self.context).data
        elif isinstance(obj, RevisionResource):
            return RevisionResourceSerializer(obj, context=self.context).data
        elif isinstance(obj, PDFResource):
            return PDFResourceSerializer(obj, context=self.context).data
        elif isinstance(obj, ExerciseResource):
            return ExerciseResourceSerializer(obj, context=self.context).data
        return AbstractResourceSerializer(obj, context=self.context).data


class DailyTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTimeSlot
        fields = ["id", "day", "time_slot", "is_available"]


class DailyTimeSlotUpdateSerializer(serializers.ModelSerializer):
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=DailyTimeSlot.objects.all(), write_only=True, source="id"
    )
    is_available = serializers.BooleanField()

    class Meta:
        model = DailyTimeSlot
        fields = ["slot_id", "is_available"]


class UserAvailabilityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAvailability
        fields = ["is_available"]


class UserAvailabilitySerializer(serializers.ModelSerializer):
    daily_slots = DailyTimeSlotSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserAvailability
        fields = "__all__"
        read_only_fields = ["user", "user_type", "created_at", "last_updated"]


class CourseOfferingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="student"
    )
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), write_only=True, source="subject"
    )
    class_level = ClassSerializer(read_only=True)
    class_level_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all(), write_only=True, source="class_level"
    )

    class Meta:
        model = CourseOffering
        fields = "__all__"


class CourseOfferingActionSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    offer = CourseOfferingSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="teacher"
    )
    offer_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseOffering.objects.all(), write_only=True, source="offer"
    )

    class Meta:
        model = CourseOfferingAction
        fields = "__all__"


class SchoolYearSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(
        read_only=True
    )  # Converted to read-only field from property

    class Meta:
        model = SchoolYear
        fields = ["id", "start_year", "end_year", "is_active", "formatted_year"]


class TeacherStudentEnrollmentSerializer(serializers.ModelSerializer):
    offer = CourseOfferingSerializer(read_only=True)
    offer_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseOffering.objects.all(), write_only=True, source="offer"
    )
    teacher = UserSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="teacher"
    )
    school_year = SchoolYearSerializer(read_only=True)

    class Meta:
        model = TeacherStudentEnrollment
        fields = [
            "id",
            "teacher",
            "teacher_id",
            "status",
            "offer",
            "offer_id",
            "created_at",
            "has_class_end",
            "school_year",
        ]

    def create(self, validated_data):
        return TeacherStudentEnrollment.objects.create(**validated_data)


class EnhancedTeacherEnrollmentSerializer(TeacherStudentEnrollmentSerializer):
    subject = serializers.SerializerMethodField()
    class_level = serializers.SerializerMethodField()
    hourly_rate = serializers.SerializerMethodField()

    class Meta(TeacherStudentEnrollmentSerializer.Meta):
        model = TeacherStudentEnrollment
        fields = TeacherStudentEnrollmentSerializer.Meta.fields + [
            "subject",
            "class_level",
            "hourly_rate",
        ]

    def get_subject(self, obj):
        if obj.offer and obj.offer.subject:
            return SubjectSerializer(obj.offer.subject).data
        return None

    def get_class_level(self, obj):
        if obj.offer and obj.offer.class_level:
            return ClassSerializer(obj.offer.class_level).data
        return None

    def get_hourly_rate(self, obj):
        return obj.offer.hourly_rate if obj.offer else None


class CourseDeclarationSerializer(serializers.ModelSerializer):
    accepted_by = UserSerializer(read_only=True)
    accepted_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source="accepted_by",
        required=False,
    )
    teacher_student_enrollment = TeacherStudentEnrollmentSerializer(read_only=True)
    teacher_student_enrollment_id = serializers.PrimaryKeyRelatedField(
        queryset=TeacherStudentEnrollment.objects.all(),
        write_only=True,
        source='teacher_student_enrollment',
        required=True
    )

    class Meta:
        model = CourseDeclaration
        fields = "__all__"
        
class PaymentProofSerializer(serializers.ModelSerializer):
    """
    Serializer for uploading payment proof documents and related payment information
    """
    proof_of_payment = serializers.FileField(required=True)
    payment_comment = serializers.CharField(required=False, allow_blank=True)
    payment_date = serializers.DateField(required=False, default=datetime.date.today)
    
    class Meta:
        model = CourseDeclaration
        fields = ['proof_of_payment', 'payment_comment', 'payment_date']


class UserProgressSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user"
    )
    topic = TopicSerializer(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(), write_only=True, source="topic"
    )
    resource = PolymorphicResourceSerializer(read_only=True)
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=AbstractResource.objects.all(), write_only=True, source="resource"
    )

    class Meta:
        model = UserProgress
        fields = "__all__"


# class QuizAttemptSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizAttempt
#         fields = "__all__"

# class QuestionResponseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuestionResponse
#         fields = "__all__"

# class BulkQuestionSerializer(serializers.Serializer):
#     questions = QuestionSerializer(many=True)

#     def create(self, validated_data):
#         questions_data = validated_data.get('questions', [])
#         questions = []

#         for question_data in questions_data:
#             options_data = question_data.pop('options', [])
#             question = Question.objects.create(
#                 quiz=self.context['quiz'],
#                 **question_data
#             )
#             for option_data in options_data:
#                 QuestionOption.objects.create(question=question, **option_data)
#             questions.append(question)

#         return questions


class UserClassSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="user"
    )
    class_level = ClassSerializer(read_only=True)
    class_level_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all(), write_only=True, source="class_level"
    )
    school_year = SchoolYearSerializer(read_only=True)
    school_year_id = serializers.PrimaryKeyRelatedField(
        queryset=SchoolYear.objects.all(),
        write_only=True,
        source="school_year",
        required=False,
    )

    class Meta:
        model = UserClass
        fields = [
            "id",
            "user",
            "user_id",
            "class_level",
            "class_level_id",
            "school_year",
            "school_year_id",
            "created_at",
            "updated_at",
        ]
