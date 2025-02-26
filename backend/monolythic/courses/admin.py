from django.contrib import admin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin
from .models import (
    SchoolYear, User, Topic, Class, Subject, Chapter,
    AbstractResource, VideoResource,
    RevisionResource, PDFResource, ExerciseResource,
    UserProgress, CourseCategory, UserAvailability, DailyTimeSlot,
    CourseOffering, CourseOfferingAction, TeacherStudentEnrollment, CourseDeclaration,UserClass
    # Question, QuestionOption, QuizAttempt, QuestionResponse
)

@admin.register(SchoolYear)
class SchoolYearAdmin(admin.ModelAdmin):
    list_display = ('start_year','end_year','formatted_year')
    search_fields = ('start_year','end_year',)
    list_filter= ('start_year','end_year',)

@admin.register(UserClass)
class UserClassAdmin(admin.ModelAdmin):
    list_display = ('user', 'class_level', 'created_at')
    search_fields = ('user__email', 'class_level__name')
    list_filter = ('class_level',)
    ordering = ('-created_at',)

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'level', 'created_at')
    list_filter = ('level',)
    search_fields = ('name',)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'class_level', 'created_at')
    list_filter = ('class_level',)
    search_fields = ('name',)

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'order', 'created_at')
    list_filter = ('subject',)
    search_fields = ('title',)
    ordering = ('order',)

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'chapter', 'order', 'created_at')
    list_filter = ('chapter',)
    search_fields = ('title',)
    ordering = ('order',)

# Resource Admin Classes
class ResourceChildAdmin(PolymorphicChildModelAdmin):
    base_model = AbstractResource

@admin.register(AbstractResource)
class ResourceParentAdmin(PolymorphicParentModelAdmin):
    base_model = AbstractResource
    child_models = (VideoResource, RevisionResource, PDFResource, ExerciseResource)
    list_display = ('title', 'topic', 'created_at')
    list_filter = ('topic',)
    search_fields = ('title',)

@admin.register(VideoResource)
class VideoResourceAdmin(ResourceChildAdmin):
    list_display = ('title', 'topic',)

# @admin.register(QuizResource)
# class QuizResourceAdmin(ResourceChildAdmin):
#     list_display = ('title', 'topic', 'duration_minutes')

# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     list_display = ('text', 'quiz', 'type', 'order')
#     search_fields = ('text', 'quiz__title')
#     list_filter = ('quiz', 'type')

# @admin.register(QuestionOption)
# class QuestionOptionAdmin(admin.ModelAdmin):
#     list_display = ('text', 'question', 'is_correct', 'order')
#     search_fields = ('text', 'question__text')
#     list_filter = ('question', 'is_correct')

# @admin.register(QuizAttempt)
# class QuizAttemptAdmin(admin.ModelAdmin):
#     list_display = ('quiz', 'user', 'score', 'started_at', 'completed_at', 'is_completed')
#     search_fields = ('quiz__title', 'user__email')
#     list_filter = ('quiz', 'is_completed')

# @admin.register(QuestionResponse)
# class QuestionResponseAdmin(admin.ModelAdmin):
#     list_display = ('question', 'attempt', 'is_correct', 'points_earned')
#     search_fields = ('question__text', 'attempt__user__email')
#     list_filter = ('question', 'is_correct')

@admin.register(RevisionResource)
class RevisionResourceAdmin(ResourceChildAdmin):
    list_display = ('title', 'topic')

@admin.register(PDFResource)
class PDFResourceAdmin(ResourceChildAdmin):
    list_display = ('title', 'topic')

@admin.register(ExerciseResource)
class ExerciseResourceAdmin(ResourceChildAdmin):
    list_display = ('title', 'topic')

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'topic', 'resource', 'completed', 'progress_percentage', 'last_accessed')
    list_filter = ('completed', 'topic', 'user')
    search_fields = ('user__email', 'topic__title')

@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)

class DailyTimeSlotInline(admin.TabularInline):
    model = DailyTimeSlot
    extra = 1

@admin.register(UserAvailability)
class UserAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_available','last_updated')
    search_fields = ('user__email',)
    inlines = [DailyTimeSlotInline]
    
@admin.register(DailyTimeSlot)
class DailyTimeSlotAdmin(admin.ModelAdmin):
    list_display = ('availability', 'day', 'time_slot', 'is_available')
    search_fields = ('availability__user__email',)

@admin.register(CourseOffering)
class CourseOfferingAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'class_level', 'hourly_rate', 'is_available')
    search_fields = ('student__email', 'subject__name', 'class_level__name')
    list_filter = ('is_available', 'subject', 'class_level')

@admin.register(CourseOfferingAction)
class CourseOfferingActionAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'offer', 'action', 'created_at')
    search_fields = ('teacher__email', 'offer__subject__name')
    list_filter = ('action', 'created_at')

@admin.register(TeacherStudentEnrollment)
class TeacherStudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'offer', 'created_at', 'has_class_end')
    search_fields = ('teacher__email', 'offer__student__email')
    list_filter = ('has_class_end', 'created_at')

@admin.register(CourseDeclaration)
class CourseDeclarationAdmin(admin.ModelAdmin):
    list_display = ('teacher_student_enrollment', 'status', 'declaration_date', 'updated_at')
    search_fields = ('teacher_student_enrollment__teacher__email', 'teacher_student_enrollment__offer__student__email')
    list_filter = ('status', 'declaration_date')