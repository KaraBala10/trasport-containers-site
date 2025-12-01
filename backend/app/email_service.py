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

# Status display names for emails (base names, direction-specific handled by function)
STATUS_DISPLAY_NAMES = {
    "CREATED": "Created",
    "OFFER_SENT": "Offer Sent",
    "PENDING_PAYMENT": "Pending Payment",
    "PENDING_PICKUP": "Pending Pickup",
    "READY_FOR_DELIVERY": "Ready for Delivery",
    "OUT_FOR_DELIVERY": "Out for Delivery",
    "DELIVERED": "Delivered",
    "CANCELLED": "Cancelled",
}

# Direction-specific status display names
STATUS_DISPLAY_NAMES_EU_SY = {
    "IN_TRANSIT_TO_WATTWEG_5": "In Transit to Wattweg 5",
    "ARRIVED_WATTWEG_5": "Arrived Wattweg 5",
    "SORTING_WATTWEG_5": "Sorting Wattweg 5",
    "READY_FOR_EXPORT": "Ready for Export",
    "IN_TRANSIT_TO_DESTINATION": "In Transit to Syria",
    "ARRIVED_DESTINATION": "Arrived in Syria",
    "DESTINATION_SORTING": "Sorting in Syria",
}

STATUS_DISPLAY_NAMES_SY_EU = {
    "IN_TRANSIT_TO_WATTWEG_5": "In Transit to Aleppo",
    "ARRIVED_WATTWEG_5": "Arrived at Aleppo",
    "SORTING_WATTWEG_5": "Sorting at Aleppo",
    "READY_FOR_EXPORT": "Ready for Import",
    "IN_TRANSIT_TO_DESTINATION": "In Transit to Europe",
    "ARRIVED_DESTINATION": "Arrived in Europe",
    "DESTINATION_SORTING": "Sorting in Europe",
}


def get_status_display_name(status, direction=None):
    """
    Get status display name based on status and direction (for LCL shipments)

    Args:
        status: Status code (e.g., "IN_TRANSIT_TO_WATTWEG_5")
        direction: Direction for LCL shipments ("eu-sy" or "sy-eu"), None for FCL

    Returns:
        str: Display name for the status
    """
    # First check base names (common for all)
    if status in STATUS_DISPLAY_NAMES:
        return STATUS_DISPLAY_NAMES[status]

    # For LCL shipments, use direction-specific names
    if direction == "eu-sy":
        return STATUS_DISPLAY_NAMES_EU_SY.get(status, status)
    elif direction == "sy-eu":
        return STATUS_DISPLAY_NAMES_SY_EU.get(status, status)

    # Default fallback (for FCL or unknown direction)
    return status


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

        email_body += """

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
                    "Cannot send email: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send email: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD. For Gmail, you may need to use an App Password."
                )
            elif "535" in error_msg:
                logger.warning(
                    "Cannot send email: SMTP authentication failed. Check your email credentials."
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


def send_status_update_notification_to_admin(
    quote, old_status, new_status, offer_message=None
):
    """
    Send email notification to admin when FCL quote status is updated

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
            "Email not configured. Skipping status update notification to admin."
        )
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Get status display names
        old_status_display = STATUS_DISPLAY_NAMES.get(old_status, old_status)
        new_status_display = STATUS_DISPLAY_NAMES.get(new_status, new_status)

        # Get user info
        user_name = (
            quote.user.get_full_name() or quote.user.username
            if quote.user
            else "Unknown"
        )
        user_email = quote.user.email if quote.user else "Unknown"

        # Prepare email content
        subject = f"FCL Quote Status Updated - {quote.quote_number or f'#{quote.id}'}"

        # Build email body
        email_body = f"""
FCL Quote status has been updated.

Quote Details:
-------------------
Quote Number: {quote.quote_number or f'#{quote.id}'}
Customer: {user_name} ({user_email})
Route: {quote.origin_city}, {quote.origin_country} → {quote.destination_city}, {quote.destination_country}
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}

Status Update:
-------------------
Previous Status: {old_status_display}
New Status: {new_status_display}
Updated At: {quote.created_at.strftime('%Y-%m-%d %H:%M:%S')}
"""

        # Add offer message if status is OFFER_SENT
        if new_status == "OFFER_SENT" and offer_message:
            email_body += f"""

Offer Message Sent:
{offer_message}
"""

        # Add payment info if status is PENDING_PAYMENT
        if new_status == "PENDING_PAYMENT":
            if quote.total_price:
                email_body += f"""

Payment Information:
Total Price: €{quote.total_price:.2f}
Amount Paid: €{quote.amount_paid or 0:.2f}
"""
                if quote.total_price > 0:
                    payment_percentage = (
                        (quote.amount_paid or 0) / quote.total_price * 100
                        if quote.amount_paid
                        else 0
                    )
                    email_body += f"Payment Progress: {payment_percentage:.1f}%\n"

        email_body += """

You can view and manage this quote in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"Status update notification sent successfully to {admin_email} for quote {quote.quote_number or quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send status update notification to admin: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send status update notification to admin: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(
                    f"Cannot send status update notification to admin: {error_msg}"
                )
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending status update notification to admin: {str(e)}",
            exc_info=True,
        )
        return False


def send_edit_request_confirmation_to_user(quote, edit_message):
    """
    Send confirmation email to user when they request edit to an offer

    Args:
        quote: FCLQuote instance
        edit_message: Message from user requesting changes

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured. Skipping edit request confirmation email."
        )
        return False

    if not quote.user or not quote.user.email:
        logger.warning(f"Cannot send email: Quote {quote.id} has no user or user email")
        return False

    try:
        recipient_email = quote.user.email
        recipient_name = quote.user.get_full_name() or quote.user.username

        # Prepare email content
        subject = (
            f"Edit Request Submitted - FCL Quote #{quote.quote_number or quote.id}"
        )

        # Build email body
        email_body = f"""
Dear {recipient_name},

Thank you for submitting your edit request. We have received your request and will review it shortly.

Quote Details:
-------------------
Quote Number: {quote.quote_number or f'#{quote.id}'}
Route: {quote.origin_city}, {quote.origin_country} → {quote.destination_city}, {quote.destination_country}
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}

Your Edit Request:
-------------------
{edit_message}

Our team will review your request and get back to you soon. You will receive an email notification when we respond to your edit request.

You can view and manage your quote requests by logging into your dashboard.

If you have any questions, please don't hesitate to contact us.

Best regards,
Medo-Freight.eu Team
contact@medo-freight.eu
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
            logger.info(
                f"Edit request confirmation email sent successfully to {recipient_email} for quote {quote.quote_number or quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send edit request confirmation email: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send edit request confirmation email: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(
                    f"Cannot send edit request confirmation email: {error_msg}"
                )
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending edit request confirmation email: {str(e)}",
            exc_info=True,
        )
        return False


def send_edit_request_notification(quote, edit_message):
    """
    Send email notification to admin when user requests edit to an offer

    Args:
        quote: FCLQuote instance
        edit_message: Message from user requesting changes

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping edit request notification.")
        return False

    try:
        # Get admin email (you can configure this in settings or use DEFAULT_FROM_EMAIL)
        admin_email = settings.DEFAULT_FROM_EMAIL

        # Get user info
        user_name = (
            quote.user.get_full_name() or quote.user.username
            if quote.user
            else "Unknown"
        )
        user_email = quote.user.email if quote.user else "Unknown"

        # Prepare email content
        subject = f"Edit Request for FCL Quote #{quote.quote_number or quote.id}"

        # Build email body
        email_body = f"""
A user has requested edits to their FCL Quote offer.

Quote Number: {quote.quote_number or f'#{quote.id}'}
User: {user_name} ({user_email})
Route: {quote.origin_city}, {quote.origin_country} → {quote.destination_city}, {quote.destination_country}
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}

User's Edit Request:
{edit_message}

Please review the request and send a new offer to the user.

You can manage this quote in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"Edit request notification sent successfully to {admin_email} for quote {quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send edit request notification: SMTP server unreachable."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send edit request notification: SMTP authentication failed."
                )
            else:
                logger.warning(f"Cannot send edit request notification: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending edit request notification: {str(e)}",
            exc_info=True,
        )
        return False


def send_payment_reminder_notification_to_admin(quote):
    """
    Send email notification to admin when payment reminder is sent to user

    Args:
        quote: FCLQuote instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured. Skipping payment reminder notification to admin."
        )
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Get user info
        user_name = (
            quote.user.get_full_name() or quote.user.username
            if quote.user
            else "Unknown"
        )
        user_email = quote.user.email if quote.user else "Unknown"

        # Calculate payment percentage
        payment_percentage = 0
        remaining_amount = 0
        if quote.total_price and quote.total_price > 0:
            payment_percentage = ((quote.amount_paid or 0) / quote.total_price) * 100
            remaining_amount = quote.total_price - (quote.amount_paid or 0)

        # Prepare email content
        subject = f"Payment Reminder Sent - FCL Quote #{quote.quote_number or quote.id}"

        # Build email body
        email_body = f"""
A payment reminder has been sent to the customer.

Quote Details:
-------------------
Quote Number: {quote.quote_number or f'#{quote.id}'}
Customer: {user_name} ({user_email})
Route: {quote.origin_city}, {quote.origin_country} → {quote.destination_city}, {quote.destination_country}
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}
Current Status: {STATUS_DISPLAY_NAMES.get(quote.status, quote.status)}

Payment Information:
-------------------
Total Price: €{quote.total_price:.2f}
Amount Paid: €{quote.amount_paid or 0:.2f}
Payment Progress: {payment_percentage:.1f}%
"""

        if remaining_amount > 0:
            email_body += f"""
Remaining Amount: €{remaining_amount:.2f}
"""

        email_body += """

A payment reminder email has been sent to the customer. You can track the payment status in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"Payment reminder notification sent successfully to {admin_email} for quote {quote.quote_number or quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send payment reminder notification to admin: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send payment reminder notification to admin: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(
                    f"Cannot send payment reminder notification to admin: {error_msg}"
                )
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending payment reminder notification to admin: {str(e)}",
            exc_info=True,
        )
        return False


def send_payment_reminder_email(quote):
    """
    Send email reminder to user to complete payment

    Args:
        quote: FCLQuote instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping payment reminder.")
        return False

    if not quote.user or not quote.user.email:
        logger.warning(f"Cannot send email: Quote {quote.id} has no user or user email")
        return False

    try:
        recipient_email = quote.user.email
        recipient_name = quote.user.get_full_name() or quote.user.username

        # Calculate payment percentage
        payment_percentage = 0
        remaining_amount = 0
        if quote.total_price and quote.total_price > 0:
            payment_percentage = ((quote.amount_paid or 0) / quote.total_price) * 100
            remaining_amount = quote.total_price - (quote.amount_paid or 0)

        # Prepare email content
        subject = f"Payment Reminder - FCL Quote #{quote.quote_number or quote.id}"

        # Build email body
        email_body = f"""
Dear {recipient_name},

This is a friendly reminder to complete the payment for your FCL Quote.

Quote Number: {quote.quote_number or f'#{quote.id}'}
Route: {quote.origin_city}, {quote.origin_country} → {quote.destination_city}, {quote.destination_country}
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}
Current Status: {STATUS_DISPLAY_NAMES.get(quote.status, quote.status)}

Payment Information:
Total Price: €{quote.total_price:.2f}
Amount Paid: €{quote.amount_paid or 0:.2f}
Payment Progress: {payment_percentage:.1f}%
"""

        if remaining_amount > 0:
            email_body += f"""
Remaining Amount: €{remaining_amount:.2f}

Please complete the payment to continue with your shipment. Once payment is received, we will proceed with the next steps of your shipment process.
"""

        email_body += """
You can view your quote and payment details by logging into your dashboard.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
Medo-Freight.eu Team
contact@medo-freight.eu
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
            logger.info(
                f"Payment reminder email sent successfully to {recipient_email} for quote {quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send payment reminder: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send payment reminder: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send payment reminder: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending payment reminder email: {str(e)}",
            exc_info=True,
        )
        return False


def send_lcl_shipment_status_update_email(shipment, old_status, new_status):
    """
    Send email notification to user when LCL shipment status is updated

    Args:
        shipment: LCLShipment instance
        old_status: Previous status
        new_status: New status

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set. Skipping email notification."
        )
        return False

    if not shipment.user or not shipment.user.email:
        logger.warning(
            f"Cannot send email: Shipment {shipment.id} has no user or user email"
        )
        return False

    try:
        recipient_email = shipment.user.email
        recipient_name = shipment.user.get_full_name() or shipment.user.username

        # Get status display names (with direction support)
        old_status_display = get_status_display_name(old_status, shipment.direction)
        new_status_display = get_status_display_name(new_status, shipment.direction)

        # Prepare email content
        subject = (
            f"LCL Shipment #{shipment.shipment_number or shipment.id} - Status Updated"
        )

        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )
        # Build email body
        email_body = f"""
Dear {recipient_name},

Your LCL Shipment status has been updated.

Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Direction: {direction_display}
Sender: {shipment.sender_name}, {shipment.sender_city}, {shipment.sender_country}
Receiver: {shipment.receiver_name}, {shipment.receiver_city}, {shipment.receiver_country}

Status Update:
Previous Status: {old_status_display}
New Status: {new_status_display}
"""

        # Add payment info if status is PENDING_PAYMENT
        if new_status == "PENDING_PAYMENT":
            if shipment.total_price:
                email_body += f"""

Payment Information:
Total Price: €{shipment.total_price:.2f}
Amount Paid: €{shipment.amount_paid or 0:.2f}
"""
                if shipment.total_price > 0:
                    payment_percentage = (
                        (shipment.amount_paid or 0) / shipment.total_price * 100
                        if shipment.amount_paid
                        else 0
                    )
                    email_body += f"Payment Progress: {payment_percentage:.1f}%\n"

        email_body += """

You can view and manage your shipment by logging into your dashboard.

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
                fail_silently=True,
            )
            logger.info(
                f"Status update email sent successfully to {recipient_email} for shipment {shipment.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send email: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send email: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send email: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending status update email: {str(e)}",
            exc_info=True,
        )
        return False


def send_lcl_shipment_status_update_notification_to_admin(
    shipment, old_status, new_status
):
    """
    Send email notification to admin when LCL shipment status is updated

    Args:
        shipment: LCLShipment instance
        old_status: Previous status
        new_status: New status

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured. Skipping status update notification to admin."
        )
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Get status display names (with direction support)
        old_status_display = get_status_display_name(old_status, shipment.direction)
        new_status_display = get_status_display_name(new_status, shipment.direction)

        # Get user info
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"

        # Prepare email content
        subject = f"LCL Shipment Status Updated - {shipment.shipment_number or f'#{shipment.id}'}"

        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )
        # Build email body
        email_body = f"""
LCL Shipment status has been updated.

Shipment Details:
-------------------
Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Customer: {user_name} ({user_email})
Direction: {direction_display}
Sender: {shipment.sender_name}, {shipment.sender_city}, {shipment.sender_country}
Receiver: {shipment.receiver_name}, {shipment.receiver_city}, {shipment.receiver_country}

Status Update:
-------------------
Previous Status: {old_status_display}
New Status: {new_status_display}
Updated At: {shipment.updated_at.strftime('%Y-%m-%d %H:%M:%S')}
"""

        # Add payment info if status is PENDING_PAYMENT
        if new_status == "PENDING_PAYMENT":
            if shipment.total_price:
                email_body += f"""

Payment Information:
Total Price: €{shipment.total_price:.2f}
Amount Paid: €{shipment.amount_paid or 0:.2f}
"""
                if shipment.total_price > 0:
                    payment_percentage = (
                        (shipment.amount_paid or 0) / shipment.total_price * 100
                        if shipment.amount_paid
                        else 0
                    )
                    email_body += f"Payment Progress: {payment_percentage:.1f}%\n"

        email_body += """

You can view and manage this shipment in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"Status update notification sent successfully to admin for shipment {shipment.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send status update notification: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send status update notification: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send status update notification: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending status update notification: {str(e)}",
            exc_info=True,
        )
        return False


def send_lcl_shipment_confirmation_email(shipment):
    """
    Send confirmation email to user when a new LCL shipment is created

    Args:
        shipment: LCLShipment instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured. Skipping LCL shipment confirmation email."
        )
        return False

    if not shipment.user or not shipment.user.email:
        logger.warning(
            f"Cannot send email: Shipment {shipment.id} has no user or user email"
        )
        return False

    try:
        recipient_email = shipment.user.email
        recipient_name = shipment.user.get_full_name() or shipment.user.username

        # Prepare email content
        subject = f"LCL Shipment Confirmation - {shipment.shipment_number or f'#{shipment.id}'}"

        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )
        # Build email body
        email_body = f"""
Dear {recipient_name},

Thank you for creating your LCL Shipment. We have received your shipment request and will process it shortly.

Shipment Details:
-------------------
Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Status: {get_status_display_name(shipment.status, shipment.direction)}
Direction: {direction_display}
Created At: {shipment.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Sender Information:
-------------------
Name: {shipment.sender_name}
Email: {shipment.sender_email}
Phone: {shipment.sender_phone}
Address: {shipment.sender_address}
City: {shipment.sender_city}
Country: {shipment.sender_country}

Receiver Information:
-------------------
Name: {shipment.receiver_name}
Email: {shipment.receiver_email}
Phone: {shipment.receiver_phone}
Address: {shipment.receiver_address}
City: {shipment.receiver_city}
Country: {shipment.receiver_country}
"""

        # Add pricing info if available
        if shipment.total_price and shipment.total_price > 0:
            email_body += f"""

Pricing Information:
-------------------
Total Price: €{shipment.total_price:.2f}
Amount Paid: €{shipment.amount_paid or 0:.2f}
"""

        email_body += """

Our team will review your shipment request and process it accordingly. You will receive email notifications when your shipment status is updated.

You can view and track your shipment by logging into your dashboard.

If you have any questions, please don't hesitate to contact us.

Best regards,
Medo-Freight.eu Team
contact@medo-freight.eu
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
            logger.info(
                f"LCL shipment confirmation email sent successfully to {recipient_email} for shipment {shipment.shipment_number or shipment.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send LCL shipment confirmation email: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send LCL shipment confirmation email: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(
                    f"Cannot send LCL shipment confirmation email: {error_msg}"
                )
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending LCL shipment confirmation email: {str(e)}",
            exc_info=True,
        )
        return False


def send_lcl_shipment_notification_to_admin(shipment):
    """
    Send email notification to admin when a new LCL shipment is created

    Args:
        shipment: LCLShipment instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping LCL shipment notification.")
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Prepare email content
        subject = f"New LCL Shipment Request - {shipment.shipment_number or f'#{shipment.id}'}"

        # Get user info
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"

        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )
        # Build email body
        email_body = f"""
A new LCL Shipment request has been received.

Shipment Details:
-------------------
Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Status: {get_status_display_name(shipment.status, shipment.direction)}
Direction: {direction_display}
Created At: {shipment.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Customer Information:
-------------------
User: {user_name} ({user_email})

Sender Information:
-------------------
Name: {shipment.sender_name}
Email: {shipment.sender_email}
Phone: {shipment.sender_phone}
Address: {shipment.sender_address}
City: {shipment.sender_city}
Country: {shipment.sender_country}

Receiver Information:
-------------------
Name: {shipment.receiver_name}
Email: {shipment.receiver_email}
Phone: {shipment.receiver_phone}
Address: {shipment.receiver_address}
City: {shipment.receiver_city}
Country: {shipment.receiver_country}
"""

        # Add pricing info if available
        if shipment.total_price and shipment.total_price > 0:
            email_body += f"""

Pricing Information:
-------------------
Total Price: €{shipment.total_price:.2f}
Amount Paid: €{shipment.amount_paid or 0:.2f}
"""

        email_body += """

You can view and manage this shipment in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"LCL shipment notification sent successfully to admin for shipment {shipment.shipment_number or shipment.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send LCL shipment notification: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send LCL shipment notification: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send LCL shipment notification: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending LCL shipment notification: {str(e)}",
            exc_info=True,
        )
        return False


def send_lcl_shipment_payment_reminder_email(shipment):
    """
    Send email reminder to user to complete payment for LCL shipment

    Args:
        shipment: LCLShipment instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping payment reminder.")
        return False

    if not shipment.user or not shipment.user.email:
        logger.warning(
            f"Cannot send email: Shipment {shipment.id} has no user or user email"
        )
        return False

    try:
        recipient_email = shipment.user.email
        recipient_name = shipment.user.get_full_name() or shipment.user.username

        # Calculate payment percentage
        payment_percentage = 0
        remaining_amount = 0
        if shipment.total_price and shipment.total_price > 0:
            payment_percentage = (
                (shipment.amount_paid or 0) / shipment.total_price
            ) * 100
            remaining_amount = shipment.total_price - (shipment.amount_paid or 0)

        # Prepare email content
        subject = f"Payment Reminder - LCL Shipment #{shipment.shipment_number or shipment.id}"

        # Build email body
        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )
        email_body = f"""
Dear {recipient_name},

This is a friendly reminder to complete the payment for your LCL Shipment.

Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Direction: {direction_display}
Sender: {shipment.sender_name}, {shipment.sender_city}, {shipment.sender_country}
Receiver: {shipment.receiver_name}, {shipment.receiver_city}, {shipment.receiver_country}
Current Status: {STATUS_DISPLAY_NAMES.get(shipment.status, shipment.status)}

Payment Information:
Total Price: €{shipment.total_price:.2f}
Amount Paid: €{shipment.amount_paid or 0:.2f}
Payment Progress: {payment_percentage:.1f}%
"""

        if remaining_amount > 0:
            email_body += f"""
Remaining Amount: €{remaining_amount:.2f}

Please complete the payment to continue with your shipment. Once payment is received, we will proceed with the next steps of your shipment process.
"""

        email_body += """
You can view your shipment and payment details by logging into your dashboard.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
Medo-Freight.eu Team
contact@medo-freight.eu
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
            logger.info(
                f"Payment reminder email sent successfully to {recipient_email} for shipment {shipment.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send payment reminder: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send payment reminder: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send payment reminder: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending payment reminder email: {str(e)}",
            exc_info=True,
        )
        return False


def send_lcl_shipment_payment_reminder_notification_to_admin(shipment):
    """
    Send email notification to admin when payment reminder is sent to user for LCL shipment

    Args:
        shipment: LCLShipment instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning(
            "Email not configured. Skipping payment reminder notification to admin."
        )
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Get user info
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"

        # Calculate payment percentage
        payment_percentage = 0
        remaining_amount = 0
        if shipment.total_price and shipment.total_price > 0:
            payment_percentage = (
                (shipment.amount_paid or 0) / shipment.total_price
            ) * 100
            remaining_amount = shipment.total_price - (shipment.amount_paid or 0)

        # Prepare email content
        subject = f"Payment Reminder Sent - LCL Shipment #{shipment.shipment_number or shipment.id}"

        direction_display = (
            "Europe to Syria" if shipment.direction == "eu-sy" else "Syria to Europe"
        )
        # Build email body
        email_body = f"""
A payment reminder has been sent to the customer.

Shipment Details:
-------------------
Shipment Number: {shipment.shipment_number or f'#{shipment.id}'}
Customer: {user_name} ({user_email})
Direction: {direction_display}
Sender: {shipment.sender_name}, {shipment.sender_city}, {shipment.sender_country}
Receiver: {shipment.receiver_name}, {shipment.receiver_city}, {shipment.receiver_country}
Current Status: {STATUS_DISPLAY_NAMES.get(shipment.status, shipment.status)}

Payment Information:
-------------------
Total Price: €{shipment.total_price:.2f}
Amount Paid: €{shipment.amount_paid or 0:.2f}
Payment Progress: {payment_percentage:.1f}%
"""

        if remaining_amount > 0:
            email_body += f"""
Remaining Amount: €{remaining_amount:.2f}
"""

        email_body += """

A payment reminder email has been sent to the customer. You can track the payment status in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"Payment reminder notification sent successfully to {admin_email} for shipment {shipment.shipment_number or shipment.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send payment reminder notification to admin: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send payment reminder notification to admin: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(
                    f"Cannot send payment reminder notification to admin: {error_msg}"
                )
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending payment reminder notification to admin: {str(e)}",
            exc_info=True,
        )
        return False


def send_contact_form_notification(contact_message):
    """
    Send email notification to admin when a contact form is submitted

    Args:
        contact_message: ContactMessage instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping contact form notification.")
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Prepare email content
        subject = f"New Contact Form Submission - {contact_message.subject}"

        # Build email body
        email_body = f"""
A new contact form submission has been received.

Submission Details:
-------------------
Full Name: {contact_message.full_name}
Email: {contact_message.email}
Phone: {contact_message.phone}
Subject: {contact_message.subject}
Submitted At: {contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Message:
-------------------
{contact_message.message}

-------------------
You can view and manage contact messages in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"Contact form notification sent successfully to {admin_email} for message {contact_message.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send contact form notification: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send contact form notification: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send contact form notification: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending contact form notification: {str(e)}",
            exc_info=True,
        )
        return False


def send_fcl_quote_confirmation_email(quote):
    """
    Send confirmation email to user when a new FCL quote is submitted

    Args:
        quote: FCLQuote instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping FCL quote confirmation email.")
        return False

    if not quote.user or not quote.user.email:
        logger.warning(f"Cannot send email: Quote {quote.id} has no user or user email")
        return False

    try:
        recipient_email = quote.user.email
        recipient_name = quote.user.get_full_name() or quote.user.username

        # Prepare email content
        subject = (
            f"FCL Quote Request Confirmation - {quote.quote_number or f'#{quote.id}'}"
        )

        # Build email body
        email_body = f"""
Dear {recipient_name},

Thank you for submitting your FCL Quote request. We have received your request and will process it shortly.

Quote Details:
-------------------
Quote Number: {quote.quote_number or f'#{quote.id}'}
Status: {quote.get_status_display()}
Submitted At: {quote.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Route Details:
-------------------
Origin: {quote.origin_city}, {quote.origin_country}
Port of Loading: {quote.port_of_loading}
Destination: {quote.destination_city}, {quote.destination_country}
Port of Discharge: {quote.port_of_discharge}

Container Details:
-------------------
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}
Cargo Ready Date: {quote.cargo_ready_date.strftime('%Y-%m-%d')}

Cargo Details:
-------------------
Commodity Type: {quote.commodity_type}
Usage Type: {quote.get_usage_type_display()}
Total Weight: {quote.total_weight} KG
Total Volume: {quote.total_volume} CBM
Cargo Value: {quote.cargo_value} EUR

Our team will review your request and send you an offer soon. You will receive an email notification when your quote status is updated.

You can view and track your quote request by logging into your dashboard.

If you have any questions, please don't hesitate to contact us.

Best regards,
Medo-Freight.eu Team
contact@medo-freight.eu
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=True,
            )
            logger.info(
                f"FCL quote confirmation email sent successfully to {recipient_email} for quote {quote.quote_number or quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send FCL quote confirmation email: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send FCL quote confirmation email: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send FCL quote confirmation email: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending FCL quote confirmation email: {str(e)}",
            exc_info=True,
        )
        return False


def send_fcl_quote_notification(quote):
    """
    Send email notification to admin when a new FCL quote is submitted

    Args:
        quote: FCLQuote instance

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping FCL quote notification.")
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )

        # Prepare email content
        subject = f"New FCL Quote Request - {quote.quote_number or f'#{quote.id}'}"

        # Build email body
        email_body = f"""
A new FCL Quote request has been received.

Quote Details:
-------------------
Quote Number: {quote.quote_number or f'#{quote.id}'}
Status: {quote.get_status_display()}
Created At: {quote.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Customer Information:
-------------------
Full Name: {quote.full_name}
Email: {quote.email}
Phone: {quote.phone}
Company: {quote.company_name or 'N/A'}
Country: {quote.country}
Preferred Contact: {quote.get_preferred_contact_display()}

Route Details:
-------------------
Origin: {quote.origin_city}, {quote.origin_country}
Port of Loading: {quote.port_of_loading}
Destination: {quote.destination_city}, {quote.destination_country}
Port of Discharge: {quote.port_of_discharge}

Container Details:
-------------------
Container Type: {quote.get_container_type_display()}
Number of Containers: {quote.number_of_containers}
Cargo Ready Date: {quote.cargo_ready_date.strftime('%Y-%m-%d')}

Cargo Details:
-------------------
Commodity Type: {quote.commodity_type}
Usage Type: {quote.get_usage_type_display()}
Total Weight: {quote.total_weight} KG
Total Volume: {quote.total_volume} CBM
Cargo Value: {quote.cargo_value} EUR
Is Dangerous: {'Yes' if quote.is_dangerous else 'No'}
"""

        if quote.is_dangerous:
            email_body += f"""
Dangerous Goods Details:
UN Number: {quote.un_number or 'N/A'}
Dangerous Class: {quote.dangerous_class or 'N/A'}
"""

        email_body += f"""
Additional Services:
-------------------
Pickup Required: {'Yes' if quote.pickup_required else 'No'}
"""

        if quote.pickup_required:
            email_body += f"Pickup Address: {quote.pickup_address or 'N/A'}\n"

        email_body += f"""
Forklift Available: {'Yes' if quote.forklift_available else 'No'}
EU Export Clearance: {'Yes' if quote.eu_export_clearance else 'No'}
Cargo Insurance: {'Yes' if quote.cargo_insurance else 'No'}
On-carriage: {'Yes' if quote.on_carriage else 'No'}

-------------------
You can view and manage this quote in the admin dashboard.
"""

        # Send email with fail_silently=True to prevent exceptions
        try:
            send_mail(
                subject=subject,
                message=strip_tags(email_body),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],
                fail_silently=True,
            )
            logger.info(
                f"FCL quote notification sent successfully to {admin_email} for quote {quote.quote_number or quote.id}"
            )
            return True
        except (smtplib.SMTPException, gaierror, OSError) as smtp_error:
            error_msg = str(smtp_error)
            if "Network is unreachable" in error_msg:
                logger.warning(
                    "Cannot send FCL quote notification: SMTP server unreachable. Check network connection and EMAIL_HOST setting."
                )
            elif (
                "Username and Password not accepted" in error_msg
                or "BadCredentials" in error_msg
            ):
                logger.warning(
                    "Cannot send FCL quote notification: SMTP authentication failed. Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD."
                )
            else:
                logger.warning(f"Cannot send FCL quote notification: {error_msg}")
            return False

    except Exception as e:
        logger.error(
            f"Unexpected error sending FCL quote notification: {str(e)}",
            exc_info=True,
        )
        return False


def send_invoice_email_to_user(shipment, pdf_bytes):
    """
    Send invoice PDF to user via email.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping invoice email to user.")
        return False
    
    try:
        from django.core.mail import EmailMessage
        from io import BytesIO
        
        # Get user email
        user_email = shipment.receiver_email or shipment.user.email if shipment.user else None
        if not user_email:
            logger.warning(f"No email found for shipment {shipment.id}")
            return False
        
        # Get status display name
        status_display = get_status_display_name(shipment.status, shipment.direction)
        
        # Determine language based on user preference (default: Arabic)
        # For now, we'll use Arabic
        language = 'ar'
        
        # Email subject
        subject_ar = f"فاتورتك جاهزة - شحنة {shipment.shipment_number}"
        subject_en = f"Your Invoice is Ready - Shipment {shipment.shipment_number}"
        subject = subject_ar if language == 'ar' else subject_en
        
        # Email body
        body_ar = f"""
        مرحباً {shipment.receiver_name},
        
        تم توليد فاتورتك بنجاح لشحنتك رقم {shipment.shipment_number}.
        
        يمكنك تحميل الفاتورة من المرفقات أو من لوحة التحكم الخاصة بك.
        
        تفاصيل الشحنة:
        - رقم الشحنة: {shipment.shipment_number}
        - الحالة: {status_display['ar']}
        - المبلغ الإجمالي: €{shipment.total_price}
        - المبلغ المدفوع: €{shipment.amount_paid}
        
        شكراً لتعاملكم معنا!
        
        Medo-Freight EU
        """
        
        body_en = f"""
        Hello {shipment.receiver_name},
        
        Your invoice has been successfully generated for shipment {shipment.shipment_number}.
        
        You can download the invoice from the attachments or from your dashboard.
        
        Shipment Details:
        - Shipment Number: {shipment.shipment_number}
        - Status: {status_display['en']}
        - Total Amount: €{shipment.total_price}
        - Amount Paid: €{shipment.amount_paid}
        
        Thank you for your business!
        
        Medo-Freight EU
        """
        
        body = body_ar if language == 'ar' else body_en
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )
        
        # Attach PDF
        email.attach(
            f"Invoice-{shipment.shipment_number}.pdf",
            pdf_bytes,
            'application/pdf'
        )
        
        # Send email
        email.send()
        
        logger.info(f"✅ Invoice email sent to user {user_email} for shipment {shipment.id}")
        return True
        
    except Exception as e:
        logger.error(
            f"Error sending invoice email to user: {str(e)}",
            exc_info=True
        )
        return False


def send_invoice_email_to_admin(shipment, pdf_bytes):
    """
    Send invoice PDF to admin via email.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping invoice email to admin.")
        return False
    
    try:
        from django.core.mail import EmailMessage
        
        # Get admin email
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )
        
        # Get user info
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"
        
        # Email subject
        subject = f"Invoice Generated - Shipment {shipment.shipment_number}"
        
        # Email body
        body = f"""
        Invoice has been generated for shipment {shipment.shipment_number}.
        
        Shipment Details:
        - Shipment Number: {shipment.shipment_number}
        - User: {user_name} ({user_email})
        - Status: {shipment.get_status_display()}
        - Payment Status: {shipment.payment_status}
        - Total Amount: €{shipment.total_price}
        - Amount Paid: €{shipment.amount_paid}
        - Payment Method: {shipment.get_payment_method_display() if shipment.payment_method else 'N/A'}
        
        Invoice is attached.
        """
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
        )
        
        # Attach PDF
        email.attach(
            f"Invoice-{shipment.shipment_number}.pdf",
            pdf_bytes,
            'application/pdf'
        )
        
        # Send email
        email.send()
        
        logger.info(f"✅ Invoice email sent to admin for shipment {shipment.id}")
        return True
        
    except Exception as e:
        logger.error(
            f"Error sending invoice email to admin: {str(e)}",
            exc_info=True
        )
        return False


def send_consolidated_export_invoice_email_to_admin(shipment, pdf_bytes):
    """
    Send Consolidated Export Invoice PDF to admin via email.
    This document is for export/customs purposes and is only sent to admin.

    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping consolidated export invoice email to admin.")
        return False

    try:
        from django.core.mail import EmailMessage

        admin_email = (
            settings.ADMIN_EMAIL
            if getattr(settings, "ADMIN_EMAIL", None)
            else settings.DEFAULT_FROM_EMAIL
        )

        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"

        subject = (
            f"Consolidated Export Invoice Generated – Shipment {shipment.shipment_number}"
        )

        body = f"""
Consolidated Export Invoice – Mixed Shipment (Personal & Commercial Goods) has been generated.

Shipment Details:
- Shipment Number: {shipment.shipment_number}
- User: {user_name} ({user_email})
- Status: {shipment.get_status_display()}
- Payment Status: {shipment.payment_status}
- Total Amount: €{shipment.total_price}
- Amount Paid: €{shipment.amount_paid}

This document is for export/customs records only and is not shared with the customer.
        """

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
        )

        email.attach(
            f"Consolidated-Export-Invoice-{shipment.shipment_number}.pdf",
            pdf_bytes,
            "application/pdf",
        )

        email.send()

        logger.info(
            f"✅ Consolidated export invoice email sent to admin for shipment {shipment.id}"
        )
        return True

    except Exception as e:
        logger.error(
            f"Error sending consolidated export invoice email to admin: {str(e)}",
            exc_info=True,
        )
        return False


def send_shipping_labels_email_to_user(shipment, pdf_bytes, num_labels=None):
    """
    Send shipping labels PDF to user via email.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
        num_labels: Number of labels generated (optional)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping shipping labels email to user.")
        return False
    
    try:
        from django.core.mail import EmailMessage
        from io import BytesIO
        
        # Get user email
        user_email = shipment.receiver_email or shipment.user.email if shipment.user else None
        if not user_email:
            logger.warning(f"No email found for shipment {shipment.id}")
            return False
        
        # Get status display name
        status_display = get_status_display_name(shipment.status, shipment.direction)
        
        # Determine language based on user preference (default: Arabic)
        language = 'ar'
        
        # Email subject
        subject_ar = f"ملصقات الشحن جاهزة - شحنة {shipment.shipment_number}"
        subject_en = f"Shipping Labels Ready - Shipment {shipment.shipment_number}"
        subject = subject_ar if language == 'ar' else subject_en
        
        # Email body
        body_ar = f"""
        مرحباً {shipment.receiver_name},
        
        تم توليد ملصقات الشحن بنجاح لشحنتك رقم {shipment.shipment_number}.
        
        يمكنك تحميل الملصقات من المرفقات أو من لوحة التحكم الخاصة بك.
        
        تفاصيل الشحنة:
        - رقم الشحنة: {shipment.shipment_number}
        - الحالة: {status_display['ar']}
        - عدد الملصقات: {num_labels if num_labels else 'حسب عدد الطرود'}
        
        شكراً لتعاملكم معنا!
        
        Medo-Freight EU
        """
        
        body_en = f"""
        Hello {shipment.receiver_name},
        
        Your shipping labels have been successfully generated for shipment {shipment.shipment_number}.
        
        You can download the labels from the attachments or from your dashboard.
        
        Shipment Details:
        - Shipment Number: {shipment.shipment_number}
        - Status: {status_display['en']}
        - Number of Labels: {num_labels if num_labels else 'Based on number of parcels'}
        
        Thank you for your business!
        
        Medo-Freight EU
        """
        
        body = body_ar if language == 'ar' else body_en
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )
        
        # Attach PDF
        email.attach(
            f"Shipping-Labels-{shipment.shipment_number}.pdf",
            pdf_bytes,
            'application/pdf'
        )
        
        # Send email
        email.send()
        
        logger.info(f"✅ Shipping labels email sent to user {user_email} for shipment {shipment.id}")
        return True
        
    except Exception as e:
        logger.error(
            f"Error sending shipping labels email to user: {str(e)}",
            exc_info=True
        )
        return False


def send_shipping_labels_email_to_admin(shipment, pdf_bytes, num_labels=None):
    """
    Send shipping labels PDF to admin via email.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
        num_labels: Number of labels generated (optional)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping shipping labels email to admin.")
        return False
    
    try:
        from django.core.mail import EmailMessage
        
        # Get admin email
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )
        
        # Get user info
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"
        
        # Email subject
        subject = f"Shipping Labels Generated - Shipment {shipment.shipment_number}"
        
        # Email body
        body = f"""
        Shipping labels have been generated for shipment {shipment.shipment_number}.
        
        Shipment Details:
        - Shipment Number: {shipment.shipment_number}
        - User: {user_name} ({user_email})
        - Status: {shipment.get_status_display()}
        - Number of Labels: {num_labels if num_labels else 'Based on number of parcels'}
        
        Shipping labels are attached.
        """
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
        )
        
        # Attach PDF
        email.attach(
            f"Shipping-Labels-{shipment.shipment_number}.pdf",
            pdf_bytes,
            'application/pdf'
        )
        
        # Send email
        email.send()
        
        logger.info(f"✅ Shipping labels email sent to admin for shipment {shipment.id}")
        return True
        
    except Exception as e:
        logger.error(
            f"Error sending shipping labels email to admin: {str(e)}",
            exc_info=True
        )
        return False


def send_receipt_email_to_user(shipment, pdf_bytes):
    """
    Send receipt PDF to user via email.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping receipt email to user.")
        return False
    
    try:
        from django.core.mail import EmailMessage
        from io import BytesIO
        
        # Get user email
        user_email = shipment.receiver_email or shipment.user.email if shipment.user else None
        if not user_email:
            logger.warning(f"No email found for shipment {shipment.id}")
            return False
        
        # Get status display name
        status_display_dict = get_status_display_name(shipment.status, shipment.direction)
        # status_display_name returns a string, not a dict, so we'll use it directly
        status_display_text = status_display_dict if isinstance(status_display_dict, str) else status_display_dict.get('ar', str(status_display_dict))
        
        # Determine language based on user preference (default: Arabic)
        language = 'ar'
        
        # Email subject
        subject_ar = f"إيصال استلام شحنتك - شحنة {shipment.shipment_number}"
        subject_en = f"Receipt for Your Shipment - Shipment {shipment.shipment_number}"
        subject = subject_ar if language == 'ar' else subject_en
        
        # Email body
        body_ar = f"""
        مرحباً {shipment.receiver_name},
        
        تم استلام شحنتك رقم {shipment.shipment_number} بنجاح.
        
        يمكنك تحميل إيصال الاستلام من المرفقات أو من لوحة التحكم الخاصة بك.
        
        تفاصيل الشحنة:
        - رقم الشحنة: {shipment.shipment_number}
        - الحالة: {status_display_text}
        
        شكراً لتعاملكم معنا!
        
        Medo-Freight EU
        """
        
        body_en = f"""
        Hello {shipment.receiver_name},
        
        Your shipment {shipment.shipment_number} has been received successfully.
        
        You can download the receipt from the attachments or from your dashboard.
        
        Shipment Details:
        - Shipment Number: {shipment.shipment_number}
        - Status: {status_display_text}
        
        Thank you for your business!
        
        Medo-Freight EU
        """
        
        body = body_ar if language == 'ar' else body_en
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )
        
        # Attach PDF
        email.attach(
            f"Receipt-{shipment.shipment_number}.pdf",
            pdf_bytes,
            'application/pdf'
        )
        
        # Send email
        logger.info(f"📧 Sending receipt email to user {user_email} for shipment {shipment.id}")
        email.send()
        logger.info(f"✅ Receipt email sent successfully to user {user_email} for shipment {shipment.id}")
        return True
        
    except Exception as e:
        logger.error(
            f"Error sending receipt email to user: {str(e)}",
            exc_info=True
        )
        return False


def send_receipt_email_to_admin(shipment, pdf_bytes):
    """
    Send receipt PDF to admin via email.
    
    Args:
        shipment: LCLShipment instance
        pdf_bytes: PDF file bytes
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        logger.warning("Email not configured. Skipping receipt email to admin.")
        return False
    
    try:
        from django.core.mail import EmailMessage
        
        # Get admin email
        admin_email = (
            settings.ADMIN_EMAIL
            if settings.ADMIN_EMAIL
            else settings.DEFAULT_FROM_EMAIL
        )
        
        # Get user info
        user_name = (
            shipment.user.get_full_name() or shipment.user.username
            if shipment.user
            else "Unknown"
        )
        user_email = shipment.user.email if shipment.user else "Unknown"
        
        # Email subject
        subject = f"Receipt Generated - Shipment {shipment.shipment_number}"
        
        # Email body
        body = f"""
        Receipt has been generated for shipment {shipment.shipment_number}.
        
        Shipment Details:
        - Shipment Number: {shipment.shipment_number}
        - User: {user_name} ({user_email})
        - Status: {shipment.get_status_display()}
        - Direction: {shipment.get_direction_display()}
        
        Receipt is attached.
        """
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin_email],
        )
        
        # Attach PDF
        email.attach(
            f"Receipt-{shipment.shipment_number}.pdf",
            pdf_bytes,
            'application/pdf'
        )
        
        # Send email
        logger.info(f"📧 Sending receipt email to admin {admin_email} for shipment {shipment.id}")
        email.send()
        logger.info(f"✅ Receipt email sent successfully to admin {admin_email} for shipment {shipment.id}")
        return True
        
    except Exception as e:
        logger.error(
            f"Error sending receipt email to admin: {str(e)}",
            exc_info=True
        )
        return False