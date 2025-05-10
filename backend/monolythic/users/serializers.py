from rest_framework import serializers
from .models import User, UserPasswordResetToken, UserActivityLog
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
    class_display = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
            'user_type', 'class_enrolled',
            'enterprise_name', 'platform_usage_reason', 'email_verified', 'avatar', 'language', 
            'town', 'quarter', 'subscription_status', 'class_display',
            'is_active', 'created_at', 'updated_at', 'date_joined', 'last_login',
            'is_superuser', 'is_staff'
        ]
    
    def get_class_display(self, obj):
        return obj.get_class_display()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_superuser = serializers.BooleanField(required=False, default=False)
    is_staff = serializers.BooleanField(required=False, default=False)
    user_type = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'phone_number', 
            'date_of_birth', 'user_type', 'class_enrolled',
            'enterprise_name', 'platform_usage_reason', 'avatar', 'language',
            'town', 'quarter', 'is_superuser', 'is_staff'
        ]

    def validate(self, data):
        # Let the model's save method determine the user_type automatically 
        # based on the provided fields
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            date_of_birth=validated_data.get('date_of_birth', None),
            user_type=validated_data.get('user_type', 'STUDENT'),  # Default to STUDENT
            class_enrolled=validated_data.get('class_enrolled', None),
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

class UserActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivityLog
        fields = '__all__'