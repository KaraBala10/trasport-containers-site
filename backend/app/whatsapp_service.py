"""
WhatsApp messaging service using Twilio
"""

import logging

from django.conf import settings
from twilio.rest import Client

logger = logging.getLogger(__name__)


def format_phone_number(phone: str) -> str:
    """
    Format phone number to E.164 format for WhatsApp

    Args:
        phone: Phone number in any format

    Returns:
        str: Formatted phone number in E.164 format
    """
    if not phone:
        return ""

    # Remove all non-digit characters except +
    cleaned = "".join(c for c in phone if c.isdigit() or c == "+")

    # If it doesn't start with +, try to add it
    # Note: This is a simple implementation. You may need to add country code detection
    # For now, we'll assume numbers starting with 0 are local and need country code
    if not cleaned.startswith("+"):
        # If it starts with 0, remove it (common in some countries)
        if cleaned.startswith("0"):
            cleaned = cleaned[1:]
        # Add + prefix
        cleaned = "+" + cleaned

    return cleaned


def send_whatsapp_message(to_number: str, message: str) -> bool:
    """
    Send WhatsApp message via Twilio

    Args:
        to_number: Recipient phone number in E.164 format (e.g., +31683083916)
        message: Message content to send

    Returns:
        bool: True if message sent successfully, False otherwise
    """
    # Check if Twilio is configured
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio not configured. Skipping WhatsApp message.")
        return False

    if not settings.TWILIO_WHATSAPP_FROM_NUMBER:
        logger.warning(
            "Twilio WhatsApp from number not configured. Skipping WhatsApp message."
        )
        return False

    try:
        # Initialize Twilio client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Format the 'from' number for WhatsApp (must be whatsapp:+...)
        from_number = settings.TWILIO_WHATSAPP_FROM_NUMBER
        if not from_number.startswith("whatsapp:"):
            from_number = f"whatsapp:{from_number}"

        # Format the 'to' number for WhatsApp
        to_number_formatted = to_number
        if not to_number_formatted.startswith("whatsapp:"):
            to_number_formatted = f"whatsapp:{to_number_formatted}"

        # Send WhatsApp message
        message_obj = client.messages.create(
            body=message, from_=from_number, to=to_number_formatted
        )

        logger.info(
            f"WhatsApp message sent successfully to {to_number}. "
            f"Message SID: {message_obj.sid}"
        )
        return True

    except Exception as e:
        logger.error(
            f"Failed to send WhatsApp message to {to_number}: {str(e)}", exc_info=True
        )
        return False


def send_lcl_shipment_whatsapp_notification(
    shipment, send_to_admin: bool = True, send_to_user: bool = True
):
    """
    Send WhatsApp notification when LCL shipment is created
    Sends to both admin and user (if phone numbers are available)

    Args:
        shipment: LCLShipment instance
        send_to_admin: Whether to send notification to admin (default: True)
        send_to_user: Whether to send notification to user (default: True)

    Returns:
        dict: Dictionary with 'admin' and 'user' keys indicating success status
    """
    results = {"admin": False, "user": False}

    try:
        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )

        # Admin message with full details
        admin_message = f"""🚚 New LCL Shipment Created

Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Direction: {direction_display}
Status: {shipment.get_status_display()}

Sender: {shipment.sender_name}
Email: {shipment.sender_email}
Phone: {shipment.sender_phone}

Receiver: {shipment.receiver_name}
Email: {shipment.receiver_email}
Phone: {shipment.receiver_phone}

Total Price: €{shipment.total_price:.2f if shipment.total_price else 0:.2f}
Created: {shipment.created_at.strftime('%Y-%m-%d %H:%M:%S')}

View in dashboard for more details."""

        # User confirmation message
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else shipment.sender_name
        )
        user_message = f"""✅ LCL Shipment Confirmation

Dear {user_name},

Thank you for creating your LCL Shipment!

Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Direction: {direction_display}
Status: {shipment.get_status_display()}
Total Price: €{shipment.total_price:.2f if shipment.total_price else 0:.2f}

We have received your shipment request and will process it shortly. You will receive email notifications when your shipment status is updated.

You can view and track your shipment by logging into your dashboard.

Best regards,
Medo-Freight.eu Team"""

        # Send to admin
        if send_to_admin and settings.TWILIO_ADMIN_WHATSAPP_NUMBER:
            results["admin"] = send_whatsapp_message(
                settings.TWILIO_ADMIN_WHATSAPP_NUMBER, admin_message
            )

        # Send to user (use sender phone number)
        if send_to_user and shipment.sender_phone:
            # Format phone number to E.164 format
            user_phone = format_phone_number(shipment.sender_phone)
            if user_phone:
                results["user"] = send_whatsapp_message(user_phone, user_message)
            else:
                logger.warning(
                    f"Could not format user phone number: {shipment.sender_phone}"
                )

        return results

    except Exception as e:
        logger.error(
            f"Failed to send LCL shipment WhatsApp notification: {str(e)}",
            exc_info=True,
        )
        return results


def send_fcl_quote_whatsapp_notification(
    quote, send_to_admin: bool = True, send_to_user: bool = True
):
    """
    Send WhatsApp notification when FCL quote is created
    Sends to both admin and user (if phone numbers are available)

    Args:
        quote: FCLQuote instance
        send_to_admin: Whether to send notification to admin (default: True)
        send_to_user: Whether to send notification to user (default: True)

    Returns:
        dict: Dictionary with 'admin' and 'user' keys indicating success status
    """
    results = {"admin": False, "user": False}

    try:
        # Admin message with full details
        admin_message = f"""📦 New FCL Quote Request

Quote Number: {quote.quote_number or f'#{quote.id}'}
Status: {quote.get_status_display()}

Customer: {quote.full_name}
Email: {quote.email}
Phone: {quote.phone}

Origin: {quote.port_of_loading}, {quote.origin_country}
Destination: {quote.port_of_discharge}, {quote.destination_country}

Container Type: {quote.container_type}
Cargo Type: {quote.cargo_type}

Created: {quote.created_at.strftime('%Y-%m-%d %H:%M:%S')}

View in dashboard for more details."""

        # User confirmation message
        user_message = f"""✅ FCL Quote Request Confirmation

Dear {quote.full_name},

Thank you for submitting your FCL Quote Request!

Quote Number: {quote.quote_number or f'#{quote.id}'}
Status: {quote.get_status_display()}

Origin: {quote.port_of_loading}, {quote.origin_country}
Destination: {quote.port_of_discharge}, {quote.destination_country}
Container Type: {quote.container_type}

We have received your quote request and will contact you soon with pricing and further details.

You can view and track your quote by logging into your dashboard.

Best regards,
Medo-Freight.eu Team"""

        # Send to admin
        if send_to_admin and settings.TWILIO_ADMIN_WHATSAPP_NUMBER:
            results["admin"] = send_whatsapp_message(
                settings.TWILIO_ADMIN_WHATSAPP_NUMBER, admin_message
            )

        # Send to user (use quote phone number)
        if send_to_user and quote.phone:
            # Format phone number to E.164 format
            user_phone = format_phone_number(quote.phone)
            if user_phone:
                results["user"] = send_whatsapp_message(user_phone, user_message)
            else:
                logger.warning(f"Could not format user phone number: {quote.phone}")

        return results

    except Exception as e:
        logger.error(
            f"Failed to send FCL quote WhatsApp notification: {str(e)}", exc_info=True
        )
        return results


def send_contact_form_whatsapp_notification(
    contact_message, recipient_number: str = None
):
    """
    Send WhatsApp notification when contact form is submitted

    Args:
        contact_message: ContactMessage instance
        recipient_number: Optional recipient phone number. If not provided, uses admin number

    Returns:
        bool: True if message sent successfully, False otherwise
    """
    if not recipient_number:
        recipient_number = settings.TWILIO_ADMIN_WHATSAPP_NUMBER

    if not recipient_number:
        logger.warning(
            "No WhatsApp recipient number configured. Skipping WhatsApp notification."
        )
        return False

    try:
        message = f"""📧 New Contact Form Submission

Subject: {contact_message.subject}

From: {contact_message.full_name}
Email: {contact_message.email}
Phone: {contact_message.phone}

Message:
{contact_message.message}

Submitted: {contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Please respond to the customer as soon as possible."""

        return send_whatsapp_message(recipient_number, message)

    except Exception as e:
        logger.error(
            f"Failed to send contact form WhatsApp notification: {str(e)}",
            exc_info=True,
        )
        return False
