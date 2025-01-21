from django.contrib import admin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin
from .models import (
    User, Topic, Class, Subject, Chapter,
    AbstractResource, VideoResource, QuizResource,
    RevisionResource, PDFResource, ExerciseResource,
    UserProgress, CourseCategory,UserAvailability,DailyTimeSlot
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'education_level')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('education_level', 'is_active')
    
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

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
    child_models = (VideoResource, QuizResource, RevisionResource, PDFResource, ExerciseResource)
    list_display = ('title', 'topic', 'created_at')
    list_filter = ('topic',)
    search_fields = ('title',)

@admin.register(VideoResource)
class VideoResourceAdmin(ResourceChildAdmin):
    list_display = ('title', 'topic', 'video_url')

@admin.register(QuizResource)
class QuizResourceAdmin(ResourceChildAdmin):
    list_display = ('title', 'topic', 'total_questions', 'duration_minutes')

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