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
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='fr')
    town = models.CharField(max_length=100, blank=True,null=True)
    quarter = models.CharField(max_length=100, blank=True,null=True)
    
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
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.email

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