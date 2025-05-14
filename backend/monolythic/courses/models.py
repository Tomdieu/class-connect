import datetime
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
import uuid
from polymorphic.models import PolymorphicModel
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.utils.timezone import now

User = get_user_model()

class Section(models.Model):
    FRANCOPHONE = 'FR'
    ANGLOPHONE = 'EN'
    TYPE_CHOICES = [
        (FRANCOPHONE, 'Francophone'),
        (ANGLOPHONE, 'Anglophone'),
    ]
    code = models.CharField(max_length=2, choices=TYPE_CHOICES, unique=True)
    label = models.CharField(max_length=50)
    
    def __str__(self):
        return self.label

class EducationLevel(models.Model):
    COLLEGE = 'COLLEGE'
    LYCEE = 'LYCEE'
    UNIVERSITY = 'UNIVERSITY'
    PROFESSIONAL = 'PROFESSIONAL'
    LEVEL_CHOICES = [
        (COLLEGE, 'College'),
        (LYCEE, 'Lycée'),
        (UNIVERSITY, 'Université'),
        (PROFESSIONAL, 'Professionnel'),
    ]
    code = models.CharField(max_length=20, choices=LEVEL_CHOICES)  # Remove unique=True
    label = models.CharField(max_length=100)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='education_levels')
    
    class Meta:
        unique_together = ('code', 'section')  # Make code unique per section
    
    def __str__(self):
        return f"{self.label} ({self.section.code})"

class Speciality(models.Model):
    SCIENTIFIQUE = 'scientifique'
    LITTERAIRE = 'litteraire'
    TYPE_CHOICES = [
        (SCIENTIFIQUE, 'Scientifique'),
        (LITTERAIRE, 'Littéraire'),
    ]
    code = models.CharField(max_length=20, choices=TYPE_CHOICES, unique=True)
    label = models.CharField(max_length=50)
    
    def __str__(self):
        return self.label
    
    class Meta:
        verbose_name_plural = "Specialities"

class LevelClassDefinition(models.Model):
    """
    Defines the standard classes available for a given education level,
    optionally tied to a speciality (e.g. 2nde scientifique).
    """
    education_level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE, related_name='class_definitions')
    name = models.CharField(max_length=50)
    speciality = models.ForeignKey(
        Speciality,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='class_definitions'
    )
    
    class Meta:
        unique_together = ('education_level', 'name', 'speciality')
        
    def __str__(self):
        parts = [self.name]
        if self.speciality:
            parts.append(self.speciality.code)
        return " ".join(parts)

class Class(models.Model):
    """
    Actual offered class instance/variant, tied to a LevelClassDefinition.
    e.g. '2nde C', 'L1-A'.
    """
    definition = models.ForeignKey(
        LevelClassDefinition, 
        on_delete=models.CASCADE, 
        related_name='instances',
        null=True,  # Allow null temporarily for migration
        blank=True  # Allow blank temporarily
    )
    variant = models.CharField(max_length=50, blank=True, help_text="Optional variant label, e.g. 'A', 'C', 'A4'.")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Classes"
        
    def __str__(self):
        if self.variant:
            return f"{self.definition.name} {self.variant}"
        return self.definition.name

class CourseCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.name

class SchoolYear(models.Model):
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField()
    # Removing is_active field and replacing with property

    class Meta:
        unique_together = ('start_year', 'end_year')
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.start_year}-{self.end_year}"
    
    @property
    def formatted_year(self):
        """Returns the school year in 'YYYY-YYYY' format."""
        return f"{self.start_year}-{self.end_year}"
    
    @property
    def is_active(self):
        """Determines if this is the active school year based on the current date."""
        today = now().date()
        current_year = today.year
        
        # School year typically runs from September to August
        if today.month >= 9:  # September or later
            return self.start_year == current_year
        else:  # January to August
            return self.start_year == current_year - 1
    
    @classmethod
    def current_year(cls):
        """Gets or creates the current school year based on today's date."""
        today = now().date()
        current_year = today.year
        start_year = current_year if today.month >= 9 else current_year - 1  # Assume school starts in September
        end_year = start_year + 1

        school_year, created = cls.objects.get_or_create(
            start_year=start_year,
            end_year=end_year
        )
        return school_year

class UserClass(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    class_level = models.ForeignKey(Class, on_delete=models.CASCADE)
    school_year = models.ForeignKey(SchoolYear,on_delete=models.CASCADE,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if self.school_year == None:
            self.school_year = SchoolYear.current_year()
        super().save(*args, **kwargs)

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
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
    offer = models.ForeignKey(CourseOffering, on_delete=models.CASCADE,related_name='courseofferingaction_set')
    action = models.CharField(max_length=20,choices=ACTIONS,default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.teacher} - {self.offer} - {self.action}"
    


class TeacherStudentEnrollment(models.Model):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (COMPLETED, "Completed"),
    ]
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='students')
    offer = models.ForeignKey(CourseOffering, on_delete=models.PROTECT,related_name='teacher_student_enrollments')
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    has_class_end = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    
    class Meta:
        unique_together = ("teacher", "offer", "school_year")  # Prevents duplicate enrollments
        indexes = [
            models.Index(fields=["teacher", "school_year"]),
        ]

    def __str__(self):
        return f"{self.teacher} - {self.offer.student} ({self.school_year})"
    
    @classmethod
    def enroll(cls, teacher, offer):
        """
        Enrolls a teacher to a student's course for the current school year.
        If the enrollment already exists, return the existing one.
        """
        school_year = SchoolYear.current_year()
        enrollment, created = cls.objects.get_or_create(
            teacher=teacher,
            offer=offer,
            school_year=school_year,
            defaults={"status": cls.ACTIVE}
        )
        return enrollment
    
    @classmethod
    def get_current_year_enrollments(cls, teacher):
        """Returns all enrollments for the teacher in the current school year."""
        return cls.objects.filter(teacher=teacher, school_year=SchoolYear.current_year())
    
    def complete(self):
        """Marks the enrollment as completed."""
        self.status = self.COMPLETED
        self.save()
    
class CourseDeclaration(models.Model):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    REJECTED = 'REJECTED'
    PAID = 'PAID'

    ACTIONS = (
        (PENDING,'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
        (PAID,'Paid')
    )

    teacher_student_enrollment = models.ForeignKey(TeacherStudentEnrollment, on_delete=models.CASCADE, related_name='declarations')
    duration = models.PositiveIntegerField(_("Duration in minutes"))
    declaration_date = models.DateField(_("Declaration Date"),default=datetime.date.today)
    accepted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='accepted_declarations')
    status = models.CharField(max_length=20, choices=ACTIONS, default=PENDING)
    updated_at = models.DateTimeField(auto_now=True)
    proof_of_payment = models.FileField(upload_to='declarations/', blank=True, null=True)
    payment_comment = models.TextField(blank=True, null=True)
    payment_date = models.DateField(_("Payment Date"), blank=True, null=True)
    paid_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='paid_declarations')

    def __str__(self):
        return f"{self.teacher_student_enrollment} - {self.status}"

class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)  # Replacing 'course' with 'topic'
    resource = models.ForeignKey(AbstractResource, on_delete=models.CASCADE)  # Polymorphic resource
    completed = models.BooleanField(default=False)
    current_page = models.PositiveIntegerField(blank=True, null=True)
    total_pages = models.PositiveIntegerField(blank=True,null=True)
    current_time = models.PositiveIntegerField(blank=True,null=True)
    total_duration = models.PositiveIntegerField(blank=True,null=True)
    
    progress_percentage = models.IntegerField(default=0)
    last_accessed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.topic} - {self.resource}"


