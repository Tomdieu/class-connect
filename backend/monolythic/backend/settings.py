"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 5.1.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import environ
import os

env = environ.Env()
environ.Env.read_env()


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
try:
    environ.Env.read_env(os.path.join(BASE_DIR, ".env"))
except FileNotFoundError:
    pass

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-)%^x%9(v84+=#1vc3wgh=^uq7d6gtcyw-tl%x5k+8cj1nt6wdm"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env("DEBUG", default=False)

ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "polymorphic",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # local apps
    "users",
    "courses",
    "notifications",
    "payments",
    "streamings",
    "forum",
    # third party adds
    "rest_framework",
    "phonenumber_field",
    "oauth2_provider",
    "social_django",
    "drf_social_oauth2",
    "drf_yasg",
    "django_celery_beat",
    "django_celery_results",
    "storages",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "utils.middleware.ThreadLocalMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "users.middleware.RequestMiddleware",
    "users.middleware.SingleSessionMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                # Social Auth
                "social_django.context_processors.backends",
                "social_django.context_processors.login_redirect",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"
ASGI_APPLICATION = "backend.asgi.application"


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

USE_POSTGRES = env("USE_POSTGRES", default=True)

if USE_POSTGRES:

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("POSTGRES_DB"),
            "USER": env("POSTGRES_USER"),
            "PASSWORD": env("POSTGRES_PASSWORD"),
            "HOST": env("POSTGRES_HOST", default="localhost"),
            "PORT": env("POSTGRES_PORT", default=5432),
        }
    }
else:

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_USER_MODEL = "users.User"


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/
USER_S3 = env("USE_S3", default=False)
if USER_S3:
    # WASABI SETTINGS for MEDIA files only
    # AWS_ACCESS_KEY_ID = env("WASABI_ACCESS_KEY_ID")
    # AWS_SECRET_ACCESS_KEY = env("WASABI_SECRET_ACCESS_KEY")
    # AWS_STORAGE_BUCKET_NAME = env("WASABI_STORAGE_BUCKET_NAME")
    # AWS_S3_REGION_NAME = env("WASABI_REGION_NAME")
    # AWS_S3_ENDPOINT_URL = f"https://s3.{AWS_S3_REGION_NAME}.wasabisys.com"
    
    AWS_ACCESS_KEY_ID = env('B2_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('B2_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('B2_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('B2_S3_REGION_NAME')
    AWS_S3_ENDPOINT = f's3.{AWS_S3_REGION_NAME}.backblazeb2.com'
    AWS_S3_ENDPOINT_URL = f'https://{AWS_S3_ENDPOINT}'
    # AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_ENDPOINT}'
    
    # AWS_S3_ADDRESSING_STYLE = "virtual"
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    
    # AWS_S3_OBJECT_PARAMETERS = {
    #     "ACL": "private",  # or 'public-read' depending on your needs
    # }

    # Force private access for free trial
    # AWS_DEFAULT_ACL = 'private'
    # AWS_S3_FILE_OVERWRITE = False
    # AWS_QUERYSTRING_AUTH = True

    # Media settings only for Wasabi
    # DEFAULT_FILE_STORAGE = "backend.storage_backends.MediaStorage"
    # MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.wasabisys.com/media/"
    # MEDIA_URL = f'https://{AWS_STORAGE_BUCKET_NAME}.s3.{AWS_S3_REGION_NAME}.backblazeb2.com/media/'

    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

else:
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "mediafiles"

# Static files always local regardless of USE_S3
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Authentication backends
AUTHENTICATION_BACKENDS = (
    # Django
    'django.contrib.auth.backends.ModelBackend',
    
    # Custom OAuth2
    'users.auth_backends.CustomDjangoOAuth2',
    
    # drf-social-oauth2
    'drf_social_oauth2.backends.DjangoOAuth2',
    
    # OAuth2
    'oauth2_provider.backends.OAuth2Backend',
)

# Make sure OAuth2_PROVIDER settings are properly configured
OAUTH2_PROVIDER = {
    'ACCESS_TOKEN_EXPIRE_SECONDS': 2592000,  # 30 days
    'REFRESH_TOKEN_EXPIRE_SECONDS': 30 * 24 * 60 * 60,  # 30 days
    'OAUTH2_BACKEND_CLASS': 'oauth2_provider.oauth2_backends.JSONOAuthLibCore',
    'SCOPES': {'read': 'Read scope', 'write': 'Write scope'},
    'OAUTH2_VALIDATOR_CLASS': 'oauth2_provider.oauth2_validators.OAuth2Validator',
}

# Make sure our custom backend is used first to validate tokens
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'drf_social_oauth2.authentication.SocialAuthentication',
    ),
}

# Cors Configuration
# CORS_ALLOWED_ORIGINS = [
#     "https://www.classconnect.cm",
#     "https://classconnect.cm",
#     "https://www.api.classconnect.cm",
#     "https://api.classconnect.cm",
# ]
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")

# Add CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    "https://www.classconnect.cm",
    "https://classconnect.cm",
    "https://www.api.classconnect.cm",
    "https://api.classconnect.cm",
    'http://localhost:3000',
]

# Google configuration
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env("GOOGLE_CLIENT_ID", default="")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env("GOOGLE_CLIENT_SECRET", default="")

# Define SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE to get extra permissions from Google.
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

# Email settings (configure according to your email provider)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env("EMAIL_HOST", default="smtp.example.com")
EMAIL_PORT = env("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="your-email@example.com")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="your-email-password")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="webmaster@example.com")

# SWAGGER

SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
    },
    "USE_SESSION_AUTH": False,
}

# Celery configurations
REDIS_HOST = env("REDIS_HOST", default="localhost")
CELERY_BROKER_URL = env("CELERY_BROKER_URL", default=f"redis://{REDIS_HOST}:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default=f"redis://{REDIS_HOST}:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_TIMEZONE = "UTC"
CELERY_TASK_REJECT_ON_WORKER_LOST = True
CELERY_TASK_TRACK_STARTED = True
CELERY_ACKS_LATE = True
CELERY_WORKER_SEND_TASK_EVENTS = True
CELERY_TASK_SEND_SENT_EVENT = True
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# Rabbitmq configuration

RABBITMQ_HOST = env("RABBITMQ_HOST", default="localhost")
RABBITMQ_PORT = env("RABBITMQ_PORT", default=5672)
RABBITMQ_USERNAME = env("RABBITMQ_USERNAME", default="classconnect")
RABBITMQ_PASSWORD = env("RABBITMQ_PASSWORD", default="classconnect")

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_FILE = env(
    "GOOGLE_SERVICE_ACCOUNT_FILE", default=BASE_DIR / "secret/google-secret.json"
)

# Caching
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{REDIS_HOST}:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(f"{REDIS_HOST}", 6379)],
        },
    },
}

# CAMPAY

CAMPAY_APP_USERNAME = env('CAMPAY_APP_USERNAME', default='')
CAMPAY_APP_PASSWORD = env('CAMPAY_APP_PASSWORD', default='')
CAMPAY_ENVIRONMENT = env('CAMPAY_ENVIRONMENT', default='DEV')
CAMPAY_WEBHOOK_SECRET = env('CAMPAY_WEBHOOK_SECRET',default='')

# AWS S3 Configuration

# AWS_ACCESS_KEY_ID = env('B2_ACCESS_KEY_ID',default='<your b2 application key>')
# AWS_SECRET_ACCESS_KEY = env('B2_SECRET_ACCESS_KEY',default='<your b2 application key>')
# AWS_STORAGE_BUCKET_NAME = env('B2_STORAGE_BUCKET_NAME',default='classconnect')
# AWS_PRIVATE_BUCKET_NAME = env('B2_STORAGE_BUCKET_NAME',default='classconnect')
# AWS_S3_REGION_NAME = env('B2_S3_REGION_NAME',default='us-east-005')

# AWS_S3_ENDPOINT = f's3.{AWS_S3_REGION_NAME}.backblazeb2.com'
# AWS_S3_ENDPOINT_URL = f'https://{AWS_S3_ENDPOINT}'

# AWS_QUERYSTRING_AUTH = True  # This is important for private buckets
# AWS_DEFAULT_ACL = 'private'
# AWS_S3_FILE_OVERWRITE = False
# AWS_S3_VERIFY = True
# AWS_S3_SIGNATURE_NAME = 's3v4'
# AWS_S3_FILE_OVERWRITE=False
# AWS_DEFAULT_ACL= None
# AWS_S3_VERIFY=True

# AWS_PRIVATE_MEDIA_LOCATION = 'media/private'
# PRIVATE_FILE_STORAGE = 'backend.storage_backends.PrivateMediaStorage'

# AWS_S3_OBJECT_PARAMETERS = {
#     'CacheControl': 'max-age=86400',
# }


# DEFAULT_FILE_STORAGE = 'backend.storage_backends.PrivateMediaStorage'
# DEFAULT_FILE_STORAGE = 'backend.storage_backends.B2Storage'


FRONTEND_HOST=env('FRONTEND_HOST',default='http://localhost:3000')

CLASSCONNECT_CLIENT_SECRETE=env('CLASSCONNECT_CLIENT_SECRETE',default='classconnect')
CLASSCONNECT_CLIENT_ID=env('CLASSCONNECT_CLIENT_ID',default='classconnect')


ENABLE_GOOGLE_MEET = True

# File upload settings for 1GB uploads
DATA_UPLOAD_MAX_MEMORY_SIZE = 1073741824  # 1GB (1024 * 1024 * 1024)
FILE_UPLOAD_MAX_MEMORY_SIZE = 1073741824  # 1GB (1024 * 1024 * 1024)

# For very large files, it's better to use chunked uploads
# These settings ensure Django handles the upload efficiently
FILE_UPLOAD_HANDLERS = [
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
]

# Configure longer timeouts for large file uploads
# This affects how long Django will wait for the upload to complete
WSGI_REQUEST_TIMEOUT = 1800  # 30 minutes

# If using gunicorn, add these to your gunicorn.conf.py or command line:
# --timeout 1800

JITSI_SERVER=env('JITSI_SERVER',default='meet.classconnect.cm')

# FreemoPay API Configuration
FREEMOPAY_APP_KEY = os.environ.get('FREEMOPAY_APP_KEY', 'your_freemopay_app_key')
FREEMOPAY_SECRET_KEY = os.environ.get('FREEMOPAY_SECRET_KEY', 'your_freemopay_secret_key')
FREEMOPAY_BASE_URL = os.environ.get('FREEMOPAY_BASE_URL', 'https://api-v2.freemopay.com')