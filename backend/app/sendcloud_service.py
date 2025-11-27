"""
Sendcloud API Integration Service

This module handles all communication with Sendcloud API for shipping services.
Used for EU internal transport only.

Security Features:
- Input validation and sanitization
- Webhook signature verification
- Response validation
- Secure logging (no sensitive data exposure)
- Rate limiting awareness
"""

import logging
import hashlib
import hmac
import re
import requests
from requests.auth import HTTPBasicAuth
from django.conf import settings
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# EU country codes (ISO 3166-1 alpha-2)
VALID_EU_COUNTRY_CODES = {
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'NO', 'CH', 'GB'
}

# Maximum reasonable values
MAX_WEIGHT_KG = 1000  # 1000 kg max per parcel
MAX_DIMENSION_CM = 300  # 3 meters max
MAX_STRING_LENGTH = 500  # Max length for text fields


class SendcloudAPIError(Exception):
    """Custom exception for Sendcloud API errors"""
    pass


class SendcloudValidationError(Exception):
    """Custom exception for validation errors"""
    pass


def validate_country_code(country: str) -> str:
    """
    Validate and sanitize country code
    
    Args:
        country: Country code (ISO 3166-1 alpha-2)
    
    Returns:
        Validated uppercase country code
        
    Raises:
        SendcloudValidationError: If country code is invalid
    """
    if not country or not isinstance(country, str):
        raise SendcloudValidationError("Country code is required")
    
    country_upper = country.strip().upper()
    
    if len(country_upper) != 2:
        raise SendcloudValidationError(f"Invalid country code format: {country}")
    
    if not country_upper.isalpha():
        raise SendcloudValidationError(f"Country code must contain only letters: {country}")
    
    if country_upper not in VALID_EU_COUNTRY_CODES:
        raise SendcloudValidationError(f"Country code not supported: {country}")
    
    return country_upper


def validate_postal_code(postal_code: str) -> str:
    """
    Validate and sanitize postal code
    
    Args:
        postal_code: Postal/ZIP code
    
    Returns:
        Sanitized postal code
        
    Raises:
        SendcloudValidationError: If postal code is invalid
    """
    if not postal_code or not isinstance(postal_code, str):
        raise SendcloudValidationError("Postal code is required")
    
    # Remove extra whitespace
    postal_code = postal_code.strip()
    
    # Check length
    if len(postal_code) > 20:
        raise SendcloudValidationError("Postal code too long")
    
    # Allow only alphanumeric and spaces/hyphens
    if not re.match(r'^[A-Za-z0-9\s\-]+$', postal_code):
        raise SendcloudValidationError("Postal code contains invalid characters")
    
    return postal_code


def validate_text_field(value: str, field_name: str, max_length: int = MAX_STRING_LENGTH) -> str:
    """
    Validate and sanitize text fields (address, city, etc.)
    
    Args:
        value: Text value to validate
        field_name: Name of the field (for error messages)
        max_length: Maximum allowed length
    
    Returns:
        Sanitized text
        
    Raises:
        SendcloudValidationError: If text is invalid
    """
    if not value or not isinstance(value, str):
        raise SendcloudValidationError(f"{field_name} is required")
    
    # Remove leading/trailing whitespace
    value = value.strip()
    
    # Check minimum length
    if len(value) < 2:
        raise SendcloudValidationError(f"{field_name} is too short")
    
    # Check maximum length
    if len(value) > max_length:
        raise SendcloudValidationError(f"{field_name} is too long (max {max_length} characters)")
    
    # Remove any potentially dangerous characters
    # Allow: letters, numbers, spaces, and common punctuation
    if not re.match(r'^[A-Za-z0-9\s\.\,\-\#\/]+$', value):
        raise SendcloudValidationError(f"{field_name} contains invalid characters")
    
    return value


def validate_weight(weight: float) -> float:
    """
    Validate weight value
    
    Args:
        weight: Weight in kg
    
    Returns:
        Validated weight
        
    Raises:
        SendcloudValidationError: If weight is invalid
    """
    try:
        weight_float = float(weight)
    except (TypeError, ValueError):
        raise SendcloudValidationError("Weight must be a valid number")
    
    if weight_float <= 0:
        raise SendcloudValidationError("Weight must be greater than 0")
    
    if weight_float > MAX_WEIGHT_KG:
        raise SendcloudValidationError(f"Weight exceeds maximum allowed ({MAX_WEIGHT_KG} kg)")
    
    return weight_float


def validate_dimension(dimension: Optional[float], dimension_name: str) -> Optional[float]:
    """
    Validate dimension value (length, width, height)
    
    Args:
        dimension: Dimension in cm (optional)
        dimension_name: Name of dimension (for error messages)
    
    Returns:
        Validated dimension or None
        
    Raises:
        SendcloudValidationError: If dimension is invalid
    """
    if dimension is None:
        return None
    
    try:
        dimension_float = float(dimension)
    except (TypeError, ValueError):
        raise SendcloudValidationError(f"{dimension_name} must be a valid number")
    
    if dimension_float < 0:
        raise SendcloudValidationError(f"{dimension_name} cannot be negative")
    
    if dimension_float > MAX_DIMENSION_CM:
        raise SendcloudValidationError(f"{dimension_name} exceeds maximum ({MAX_DIMENSION_CM} cm)")
    
    return dimension_float


def get_shipping_methods(
    sender_address: str,
    sender_city: str,
    sender_postal_code: str,
    sender_country: str,
    receiver_address: str,
    receiver_city: str,
    receiver_postal_code: str,
    receiver_country: str,
    weight: float,
    length: Optional[float] = None,
    width: Optional[float] = None,
    height: Optional[float] = None,
) -> List[Dict]:
    """
    Get available shipping methods and prices from Sendcloud
    
    Args:
        sender_address: Sender street address
        sender_city: Sender city
        sender_postal_code: Sender postal/zip code
        sender_country: Sender country code (ISO 2-letter, e.g. 'NL', 'DE')
        receiver_address: Receiver street address
        receiver_city: Receiver city
        receiver_postal_code: Receiver postal/zip code
        receiver_country: Receiver country code (ISO 2-letter)
        weight: Package weight in kg
        length: Package length in cm (optional)
        width: Package width in cm (optional)
        height: Package height in cm (optional)
    
    Returns:
        List of shipping methods with prices:
        [
            {
                'id': 1,
                'name': 'PostNL',
                'carrier': 'postnl',
                'price': 6.25,
                'currency': 'EUR',
                'delivery_days': '2-3',
                'service_point_input': 'none'
            },
            ...
        ]
    
    Raises:
        SendcloudAPIError: If API call fails
        SendcloudValidationError: If input validation fails
    """
    
    # ✅ STEP 1: Validate all inputs before sending to API
    try:
        sender_address = validate_text_field(sender_address, "Sender address", max_length=200)
        sender_city = validate_text_field(sender_city, "Sender city", max_length=100)
        sender_postal_code = validate_postal_code(sender_postal_code)
        sender_country = validate_country_code(sender_country)
        
        receiver_address = validate_text_field(receiver_address, "Receiver address", max_length=200)
        receiver_city = validate_text_field(receiver_city, "Receiver city", max_length=100)
        receiver_postal_code = validate_postal_code(receiver_postal_code)
        receiver_country = validate_country_code(receiver_country)
        
        weight = validate_weight(weight)
        length = validate_dimension(length, "Length")
        width = validate_dimension(width, "Width")
        height = validate_dimension(height, "Height")
        
    except SendcloudValidationError as e:
        logger.warning(f"Input validation failed: {str(e)}")
        raise
    
    # ✅ Check if API keys are configured
    if not settings.SENDCLOUD_PUBLIC_KEY or not settings.SENDCLOUD_SECRET_KEY:
        logger.error("Sendcloud API keys are not configured in .env file")
        raise SendcloudAPIError("Sendcloud API credentials are missing. Please configure SENDCLOUD_PUBLIC_KEY and SENDCLOUD_SECRET_KEY.")
    
    # ✅ Using real Sendcloud API
    logger.info(f"🚀 Using Sendcloud API for shipping rates")
    
    # ✅ STEP 2: Prepare API request
    # API Documentation: GET /api/v2/shipping_methods
    # Accepted parameters: sender_address (ID), service_point_id, is_return
    # We call without sender_address ID and filter results locally
    url = f"{settings.SENDCLOUD_API_URL}shipping_methods"
    
    # Prepare authentication
    auth = HTTPBasicAuth(
        settings.SENDCLOUD_PUBLIC_KEY,
        settings.SENDCLOUD_SECRET_KEY
    )
    
    # ✅ NOTE: According to Sendcloud API docs, this endpoint only accepts:
    # - sender_address (ID number, not address text)  
    # - service_point_id (for service point delivery)
    # - is_return (boolean)
    # Since we don't have sender_address ID, we call without parameters
    params = {
        'is_return': 'false'  # We only want outgoing shipping methods
    }
    
    try:
        # ✅ STEP 2: Secure logging (no personal data)
        logger.info(f"Requesting Sendcloud shipping methods: {sender_country} → {receiver_country}, Weight: {weight}kg")
        
        # Make API request
        response = requests.get(
            url,
            auth=auth,
            params=params,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        # Check response status
        response.raise_for_status()
        
        # ✅ STEP 3: Validate response is valid JSON
        try:
            data = response.json()
        except ValueError:
            logger.error("Sendcloud API returned invalid JSON")
            raise SendcloudAPIError("Invalid JSON response from Sendcloud API")
        
        # ✅ STEP 4: Validate response structure
        if not isinstance(data, dict):
            logger.error("Sendcloud API response is not a dictionary")
            raise SendcloudAPIError("Invalid response structure from Sendcloud API")
        
        # Extract shipping methods
        shipping_methods = data.get('shipping_methods', [])
        
        if not isinstance(shipping_methods, list):
            logger.error("shipping_methods is not a list")
            raise SendcloudAPIError("Invalid shipping_methods format in response")
        
        if not shipping_methods:
            logger.warning("No shipping methods available for given parameters")
            return []
        
        # ✅ STEP 5: Filter and format shipping methods
        # According to Sendcloud API documentation, each method has:
        # - id, name, carrier, min_weight, max_weight
        # - countries array with price per country
        # We filter based on weight and destination country
        
        formatted_methods = []
        for idx, method in enumerate(shipping_methods):
            try:
                # Validate method is a dictionary
                if not isinstance(method, dict):
                    logger.warning(f"Shipping method {idx} is not a dictionary, skipping")
                    continue
                
                method_id = method.get('id')
                method_name = method.get('name')
                method_carrier = method.get('carrier')
                min_weight_str = method.get('min_weight')
                max_weight_str = method.get('max_weight')
                countries = method.get('countries', [])
                
                # Skip if essential fields are missing
                if not method_id or not method_name:
                    logger.warning(f"Shipping method {idx} missing id or name, skipping")
                    continue
                
                # ✅ Filter 1: Check weight range (if provided)
                if min_weight_str and max_weight_str:
                    try:
                        min_weight = float(min_weight_str)
                        max_weight = float(max_weight_str)
                        
                        # Check if parcel weight is within method's weight range
                        if weight < min_weight or weight > max_weight:
                            # Weight out of range, skip this method
                            continue
                    except (TypeError, ValueError):
                        # Invalid weight format, skip weight check but continue
                        logger.warning(f"Method {method_id} has invalid weight format, skipping weight filter")
                
                # ✅ Filter 2: Check if destination country is supported
                if not isinstance(countries, list):
                    # No countries data or invalid format, skip this method
                    logger.warning(f"Method {method_id} has invalid countries data, skipping")
                    continue
                
                # If countries array is empty, skip (no price info available)
                if not countries:
                    continue
                
                # Find the destination country in the countries array
                country_data = None
                for country in countries:
                    if isinstance(country, dict) and country.get('iso_2') == receiver_country:
                        country_data = country
                        break
                
                if not country_data:
                    # Destination country not supported by this method, skip
                    continue
                
                # ✅ Extract price from country data
                price = country_data.get('price')
                if price is None:
                    logger.warning(f"Method {method_id} has no price for {receiver_country}, skipping")
                    continue
                
                try:
                    price_float = float(price)
                    if price_float < 0:
                        logger.warning(f"Method {method_id} has negative price, skipping")
                        continue
                except (TypeError, ValueError):
                    logger.warning(f"Method {method_id} has invalid price format, skipping")
                    continue
                
                # ✅ Extract delivery time from country data (if available)
                lead_time_hours = country_data.get('lead_time_hours')
                delivery_days = 'N/A'
                if lead_time_hours:
                    try:
                        days = int(lead_time_hours) // 24
                        delivery_days = f"{days}" if days > 0 else "1"
                    except (TypeError, ValueError):
                        pass
                
                # ✅ Add formatted method to results
                formatted_methods.append({
                    'id': int(method_id),
                    'name': str(method_name)[:100],  # Limit name length
                    'carrier': str(method_carrier)[:50] if method_carrier else 'unknown',
                    'price': round(price_float, 2),  # Round to 2 decimals
                    'currency': 'EUR',  # Sendcloud uses EUR for EU shipping
                    'min_weight': str(min_weight_str) if min_weight_str else '0',
                    'max_weight': str(max_weight_str) if max_weight_str else 'N/A',
                    'delivery_days': delivery_days,
                    'service_point_input': str(method.get('service_point_input', 'none'))[:20],
                })
                
            except Exception as e:
                logger.error(f"Error processing shipping method {idx}: {type(e).__name__}")
                continue  # Skip this method and continue with others
        
        if not formatted_methods:
            logger.warning(f"No shipping methods available for {receiver_country} with weight {weight}kg after filtering")
            return []
        
        logger.info(f"Successfully filtered {len(formatted_methods)} shipping methods (from {len(shipping_methods)} total) for {receiver_country}")
        return formatted_methods
        
    except requests.exceptions.HTTPError as e:
        # ✅ STEP 6: Secure error logging (no sensitive data exposure)
        status_code = e.response.status_code if e.response else 'N/A'
        logger.error(f"Sendcloud API HTTP error: Status {status_code}")
        
        # Only log sanitized error details (not full response which may contain sensitive info)
        if e.response and status_code in [400, 401, 403, 404]:
            try:
                error_data = e.response.json()
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                logger.error(f"Sendcloud error message: {error_message[:200]}")  # Limit length
            except:
                pass  # Failed to parse error, skip detailed logging
        
        raise SendcloudAPIError(f"Sendcloud API error (status {status_code})")
        
    except requests.exceptions.Timeout:
        logger.error("Sendcloud API request timeout after 10 seconds")
        raise SendcloudAPIError("Sendcloud API request timeout")
        
    except requests.exceptions.RequestException as e:
        # Log error type without exposing full details
        error_type = type(e).__name__
        logger.error(f"Sendcloud API request failed: {error_type}")
        raise SendcloudAPIError("Failed to connect to Sendcloud API")
        
    except SendcloudValidationError:
        # Re-raise validation errors (already logged)
        raise
        
    except Exception as e:
        # Catch-all for unexpected errors
        error_type = type(e).__name__
        logger.error(f"Unexpected error in get_shipping_methods: {error_type}")
        raise SendcloudAPIError("Unexpected error while fetching shipping methods")


def create_parcel(
    shipment_data: Dict,
    selected_shipping_method: int,
) -> Dict:
    """
    Create a parcel in Sendcloud after payment confirmation
    
    Args:
        shipment_data: Dictionary containing shipment details
        selected_shipping_method: ID of selected shipping method
    
    Returns:
        {
            'sendcloud_id': 12345,
            'tracking_number': '3SABCD123456789',
            'tracking_url': 'https://...',
            'label_url': 'https://...',
            'status': 'announced'
        }
    
    Raises:
        SendcloudAPIError: If API call fails
        SendcloudValidationError: If input validation fails
    """
    
    # Validate API credentials
    if not settings.SENDCLOUD_PUBLIC_KEY or not settings.SENDCLOUD_SECRET_KEY:
        logger.error("Sendcloud API credentials not configured")
        raise SendcloudAPIError("Sendcloud API credentials missing")
    
    # ✅ Validate shipment_data structure
    if not isinstance(shipment_data, dict):
        raise SendcloudValidationError("shipment_data must be a dictionary")
    
    # ✅ Validate shipping method ID
    try:
        shipping_method_id = int(selected_shipping_method)
        if shipping_method_id <= 0:
            raise SendcloudValidationError("Shipping method ID must be positive")
    except (TypeError, ValueError):
        raise SendcloudValidationError("Invalid shipping method ID")
    
    # ✅ Validate required fields exist
    required_fields = [
        'receiver_name', 'receiver_address', 'receiver_city',
        'receiver_postal_code', 'receiver_country', 'weight'
    ]
    for field in required_fields:
        if field not in shipment_data or not shipment_data[field]:
            raise SendcloudValidationError(f"Missing required field: {field}")
    
    # ✅ Validate and sanitize fields
    try:
        receiver_name = validate_text_field(shipment_data['receiver_name'], "Receiver name", 100)
        receiver_address = validate_text_field(shipment_data['receiver_address'], "Receiver address", 200)
        receiver_city = validate_text_field(shipment_data['receiver_city'], "Receiver city", 100)
        receiver_postal_code = validate_postal_code(shipment_data['receiver_postal_code'])
        receiver_country = validate_country_code(shipment_data['receiver_country'])
        weight = validate_weight(shipment_data['weight'])
    except SendcloudValidationError as e:
        logger.warning(f"Parcel data validation failed: {str(e)}")
        raise
    
    # API endpoint
    url = f"{settings.SENDCLOUD_API_URL}parcels"
    
    # Prepare authentication
    auth = HTTPBasicAuth(
        settings.SENDCLOUD_PUBLIC_KEY,
        settings.SENDCLOUD_SECRET_KEY
    )
    
    # ✅ Prepare parcel data with validated fields only
    parcel_data = {
        'parcel': {
            'name': receiver_name,
            'address': receiver_address,
            'city': receiver_city,
            'postal_code': receiver_postal_code,
            'country': receiver_country,
            'weight': str(weight),
            'shipping_method': shipping_method_id,
            'request_label': True,
        }
    }
    
    # ✅ Add optional validated fields
    if 'receiver_company' in shipment_data and shipment_data['receiver_company']:
        company_name = validate_text_field(shipment_data['receiver_company'], "Company name", 100)
        parcel_data['parcel']['company_name'] = company_name
    
    if 'receiver_email' in shipment_data and shipment_data['receiver_email']:
        # Basic email validation (regex)
        email = str(shipment_data['receiver_email']).strip()
        if re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            parcel_data['parcel']['email'] = email[:200]
    
    if 'receiver_phone' in shipment_data and shipment_data['receiver_phone']:
        # Basic phone validation (remove non-digits, limit length)
        phone = re.sub(r'[^\d\+\s\-\(\)]', '', str(shipment_data['receiver_phone']))
        parcel_data['parcel']['telephone'] = phone[:30]
    
    if 'order_number' in shipment_data and shipment_data['order_number']:
        order_number = validate_text_field(shipment_data['order_number'], "Order number", 50)
        parcel_data['parcel']['order_number'] = order_number
    
    try:
        # ✅ Secure logging (no personal data)
        logger.info(f"Creating parcel in Sendcloud: Method {shipping_method_id}, Weight {weight}kg, Country {receiver_country}")
        
        # Make API request
        response = requests.post(
            url,
            auth=auth,
            json=parcel_data,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        # Check response status
        response.raise_for_status()
        
        # ✅ Validate response is valid JSON
        try:
            data = response.json()
        except ValueError:
            logger.error("Sendcloud API returned invalid JSON when creating parcel")
            raise SendcloudAPIError("Invalid JSON response from Sendcloud API")
        
        # ✅ Validate response structure
        if not isinstance(data, dict):
            logger.error("Sendcloud parcel creation response is not a dictionary")
            raise SendcloudAPIError("Invalid response structure from Sendcloud API")
        
        parcel = data.get('parcel', {})
        
        if not isinstance(parcel, dict):
            logger.error("Parcel data is not a dictionary")
            raise SendcloudAPIError("Invalid parcel data in response")
        
        # ✅ Validate required fields in response
        parcel_id = parcel.get('id')
        if not parcel_id:
            logger.error("Sendcloud did not return parcel ID")
            raise SendcloudAPIError("Missing parcel ID in Sendcloud response")
        
        # ✅ Build validated result
        result = {
            'sendcloud_id': int(parcel_id),
            'tracking_number': str(parcel.get('tracking_number', ''))[:100],
            'tracking_url': str(parcel.get('tracking_url', ''))[:500],
            'label_url': None,
            'status': 'announced',
            'carrier': str(parcel.get('carrier', {}).get('code', 'unknown'))[:50] if isinstance(parcel.get('carrier'), dict) else 'unknown',
        }
        
        # ✅ Extract label URL safely
        label_data = parcel.get('label', {})
        if isinstance(label_data, dict):
            normal_printer = label_data.get('normal_printer')
            if isinstance(normal_printer, list) and len(normal_printer) > 0:
                result['label_url'] = str(normal_printer[0])[:500]
        
        # ✅ Extract status safely
        status_data = parcel.get('status', {})
        if isinstance(status_data, dict):
            status_message = status_data.get('message')
            if status_message:
                result['status'] = str(status_message)[:50]
        
        logger.info(f"✅ Successfully created parcel with ID {result['sendcloud_id']}")
        return result
        
    except requests.exceptions.HTTPError as e:
        # ✅ Secure error logging
        status_code = e.response.status_code if e.response else 'N/A'
        logger.error(f"Sendcloud API HTTP error while creating parcel: Status {status_code}")
        
        # Only log sanitized error message
        if e.response and status_code in [400, 401, 403, 422]:
            try:
                error_data = e.response.json()
                if isinstance(error_data, dict):
                    error_msg = error_data.get('error', {}).get('message', 'Unknown')
                    logger.error(f"Sendcloud error: {str(error_msg)[:200]}")
            except:
                pass
        
        raise SendcloudAPIError(f"Failed to create parcel (HTTP {status_code})")
        
    except requests.exceptions.Timeout:
        logger.error("Sendcloud API timeout while creating parcel (15s)")
        raise SendcloudAPIError("Sendcloud API request timeout")
        
    except requests.exceptions.RequestException as e:
        error_type = type(e).__name__
        logger.error(f"Sendcloud request failed: {error_type}")
        raise SendcloudAPIError("Failed to connect to Sendcloud API")
        
    except SendcloudValidationError:
        raise
        
    except Exception as e:
        error_type = type(e).__name__
        logger.error(f"Unexpected error in create_parcel: {error_type}")
        raise SendcloudAPIError("Unexpected error while creating parcel")


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """
    Verify Sendcloud webhook signature to prevent fake webhooks
    
    Args:
        payload: Raw request body (bytes)
        signature: Signature from Sendcloud-Signature header
    
    Returns:
        True if signature is valid, False otherwise
    
    Security:
        This prevents attackers from sending fake webhook requests
        to manipulate shipment statuses or trigger actions
    """
    if not settings.SENDCLOUD_WEBHOOK_SECRET:
        logger.warning("Sendcloud webhook secret not configured - cannot verify signature")
        return False
    
    if not signature:
        logger.warning("Webhook signature missing")
        return False
    
    try:
        # ✅ Calculate expected signature using HMAC-SHA256
        expected_signature = hmac.new(
            settings.SENDCLOUD_WEBHOOK_SECRET.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # ✅ Compare signatures securely (constant-time comparison)
        is_valid = hmac.compare_digest(signature, expected_signature)
        
        if not is_valid:
            logger.error("⚠️ Webhook signature verification failed - possible fake webhook attempt!")
        
        return is_valid
        
    except Exception as e:
        logger.error(f"Error verifying webhook signature: {type(e).__name__}")
        return False


def parse_webhook_data(data: Dict) -> Dict:
    """
    Parse and validate Sendcloud webhook data
    
    Args:
        data: Webhook payload
    
    Returns:
        Validated and sanitized webhook data
        
    Raises:
        SendcloudValidationError: If webhook data is invalid
    """
    if not isinstance(data, dict):
        raise SendcloudValidationError("Webhook data must be a dictionary")
    
    # ✅ Validate essential fields exist
    parcel = data.get('parcel')
    if not isinstance(parcel, dict):
        raise SendcloudValidationError("Missing or invalid 'parcel' in webhook data")
    
    parcel_id = parcel.get('id')
    if not parcel_id:
        raise SendcloudValidationError("Missing parcel ID in webhook")
    
    # ✅ Extract and validate data
    try:
        validated_data = {
            'sendcloud_id': int(parcel_id),
            'tracking_number': str(parcel.get('tracking_number', ''))[:100],
            'status': 'unknown',
            'carrier': 'unknown',
        }
        
        # Extract status safely
        status_data = parcel.get('status', {})
        if isinstance(status_data, dict):
            status_message = status_data.get('message')
            if status_message:
                validated_data['status'] = str(status_message)[:50]
        
        # Extract carrier safely
        carrier_data = parcel.get('carrier', {})
        if isinstance(carrier_data, dict):
            carrier_code = carrier_data.get('code')
            if carrier_code:
                validated_data['carrier'] = str(carrier_code)[:50]
        
        return validated_data
        
    except (TypeError, ValueError) as e:
        raise SendcloudValidationError(f"Failed to parse webhook data: {str(e)}")

