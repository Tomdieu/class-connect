from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
import uuid
from polymorphic.models import PolymorphicModel

class User(models.Model):
    EDUCATION_LEVELS = [
        ('COLLEGE', 'Collège'),
        ('LYCEE', 'Lycée'),
        ('UNIVERSITY', 'Université'),
        ('PROFESSIONAL', 'Professionnel'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('fr', 'French'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=150, blank=True)
    last_name = models.CharField(_("last name"), max_length=150, blank=True)
    phone_number = PhoneNumberField(unique=True, region='CM')
    date_of_birth = models.DateField(null=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVELS)
    class_grade = models.CharField(max_length=50, blank=True)
    email_verified = models.BooleanField(default=False)
    profile_picture = models.URLField(null=True, blank=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    town = models.CharField(max_length=100, blank=True,null=True)
    quarter = models.CharField(max_length=100, blank=True,null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    date_joined = models.DateTimeField(blank=True,null=True)

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.email
    
    
class CourseCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.name

class Class(models.Model):
    EDUCATION_LEVELS = [
        ('COLLEGE', 'Collège'),
        ('LYCEE', 'Lycée'),
        ('UNIVERSITY', 'Université'),
        ('PROFESSIONAL', 'Professionnel'),
    ]
    
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=EDUCATION_LEVELS)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Classes"

    def __str__(self):
        return f"{self.name} - {self.get_level_display()}"

class Subject(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    class_level = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='subjects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.class_level}"

class Chapter(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='chapters')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} - {self.subject}"
    
class Topic(models.Model):
    title = models.CharField(max_length=200)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name="topics")
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.title} - {self.chapter}"

class AbstractResource(PolymorphicModel):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="%(class)s_resources")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.title}"


class VideoResource(AbstractResource):
    video_url = models.URLField(_("Video URL"), blank=True, null=True)
    video_file = models.FileField(upload_to="videos/", blank=True, null=True)


class QuizResource(AbstractResource):
    total_questions = models.PositiveIntegerField()
    duration_minutes = models.PositiveIntegerField()  # Time limit in minutes


class RevisionResource(AbstractResource):
    content = models.TextField()


class PDFResource(AbstractResource):
    pdf_file = models.FileField(upload_to="pdfs/")


class ExerciseResource(AbstractResource):
    instructions = models.TextField()
    solution_file = models.FileField(upload_to="exercises/solutions/", blank=True, null=True)
    exercise_file = models.FileField(upload_to="exercises/", blank=True, null=True)

# class Course(models.Model):
#     COURSE_LEVELS = [
#         ('COLLEGE', 'Collège'),
#         ('LYCEE', 'Lycée'),
#         ('UNIVERSITY', 'Université'),
#         ('PROFESSIONAL', 'Professionnel'),
#     ]
    
#     title = models.CharField(max_length=200)
#     description = models.TextField()
#     level = models.CharField(max_length=20, choices=COURSE_LEVELS)
#     category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE)
#     instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses')
#     minimum_subscription_plan_id = models.IntegerField()  # Reference to Subscription service
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='courses', null=True)
#     chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='courses', null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     def __str__(self):
#         return self.title

# class CourseResource(models.Model):
    
#     course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
#     title = models.CharField(max_length=200)
#     file = models.FileField(upload_to='course_resources/')
#     description = models.TextField(blank=True)
#     order = models.PositiveIntegerField(default=0)
    
#     @property
#     def resource_type(self):
#         return self.file.url.split('.')[-1]
    
#     def __str__(self):
#         return self.title

class UserAvailability(models.Model):
    """
    Base availability model for both teachers and students
    """
    
    USER_TYPE_CHOICES = (
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
    )
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='availabilities')
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_available = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Availability"
        verbose_name_plural = "User Availabilities"
        unique_together = ['user', 'user_type']
        
    def __str__(self):
        return f"{self.user.email} - {self.user_type} Availability"
        
    def create_default_slots(self):
        """Create all time slots as available"""
        for day, _ in DailyTimeSlot.DAYS_OF_WEEK:
            for time_slot, _ in DailyTimeSlot.TIME_SLOTS:
                DailyTimeSlot.objects.get_or_create(
                    availability=self,
                    day=day,
                    time_slot=time_slot,
                    defaults={'is_available': False}
                )
        

class DailyTimeSlot(models.Model):
    DAYS_OF_WEEK = [
        ('lun', 'Lundi'),
        ('mar', 'Mardi'),
        ('mer', 'Mercredi'),
        ('jeu', 'Jeudi'),
        ('ven', 'Vendredi'),
        ('sam', 'Samedi'),
        ('dim', 'Dimanche'),
    ]

    TIME_SLOTS = [
        ('matin', 'Matin'),
        ('13h-14h', '13h-14h'),
        ('14h-15h', '14h-15h'),
        ('15h-16h', '15h-16h'),
        ('16h-17h', '16h-17h'),
        ('17h-18h', '17h-18h'),
        ('18h-19h', '18h-19h'),
        ('19h-20h', '19h-20h'),
    ]

    availability = models.ForeignKey(
        UserAvailability,
        on_delete=models.CASCADE,
        related_name='daily_slots'
    )
    day = models.CharField(
        max_length=3,
        choices=DAYS_OF_WEEK
    )
    time_slot = models.CharField(
        max_length=10,
        choices=TIME_SLOTS
    )
    is_available = models.BooleanField(default=False)

    class Meta:
        unique_together = ['availability', 'day', 'time_slot']
        verbose_name = _("Daily Time Slot")
        verbose_name_plural = _("Daily Time Slots")

    def __str__(self):
        return f"{self.get_day_display()} {self.get_time_slot_display()}"

class CourseOffering(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offers')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_level = models.ForeignKey(Class, on_delete=models.CASCADE)
    duration = models.PositiveIntegerField(_("Duration in minutes"))
    frequency = models.PositiveIntegerField(_("Frequency in days (e.g x/week)"))
    start_date = models.DateField(_("Start Date"))
    hourly_rate = models.DecimalField(_("Hourly Rate"), max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.subject} - {self.class_level} - {self.hourly_rate} FCFA"

class CourseOfferingAction(models.Model):
    """
    Model to track teacher actions on course offerings
    """

    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'
    CANCELLED = 'CANCELLED'

    ACTIONS = (
        (PENDING,'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
        (CANCELLED, 'Cancelled'),
    )

    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='offer_actions')
    offer = models.ForeignKey(CourseOffering, on_delete=models.CASCADE)
    action = models.CharField(max_length=20,choices=ACTIONS,default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher} - {self.offer} - {self.action}"

class TeacherStudentEnrollment(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students')
    offer = models.ForeignKey(CourseOffering, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    has_class_end = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.teacher} - {self.offer.student}"
    
class CourseDeclaration(models.Model):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'

    ACTIONS = (
        (PENDING,'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected')
    )

    teacher_student_enrollment = models.ForeignKey(TeacherStudentEnrollment, on_delete=models.CASCADE, related_name='declarations')
    duration = models.PositiveIntegerField(_("Duration in minutes"))
    declaration_date = models.DateField(_("Declaration Date"))
    accepted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_declarations')
    status = models.CharField(max_length=20, choices=ACTIONS, default=PENDING)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.teacher_student_enrollment} - {self.status}"

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)  # Replacing 'course' with 'topic'
    resource = models.ForeignKey(AbstractResource, on_delete=models.CASCADE)  # Polymorphic resource
    completed = models.BooleanField(default=False)
    progress_percentage = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.topic} - {self.resource}"