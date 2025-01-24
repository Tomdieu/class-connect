from rest_framework import serializers
from .models import User,UserPasswordResetToken
from django.utils import timezone
import datetime
from phonenumber_field.serializerfields import PhoneNumberField

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
            'education_level', 'lycee_class', 'university_level', 'university_year', 
            'enterprise_name', 'platform_usage_reason', 'email_verified', 'profile_picture', 
            'language', 'town', 'quarter', 'is_staff', 'is_active', 'created_at', 
            'updated_at', 'date_joined'
        ]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
            'education_level', 'lycee_class', 'university_level', 'university_year', 
            'enterprise_name', 'platform_usage_reason', 'password'
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            date_of_birth=validated_data.get('date_of_birth', None),
            education_level=validated_data.get('education_level', ''),
            lycee_class=validated_data.get('lycee_class', None),
            university_level=validated_data.get('university_level', None),
            university_year=validated_data.get('university_year', None),
            enterprise_name=validated_data.get('enterprise_name', ''),
            platform_usage_reason=validated_data.get('platform_usage_reason', ''),
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