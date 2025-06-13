import requests
import re
from typing import Dict, Optional, Union
from datetime import datetime, timedelta
import json


class FreemoPayManager:
    """
    A class to manage FreemoPay API v2 payment operations efficiently.
    """
    
    def __init__(self, app_key: str, secret_key: str, base_url: str = "https://api-v2.freemopay.com"):
        """
        Initialize the FreemoPay manager.
        
        Args:
            app_key (str): FreemoPay application key (username for basic auth)
            secret_key (str): FreemoPay secret key (password for basic auth)
            base_url (str): Base URL for FreemoPay API
        """
        self.app_key = app_key
        self.secret_key = secret_key
        self.base_url = base_url.rstrip('/')
        self.token = None
        self.token_expires_at = None
        
    def validate_phone_number(self, phone: str) -> bool:
        """
        Validate Cameroon phone number format for FreemoPay.
        
        Args:
            phone (str): Phone number to validate
            
        Returns:
            bool: True if valid, False otherwise
        """
        # Cameroon phone number pattern (237) followed by 9 digits
        pattern = r'^237\d{9}$'
        return bool(re.match(pattern, phone))

    def _get_basic_auth_headers(self) -> Dict[str, str]:
        """
        Get headers for basic authentication.
        
        Returns:
            Dict: Headers with basic auth
        """
        import base64
        
        credentials = f"{self.app_key}:{self.secret_key}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {encoded_credentials}'
        }

    def _get_bearer_auth_headers(self) -> Dict[str, str]:
        """
        Get headers for bearer token authentication.
        
        Returns:
            Dict: Headers with bearer token
        """
        if not self.token or (self.token_expires_at and datetime.now() >= self.token_expires_at):
            self.generate_token()
            
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }

    def generate_token(self) -> Dict:
        """
        Generate JWT authentication token.
        
        Returns:
            Dict: Token response
            
        Raises:
            Exception: If token generation fails
        """
        url = f"{self.base_url}/api/v2/payment/token"
        headers = self._get_basic_auth_headers()
        
        try:
            response = requests.post(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            if 'token' in data:
                self.token = data['token']
                # Token expires in 3600 seconds (1 hour)
                self.token_expires_at = datetime.now() + timedelta(seconds=3600)
                
            return data
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to generate token: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from token endpoint")

    def init_payment(self,
                    payer: str,
                    amount: Union[int, float, str],
                    external_id: str,
                    description: str,
                    callback: str,
                    use_token: bool = False) -> Dict:
        """
        Initialize a payment transaction.
        
        Args:
            payer (str): Payer's phone number (must include country code)
            amount: Amount to collect
            external_id (str): External reference for tracking
            description (str): Payment description
            callback (str): Callback URL for receiving payment status updates
            use_token (bool): Whether to use bearer token auth instead of basic auth
            
        Returns:
            Dict: Payment initialization response
            
        Raises:
            ValueError: For invalid phone number or amount
            Exception: For FreemoPay API errors
        """
        if not self.validate_phone_number(payer):
            raise ValueError("Invalid phone number format. Must start with 237 followed by 9 digits")
            
        try:
            amount = str(float(amount))  # Validate and convert amount to string
        except ValueError:
            raise ValueError("Invalid amount provided")

        url = f"{self.base_url}/api/v2/payment"
        
        headers = self._get_bearer_auth_headers() if use_token else self._get_basic_auth_headers()
        
        payload = {
            "payer": payer,
            "amount": amount,
            "externalId": external_id,
            "description": description,
            "callback": callback
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = response.headers.get('Retry-After', '60')
                raise Exception(f"Rate limit exceeded. Retry after {retry_after} seconds")
                
            response.raise_for_status()
            
            data = response.json()
            
            # Check for error in response
            if isinstance(data, dict) and data.get('status') == 'ERROR':
                raise Exception(data.get('message', 'Error initializing payment'))
                
            return data
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to initialize payment: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from payment endpoint")

    def check_payment_status(self, reference: str, use_token: bool = False) -> Dict:
        """
        Check the status of a payment transaction.
        
        Args:
            reference (str): Payment reference from init_payment response
            use_token (bool): Whether to use bearer token auth instead of basic auth
            
        Returns:
            Dict: Payment status response
            
        Raises:
            Exception: For FreemoPay API errors
        """
        url = f"{self.base_url}/api/v2/payment/{reference}"
        
        headers = self._get_bearer_auth_headers() if use_token else self._get_basic_auth_headers()

        try:
            response = requests.get(url, headers=headers)
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = response.headers.get('Retry-After', '60')
                raise Exception(f"Rate limit exceeded. Retry after {retry_after} seconds")
                
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to check payment status: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from status endpoint")

    def validate_callback(self, callback_data: Dict) -> bool:
        """
        Validate callback data structure.
        
        Args:
            callback_data (Dict): Callback data received from FreemoPay
            
        Returns:
            bool: True if valid callback structure
        """
        required_fields = ['status', 'reference', 'amount', 'transactionType', 'externalId']
        
        return all(field in callback_data for field in required_fields)

    def process_callback(self, callback_data: Dict) -> Dict:
        """
        Process callback data from FreemoPay webhook.
        
        Args:
            callback_data (Dict): Callback data received from FreemoPay
            
        Returns:
            Dict: Processed callback information
            
        Raises:
            ValueError: If callback data is invalid
        """
        if not self.validate_callback(callback_data):
            raise ValueError("Invalid callback data structure")
            
        status = callback_data.get('status')
        if status not in ['SUCCESS', 'FAILED']:
            raise ValueError(f"Invalid status: {status}")
            
        return {
            'is_success': status == 'SUCCESS',
            'is_failed': status == 'FAILED',
            'reference': callback_data.get('reference'),
            'amount': callback_data.get('amount'),
            'external_id': callback_data.get('externalId'),
            'message': callback_data.get('message', ''),
            'transaction_type': callback_data.get('transactionType'),
            'raw_data': callback_data
        }

    def handle_rate_limit_error(self, retry_after: str) -> None:
        """
        Handle rate limit error by providing guidance.
        
        Args:
            retry_after (str): Seconds to wait before retrying
        """
        print(f"Rate limit exceeded. Please wait {retry_after} seconds before making another request.")
        print("FreemoPay allows 100 requests per minute per merchant account.")