from rest_framework import serializers
from .models import VideoConferenceSession
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model
from courses.models import Subject, TeacherStudentEnrollment
from courses.serializers import SubjectSerializer, TeacherStudentEnrollmentSerializer

User = get_user_model()


class VideoConferenceSessionSerializer(serializers.ModelSerializer):
    meeting_link = serializers.URLField(required=False)
    instructor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="instructor"
    )
    instructor = UserSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), write_only=True, source="subject"
    )
    teacher_student_enrollment_id = serializers.PrimaryKeyRelatedField(
        queryset=TeacherStudentEnrollment.objects.all(), write_only=True, source="teacher_student_enrollment"
    )
    teacher_student_enrollment = TeacherStudentEnrollmentSerializer(read_only=True)

    class Meta:
        model = VideoConferenceSession
        fields = "__all__"
        read_only_fields = ["recording_url", "created_at"]


# class SessionParticipantSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SessionParticipant
#         fields = "__all__"
