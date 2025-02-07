from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
import uuid
from polymorphic.models import PolymorphicModel
from django.contrib.auth import get_user_model
from django.utils.text import slugify

User = get_user_model()
class CourseCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.name

class Class(models.Model):

    LYCEE = 'LYCEE'
    UNIVERSITY = 'UNIVERSITY'
    PROFESSIONAL = 'PROFESSIONAL'

    EDUCATION_LEVELS = [
        (LYCEE, 'Lycée'),
        (UNIVERSITY, 'Université'),
        (PROFESSIONAL, 'Professionnel'),
    ]

    FRANCOPHONE = 'FRANCOPHONE'
    ANGLOPHONE = 'ANGLOPHONE'

    SECTIONS = [
        (FRANCOPHONE,'Francophone'),
        (ANGLOPHONE,'Anglophone')
    ]
    
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=EDUCATION_LEVELS)
    section = models.CharField(max_length=20,choices=SECTIONS,default=FRANCOPHONE)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Classes"

    def __str__(self):
        return f"{self.name} - {self.get_level_display()}"


class UserClass(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    class_level = models.ForeignKey(Class, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.class_level}"

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
    slug = models.SlugField(unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def get_signed_url(self, field_name):
        """Get a presigned URL for any file field"""
        file_field = getattr(self, field_name)
        if file_field:
            try:
                return file_field.storage.url(file_field.name)
            except:
                return None
        return None

    def __str__(self):
        return f"{self.title}"


class VideoResource(AbstractResource):
    video_file = models.FileField(upload_to="videos/", blank=True, null=True)

    def get_video_url(self):
        return self.get_signed_url('video_file')


class QuizResource(AbstractResource):
   duration_minutes = models.PositiveIntegerField()
   passing_score = models.PositiveIntegerField(default=60)
   show_correct_answers = models.BooleanField(default=True)
   shuffle_questions = models.BooleanField(default=False)

   def get_user_attempts(self, user):
       return self.attempts.filter(user=user).count()

   def can_user_attempt(self, user):
       attempts = self.get_user_attempts(user)
       return attempts < self.attempts_allowed

   def get_user_best_score(self, user):
       return self.attempts.filter(
           user=user, 
           is_completed=True
       ).aggregate(best_score=models.Max('score'))['best_score']
       
class Question(models.Model):
   QUESTION_TYPES = [
       ('MULTIPLE_CHOICE', 'Multiple Choice'),
       ('SINGLE_CHOICE', 'Single Choice'),
       ('TRUE_FALSE', 'True/False'),
       ('SHORT_ANSWER', 'Short Answer'),
   ]

   quiz = models.ForeignKey(QuizResource, on_delete=models.CASCADE, related_name='questions') 
   text = models.TextField()
   image = models.ImageField(upload_to='quiz_questions/', blank=True, null=True)
   type = models.CharField(max_length=20, choices=QUESTION_TYPES)
   points = models.PositiveIntegerField(default=1)
   order = models.PositiveIntegerField(default=0)
   explanation = models.TextField(blank=True)
   explanation_image = models.ImageField(upload_to='quiz_explanations/', blank=True, null=True)
   created_at = models.DateTimeField(auto_now_add=True)
   updated_at = models.DateTimeField(auto_now=True)

   class Meta:
       ordering = ['order']

   def __str__(self):
       return f"Question {self.order}: {self.text[:50]}..."
   
class QuestionOption(models.Model):
   question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
   text = models.CharField(max_length=255)
   image = models.ImageField(upload_to='quiz_options/', blank=True, null=True)
   is_correct = models.BooleanField(default=False)
   order = models.PositiveIntegerField(default=0)
   created_at = models.DateTimeField(auto_now_add=True)
   updated_at = models.DateTimeField(auto_now=True)

   class Meta:
       ordering = ['order']

   def __str__(self):
       return f"Option for {self.question}: {self.text[:30]}.."
   
class QuizAttempt(models.Model):
   quiz = models.ForeignKey(QuizResource, on_delete=models.CASCADE, related_name='attempts')
   user = models.ForeignKey(User, on_delete=models.CASCADE)
   score = models.DecimalField(max_digits=5, decimal_places=2)
   started_at = models.DateTimeField(auto_now_add=True)
   completed_at = models.DateTimeField(null=True, blank=True)
   is_completed = models.BooleanField(default=False)

   def __str__(self):
       return f"Attempt by {self.user} on {self.quiz.title}"

   @property
   def duration(self):
       if self.completed_at:
           return self.completed_at - self.started_at
       return None

   def finish_attempt(self):
       self.completed_at = timezone.now()
       self.is_completed = True
       self.calculate_score()
       self.save()

   def calculate_score(self):
       total_points = self.quiz.questions.aggregate(total=models.Sum('points'))['total']
       earned_points = self.responses.filter(is_correct=True).aggregate(
           earned=models.Sum('points_earned'))['earned'] or 0
       self.score = (earned_points / total_points * 100) if total_points > 0 else 0
       self.save()

class QuestionResponse(models.Model):
   attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='responses')
   question = models.ForeignKey(Question, on_delete=models.CASCADE)
   selected_options = models.ManyToManyField(QuestionOption, blank=True)
   text_response = models.TextField(blank=True)
   is_correct = models.BooleanField(default=False)
   points_earned = models.DecimalField(max_digits=5, decimal_places=2, default=0)
   created_at = models.DateTimeField(auto_now_add=True)
   updated_at = models.DateTimeField(auto_now=True)

   def calculate_score(self):
       if self.question.type in ['MULTIPLE_CHOICE', 'SINGLE_CHOICE']:
           correct_options = set(self.question.options.filter(is_correct=True))
           selected_options = set(self.selected_options.all())
           
           if self.question.type == 'SINGLE_CHOICE':
               self.is_correct = len(selected_options) == 1 and selected_options.issubset(correct_options)
               self.points_earned = self.question.points if self.is_correct else 0
           else:
               correct_selections = len(selected_options.intersection(correct_options))
               incorrect_selections = len(selected_options - correct_options)
               total_correct = len(correct_options)
               
               if incorrect_selections == 0:
                   self.points_earned = (correct_selections / total_correct) * self.question.points
                   self.is_correct = correct_selections == total_correct
               else:
                   self.points_earned = 0
                   self.is_correct = False
                   
       elif self.question.type == 'TRUE_FALSE':
           self.is_correct = self.selected_options.filter(is_correct=True).exists()
           self.points_earned = self.question.points if self.is_correct else 0
           
       elif self.question.type == 'SHORT_ANSWER':
           correct_answer = self.question.options.filter(is_correct=True).first()
           if correct_answer and self.text_response.lower().strip() == correct_answer.text.lower().strip():
               self.is_correct = True
               self.points_earned = self.question.points
           
       self.save()

       
class RevisionResource(AbstractResource):
    content = models.TextField()


class PDFResource(AbstractResource):
    pdf_file = models.FileField(upload_to="pdfs/")

    def get_pdf_url(self):
        return self.get_signed_url('pdf_file')


class ExerciseResource(AbstractResource):
    instructions = models.TextField()
    solution_file = models.FileField(upload_to="exercises/solutions/", blank=True, null=True)
    exercise_file = models.FileField(upload_to="exercises/", blank=True, null=True)

    def get_solution_url(self):
        return self.get_signed_url('solution_file')
        
    def get_exercise_url(self):
        return self.get_signed_url('exercise_file')


class UserAvailability(models.Model):
    """
    Base availability model for both teachers and students
    """
    
    USER_TYPE_CHOICES = (
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availabilities')
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
