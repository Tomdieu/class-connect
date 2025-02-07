from django.core.files.base import ContentFile
from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings
import boto3
from botocore.config import Config
# from .storage_backends import B2Storage
from django.core.files.storage import default_storage

def test_wasabi_connection():
    try:
        # Try to upload a test file
        test_file = ContentFile("test content")
        path = default_storage.save("test_wasabi.txt", test_file)
        
        print(f"File uploaded successfully to: {path}")
        
        # Generate a URL to the file
        url = default_storage.url(path)
        print(f"File URL: {url}")
        
        # Clean up
        # default_storage.delete(path)
        # print("Test file deleted successfully")
        
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False
    
def debug_wasabi():
    """Comprehensive Wasabi testing"""
    try:
        # 1. First print settings to verify they're loaded
        print("\nChecking settings...")
        print(f"Endpoint URL: {settings.AWS_S3_ENDPOINT_URL}")
        print(f"Bucket: {settings.AWS_STORAGE_BUCKET_NAME}")
        print(f"Access Key: {'*' * len(settings.AWS_ACCESS_KEY_ID)}")
        print(f"Secret Key: {'*' * len(settings.AWS_SECRET_ACCESS_KEY)}")
        
        # 2. Test direct boto3 connection
        s3 = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Upload test
        test_key = 'test_read.txt'
        test_content = 'Hello Wasabi! Testing read/write.'
        
        print("\n1. Testing upload...")
        s3.put_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key,
            Body=test_content
        )
        print("Upload successful!")
        
        # Read test
        print("\n2. Testing read...")
        response = s3.get_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=test_key
        )
        content = response['Body'].read().decode('utf-8')
        print(f"Read content: {content}")
        
        # Verify content matches
        print("\n3. Verifying content...")
        if content == test_content:
            print("Content verification successful!")
        else:
            print("Content verification failed!")
            
        # List files
        print("\n4. Listing files...")
        response = s3.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            MaxKeys=10
        )
        for obj in response.get('Contents', []):
            print(f"Found file: {obj['Key']} (Size: {obj['Size']} bytes)")

        # Test Django storage
        print("\n5. Testing Django storage...")
        try:
            path = default_storage.save('test_django.txt', ContentFile('Hello from Django!'))
            print(f"Django storage save path: {path}")
            url = default_storage.url(path)
            print(f"Generated URL: {url}")
        except Exception as e:
            print(f"Django storage failed: {str(e)}")
            
        return True
    except Exception as e:
        print(f"Initial connection failed: {str(e)}")
        return False

# def test_b2_storage():
#     try:
#         # Create storage instance
#         storage = B2Storage()  # Use our custom storage class
        
#         print("Testing direct upload to B2...")
#         filename = "test_b2_upload.txt"
#         content = ContentFile("test content")
        
#         # Try to save the file with explicit parameters
#         saved_path = storage.save(filename, content)
#         print(f"File saved to B2 path: {saved_path}")
        
#         # Verify the file exists
#         exists = storage.exists(saved_path)
#         print(f"File exists in B2: {exists}")
        
#         # Generate a signed URL to verify access
#         url = storage.url(saved_path)
#         print(f"File accessible at: {url}")
        
#         # Clean up
#         storage.delete(saved_path)
#         print("Test file deleted")
        
#         return True
#     except Exception as e:
#         print(f"B2 Storage Error: {type(e).__name__} - {str(e)}")
#         return False

# def verify_b2_credentials():
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
            config=Config(s3={'addressing_style': 'virtual'})
        )
        
        # Try to list objects in the bucket
        response = s3.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            MaxKeys=1
        )
        
        print("Successfully connected to B2!")
        print(response)
        return True
        
    except Exception as e:
        print(f"B2 Credential Error: {type(e).__name__} - {str(e)}")
        return False