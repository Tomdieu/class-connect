from rest_framework import serializers
from .models import (
    CourseCategory,
    UserProgress,
    Class,
    Subject,
    Chapter,
    AbstractResource,
    ExerciseResource,
    PhoneNumberField,
    PDFResource,
    QuizResource,
    VideoResource,
    RevisionResource,
    Topic,
    UserAvailability,DailyTimeSlot
)


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = "__all__"


# class CourseResourceSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CourseResource
#         fields = "__all__"


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


class VideoResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = VideoResource
        fields = AbstractResourceSerializer.Meta.fields + ["video_url", "video_file"]


class QuizResourceSerializer(AbstractResourceSerializer):
    class Meta:
        model = QuizResource
        fields = AbstractResourceSerializer.Meta.fields + ["total_questions", "duration_minutes"]


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

class UserAvailabilitySerializer(serializers.ModelSerializer):
    daily_slots = DailyTimeSlotSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserAvailability
        fields = ['id', 'teacher', 'is_available', 'last_updated', 'daily_slots']


# class CourseSerializer(serializers.ModelSerializer):
#     resources = CourseResourceSerializer(many=True, required=False)

#     class Meta:
#         model = Course
#         fields = "__all__"

#     def create(self, validated_data):
#         resources_data = validated_data.pop("resources", [])
#         course = Course.objects.create(**validated_data)

#         for resource_data in resources_data:
#             CourseResource.objects.create(course=course, **resource_data)

#         return course

#     def update(self, instance, validated_data):
#         resources_data = validated_data.pop("resources", [])

#         # Update course fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         # Handle resources update
#         if resources_data:
#             # Optional: Clear existing resources if you want to replace them
#             # instance.resources.all().delete()

#             for resource_data in resources_data:
#                 CourseResource.objects.create(course=instance, **resource_data)

#         return instance


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = "__all__"
