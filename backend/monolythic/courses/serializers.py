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
    QuizResource,
    VideoResource,
    RevisionResource,
    Topic,
    UserAvailability, DailyTimeSlot,
    CourseOffering,
    CourseOfferingAction,
    TeacherStudentEnrollment,
    CourseDeclaration,
    Question, QuestionOption, QuizAttempt, QuestionResponse
)
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = "__all__"

class ClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = Class
        fields = "__all__"


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
        fields = ["id", "topic", "title", "description", "created_at", "updated_at", "resource_type"]

    def get_resource_type(self, obj):
        return obj.__class__.__name__


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = "__all__"

class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = "__all__"

class QuizResourceSerializer(AbstractResourceSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuizResource
        fields = AbstractResourceSerializer.Meta.fields + [
            "total_questions", "duration_minutes", "passing_score",
            "show_correct_answers", "show_explanation", "shuffle_questions",
            "attempts_allowed", "partial_credit", "questions"
        ]

class VideoResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = VideoResource
        fields = AbstractResourceSerializer.Meta.fields + ["video_file"]


class RevisionResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = RevisionResource
        fields = AbstractResourceSerializer.Meta.fields + ["content"]


class PDFResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = PDFResource
        fields = AbstractResourceSerializer.Meta.fields + ["pdf_file"]


class ExerciseResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = ExerciseResource
        fields = AbstractResourceSerializer.Meta.fields + [
            "instructions",
            "exercise_file",
            "solution_file",
        ]


class PolymorphicResourceSerializer(serializers.ModelSerializer):
    resource = serializers.SerializerMethodField()

    class Meta:
        model = AbstractResource
        fields = ["id", "resource"]

    def get_resource(self, obj):
        if isinstance(obj, VideoResource):
            return VideoResourceSerializer(obj).data
        elif isinstance(obj, QuizResource):
            return QuizResourceSerializer(obj).data
        elif isinstance(obj, RevisionResource):
            return RevisionResourceSerializer(obj).data
        elif isinstance(obj, PDFResource):
            return PDFResourceSerializer(obj).data
        elif isinstance(obj, ExerciseResource):
            return ExerciseResourceSerializer(obj).data
        return AbstractResourceSerializer(obj).data


class DailyTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyTimeSlot
        fields = ['id', 'day', 'time_slot', 'is_available']

class DailyTimeSlotUpdateSerializer(serializers.ModelSerializer):
    slot_id = serializers.PrimaryKeyRelatedField(
        queryset=DailyTimeSlot.objects.all(),
        write_only=True,
        source='id'
    )
    is_available = serializers.BooleanField()
    
    class Meta:
        model = DailyTimeSlot
        fields = ['slot_id','is_available']


class UserAvailabilitySerializer(serializers.ModelSerializer):
    daily_slots = DailyTimeSlotSerializer(many=True, read_only=True)

    class Meta:
        model = UserAvailability
        fields = ['id', 'user', 'is_available', 'last_updated', 'daily_slots']

class CourseOfferingSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    student_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='student'
    )
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(),
        write_only=True,
        source='subject'
    )
    class_level = ClassSerializer(read_only=True)
    class_level_id = serializers.PrimaryKeyRelatedField(
        queryset=Class.objects.all(),
        write_only=True,
        source='class_level'
    )
    class Meta:
        model = CourseOffering
        fields = '__all__'

class CourseOfferingActionSerializer(serializers.ModelSerializer):
    teacher = UserSerializer(read_only=True)
    offer = CourseOfferingSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='teacher'
    )
    offer_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseOffering.objects.all(),
        write_only=True,
        source='offer'
    )
    
    class Meta:
        model = CourseOfferingAction
        fields = '__all__'

class TeacherStudentEnrollmentSerializer(serializers.ModelSerializer):
    offer = CourseOfferingSerializer(read_only=True)
    offer_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseOffering.objects.all(),
        write_only=True,
        source='offer'
    )
    teacher = UserSerializer(read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='teacher'
    )

    class Meta:
        model = TeacherStudentEnrollment
        fields = ['id', 'teacher','teacher_id', 'offer', 'offer_id', 'created_at', 'has_class_end']

    def create(self, validated_data):
        return TeacherStudentEnrollment.objects.create(**validated_data)

class CourseDeclarationSerializer(serializers.ModelSerializer):
    accepted_by = UserSerializer(read_only=True)
    accepted_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='accepted_by'
    )
    class Meta:
        model = CourseDeclaration
        fields = '__all__'

class UserProgressSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user'
    )
    topic = TopicSerializer(read_only=True)
    topic_id = serializers.PrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        write_only=True,
        source='topic'
    )
    resource = PolymorphicResourceSerializer(read_only=True)
    resource_id = serializers.PrimaryKeyRelatedField(
        queryset=AbstractResource.objects.all(),
        write_only=True,
        source='resource'
    )
    class Meta:
        model = UserProgress
        fields = "__all__"

class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = "__all__"

class QuestionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionResponse
        fields = "__all__"
