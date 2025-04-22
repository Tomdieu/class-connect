import random
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
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
        ("COLLEGE", "Collège"),
        ("LYCEE", "Lycée"),
        ("UNIVERSITY", "Université"),
        ("PROFESSIONAL", "Professionnel"),
        ("ADMIN", "Administrator"),
    ]

    COLLEGE_CLASSES = [
        ("6eme", "6ème"),
        ("5eme", "5ème"),
        ("4eme", "4ème"),
        ("3eme", "3ème"),
    ]

    LYCEE_CLASSES = [
        ("2nde", "2nde"),
        ("1ere", "1ère"),
        ("terminale", "Terminale"),
    ]

    LYCEE_SPECIALITIES = [
        ("scientifique", "scientifique"),
        ("litteraire", "litteraire")
    ]

    UNIVERSITY_LEVELS = [
        ("licence", "Licence"),
        ("master", "Master"),
        ("doctorat", "Doctorat"),
    ]

    LICENCE_YEARS = [
        ("L1", "L1"),
        ("L2", "L2"),
        ("L3", "L3"),
    ]

    MASTER_YEARS = [
        ("M1", "M1"),
        ("M2", "M2"),
    ]
    
    CLASS_LEVELS = {
        # College classes (6eme = 1, 5eme = 2, etc.)
        "6eme": 1,
        "5eme": 2,
        "4eme": 3,
        "3eme": 4,
        # Lycee classes (2nde = 5, 1ere = 6, etc.)
        "2nde": 5,
        "1ere": 6,
        "terminale": 7,
        # University levels
        # Licence
        "L1": 8,
        "L2": 9,
        "L3": 10,
        # Master
        "M1": 11,
        "M2": 12,
        # Doctorat
        "doctorat": 13,
    }

    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("fr", "French"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=150)
    last_name = models.CharField(_("last name"), max_length=150)
    phone_number = PhoneNumberField(unique=True, region="CM")
    date_of_birth = models.DateField(null=True, blank=True)
    education_level = models.CharField(
        max_length=20, 
        choices=EDUCATION_LEVELS,
        blank=True,  # Allow empty in forms/validation
        null=True,
    )

    # Education level specific fields
    college_class = models.CharField(
        max_length=20, 
        choices=COLLEGE_CLASSES,
        null=True, 
        blank=True,
        help_text=_("Class for college students")
    )
    lycee_class = models.CharField(
        max_length=20, 
        choices=LYCEE_CLASSES,
        null=True, 
        blank=True,
        help_text=_("Class for lycee students")
    )
    lycee_speciality = models.CharField(max_length=255,choices=LYCEE_SPECIALITIES, null=True, blank=True)
    university_level = models.CharField(
        max_length=20, choices=UNIVERSITY_LEVELS, null=True, blank=True
    )
    university_year = models.CharField(
        max_length=2, choices=LICENCE_YEARS + MASTER_YEARS, null=True, blank=True
    )
    enterprise_name = models.CharField(max_length=255, null=True, blank=True)
    platform_usage_reason = models.TextField(null=True, blank=True)

    email_verified = models.BooleanField(default=False)
    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        verbose_name=_("Avatar"),
        help_text=_("User profile picture")
    )
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default="fr")
    town = models.CharField(max_length=100, blank=True, null=True)
    quarter = models.CharField(max_length=100, blank=True, null=True)

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
    REQUIRED_FIELDS = ["first_name", "last_name", "phone_number"]

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.email

    def clean(self):
        from django.core.exceptions import ValidationError

        # For superusers and staff, set a special admin education level
        # This satisfies the database constraint while maintaining the distinction
        if self.is_superuser or self.is_staff:
            self.education_level = "ADMIN"
            # Clear all education specific fields for admins
            self.college_class = None
            self.lycee_class = None
            self.lycee_speciality = None
            self.university_level = None
            self.university_year = None
            self.enterprise_name = None
            self.platform_usage_reason = None
            return

        # Validate education level for regular users
        if not self.education_level:
            raise ValidationError(_("Education level is required for regular users"))

        # Validate education level specific fields
        if self.education_level == "COLLEGE":
            if not self.college_class:
                raise ValidationError(_("College class is required for college students"))
            self.lycee_class = None
            self.lycee_speciality = None
            self.university_level = None
            self.university_year = None
            self.enterprise_name = None
            self.platform_usage_reason = None
            
        if self.education_level == "LYCEE":
            if not self.lycee_class:
                raise ValidationError(_("Lycee class is required for lycee students"))
            if not self.lycee_speciality:
                raise ValidationError(_("Speciality is required for lycee students"))
            self.college_class = None
            self.university_level = None
            self.university_year = None
            self.enterprise_name = None
            self.platform_usage_reason = None

        elif self.education_level == "UNIVERSITY":
            if not self.university_level:
                raise ValidationError(_("University level is required for university students"))
            if self.university_level in ["licence", "master"] and not self.university_year:
                raise ValidationError(_("University year is required for licence and master students"))
            self.college_class = None
            self.lycee_class = None
            self.lycee_speciality = None
            self.enterprise_name = None
            self.platform_usage_reason = None

        elif self.education_level == "PROFESSIONAL":
            if not self.enterprise_name or not self.platform_usage_reason:
                raise ValidationError(_("Enterprise name and platform usage reason are required for professionals"))
            self.college_class = None
            self.lycee_class = None
            self.lycee_speciality = None
            self.university_level = None
            self.university_year = None

    def get_class_level(self):
        """
        Returns the numeric level of the user's class.
        College: 1-4 (6eme-3eme)
        Lycee: 5-7 (2nde-terminale)
        University: 8-13 (L1-Doctorat)
        Returns None if user has no class or is not in college/lycee/university
        """
        if self.education_level == "COLLEGE" and self.college_class:
            return self.CLASS_LEVELS.get(self.college_class)
        elif self.education_level == "LYCEE" and self.lycee_class:
            return self.CLASS_LEVELS.get(self.lycee_class)
        elif self.education_level == "UNIVERSITY":
            if self.university_level == "doctorat":
                return self.CLASS_LEVELS.get("doctorat")
            elif self.university_year:
                return self.CLASS_LEVELS.get(self.university_year)
        return None
    
    def can_access_class_level(self, target_level: int):
        """
        Determines if the user can access content for a specific class level
        based on their subscription and current level.

        Premium users can access all previous levels.
        Standard users can access their current level and 2 previous levels.
        Basic users can only access their current level.
        """
        current_level = self.get_class_level()
        if not current_level:
            return False

        # Get user's subscription (implement this based on your subscription model)
        subscription = self.get_active_subscription()
        if not subscription:
            return False

        if subscription.plan == "premium":
            # Premium users can access all previous levels
            return target_level <= current_level
        elif subscription.plan == "standard":
            # Standard users can access their level and 2 previous levels
            return current_level - 2 <= target_level <= current_level
        else:  # Basic plan
            # Basic users can only access their current level
            return target_level == current_level
    
    def get_accessible_levels(self):
        """
        Returns a list of class levels the user can access based on their
        subscription and current level.
        """
        current_level = self.get_class_level()
        if not current_level:
            return []

        subscription = self.get_active_subscription()
        if not subscription:
            return []

        if subscription.plan == "premium":
            # All levels up to current level
            return list(range(1, current_level + 1))
        elif subscription.plan == "standard":
            # Current level and 2 previous levels
            start_level = max(1, current_level - 2)
            return list(range(start_level, current_level + 1))
        else:  # Basic plan
            # Only current level
            return [current_level]
    
    @property
    def subscription_status(self):
        """Returns the current subscription status of the user"""
        active_sub = self.get_active_subscription()
        if active_sub:
            return {
                'active': True,
                'plan': active_sub.plan.name,
                'expires': active_sub.end_date
            }
        return {'active': False}

    def get_active_subscription(self):
        """
        Returns the user's active subscription.
        """
        try:
            return self.subscriptions.select_related('plan').get(
                end_date__gt=timezone.now()
            )
        except:
            return None

    def has_active_subscription(self):
        """Check if user has any active subscription"""
        return self.get_active_subscription() is not None

    def get_subscription_plan(self):
        """Returns the current subscription plan name or None"""
        subscription = self.get_active_subscription()
        return subscription.plan.name if subscription else None

    def can_access_content(self, content_level=None):
        """
        Determines if user can access specific content based on subscription level
        and education level
        """
        subscription = self.get_active_subscription()
        if not subscription:
            return False

        if not content_level:
            return True

        return self.can_access_class_level(content_level)
    
    def get_class_display(self):
        """
        Returns a formatted string of the user's education level and class
        """
        if not self.education_level:
            return "No education level set"

        if self.education_level == "COLLEGE":
            class_name = dict(self.COLLEGE_CLASSES).get(self.college_class, "")
            return f"{dict(self.EDUCATION_LEVELS)[self.education_level]} - {class_name}"
        elif self.education_level == "LYCEE":
            class_name = dict(self.LYCEE_CLASSES).get(self.lycee_class, "")
            return f"{dict(self.EDUCATION_LEVELS)[self.education_level]} - {class_name}"
            
        if self.education_level == "UNIVERSITY":
            level = dict(self.UNIVERSITY_LEVELS).get(self.university_level, "")
            year = self.university_year or ""
            return f"{level} {year}".strip()
        
        return dict(self.EDUCATION_LEVELS)[self.education_level]

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
    device_type = models.CharField(
        max_length=50, blank=True, null=True
    )  # mobile, tablet, desktop
    device_name = models.CharField(
        max_length=255, blank=True, null=True
    )  # iPhone 12, Samsung Galaxy S21, etc.
    os_name = models.CharField(
        max_length=50, blank=True, null=True
    )  # iOS, Android, Windows, macOS
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

class UserActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.TextField()  # What the user did
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # User's IP address
    user_agent = models.TextField(null=True, blank=True)  # Browser & device info
    request_method = models.CharField(max_length=10, null=True, blank=True)  # GET, POST, etc.
    request_path = models.TextField(null=True, blank=True)  # Which page/API was accessed
    referrer = models.TextField(null=True, blank=True)  # Where the user came from
    extra_data = models.JSONField(null=True, blank=True)  # Any additional metadata
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"