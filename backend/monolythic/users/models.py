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
    USER_TYPES = [
        ("ADMIN", "Administrator"),
        ("STUDENT", "Student"),
        ("PROFESSIONAL", "Professional"),
    ]

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
    
    # Replace education_level with user_type
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPES,
        default="STUDENT",
    )

    # Professional-specific fields
    enterprise_name = models.CharField(max_length=255, null=True, blank=True)
    platform_usage_reason = models.TextField(null=True, blank=True)

    # Student-specific field
    class_enrolled = models.ForeignKey(
        'courses.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )

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

        # For superusers and staff, automatically set as ADMIN
        if self.is_superuser or self.is_staff:
            self.user_type = "ADMIN"
            self.enterprise_name = None
            self.platform_usage_reason = None
            self.class_enrolled = None
            return

        # For students, class_enrolled should be provided
        if self.user_type == "STUDENT":
            if not self.class_enrolled:
                raise ValidationError(_("Class must be provided for students"))
            self.enterprise_name = None
            self.platform_usage_reason = None
            
        # For professionals, enterprise name and platform usage reason are required
        elif self.user_type == "PROFESSIONAL":
            if not self.enterprise_name or not self.platform_usage_reason:
                raise ValidationError(_("Enterprise name and platform usage reason are required for professionals"))
            self.class_enrolled = None
            
        # Fall back to STUDENT if user_type is invalid
        elif self.user_type not in dict(self.USER_TYPES):
            self.user_type = "STUDENT"

    def get_class_display(self):
        """
        Returns a formatted string of the user's class if applicable
        """
        if self.user_type == "STUDENT" and self.class_enrolled:
            return f"{str(self.class_enrolled)}"
        elif self.user_type == "PROFESSIONAL":
            return f"Professional - {self.enterprise_name}"
        elif self.user_type == "ADMIN":
            return "Administrator"
        return "No class assigned"

    def save(self, *args, **kwargs):
        # Auto-determine user_type based on provided fields if not explicitly set
        if not self.pk:  # Only for new users
            if self.is_superuser or self.is_staff:
                self.user_type = "ADMIN"
            elif self.enterprise_name and self.platform_usage_reason:
                self.user_type = "PROFESSIONAL"
            elif self.class_enrolled:
                self.user_type = "STUDENT"
        
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