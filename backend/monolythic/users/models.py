import random
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    EDUCATION_LEVELS = [
        ('LYCEE', 'Lycée'),
        ('UNIVERSITY', 'Université'),
        ('PROFESSIONAL', 'Professionnel'),
    ]

    LYCEE_CLASSES = [
        ('6eme', '6ème'),
        ('5eme', '5ème'),
        ('4eme', '4ème'),
        ('3eme', '3ème'),
        ('2nde', '2nde'),
        ('1ere', '1ère'),
        ('terminale', 'Terminale'),
    ]

    UNIVERSITY_LEVELS = [
        ('licence', 'Licence'),
        ('master', 'Master'),
        ('doctorat', 'Doctorat'),
    ]

    LICENCE_YEARS = [
        ('L1', 'L1'),
        ('L2', 'L2'),
        ('L3', 'L3'),
    ]

    MASTER_YEARS = [
        ('M1', 'M1'),
        ('M2', 'M2'),
    ]
    
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('fr', 'French'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=150)
    last_name = models.CharField(_("last name"), max_length=150)
    phone_number = PhoneNumberField(unique=True, region='CM')
    date_of_birth = models.DateField(null=True,blank=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_LEVELS)
    
    # Education level specific fields
    lycee_class = models.CharField(max_length=20, choices=LYCEE_CLASSES, null=True, blank=True)
    university_level = models.CharField(max_length=20, choices=UNIVERSITY_LEVELS, null=True, blank=True)
    university_year = models.CharField(
        max_length=2, 
        choices=LICENCE_YEARS + MASTER_YEARS, 
        null=True, 
        blank=True
    )
    enterprise_name = models.CharField(max_length=255, null=True, blank=True)
    platform_usage_reason = models.TextField(null=True, blank=True)
    
    email_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    town = models.CharField(max_length=100,blank=True,null=True)
    quarter = models.CharField(max_length=100,blank=True,null=True)
    
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_("Designates whether this user should be treated as active."),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone_number']

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.email

    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Validate education level specific fields
        if self.education_level == 'LYCEE':
            if not self.lycee_class:
                raise ValidationError(_('Lycee class is required for lycee students'))
            self.university_level = None
            self.university_year = None
            self.enterprise_name = None
            self.platform_usage_reason = None
            
        elif self.education_level == 'UNIVERSITY':
            if not self.university_level:
                raise ValidationError(_('University level is required for university students'))
            if self.university_level in ['licence', 'master'] and not self.university_year:
                raise ValidationError(_('University year is required for licence and master students'))
            self.lycee_class = None
            self.enterprise_name = None
            self.platform_usage_reason = None
            
        elif self.education_level == 'PROFESSIONAL':
            if not self.enterprise_name or not self.platform_usage_reason:
                raise ValidationError(_('Enterprise name and platform usage reason are required for professionals'))
            self.lycee_class = None
            self.university_level = None
            self.university_year = None

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class UserPasswordResetToken(models.Model):
    user = models.ForeignKey(User, related_name="reset_token", on_delete=models.CASCADE)
    code = models.CharField(
        max_length=6, null=True, blank=True, help_text="A six digit code"
    )
    reset_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user} Reset Password at {self.reset_at}"

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = "".join(random.choices("0123456789", k=6))
        super().save(*args, **kwargs)

class UserActiveToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.TextField()
    device_type = models.CharField(max_length=50, blank=True, null=True)  # mobile, tablet, desktop
    device_name = models.CharField(max_length=255, blank=True, null=True)  # iPhone 12, Samsung Galaxy S21, etc.
    os_name = models.CharField(max_length=50, blank=True, null=True)  # iOS, Android, Windows, macOS
    os_version = models.CharField(max_length=50, blank=True, null=True)
    browser_name = models.CharField(max_length=50, blank=True, null=True)
    browser_version = models.CharField(max_length=50, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("User Active Token")
        verbose_name_plural = _("User Active Tokens")

    def __str__(self):
        return f"{self.user.email}'s active token on {self.device_name}"