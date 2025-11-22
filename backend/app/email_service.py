"""
Email service for sending notifications to users
"""

import logging
import smtplib
from socket import gaierror

from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

# Status display names for emails
STATUS_DISPLAY_NAMES = {
    "CREATED": "Created",
    "OFFER_SENT": "Offer Sent",
    "PENDING_PAYMENT": "Pending Payment",
    "PENDING_PICKUP": "Pending Pickup",
    "IN_TRANSIT_TO_AXEL": "In Transit to Axel",
    "ARRIVED_AXEL": "Arrived Axel",
    "SORTING_AXEL": "Sorting Axel",
    "READY_FOR_EXPORT": "Ready for Export",
    "IN_TRANSIT_TO_SYRIA": "In Transit to Syria",
    "ARRIVED_SYRIA": "Arrived Syria",
    "SYRIA_SORTING": "Syria Sorting",
    "READY_FOR_DELIVERY": "Ready for Delivery",
    "OUT_FOR_DELIVERY": "Out for Delivery",
    "DELIVERED": "Delivered",
    "CANCELLED": "Cancelled",
}


def send_status_update_email(quote, old_status, new_status, offer_message=None):
    """
    Send email notification to user when FCL quote status is updated

    Args:
        quote: FCLQuote instance
        old_status: Previous status
        new_status: New status
        offer_message: Optional offer message if status is OFFER_SENT

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set. Skipping email notification."
        )
        return False

    if not quote.user or not quote.user.email:
        logger.warning(f"Cannot send email: Quote {quote.id} has no user or user email")
        return False

    try:
        recipient_email = quote.user.email
        recipient_name = quote.user.get_full_name() or quote.user.username

        # Get status display names
        old_status_display = STATUS_DISPLAY_NAMES.get(old_status, old_status)
        new_status_display = STATUS_DISPLAY_NAMES.get(new_status, new_status)

        # Prepare email content
        subject = f"FCL Quote #{quote.quote_number or quote.id} - Status Updated"

        # Build email body
        email_body = f"""
Dear {recipient_name},

Your FCL Quote request status has been updated.

Quote Number: {quote.quote_number or f'#{quote.id}'}
Route: {quote.origin_city}, {quote.origin_country} → {quote.destination_city}, {quote.destination_country}
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}

Status Update:
Previous Status: {old_status_display}
New Status: {new_status_display}
"""

        # Add offer message if status is OFFER_SENT
        if new_status == "OFFER_SENT" and offer_message:
            email_body += f"""

Offer Message:
{offer_message}

Please log in to your dashboard to view the full offer details and respond.
"""
        elif new_status == "OFFER_SENT":
            email_body += "\n\nAn offer has been sent. Please log in to your dashboard to view the offer details.\n"

        email_body += f"""

You can view and manage your quote requests by logging into your dashboard.

Best regards,
Medo-Freight.eu Team
contact@medo-freight.eu
"""

        # Send email with fail_silently=True to prevent exceptions from blocking status updates
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,  # Changed to True to prevent exceptions
            )
            logger.info(
                f"Status update email sent successfully to {recipient_email} for quote {quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            # Handle specific SMTP errors gracefully
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    f"Cannot send email: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    f"Cannot send email: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD. For Gmail, you may need to use an App Password."
                )
            elif "535" in error_msg:
                logger.warning(
                    f"Cannot send email: SMTP authentication failed. Check your email credentials."
                )
            else:
                logger.warning(f"Cannot send email: {error_msg}")
            return False

    except Exception as e:
        # Catch any other unexpected errors
        logger.error(
            f"Unexpected error sending status update email: {str(e)}", exc_info=True
        )
        return False
