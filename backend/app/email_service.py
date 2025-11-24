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
    "IN_TRANSIT_TO_WATTWEG_5": "In Transit to Wattweg 5",
    "ARRIVED_WATTWEG_5": "Arrived Wattweg 5",
    "SORTING_WATTWEG_5": "Sorting Wattweg 5",
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


def send_status_update_notification_to_admin(quote, old_status, new_status, offer_message=None):
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
        logger.warning("Email not configured. Skipping status update notification to admin.")
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = settings.ADMIN_EMAIL if settings.ADMIN_EMAIL else settings.DEFAULT_FROM_EMAIL

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
                logger.warning(f"Cannot send status update notification to admin: {error_msg}")
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
        logger.warning("Email not configured. Skipping edit request confirmation email.")
        return False

    if not quote.user or not quote.user.email:
        logger.warning(f"Cannot send email: Quote {quote.id} has no user or user email")
        return False

    try:
        recipient_email = quote.user.email
        recipient_name = quote.user.get_full_name() or quote.user.username

        # Prepare email content
        subject = f"Edit Request Submitted - FCL Quote #{quote.quote_number or quote.id}"

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
                logger.warning(f"Cannot send edit request confirmation email: {error_msg}")
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
        logger.warning("Email not configured. Skipping payment reminder notification to admin.")
        return False

    try:
        # Get admin email (use ADMIN_EMAIL from settings if configured, otherwise use DEFAULT_FROM_EMAIL)
        admin_email = settings.ADMIN_EMAIL if settings.ADMIN_EMAIL else settings.DEFAULT_FROM_EMAIL

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
                logger.warning(f"Cannot send payment reminder notification to admin: {error_msg}")
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
        admin_email = settings.ADMIN_EMAIL if settings.ADMIN_EMAIL else settings.DEFAULT_FROM_EMAIL

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
        subject = f"FCL Quote Request Confirmation - {quote.quote_number or f'#{quote.id}'}"

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
        admin_email = settings.ADMIN_EMAIL if settings.ADMIN_EMAIL else settings.DEFAULT_FROM_EMAIL

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
