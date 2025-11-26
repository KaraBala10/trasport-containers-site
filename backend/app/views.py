import logging
import traceback
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

try:
    from mollie.api.client import Client as MollieClient

    MOLLIE_AVAILABLE = True
except ImportError:
    MOLLIE_AVAILABLE = False

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from .email_service import (
    send_contact_form_notification,
    send_edit_request_confirmation_to_user,
    send_fcl_quote_confirmation_email,
    send_fcl_quote_notification,
    send_payment_reminder_email,
    send_payment_reminder_notification_to_admin,
    send_status_update_email,
    send_status_update_notification_to_admin,
)
from .models import (
    City,
    ContactMessage,
    Country,
    EditRequestMessage,
    FCLQuote,
    PackagingPrice,
    Port,
    Price,
    ProductRequest,
)
from .serializers import (
    ChangePasswordSerializer,
    CitySerializer,
    ContactMessageSerializer,
    CountrySerializer,
    EditRequestMessageSerializer,
    FCLQuoteSerializer,
    PackagingPriceSerializer,
    PortSerializer,
    PriceSerializer,
    ProductRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "message": "Login successful",
            },
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # Token might already be blacklisted or invalid
                pass
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Override update to allow partial updates"""
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


class ContactMessageView(generics.CreateAPIView):
    """API endpoint for submitting contact form messages"""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]  # Allow anyone to submit contact form

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact_message = serializer.save()

        # Send email notification to admin
        try:
            send_contact_form_notification(contact_message)
        except Exception as email_error:
            logger = logging.getLogger(__name__)
            logger.error(
                f"Failed to send contact form notification: {str(email_error)}"
            )
            # Don't fail the request if email fails

        return Response(
            {
                "success": True,
                "message": "Your message has been sent successfully. We will contact you soon.",
                "id": contact_message.id,
            },
            status=status.HTTP_201_CREATED,
        )


class FCLQuoteView(generics.CreateAPIView):
    """API endpoint for submitting FCL quote requests"""

    queryset = FCLQuote.objects.all()
    serializer_class = FCLQuoteSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        # ensures user is always set on the quote
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        logger = logging.getLogger(__name__)

        if settings.DEBUG:
            logger.debug(f"Request data keys: {list(request.data.keys())}")
            logger.debug(
                f"Authenticated user: {request.user} (ID: {request.user.id if request.user.is_authenticated else 'N/A'})"
            )

        if not request.user.is_authenticated:
            return Response(
                {"success": False, "error": "User not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # let DRF handle validation and object creation
        # perform_create will be called automatically and set the user
        response = super().create(request, *args, **kwargs)

        quote_id = response.data.get("id")

        # Generate quote number in format: MF-{ORIGIN}-{DEST}-FCL-{YEAR}-{COUNTER}
        quote_number = None
        if quote_id is not None:
            try:
                # Get the quote object to access origin and destination countries
                quote = FCLQuote.objects.get(id=quote_id)

                # Helper function to get country code
                def get_country_code(country_name):
                    """Convert country name to 2-letter code"""
                    if not country_name:
                        return "XX"

                    country_name_upper = country_name.upper().strip()

                    # Common country mappings
                    country_map = {
                        # European countries
                        "ROMANIA": "RO",
                        "IRELAND": "IE",
                        "GERMANY": "DE",
                        "FRANCE": "FR",
                        "ITALY": "IT",
                        "SPAIN": "ES",
                        "NETHERLANDS": "NL",
                        "BELGIUM": "BE",
                        "POLAND": "PL",
                        "GREECE": "GR",
                        "PORTUGAL": "PT",
                        "AUSTRIA": "AT",
                        "SWEDEN": "SE",
                        "DENMARK": "DK",
                        "FINLAND": "FI",
                        "EUROPE": "EU",
                        "EU": "EU",
                        # Middle East
                        "SYRIA": "SY",
                        "LEBANON": "LB",
                        "JORDAN": "JO",
                        "TURKEY": "TR",
                        "EGYPT": "EG",
                        "SAUDI ARABIA": "SA",
                        "UAE": "AE",
                        "UNITED ARAB EMIRATES": "AE",
                        # If already a 2-letter code, return as is
                    }

                    # Check if it's already a 2-letter code
                    if len(country_name_upper) == 2:
                        return country_name_upper

                    # Check mapping
                    if country_name_upper in country_map:
                        return country_map[country_name_upper]

                    # Try to extract first 2 letters if it's a common pattern
                    # Otherwise return first 2 letters of the country name
                    return (
                        country_name_upper[:2] if len(country_name_upper) >= 2 else "XX"
                    )

                origin_code = get_country_code(quote.origin_country)
                dest_code = get_country_code(quote.destination_country)
                current_year = (
                    quote.created_at.year if quote.created_at else datetime.now().year
                )
                counter = quote_id

                quote_number = (
                    f"MF-{origin_code}-{dest_code}-FCL-{current_year}-{counter:05d}"
                )

                # Save quote number to database
                quote.quote_number = quote_number
                quote.save(update_fields=["quote_number"])

            except Exception as e:
                logger.error(f"Error generating quote number: {str(e)}")
                # Fallback to simple format
                quote_number = f"FCL-{quote_id:06d}" if quote_id is not None else None
                if quote_number and quote_id:
                    try:
                        quote = FCLQuote.objects.get(id=quote_id)
                        quote.quote_number = quote_number
                        quote.save(update_fields=["quote_number"])
                    except Exception:
                        pass

        # Send email notifications
        if quote_id is not None:
            try:
                quote = FCLQuote.objects.get(id=quote_id)
                # Send email to admin
                send_fcl_quote_notification(quote)
                # Send confirmation email to user
                send_fcl_quote_confirmation_email(quote)
            except Exception as email_error:
                logger.error(
                    f"Failed to send FCL quote email notifications: {str(email_error)}"
                )
                # Don't fail the request if email fails

        return Response(
            {
                "success": True,
                "message": "Your FCL quote request has been submitted successfully. We will contact you soon.",
                "id": quote_id,
                "quote_number": quote_number,
            },
            status=response.status_code,
        )


class FCLQuoteListView(generics.ListAPIView):
    """API endpoint to list user's FCL quotes (or all quotes for admin)"""

    serializer_class = FCLQuoteSerializer
    authentication_classes = [JWTAuthentication]  # Explicitly use JWT authentication
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return quotes for the authenticated user, or all quotes if admin"""
        if settings.DEBUG:
            logger = logging.getLogger(__name__)
            logger.debug(
                f"Fetching quotes for user: {self.request.user} (ID: {self.request.user.id if self.request.user.is_authenticated else 'N/A'})"
            )

        if not self.request.user.is_authenticated:
            return FCLQuote.objects.none()

        # If user is superuser, return all quotes
        if self.request.user.is_superuser:
            queryset = FCLQuote.objects.all().order_by("-created_at")
            if settings.DEBUG:
                logger.debug(f"Admin user - Found {queryset.count()} total quotes")
        else:
            # Regular user - only their quotes
            queryset = FCLQuote.objects.filter(user=self.request.user).order_by(
                "-created_at"
            )
            if settings.DEBUG:
                logger.debug(
                    f"Regular user - Found {queryset.count()} quotes for user {self.request.user.id}"
                )

        return queryset


class FCLQuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint to retrieve, update, or delete a specific FCL quote"""

    serializer_class = FCLQuoteSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """Return quotes for the authenticated user, or all quotes if admin"""
        if not self.request.user.is_authenticated:
            return FCLQuote.objects.none()
        # Admin can access all quotes, regular users only their own
        if self.request.user.is_superuser:
            return FCLQuote.objects.all()
        return FCLQuote.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        """Update FCL quote"""
        instance = self.get_object()

        # Check if user is not admin and quote status is PENDING_PAYMENT or later
        if not request.user.is_superuser:
            locked_statuses = [
                "PENDING_PAYMENT",
                "PENDING_PICKUP",
                "IN_TRANSIT_TO_WATTWEG_5",
                "ARRIVED_WATTWEG_5",
                "SORTING_WATTWEG_5",
                "READY_FOR_EXPORT",
                "IN_TRANSIT_TO_SYRIA",
                "ARRIVED_SYRIA",
                "SYRIA_SORTING",
                "READY_FOR_DELIVERY",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ]
            if instance.status in locked_statuses:
                return Response(
                    {
                        "success": False,
                        "error": "Cannot edit quote after payment process has started. Only admins can edit quotes in this status.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "success": True,
                "message": "FCL quote updated successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        """Delete FCL quote"""
        instance = self.get_object()

        # Check if user is not admin and quote status is PENDING_PAYMENT or later
        if not request.user.is_superuser:
            locked_statuses = [
                "PENDING_PAYMENT",
                "PENDING_PICKUP",
                "IN_TRANSIT_TO_WATTWEG_5",
                "ARRIVED_WATTWEG_5",
                "SORTING_WATTWEG_5",
                "READY_FOR_EXPORT",
                "IN_TRANSIT_TO_SYRIA",
                "ARRIVED_SYRIA",
                "SYRIA_SORTING",
                "READY_FOR_DELIVERY",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ]
            if instance.status in locked_statuses:
                return Response(
                    {
                        "success": False,
                        "error": "Cannot delete quote after payment process has started. Only admins can delete quotes in this status.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "FCL quote deleted successfully."},
            status=status.HTTP_200_OK,
        )


@api_view(["POST"])
@permission_classes([AllowAny])  # Allow anyone to calculate CBM
def calculate_cbm_view(request):
    """API endpoint to calculate CBM (Cubic Meters) from dimensions in centimeters"""
    try:
        length = float(request.data.get("length", 0))
        width = float(request.data.get("width", 0))
        height = float(request.data.get("height", 0))

        # Validate inputs
        if length <= 0 or width <= 0 or height <= 0:
            return Response(
                {
                    "success": False,
                    "error": "Length, width, and height must be greater than 0",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate CBM: (Length * Width * Height) / 1,000,000
        # This converts from cm³ to m³
        cbm = (length * width * height) / 1000000

        return Response(
            {
                "success": True,
                "cbm": round(cbm, 6),  # Round to 6 decimal places
                "formula": f"({length} × {width} × {height}) / 1,000,000 = {cbm:.6f} m³",
            },
            status=status.HTTP_200_OK,
        )
    except (ValueError, TypeError):
        return Response(
            {"success": False, "error": "Invalid input. Please provide valid numbers."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error calculating CBM: {str(e)}")
        return Response(
            {"success": False, "error": "An error occurred while calculating CBM."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])  # Allow anyone to calculate pricing
def calculate_pricing_view(request):
    """API endpoint to calculate pricing based on parcels and Price table"""
    try:
        parcels_data = request.data.get("parcels", [])

        if not parcels_data or len(parcels_data) == 0:
            return Response(
                {
                    "success": False,
                    "error": "No parcels provided",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_price_by_weight = 0
        total_price_by_cbm = 0
        total_packaging_cost = 0
        calculations = []
        packaging_calculations = []

        # Calculate pricing for each parcel using Price table
        for parcel_data in parcels_data:
            product_id = parcel_data.get("productCategory")
            packaging_id = parcel_data.get("packagingType")
            weight = float(parcel_data.get("weight", 0))
            cbm = float(parcel_data.get("cbm", 0))
            repeat_count = int(parcel_data.get("repeatCount", 1))

            # Calculate packaging cost even if no product category
            if packaging_id:
                try:
                    packaging = PackagingPrice.objects.get(id=int(packaging_id))
                    # Packaging cost is multiplied by repeat count
                    packaging_cost = float(packaging.price) * repeat_count
                    total_packaging_cost += packaging_cost

                    packaging_calculations.append(
                        {
                            "packaging_id": packaging_id,
                            "packaging_name": (
                                packaging.ar_option
                                if request.data.get("language") == "ar"
                                else packaging.en_option
                            ),
                            "dimension": packaging.dimension,
                            "price_per_unit": float(packaging.price),
                            "repeat_count": repeat_count,
                            "total_cost": round(packaging_cost, 2),
                        }
                    )
                except PackagingPrice.DoesNotExist:
                    logger = logging.getLogger(__name__)
                    logger.warning(f"PackagingPrice with id {packaging_id} not found")
                except (ValueError, TypeError) as e:
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Invalid packaging data: {str(e)}")

            # Skip product pricing if no product category
            if not product_id:
                continue

            try:
                # Get price from Price table
                price = Price.objects.get(id=int(product_id))

                # Calculate for this parcel (accounting for repeat count)
                parcel_weight = weight * repeat_count
                parcel_cbm = cbm * repeat_count

                # Calculate: Weight * price_per_kg, CBM * one_cbm
                price_by_weight = parcel_weight * float(price.price_per_kg)
                price_by_cbm = parcel_cbm * float(price.one_cbm)

                total_price_by_weight += price_by_weight
                total_price_by_cbm += price_by_cbm

                calculations.append(
                    {
                        "product_id": product_id,
                        "product_name": (
                            price.ar_item
                            if request.data.get("language") == "ar"
                            else price.en_item
                        ),
                        "weight": parcel_weight,
                        "cbm": parcel_cbm,
                        "price_per_kg": float(price.price_per_kg),
                        "one_cbm": float(price.one_cbm),
                        "price_by_weight": round(price_by_weight, 2),
                        "price_by_cbm": round(price_by_cbm, 2),
                    }
                )
            except Price.DoesNotExist:
                logger = logging.getLogger(__name__)
                logger.warning(f"Price with id {product_id} not found")
                continue
            except (ValueError, TypeError) as e:
                logger = logging.getLogger(__name__)
                logger.warning(f"Invalid data for parcel: {str(e)}")
                continue

        # Calculate Base LCL Price: max(priceByWeight, priceByCBM, 75)
        base_lcl_price = max(total_price_by_weight, total_price_by_cbm, 75)

        # Grand Total = Base LCL Price + packaging + insurance
        calculation_total = base_lcl_price + total_packaging_cost

        # Calculate insurance if declaredShipmentValue is provided
        declared_shipment_value = float(
            request.data.get("declaredShipmentValue", 0) or 0
        )
        insurance_cost = 0
        if declared_shipment_value > 0:
            # Insurance: (Base LCL Price + declared value) * 1.5%
            insurance_cost = (base_lcl_price + declared_shipment_value) * 0.015

        total_price = calculation_total + insurance_cost

        formula_dict = {
            "priceByWeight": f"Total Weight × Price per KG = {total_price_by_weight:.2f}",
            "priceByCBM": f"Total CBM × One CBM Price = {total_price_by_cbm:.2f}",
            "baseLCLPrice": f"max({total_price_by_weight:.2f}, {total_price_by_cbm:.2f}, 75) = {base_lcl_price:.2f}",
            "packagingCost": f"Total Packaging Cost = {total_packaging_cost:.2f}",
            "calculation": f"{base_lcl_price:.2f} + {total_packaging_cost:.2f} = {calculation_total:.2f}",
        }

        if insurance_cost > 0:
            formula_dict["insurance"] = (
                f"({base_lcl_price:.2f} + {declared_shipment_value:.2f}) × 1.5% = {insurance_cost:.2f}"
            )
            formula_dict["totalPrice"] = (
                f"{calculation_total:.2f} + {insurance_cost:.2f} = {total_price:.2f}"
            )
        else:
            formula_dict["totalPrice"] = f"{calculation_total:.2f} = {total_price:.2f}"

        return Response(
            {
                "success": True,
                "priceByWeight": round(total_price_by_weight, 2),
                "priceByCBM": round(total_price_by_cbm, 2),
                "basePrice": round(base_lcl_price, 2),
                "packagingCost": round(total_packaging_cost, 2),
                "calculation": round(calculation_total, 2),
                "insuranceCost": round(insurance_cost, 2),
                "declaredShipmentValue": round(declared_shipment_value, 2),
                "totalPrice": round(total_price, 2),
                "calculations": calculations,
                "packagingCalculations": packaging_calculations,
                "formula": formula_dict,
            },
            status=status.HTTP_200_OK,
        )
    except (ValueError, TypeError) as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error calculating pricing: {str(e)}")
        return Response(
            {"success": False, "error": f"Invalid input: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error calculating pricing: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": "An error occurred while calculating pricing."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_fcl_quote_status_view(request, pk):
    """API endpoint for admin to update FCL quote status"""
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only superusers can update quote status."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        quote = FCLQuote.objects.get(pk=pk)
        new_status = request.data.get("status")
        offer_message = request.data.get("offer_message", "")

        if not new_status:
            return Response(
                {"success": False, "error": "Status is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate status
        valid_statuses = [choice[0] for choice in FCLQuote.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {
                    "success": False,
                    "error": f"Invalid status. Valid statuses are: {', '.join(valid_statuses)}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if payment is 100% before allowing status updates to IN_TRANSIT_TO_SYRIA and beyond
        restricted_statuses = [
            "IN_TRANSIT_TO_SYRIA",
            "ARRIVED_SYRIA",
            "SYRIA_SORTING",
            "READY_FOR_DELIVERY",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
        ]
        if new_status in restricted_statuses:
            if quote.total_price and quote.total_price > 0:
                payment_percentage = (
                    (quote.amount_paid or 0) / quote.total_price * 100
                    if quote.amount_paid
                    else 0
                )
                if payment_percentage < 100:
                    return Response(
                        {
                            "success": False,
                            "error": f"Cannot update status to {new_status}. Payment must be 100% complete. Current payment: {payment_percentage:.1f}%",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # Store old status for email notification
        old_status = quote.status

        quote.status = new_status

        # If status is OFFER_SENT, save message and timestamp
        if new_status == "OFFER_SENT" and offer_message:
            quote.offer_message = offer_message
            from django.utils import timezone

            quote.offer_sent_at = timezone.now()
            quote.user_response = (
                "PENDING"  # Reset user response when new offer is sent
            )

        # If status is PENDING_PAYMENT (or already is), allow setting/updating total_price and amount_paid
        if new_status == "PENDING_PAYMENT" or quote.status == "PENDING_PAYMENT":
            # Allow setting/updating total_price
            total_price = request.data.get("total_price")
            if total_price is not None:
                try:
                    total_price_decimal = float(total_price)
                    if total_price_decimal < 0:
                        return Response(
                            {
                                "success": False,
                                "error": "Total price cannot be negative.",
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    quote.total_price = total_price_decimal
                except (ValueError, TypeError):
                    return Response(
                        {
                            "success": False,
                            "error": "Invalid total_price value.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Allow setting/updating amount_paid
            amount_paid = request.data.get("amount_paid")
            if amount_paid is not None:
                try:
                    amount_paid_decimal = float(amount_paid)
                    if amount_paid_decimal < 0:
                        return Response(
                            {
                                "success": False,
                                "error": "Amount paid cannot be negative.",
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    if quote.total_price and amount_paid_decimal > quote.total_price:
                        return Response(
                            {
                                "success": False,
                                "error": "Amount paid cannot be greater than total price.",
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    quote.amount_paid = amount_paid_decimal
                except (ValueError, TypeError):
                    return Response(
                        {
                            "success": False,
                            "error": "Invalid amount_paid value.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        quote.save()

        # Send email notifications
        try:
            # Send email to user
            send_status_update_email(
                quote=quote,
                old_status=old_status,
                new_status=new_status,
                offer_message=offer_message if new_status == "OFFER_SENT" else None,
            )
            # Send email to admin
            send_status_update_notification_to_admin(
                quote=quote,
                old_status=old_status,
                new_status=new_status,
                offer_message=offer_message if new_status == "OFFER_SENT" else None,
            )
        except Exception as email_error:
            # Log email error but don't fail the request
            logger = logging.getLogger(__name__)
            logger.error(
                f"Failed to send status update email notifications: {str(email_error)}"
            )

        # Get status display name
        status_display = dict(FCLQuote.STATUS_CHOICES).get(new_status, new_status)

        return Response(
            {
                "success": True,
                "message": f"FCL quote status updated to {status_display} successfully.",
                "data": FCLQuoteSerializer(quote).data,
            },
            status=status.HTTP_200_OK,
        )
    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating quote status: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "An error occurred while processing the request.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def respond_to_offer_view(request, pk):
    """API endpoint for users to accept or reject an offer"""
    try:
        quote = FCLQuote.objects.get(pk=pk)

        # Check if user owns this quote
        if quote.user != request.user:
            return Response(
                {"success": False, "error": "You can only respond to your own quotes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if offer has been sent
        if quote.status != "OFFER_SENT" or not quote.offer_message:
            return Response(
                {
                    "success": False,
                    "error": "No offer has been sent for this quote yet.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_response = request.data.get("user_response")
        edit_request_message = request.data.get("edit_request_message", "")

        if user_response not in ["ACCEPTED", "REJECTED", "EDIT_REQUESTED"]:
            return Response(
                {
                    "success": False,
                    "error": "Invalid response. Must be 'ACCEPTED', 'REJECTED', or 'EDIT_REQUESTED'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate edit request message if requesting edit
        if user_response == "EDIT_REQUESTED":
            if not edit_request_message or not edit_request_message.strip():
                return Response(
                    {
                        "success": False,
                        "error": "Edit request message is required when requesting edits.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            quote.edit_request_message = edit_request_message.strip()
            quote.edit_request_status = "PENDING"
            # Create the first message in the conversation thread
            EditRequestMessage.objects.create(
                quote=quote,
                sender=request.user,
                message=edit_request_message.strip(),
                is_admin=False,
            )
            # Keep status as OFFER_SENT and notify admin and user
            from .email_service import send_edit_request_notification

            try:
                # Send email to admin
                send_edit_request_notification(quote, edit_request_message.strip())
                # Send confirmation email to user
                send_edit_request_confirmation_to_user(
                    quote, edit_request_message.strip()
                )
            except Exception as email_error:
                logger = logging.getLogger(__name__)
                logger.error(
                    f"Failed to send edit request email notifications: {str(email_error)}"
                )

        quote.user_response = user_response

        # If user accepts, change status to PENDING_PAYMENT
        if user_response == "ACCEPTED":
            quote.status = "PENDING_PAYMENT"
        # If user rejects or requests edit, keep status as OFFER_SENT but mark response

        quote.save()

        return Response(
            {
                "success": True,
                "message": f"Offer {user_response.lower()} successfully.",
                "data": FCLQuoteSerializer(quote).data,
            },
            status=status.HTTP_200_OK,
        )
    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error responding to offer: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "An error occurred while processing the request.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_edit_request_reply_view(request, pk):
    """API endpoint to send a reply in offer conversation (when offer is sent)"""
    try:
        quote = FCLQuote.objects.get(pk=pk)
        message_text = request.data.get("message", "").strip()

        if not message_text:
            return Response(
                {
                    "success": False,
                    "error": "Message is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check permissions
        is_admin = request.user.is_superuser
        is_owner = quote.user == request.user

        if not (is_admin or is_owner):
            return Response(
                {
                    "success": False,
                    "error": "You can only reply to conversations for your own quotes or as an admin.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if offer has been sent (conversation is only available when offer is sent)
        if quote.status != "OFFER_SENT" or not quote.offer_message:
            return Response(
                {
                    "success": False,
                    "error": "Conversation is only available when an offer has been sent.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the message
        message = EditRequestMessage.objects.create(
            quote=quote,
            sender=request.user,
            message=message_text,
            is_admin=is_admin,
        )

        serializer = EditRequestMessageSerializer(message, context={"request": request})

        return Response(
            {
                "success": True,
                "message": "Reply sent successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error sending edit request reply: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "An error occurred while processing the request.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_or_decline_edit_request_view(request, pk):
    """API endpoint for admin to approve or decline an edit request"""
    if not request.user.is_superuser:
        return Response(
            {
                "success": False,
                "error": "Only admins can approve or decline edit requests.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        quote = FCLQuote.objects.get(pk=pk)
        action = request.data.get("action")  # "approve" or "decline"
        message_text = request.data.get("message", "").strip()

        if action not in ["approve", "decline"]:
            return Response(
                {
                    "success": False,
                    "error": "Action must be 'approve' or 'decline'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quote.user_response != "EDIT_REQUESTED":
            return Response(
                {
                    "success": False,
                    "error": "This quote does not have an active edit request.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update edit request status
        if action == "approve":
            quote.edit_request_status = "APPROVED"
            # If approved, reset to CREATED status so admin can send a new offer
            quote.status = "CREATED"
            quote.user_response = "PENDING"
            quote.edit_request_message = None
        else:  # decline
            quote.edit_request_status = "DECLINED"
            # If declined, keep status as OFFER_SENT
            quote.status = "OFFER_SENT"

        # Create a message with the admin's decision
        if message_text:
            EditRequestMessage.objects.create(
                quote=quote,
                sender=request.user,
                message=message_text,
                is_admin=True,
            )

        quote.save()

        return Response(
            {
                "success": True,
                "message": f"Edit request {action}d successfully.",
                "data": FCLQuoteSerializer(quote).data,
            },
            status=status.HTTP_200_OK,
        )
    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error approving/declining edit request: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "An error occurred while processing the request.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_payment_reminder_view(request, pk):
    """API endpoint for admin to send payment reminder email to user"""
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can send payment reminders."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        quote = FCLQuote.objects.get(pk=pk)

        # Check if quote has total price set
        if not quote.total_price or quote.total_price <= 0:
            return Response(
                {
                    "success": False,
                    "error": "Cannot send payment reminder. Total price must be set first.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if payment is already 100%
        if quote.total_price > 0:
            payment_percentage = (
                (quote.amount_paid or 0) / quote.total_price * 100
                if quote.amount_paid
                else 0
            )
            if payment_percentage >= 100:
                return Response(
                    {
                        "success": False,
                        "error": "Payment is already 100% complete. No reminder needed.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Send payment reminder emails
        email_sent = send_payment_reminder_email(quote)
        # Also send notification to admin
        send_payment_reminder_notification_to_admin(quote)

        if email_sent:
            return Response(
                {
                    "success": True,
                    "message": "Payment reminder email sent successfully.",
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "success": False,
                    "error": "Failed to send payment reminder email. Please check email configuration.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error sending payment reminder: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "An error occurred while processing the request.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_prices_view(request):
    """API endpoint to get all prices"""
    try:
        prices = Price.objects.all().order_by("ar_item", "en_item")
        serializer = PriceSerializer(prices, many=True)
        return Response(
            {"success": True, "prices": serializer.data},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching prices: {str(e)}")
        return Response(
            {"success": False, "error": "An error occurred while fetching prices."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_packaging_prices_view(request):
    """API endpoint to get all packaging prices"""
    try:
        packaging_prices = PackagingPrice.objects.all().order_by(
            "ar_option", "en_option"
        )
        serializer = PackagingPriceSerializer(packaging_prices, many=True)
        return Response(
            {"success": True, "data": serializer.data},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching packaging prices: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "An error occurred while fetching packaging prices.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_payment_view(request, pk):
    """API endpoint to initiate Mollie payment for an FCL quote"""
    logger = logging.getLogger(__name__)

    if not MOLLIE_AVAILABLE:
        return Response(
            {
                "success": False,
                "error": "Mollie payment service is not available. Please install mollie-api-python.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        quote = FCLQuote.objects.get(pk=pk)

        # Check if user owns this quote
        if quote.user != request.user:
            return Response(
                {"success": False, "error": "You can only pay for your own quotes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if quote is in PENDING_PAYMENT status
        if quote.status != "PENDING_PAYMENT":
            return Response(
                {
                    "success": False,
                    "error": f"Payment can only be initiated for quotes with PENDING_PAYMENT status. Current status: {quote.status}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if total_price is set
        if not quote.total_price or quote.total_price <= 0:
            return Response(
                {
                    "success": False,
                    "error": "Total price must be set before initiating payment.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate remaining amount
        amount_paid = quote.amount_paid or Decimal("0")
        remaining_amount = quote.total_price - amount_paid

        if remaining_amount <= 0:
            return Response(
                {
                    "success": False,
                    "error": "Payment is already complete. No remaining amount to pay.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Initialize Mollie client
        api_key = (
            settings.MOLLIE_API_KEY_TEST
            if settings.MOLLIE_USE_TEST_MODE
            else settings.MOLLIE_API_KEY
        )

        if not api_key:
            return Response(
                {
                    "success": False,
                    "error": "Mollie API key is not configured. Please contact administrator.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        mollie_client = MollieClient()
        mollie_client.set_api_key(api_key)

        # Create payment description
        description = f"FCL Quote Payment - {quote.quote_number or f'#{quote.id}'}"
        if amount_paid > 0:
            description += f" (Remaining: €{remaining_amount:.2f})"

        # Create payment in Mollie
        payment_data = {
            "amount": {
                "currency": "EUR",
                "value": f"{remaining_amount:.2f}",
            },
            "description": description,
            "redirectUrl": settings.MOLLIE_REDIRECT_SUCCESS_URL,
            "webhookUrl": settings.MOLLIE_WEBHOOK_URL,
            "metadata": {
                "quote_id": str(quote.id),
                "quote_number": quote.quote_number or f"#{quote.id}",
                "user_id": str(request.user.id),
            },
        }

        payment = mollie_client.payments.create(payment_data)

        # Save payment information to quote
        quote.payment_id = payment.id
        quote.payment_status = payment.status
        quote.payment_method = "mollie"
        quote.payment_created_at = timezone.now()
        quote.payment_updated_at = timezone.now()
        quote.save()

        logger.info(
            f"Payment initiated for quote {quote.id}: Mollie payment ID {payment.id}"
        )

        return Response(
            {
                "success": True,
                "message": "Payment initiated successfully.",
                "checkout_url": payment.checkout_url,
                "payment_id": payment.id,
                "amount": {
                    "value": float(remaining_amount),
                    "currency": "EUR",
                },
            },
            status=status.HTTP_200_OK,
        )

    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error initiating payment: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": f"An error occurred while initiating payment: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_regular_products_view(request):
    """API endpoint to get regular products with per_kg pricing unit"""
    try:
        # Get all products where minimum_shipping_unit is 'per_kg'
        regular_products = Price.objects.filter(
            minimum_shipping_unit="per_kg"
        ).values(
            "id",
            "ar_item",
            "en_item",
            "price_per_kg",
            "minimum_shipping_weight",
            "minimum_shipping_unit",
            "one_cbm",
        )

        return Response(
            {
                "success": True,
                "products": list(regular_products),
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching regular products: {str(e)}")
        return Response(
            {"success": False, "error": "Failed to fetch regular products"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def get_per_piece_products_view(request):
    """API endpoint to get products with per_piece pricing unit (Electronics)"""
    try:
        # Get all products where minimum_shipping_unit is 'per_piece'
        per_piece_products = Price.objects.filter(
            minimum_shipping_unit="per_piece"
        ).values(
            "id",
            "ar_item",
            "en_item",
            "price_per_kg",
            "minimum_shipping_weight",
            "minimum_shipping_unit",
        )

        return Response(
            {
                "success": True,
                "products": list(per_piece_products),
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching per-piece products: {str(e)}")
        return Response(
            {"success": False, "error": "Failed to fetch products"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])  # Mollie webhook doesn't use JWT
def mollie_webhook_view(request):
    """API endpoint to receive webhook notifications from Mollie"""
    logger = logging.getLogger(__name__)

    if not MOLLIE_AVAILABLE:
        logger.error("Mollie webhook received but Mollie API is not available")
        return Response(
            {"error": "Service unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        payment_id = request.data.get("id")
        if not payment_id:
            return Response(
                {"error": "Payment ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Initialize Mollie client
        api_key = (
            settings.MOLLIE_API_KEY_TEST
            if settings.MOLLIE_USE_TEST_MODE
            else settings.MOLLIE_API_KEY
        )

        if not api_key:
            logger.error("Mollie API key is not configured")
            return Response(
                {"error": "Configuration error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        mollie_client = MollieClient()
        mollie_client.set_api_key(api_key)

        # Retrieve payment from Mollie
        payment = mollie_client.payments.get(payment_id)

        # Find quote by payment_id
        try:
            quote = FCLQuote.objects.get(payment_id=payment_id)
        except FCLQuote.DoesNotExist:
            logger.warning(f"Quote not found for payment ID: {payment_id}")
            return Response(
                {"error": "Quote not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Update payment status
        quote.payment_status = payment.status
        quote.payment_updated_at = timezone.now()

        # If payment is paid, update amount_paid
        if payment.status == "paid" and payment.amount:
            paid_amount = Decimal(str(payment.amount["value"]))
            current_amount_paid = quote.amount_paid or Decimal("0")
            quote.amount_paid = current_amount_paid + paid_amount
            logger.info(
                f"Payment received for quote {quote.id}: €{paid_amount:.2f}. Total paid: €{quote.amount_paid:.2f}"
            )

        quote.save()

        logger.info(
            f"Webhook processed for quote {quote.id}: Payment {payment_id} status updated to {payment.status}"
        )

        return Response({"success": True}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error processing Mollie webhook: {str(e)}", exc_info=True)
        return Response(
            {"error": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_status_view(request, pk):
    """API endpoint to check payment status for an FCL quote"""
    logger = logging.getLogger(__name__)

    try:
        quote = FCLQuote.objects.get(pk=pk)

        # Check if user owns this quote
        if quote.user != request.user and not request.user.is_superuser:
            return Response(
                {
                    "success": False,
                    "error": "You can only check payment status for your own quotes.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # If there's a payment_id, try to get latest status from Mollie
        payment_status_info = None
        if quote.payment_id and MOLLIE_AVAILABLE:
            try:
                api_key = (
                    settings.MOLLIE_API_KEY_TEST
                    if settings.MOLLIE_USE_TEST_MODE
                    else settings.MOLLIE_API_KEY
                )
                if api_key:
                    mollie_client = MollieClient()
                    mollie_client.set_api_key(api_key)
                    payment = mollie_client.payments.get(quote.payment_id)
                    payment_status_info = {
                        "id": payment.id,
                        "status": payment.status,
                        "amount": payment.amount,
                        "paid_at": payment.paid_at,
                        "checkout_url": (
                            payment.checkout_url
                            if hasattr(payment, "checkout_url")
                            else None
                        ),
                    }
                    # Update local status if different
                    if quote.payment_status != payment.status:
                        quote.payment_status = payment.status
                        quote.payment_updated_at = timezone.now()
                        quote.save()
            except Exception as e:
                logger.warning(f"Could not fetch payment status from Mollie: {str(e)}")

        # Calculate payment info
        total_price = float(quote.total_price) if quote.total_price else 0
        amount_paid = float(quote.amount_paid) if quote.amount_paid else 0
        remaining_amount = total_price - amount_paid
        payment_percentage = (amount_paid / total_price * 100) if total_price > 0 else 0

        return Response(
            {
                "success": True,
                "quote_id": quote.id,
                "quote_number": quote.quote_number,
                "total_price": total_price,
                "amount_paid": amount_paid,
                "remaining_amount": max(0, remaining_amount),
                "payment_percentage": round(payment_percentage, 2),
                "payment_status": quote.payment_status,
                "payment_method": quote.payment_method,
                "payment_id": quote.payment_id,
                "payment_created_at": (
                    quote.payment_created_at.isoformat()
                    if quote.payment_created_at
                    else None
                ),
                "payment_updated_at": (
                    quote.payment_updated_at.isoformat()
                    if quote.payment_updated_at
                    else None
                ),
                "mollie_payment": payment_status_info,
            },
            status=status.HTTP_200_OK,
        )

    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": "An error occurred while checking payment status.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================================
# Location APIs (Countries, Cities, Ports)
# ============================================================================


@api_view(["GET"])
@permission_classes([AllowAny])
def countries_list_view(request):
    """Get list of all countries"""
    countries = Country.objects.all()
    serializer = CountrySerializer(countries, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def cities_list_view(request):
    """Get list of cities, optionally filtered by country"""
    country_code = request.query_params.get("country", None)

    if country_code:
        cities = City.objects.filter(country__code=country_code)
    else:
        cities = City.objects.all()

    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([AllowAny])
def ports_list_view(request):
    """Get list of ports, optionally filtered by country"""
    country_code = request.query_params.get("country", None)

    if country_code:
        ports = Port.objects.filter(country__code=country_code)
    else:
        ports = Port.objects.all()

    serializer = PortSerializer(ports, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def request_new_product_view(request):
    """Handle user requests for new products to be added"""
    try:
        product_name = request.data.get("productName")
        language = request.data.get("language", "en")

        if not product_name:
            return Response(
                {"success": False, "error": "Product name is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the user if authenticated
        user = request.user if request.user.is_authenticated else None

        # Create the product request
        product_request = ProductRequest.objects.create(
            user=user,
            product_name=product_name,
            language=language,
            status="PENDING",
        )

        # Send email notification to admin
        try:
            from django.conf import settings
            from django.core.mail import send_mail

            # Get all superuser emails
            admin_emails = list(
                User.objects.filter(is_superuser=True).values_list("email", flat=True)
            )
            
            # Add ADMIN_EMAIL from settings if configured
            if settings.ADMIN_EMAIL and settings.ADMIN_EMAIL not in admin_emails:
                admin_emails.append(settings.ADMIN_EMAIL)

            if admin_emails:
                user_info = (
                    f"{user.username} ({user.email})" if user else "Anonymous User"
                )

                subject = f"New Product Request - {product_name}"

                # Different message based on whether user is authenticated
                if user and user.email:
                    message = f"""
A new product has been requested:

Product Name: {product_name}
Language: {language}
Requested by: {user_info}
Request ID: {product_request.id}
Date: {product_request.created_at.strftime("%Y-%m-%d %H:%M:%S")}

IMPORTANT: Please reply to this user at {user.email} once you have added this product to the system.

You can manage product requests in the admin panel.
"""
                else:
                    message = f"""
A new product has been requested:

Product Name: {product_name}
Language: {language}
Requested by: Anonymous User (not logged in)
Request ID: {product_request.id}
Date: {product_request.created_at.strftime("%Y-%m-%d %H:%M:%S")}

Note: This user was not logged in, so we cannot send them an email notification.
Please add this product to the pricing system if appropriate.

You can manage product requests in the admin panel.
"""

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=admin_emails,
                    fail_silently=True,
                )
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to send product request email: {str(e)}")

        return Response(
            {
                "success": True,
                "message": "Product request submitted successfully",
                "requestId": product_request.id,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error in request_new_product_view: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to submit product request"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_product_requests_view(request):
    """Get all product requests for the authenticated user"""
    try:
        # Get product requests for the current user
        product_requests = ProductRequest.objects.filter(user=request.user).order_by("-created_at")
        
        serializer = ProductRequestSerializer(product_requests, many=True)
        
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error in user_product_requests_view: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to fetch product requests"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_all_product_requests_view(request):
    """Get all product requests (Admin only)"""
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can view all product requests"},
            status=status.HTTP_403_FORBIDDEN,
        )
    
    try:
        # Get all product requests
        product_requests = ProductRequest.objects.all().order_by("-created_at")
        
        serializer = ProductRequestSerializer(product_requests, many=True)
        
        return Response(
            {
                "success": True,
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error in admin_all_product_requests_view: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to fetch product requests"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_product_request_view(request, pk):
    """Update product request status and admin notes (Admin only)"""
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can update product requests"},
            status=status.HTTP_403_FORBIDDEN,
        )
    
    try:
        product_request = ProductRequest.objects.get(pk=pk)
        
        # Update status if provided
        if "status" in request.data:
            product_request.status = request.data["status"]
        
        # Update admin notes if provided
        if "admin_notes" in request.data:
            product_request.admin_notes = request.data["admin_notes"]
        
        product_request.save()
        
        serializer = ProductRequestSerializer(product_request)
        
        return Response(
            {
                "success": True,
                "message": "Product request updated successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    except ProductRequest.DoesNotExist:
        return Response(
            {"success": False, "error": "Product request not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error in update_product_request_view: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to update product request"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
