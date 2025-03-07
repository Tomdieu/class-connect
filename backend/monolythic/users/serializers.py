from rest_framework import serializers
from .models import User,UserPasswordResetToken
from django.utils import timezone
import datetime
from phonenumber_field.serializerfields import PhoneNumberField
from django.contrib.auth.models import Permission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class UserSerializer(serializers.ModelSerializer):
    subscription_status = serializers.ReadOnlyField()
    class_level = serializers.SerializerMethodField()
    class_display = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
            'education_level', 'college_class', 'lycee_class', 'lycee_speciality',
            'university_level', 'university_year', 'enterprise_name', 
            'platform_usage_reason', 'email_verified', 'avatar', 'language', 
            'town', 'quarter', 'subscription_status', 'class_level', 'class_display',
            'is_active', 'created_at', 'updated_at', 'date_joined','last_login',
            'is_superuser', 'is_staff'
        ]
        
    def get_class_level(self, obj):
        return obj.get_class_level()
    
    def get_class_display(self, obj):
        return obj.get_class_display()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_superuser = serializers.BooleanField(required=False, default=False)
    is_staff = serializers.BooleanField(required=False, default=False)
    education_level = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'phone_number', 
            'date_of_birth', 'education_level', 'college_class', 'lycee_class',
            'lycee_speciality', 'university_level', 'university_year',
            'enterprise_name', 'platform_usage_reason', 'avatar', 'language',
            'town', 'quarter', 'is_superuser', 'is_staff'
        ]

    def validate(self, data):
        # For admin/staff, ensure education_level is at least an empty string
        if data.get('is_superuser', False) or data.get('is_staff', False):
            # Set to empty string if not provided or if null
            if 'education_level' not in data or data['education_level'] is None:
                data['education_level'] = ''
        else:
            # For regular users, education_level is required
            if not data.get('education_level'):
                raise serializers.ValidationError({'education_level': 'This field is required for non-admin users.'})
        
        return data

    def create(self, validated_data):
        # At this point education_level should always be a string (possibly empty)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            date_of_birth=validated_data.get('date_of_birth', None),
            education_level=validated_data.get('education_level', ''),
            college_class=validated_data.get('college_class', None),
            lycee_class=validated_data.get('lycee_class', None),
            lycee_speciality=validated_data.get('lycee_speciality', None),
            university_level=validated_data.get('university_level', None),
            university_year=validated_data.get('university_year', None),
            enterprise_name=validated_data.get('enterprise_name', ''),
            platform_usage_reason=validated_data.get('platform_usage_reason', ''),
            avatar=validated_data.get('avatar', None),
            language=validated_data.get('language', 'fr'),
            town=validated_data.get('town', None),
            quarter=validated_data.get('quarter', None),
            is_superuser=validated_data.get('is_superuser', False),
            is_staff=validated_data.get('is_staff', False)
        )
        return user

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New password and confirm password do not match."})
        return data

class PasswordResetSerializer(serializers.Serializer):

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User does not exist.")
        return value 
    
class PasswordResetConfirmSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(max_length=120, required=True)
    confirm_password = serializers.CharField(max_length=120, required=True)

    def validate_code(self, value):

        current_datetime = timezone.now()

        # Calculate the datetime 15 minutes ago
        fiveteen_minuts_age = current_datetime - datetime.timedelta(minutes=15)

        if not UserPasswordResetToken.objects.filter(code=value, reset_at=None,
                                                     created_at__gte=fiveteen_minuts_age).exists():
            raise serializers.ValidationError("In Valid Code or expire")
        return value

    def validate(self, attrs):
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')

        if len(confirm_password) < 8:
            raise serializers.ValidationError(
                {"confirm_password": "The confirm password must be at least 8 characters long."})

        # Check if new_password and confirm_password match
        if new_password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "The new password and confirm password do not match."})

        return attrs
    
class PhoneNumberValidationSerializer(serializers.Serializer):
    phone_number = PhoneNumberField()

    def validate_phone_number(self, value):
        if not value.is_valid():
            raise serializers.ValidationError("Invalid phone number")
        return value
    
class VerifyPasswordSerializer(serializers.Serializer):

    password = serializers.CharField(max_length=120)