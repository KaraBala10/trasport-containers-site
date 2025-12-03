"""
reCAPTCHA verification utility (supports both Enterprise and standard v3)
"""

import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def verify_recaptcha_v3_token(token: str, action: str = None) -> dict:
    """
    Verify standard reCAPTCHA v3 token using Google's verification API

    Args:
        token: The token from grecaptcha.execute()
        action: Optional action name to verify against

    Returns:
        dict with 'success' (bool) and 'score' (float) if successful
    """
    secret_key = getattr(settings, "RECAPTCHA_SECRET_KEY", None)

    if not secret_key:
        logger.warning("reCAPTCHA secret key not configured")
        return {"success": False, "error": "reCAPTCHA secret key not configured"}

    if not token:
        return {"success": False, "error": "Token is required"}

    # Standard reCAPTCHA v3 verification endpoint
    url = "https://www.google.com/recaptcha/api/siteverify"

    data = {"secret": secret_key, "response": token}

    try:
        response = requests.post(url, data=data, timeout=10)

        if response.status_code == 200:
            result = response.json()

            success = result.get("success", False)
            score = result.get("score", 0.0)
            action_returned = result.get("action")

            # Verify action matches if provided
            action_match = True
            if action:
                action_match = action_returned == action

            # Get score threshold from settings (default 0.3 for better user experience)
            score_threshold = getattr(settings, "RECAPTCHA_SCORE_THRESHOLD", 0.3)

            # Consider valid if success, action matches, and score meets threshold (>= for inclusive)
            is_valid = success and action_match and score >= score_threshold

            # Build error message if validation failed
            error_message = None
            if not is_valid:
                error_parts = []
                if not success:
                    error_codes = result.get("error-codes", [])
                    if error_codes:
                        error_parts.append(
                            f"Google API errors: {', '.join(error_codes)}"
                        )
                    else:
                        error_parts.append("Google API returned success=false")
                if not action_match:
                    error_parts.append(
                        f"Action mismatch: expected '{action}', got '{action_returned}'"
                    )
                if score < score_threshold:
                    error_parts.append(
                        f"Score too low: {score} (minimum {score_threshold} required)"
                    )
                error_message = (
                    "; ".join(error_parts) if error_parts else "Verification failed"
                )

            result_dict = {
                "success": is_valid,
                "score": score,
                "action": action_returned,
                "action_match": action_match,
                "error_codes": result.get("error-codes", []),
            }
            if error_message:
                result_dict["error"] = error_message

            return result_dict
        else:
            logger.error(
                f"reCAPTCHA v3 API error: {response.status_code} - {response.text}"
            )
            return {"success": False, "error": f"API error: {response.status_code}"}

    except requests.exceptions.RequestException as e:
        logger.error(f"reCAPTCHA v3 verification failed: {str(e)}")
        return {"success": False, "error": f"Request failed: {str(e)}"}
    except Exception as e:
        logger.error(f"reCAPTCHA v3 verification error: {str(e)}")
        return {"success": False, "error": f"Verification error: {str(e)}"}


def verify_recaptcha_enterprise_token(token: str, action: str = None) -> dict:
    """
    Verify reCAPTCHA Enterprise token using Google Cloud API

    Args:
        token: The token from grecaptcha.enterprise.execute()
        action: Optional action name to verify against

    Returns:
        dict with 'success' (bool) and 'score' (float) if successful
    """
    api_key = getattr(settings, "RECAPTCHA_ENTERPRISE_API_KEY", None)
    project_id = getattr(settings, "RECAPTCHA_ENTERPRISE_PROJECT_ID", None)
    site_key = getattr(settings, "RECAPTCHA_SITE_KEY", None) or getattr(
        settings, "NEXT_PUBLIC_RECAPTCHA_SITE_KEY", None
    )

    if not api_key or not project_id or not site_key:
        logger.warning("reCAPTCHA Enterprise configuration missing")
        return {"success": False, "error": "reCAPTCHA Enterprise not configured"}

    if not token:
        return {"success": False, "error": "Token is required"}

    # Prepare request body
    request_body = {
        "event": {
            "token": token,
            "siteKey": site_key,
        }
    }

    if action:
        request_body["event"]["expectedAction"] = action

    # Make API request
    url = f"https://recaptchaenterprise.googleapis.com/v1/projects/{project_id}/assessments?key={api_key}"

    try:
        response = requests.post(
            url,
            json=request_body,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )

        if response.status_code == 200:
            data = response.json()

            # Check if token is valid
            token_properties = data.get("tokenProperties", {})
            is_valid = token_properties.get("valid", False)
            action_match = True

            if action:
                action_match = token_properties.get("action") == action

            # Get risk score (0.0 to 1.0, higher is better)
            risk_analysis = data.get("riskAnalysis", {})
            score = risk_analysis.get("score", 0.0)

            # Get score threshold from settings (default 0.3 for better user experience)
            score_threshold = getattr(settings, "RECAPTCHA_SCORE_THRESHOLD", 0.3)

            # Consider valid if token is valid, action matches, and score meets threshold (>= for inclusive)
            success = is_valid and action_match and score >= score_threshold

            return {
                "success": success,
                "score": score,
                "action": token_properties.get("action"),
                "valid": is_valid,
                "action_match": action_match,
            }
        else:
            logger.error(
                f"reCAPTCHA Enterprise API error: {response.status_code} - {response.text}"
            )
            return {"success": False, "error": f"API error: {response.status_code}"}

    except requests.exceptions.RequestException as e:
        logger.error(f"reCAPTCHA Enterprise verification failed: {str(e)}")
        return {"success": False, "error": f"Request failed: {str(e)}"}
    except Exception as e:
        logger.error(f"reCAPTCHA Enterprise verification error: {str(e)}")
        return {"success": False, "error": f"Verification error: {str(e)}"}


def verify_recaptcha_token(token: str, action: str = None) -> dict:
    """
    Verify standard reCAPTCHA v3 token
    """
    if not token:
        return {"success": False, "error": "Token is required"}

    return verify_recaptcha_v3_token(token, action)
