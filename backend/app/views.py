import logging
import traceback
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

# Mollie payment gateway removed - using Stripe only

# Stripe Payment Integration
try:
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY if settings.STRIPE_SECRET_KEY else None
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    stripe = None

from .email_service import (
    send_contact_form_notification,
    send_edit_request_confirmation_to_user,
    send_fcl_quote_confirmation_email,
    send_fcl_quote_notification,
    send_lcl_shipment_payment_reminder_email,
    send_lcl_shipment_payment_reminder_notification_to_admin,
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
    LCLShipment,
    PackagingPrice,
    Port,
    Price,
    ProductRequest,
    SyrianProvincePrice,
)
from .serializers import (
    ChangePasswordSerializer,
    CitySerializer,
    ContactMessageSerializer,
    CountrySerializer,
    EditRequestMessageSerializer,
    FCLQuoteSerializer,
    LCLShipmentSerializer,
    PackagingPriceSerializer,
    PortSerializer,
    PriceSerializer,
    ProductRequestSerializer,
    RegisterSerializer,
    SyrianProvincePriceSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Verify reCAPTCHA v3 token if provided
        recaptcha_token = request.data.get("recaptcha_token")

        # Check if reCAPTCHA is configured (standard v3 only)
        from django.conf import settings

        has_recaptcha_config = getattr(settings, "RECAPTCHA_SECRET_KEY", None)

        if has_recaptcha_config:
            # reCAPTCHA is configured, so token is required
            if not recaptcha_token:
                return Response(
                    {
                        "error": "reCAPTCHA verification is required. Please complete the reCAPTCHA verification.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verify the token
            from .recaptcha_verify import verify_recaptcha_token

            verification_result = verify_recaptcha_token(
                token=recaptcha_token, action="register"
            )

            if not verification_result.get("success"):
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"reCAPTCHA verification failed: {verification_result.get('error')}"
                )
                return Response(
                    {
                        "error": "reCAPTCHA verification failed. Please try again.",
                        "details": verification_result.get("error", "Unknown error"),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif recaptcha_token:
            # Token provided but reCAPTCHA not configured - verify anyway (might be test key)
            from .recaptcha_verify import verify_recaptcha_token

            verification_result = verify_recaptcha_token(
                token=recaptcha_token, action="register"
            )
            # Log warning but don't block registration if reCAPTCHA is not configured
            if not verification_result.get("success"):
                logger = logging.getLogger(__name__)
                logger.warning(
                    f"reCAPTCHA token provided but verification failed (reCAPTCHA may not be configured): {verification_result.get('error')}"
                )

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

        # Verify reCAPTCHA v3 token if provided
        recaptcha_token = request.data.get("recaptcha_token")

        # Check if reCAPTCHA is configured (standard v3 only)
        has_recaptcha_config = getattr(settings, "RECAPTCHA_SECRET_KEY", None)

        if has_recaptcha_config:
            # reCAPTCHA is configured, so token is required
            if not recaptcha_token:
                return Response(
                    {
                        "success": False,
                        "error": "reCAPTCHA verification is required. Please complete the reCAPTCHA verification.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verify the token
            from .recaptcha_verify import verify_recaptcha_token

            verification_result = verify_recaptcha_token(
                token=recaptcha_token, action="fcl_quote"
            )

            if not verification_result.get("success"):
                logger.warning(
                    f"reCAPTCHA verification failed for FCL quote: {verification_result.get('error')}"
                )
                return Response(
                    {
                        "success": False,
                        "error": "reCAPTCHA verification failed. Please try again.",
                        "details": verification_result.get("error", "Unknown error"),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif recaptcha_token:
            # Token provided but reCAPTCHA not configured - verify anyway (might be test key)
            from .recaptcha_verify import verify_recaptcha_token

            verification_result = verify_recaptcha_token(
                token=recaptcha_token, action="fcl_quote"
            )
            # Log warning but don't block submission if reCAPTCHA is not configured
            if not verification_result.get("success"):
                logger.warning(
                    f"reCAPTCHA token provided but verification failed (reCAPTCHA may not be configured): {verification_result.get('error')}"
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
                "IN_TRANSIT_TO_DESTINATION",
                "ARRIVED_DESTINATION",
                "DESTINATION_SORTING",
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
                "IN_TRANSIT_TO_DESTINATION",
                "ARRIVED_DESTINATION",
                "DESTINATION_SORTING",
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

        # Calculate CBM for display: (Length * Width * Height) / 1,000,000
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

                # Skip new calculation for per_piece products (electronics) - keep as is
                if price.minimum_shipping_unit == "per_piece":
                    # Keep original calculation for electronics
                    parcel_weight = weight * repeat_count
                    parcel_cbm = cbm * repeat_count
                    price_by_weight = parcel_weight * float(price.price_per_kg)
                    price_by_cbm = parcel_cbm * float(price.price_per_kg)
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
                            "price_by_weight": round(price_by_weight, 2),
                            "price_by_cbm": round(price_by_cbm, 2),
                        }
                    )
                else:
                    # New calculation for per_kg products
                    # Get dimensions from parcel_data
                    length = float(parcel_data.get("length", 0))
                    width = float(parcel_data.get("width", 0))
                    height = float(parcel_data.get("height", 0))

                    # Calculate volumetric weight: (L × W × H) / 6,000
                    volumetric_weight = (length * width * height) / 6000

                    # Chargeable weight = max(actual_weight, volumetric_weight)
                    chargeable_weight = max(weight, volumetric_weight)

                    # Account for repeat count
                    parcel_chargeable_weight = chargeable_weight * repeat_count

                    # Price = chargeable_weight × price_per_kg
                    parcel_price = parcel_chargeable_weight * float(price.price_per_kg)

                    total_price_by_weight += parcel_price
                    total_price_by_cbm += parcel_price  # Same value for compatibility

                    calculations.append(
                        {
                            "product_id": product_id,
                            "product_name": (
                                price.ar_item
                                if request.data.get("language") == "ar"
                                else price.en_item
                            ),
                            "weight": weight,
                            "volumetric_weight": round(volumetric_weight, 3),
                            "chargeable_weight": round(chargeable_weight, 3),
                            "parcel_chargeable_weight": round(
                                parcel_chargeable_weight, 3
                            ),
                            "price_per_kg": float(price.price_per_kg),
                            "price_by_weight": round(parcel_price, 2),
                            "price_by_cbm": round(parcel_price, 2),
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
            "priceByCBM": f"Total CBM × Price per KG = {total_price_by_cbm:.2f}",
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
    logger = logging.getLogger(__name__)

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

        # Allow setting/updating total_price and amount_paid for OFFER_SENT and PENDING_PAYMENT
        if (
            new_status == "OFFER_SENT"
            or new_status == "PENDING_PAYMENT"
            or quote.status == "PENDING_PAYMENT"
        ):
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

        # Refresh quote from database to ensure we have latest data (especially invoice fields)
        quote.refresh_from_db()

        # Get status display name
        status_display = dict(FCLQuote.STATUS_CHOICES).get(new_status, new_status)

        # Prepare response data
        response_data = {
            "success": True,
            "message": f"FCL quote status updated to {status_display} successfully.",
            "data": FCLQuoteSerializer(quote).data,
        }

        # Log invoice status for debugging
        logger.info(
            f"📋 Quote {quote.id} final state - invoice_file: {quote.invoice_file}, invoice_generated_at: {quote.invoice_generated_at}"
        )

        return Response(
            response_data,
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


@api_view(["GET"])
@permission_classes([AllowAny])
def get_regular_products_view(request):
    """API endpoint to get regular products with per_kg pricing unit"""
    try:
        # Get all products where minimum_shipping_unit is 'per_kg'
        regular_products = Price.objects.filter(minimum_shipping_unit="per_kg").values(
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

        # Get latest payment status from Stripe if payment_method is stripe
        payment_status_info = None
        if quote.payment_id and quote.payment_method == "stripe" and STRIPE_AVAILABLE:
            try:
                if settings.STRIPE_SECRET_KEY:
                    # Retrieve Stripe checkout session
                    session = stripe.checkout.Session.retrieve(quote.payment_id)
                    payment_status_info = {
                        "id": session.id,
                        "status": session.payment_status,
                        "amount_total": (
                            session.amount_total / 100 if session.amount_total else 0
                        ),  # Convert from cents
                        "currency": session.currency.upper(),
                        "url": session.url if hasattr(session, "url") else None,
                    }
                    # Update local status if different
                    if quote.payment_status != session.payment_status:
                        quote.payment_status = session.payment_status
                        quote.payment_updated_at = timezone.now()
                        quote.save()
            except stripe.error.StripeError as e:
                logger.warning(f"Could not fetch payment status from Stripe: {str(e)}")
            except Exception as e:
                logger.warning(f"Error fetching Stripe payment status: {str(e)}")

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
                "stripe_payment": (
                    payment_status_info if quote.payment_method == "stripe" else None
                ),
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_stripe_payment_view(request, pk):
    """API endpoint to initiate Stripe payment for an FCL quote"""
    logger = logging.getLogger(__name__)

    if not STRIPE_AVAILABLE:
        return Response(
            {
                "success": False,
                "error": "Stripe payment service is not available. Please install stripe.",
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

        # Ensure remaining amount is at least 0.50 EUR (Stripe minimum)
        if remaining_amount < Decimal("0.50"):
            return Response(
                {
                    "success": False,
                    "error": f"Remaining amount (€{remaining_amount:.2f}) is too small. Minimum payment is €0.50.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check Stripe API key
        if not settings.STRIPE_SECRET_KEY:
            return Response(
                {
                    "success": False,
                    "error": "Stripe API key is not configured. Please contact administrator.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Create payment description
        description = f"FCL Quote Payment - {quote.quote_number or f'#{quote.id}'}"
        if amount_paid > 0:
            description += f" (Remaining: €{remaining_amount:.2f})"

        # Create Stripe Checkout Session
        try:
            # Ensure we have a valid amount (minimum 0.50 EUR = 50 cents)
            amount_in_cents = max(50, int(remaining_amount * 100))

            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "eur",
                            "product_data": {
                                "name": f"FCL Quote {quote.quote_number or f'#{quote.id}'}",
                                "description": description,
                            },
                            "unit_amount": amount_in_cents,
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=(
                    request.data.get("success_url")
                    or settings.STRIPE_REDIRECT_SUCCESS_URL
                )
                + (
                    (
                        "&"
                        if "?"
                        in (
                            request.data.get("success_url")
                            or settings.STRIPE_REDIRECT_SUCCESS_URL
                        )
                        else "?"
                    )
                    + f"type=quote&quote_id={quote.id}&session_id={{CHECKOUT_SESSION_ID}}"
                ),
                cancel_url=(
                    request.data.get("cancel_url")
                    or settings.STRIPE_REDIRECT_CANCEL_URL
                )
                + (
                    (
                        "&"
                        if "?"
                        in (
                            request.data.get("cancel_url")
                            or settings.STRIPE_REDIRECT_CANCEL_URL
                        )
                        else "?"
                    )
                    + f"type=quote&quote_id={quote.id}"
                ),
                metadata={
                    "quote_id": str(quote.id),
                    "quote_number": quote.quote_number or f"#{quote.id}",
                    "user_id": str(request.user.id),
                    "remaining_amount": str(remaining_amount),
                },
                customer_email=request.user.email if request.user.email else None,
                expires_at=int(timezone.now().timestamp())
                + (24 * 60 * 60),  # Expire in 24 hours
            )

            # Save payment information to quote
            quote.payment_id = checkout_session.id
            quote.payment_status = checkout_session.payment_status
            quote.payment_method = "stripe"
            quote.payment_created_at = timezone.now()
            quote.payment_updated_at = timezone.now()
            quote.save()

            logger.info(
                f"Stripe payment initiated for quote {quote.id}: Session ID {checkout_session.id}"
            )

            return Response(
                {
                    "success": True,
                    "message": "Payment initiated successfully.",
                    "checkout_url": checkout_session.url,
                    "session_id": checkout_session.id,
                    "amount": {
                        "value": float(remaining_amount),
                        "currency": "EUR",
                    },
                },
                status=status.HTTP_200_OK,
            )

        except stripe.error.StripeError as e:
            logger.error(f"Stripe API error: {str(e)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "error": f"Stripe payment error: {str(e)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except FCLQuote.DoesNotExist:
        return Response(
            {"success": False, "error": "FCL quote not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error initiating Stripe payment: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": f"An error occurred while initiating payment: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])  # Stripe webhook doesn't use JWT
@csrf_exempt  # Stripe webhooks don't include CSRF tokens
def stripe_webhook_view(request):
    """API endpoint to receive webhook notifications from Stripe"""
    logger = logging.getLogger(__name__)

    # Log immediately when endpoint is hit (before any checks)
    logger.info("=" * 80)
    logger.info(
        "🔔 WEBHOOK ENDPOINT HIT - Method: %s, Path: %s, Full Path: %s",
        request.method,
        request.path,
        request.get_full_path(),
    )
    logger.info("🔔 Request META keys: %s", list(request.META.keys())[:20])
    logger.info("=" * 80)

    if not STRIPE_AVAILABLE:
        logger.error("Stripe webhook received but Stripe API is not available")
        return Response(
            {"error": "Service unavailable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    try:
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

        logger.info(
            "🔔 Webhook received - Payload size: %d bytes, Signature header: %s",
            len(payload),
            "Present" if sig_header else "Missing",
        )

        if not sig_header:
            return Response(
                {"error": "Missing Stripe signature"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verify webhook signature
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        if not webhook_secret:
            logger.error("❌ STRIPE_WEBHOOK_SECRET is not configured in settings")
            logger.error("❌ Please set STRIPE_WEBHOOK_SECRET in .env file")
            return Response(
                {"error": "Webhook secret not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.info(
            "🔍 Verifying webhook signature - Secret length: %d, First 10 chars: %s...",
            len(webhook_secret),
            webhook_secret[:10] if len(webhook_secret) > 10 else webhook_secret,
        )

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            logger.info(
                "✅ Webhook signature verified successfully - Event type: %s",
                event.get("type", "unknown"),
            )
        except ValueError as e:
            logger.error(f"❌ Invalid payload: {str(e)}")
            logger.error(
                f"❌ Payload preview: {payload[:200] if len(payload) > 200 else payload}"
            )
            return Response(
                {"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"❌ Invalid signature: {str(e)}")
            logger.error(f"❌ Expected secret starts with: {webhook_secret[:10]}...")
            logger.error(
                f"❌ Signature header: {sig_header[:50] if sig_header else 'None'}..."
            )
            # Still return 200 to prevent Stripe from retrying with wrong secret
            return Response(
                {"error": "Invalid signature", "received": True},
                status=status.HTTP_200_OK,
            )

        # Handle the event
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            session_id = session.get("id")
            payment_status = session.get("payment_status")
            metadata = session.get("metadata", {})
            event_type = metadata.get("type", "")

            logger.info(
                f"🔔 Webhook received - event_type: {event['type']}, session_id: {session_id}, payment_status: {payment_status}, metadata: {metadata}"
            )

            # Check if this is a shipment payment
            if event_type == "shipment":
                shipment_id = metadata.get("shipment_id")

                logger.info(
                    f"🔍 Processing shipment webhook - session_id: {session_id}, shipment_id from metadata: {shipment_id}, payment_status: {payment_status}"
                )

                if not shipment_id:
                    logger.warning(
                        f"⚠️ Shipment ID missing in metadata for session {session_id}. Trying to find by stripe_session_id..."
                    )
                    # Try to find by stripe_session_id as fallback
                    try:
                        shipment = LCLShipment.objects.get(stripe_session_id=session_id)
                        logger.info(
                            f"✅ Found shipment by stripe_session_id: {shipment.id}"
                        )
                    except LCLShipment.DoesNotExist:
                        logger.error(
                            f"❌ LCL Shipment not found for Stripe session ID: {session_id}"
                        )
                        shipment = None
                else:
                    try:
                        # Convert shipment_id to int if it's a string
                        try:
                            shipment_id_int = int(shipment_id)
                        except (ValueError, TypeError):
                            logger.warning(
                                f"⚠️ Invalid shipment_id format: {shipment_id}, trying as string..."
                            )
                            shipment_id_int = shipment_id

                        # Try to get shipment by ID first (more reliable)
                        try:
                            shipment = LCLShipment.objects.get(pk=shipment_id_int)
                            logger.info(f"✅ Found shipment by ID: {shipment.id}")
                        except LCLShipment.DoesNotExist:
                            # Fallback to stripe_session_id if shipment_id doesn't work
                            logger.warning(
                                f"⚠️ Shipment not found by ID {shipment_id_int}, trying stripe_session_id..."
                            )
                            try:
                                shipment = LCLShipment.objects.get(
                                    stripe_session_id=session_id
                                )
                                logger.info(
                                    f"✅ Found shipment by stripe_session_id: {shipment.id}"
                                )
                            except LCLShipment.DoesNotExist:
                                logger.error(
                                    f"❌ LCL Shipment not found for ID {shipment_id_int} or Stripe session ID: {session_id}"
                                )
                                shipment = None

                        if shipment:
                            old_amount_paid = shipment.amount_paid or Decimal("0")
                            old_status = shipment.status
                            old_payment_status = shipment.payment_status

                            logger.info(
                                f"📦 Found shipment {shipment.id} - Current state: amount_paid={old_amount_paid}, status={old_status}, payment_status={old_payment_status}"
                            )

                            # Update payment_status
                            shipment.payment_status = payment_status

                            # Update amount_paid and status if payment is completed
                            if payment_status == "paid":
                                # Get amount from session
                                amount_total = session.get("amount_total")
                                amount_subtotal = session.get("amount_subtotal")

                                logger.info(
                                    f"💰 Payment is PAID - amount_total: {amount_total}, amount_subtotal: {amount_subtotal}"
                                )

                                if amount_total:
                                    # Convert from cents to decimal
                                    paid_amount = Decimal(str(amount_total)) / 100
                                    shipment.amount_paid = paid_amount
                                    # Update status based on whether Sendcloud parcel exists
                                    # If Sendcloud parcel exists, status should already be PENDING_PICKUP
                                    # Otherwise, set to PENDING_PICKUP (payment is complete, waiting for pickup)
                                    if not shipment.sendcloud_id:
                                        shipment.status = "PENDING_PICKUP"
                                    shipment.paid_at = timezone.now()

                                    logger.info(
                                        f"✅ Updated shipment {shipment.id} - amount_paid: {old_amount_paid} -> {paid_amount}, status: {old_status} -> {shipment.status}"
                                    )
                                elif amount_subtotal:
                                    # Fallback to subtotal if total is missing
                                    paid_amount = Decimal(str(amount_subtotal)) / 100
                                    shipment.amount_paid = paid_amount
                                    if not shipment.sendcloud_id:
                                        shipment.status = "PENDING_PICKUP"
                                    shipment.paid_at = timezone.now()

                                    logger.info(
                                        f"✅ Updated shipment {shipment.id} using subtotal - amount_paid: {old_amount_paid} -> {paid_amount}, status: {old_status} -> {shipment.status}"
                                    )
                                elif shipment.total_price and shipment.total_price > 0:
                                    # Final fallback: use total_price
                                    shipment.amount_paid = shipment.total_price
                                    if not shipment.sendcloud_id:
                                        shipment.status = "PENDING_PICKUP"
                                    shipment.paid_at = timezone.now()

                                    logger.warning(
                                        f"⚠️ Using total_price as fallback for shipment {shipment.id} - amount_paid: {old_amount_paid} -> {shipment.total_price}, status: {old_status} -> {shipment.status}"
                                    )
                                else:
                                    logger.error(
                                        f"❌ Cannot determine payment amount for shipment {shipment.id} - no amount_total, amount_subtotal, or total_price"
                                    )
                            else:
                                logger.warning(
                                    f"⚠️ Payment status is '{payment_status}' (not paid) for shipment {shipment.id}. Not updating amount_paid."
                                )

                            # Save changes
                            shipment.save()

                            # Refresh from database to ensure we have the latest values
                            shipment.refresh_from_db()

                            logger.info(
                                f"✅ Webhook processed successfully for LCL shipment {shipment.id}: "
                                f"payment_status: {old_payment_status} -> {shipment.payment_status}, "
                                f"amount_paid: {old_amount_paid} -> {shipment.amount_paid}, "
                                f"status: {old_status} -> {shipment.status}"
                            )

                            # ✅ Create Sendcloud parcel if payment is paid and Sendcloud is configured
                            if payment_status == "paid" and not shipment.sendcloud_id:
                                try:
                                    from .sendcloud_service import (
                                        SendcloudAPIError,
                                        SendcloudValidationError,
                                        create_parcel,
                                    )

                                    # Check if Sendcloud is needed (EU pickup with shipping method selected)
                                    if (
                                        shipment.selected_eu_shipping_method
                                        and shipment.eu_pickup_country
                                        and shipment.eu_pickup_address
                                        and shipment.eu_pickup_weight
                                        and shipment.eu_pickup_weight > 0
                                    ):
                                        logger.info(
                                            f"🚀 Attempting to create Sendcloud parcel for shipment {shipment.id}"
                                        )

                                        # Prepare shipment data for Sendcloud
                                        shipment_data = {
                                            "receiver_name": shipment.receiver_name,
                                            "receiver_address": shipment.eu_pickup_address,
                                            "receiver_city": shipment.eu_pickup_city,
                                            "receiver_postal_code": shipment.eu_pickup_postal_code,
                                            "receiver_country": shipment.eu_pickup_country,
                                            "weight": float(shipment.eu_pickup_weight),
                                        }

                                        # Add optional fields if available
                                        if shipment.receiver_email:
                                            shipment_data["receiver_email"] = (
                                                shipment.receiver_email
                                            )
                                        if shipment.receiver_phone:
                                            shipment_data["receiver_phone"] = (
                                                shipment.receiver_phone
                                            )
                                        if shipment.shipment_number:
                                            shipment_data["order_number"] = (
                                                shipment.shipment_number
                                            )

                                        # Create parcel in Sendcloud
                                        sendcloud_result = create_parcel(
                                            shipment_data=shipment_data,
                                            selected_shipping_method=shipment.selected_eu_shipping_method,
                                        )

                                        # Update shipment with Sendcloud data
                                        shipment.sendcloud_id = sendcloud_result.get(
                                            "sendcloud_id"
                                        )
                                        shipment.tracking_number = sendcloud_result.get(
                                            "tracking_number", ""
                                        )
                                        shipment.sendcloud_label_url = (
                                            sendcloud_result.get("label_url")
                                        )

                                        # Update status to PENDING_PICKUP if parcel was created
                                        if shipment.sendcloud_id:
                                            shipment.status = "PENDING_PICKUP"
                                            shipment.save()

                                            logger.info(
                                                f"✅ Successfully created Sendcloud parcel for shipment {shipment.id}: "
                                                f"sendcloud_id={shipment.sendcloud_id}, "
                                                f"tracking_number={shipment.tracking_number}"
                                            )

                                            # TODO: Send email to user with tracking number and label URL
                                        else:
                                            logger.warning(
                                                f"⚠️ Sendcloud parcel creation returned no sendcloud_id for shipment {shipment.id}"
                                            )

                                    else:
                                        logger.info(
                                            f"ℹ️ Skipping Sendcloud parcel creation for shipment {shipment.id}: "
                                            f"missing required fields (shipping_method={shipment.selected_eu_shipping_method}, "
                                            f"eu_pickup_country={shipment.eu_pickup_country}, "
                                            f"eu_pickup_weight={shipment.eu_pickup_weight})"
                                        )

                                except SendcloudValidationError as e:
                                    logger.warning(
                                        f"⚠️ Sendcloud validation error for shipment {shipment.id}: {str(e)}"
                                    )
                                    # Don't fail webhook - payment is still processed
                                except SendcloudAPIError as e:
                                    logger.error(
                                        f"❌ Sendcloud API error for shipment {shipment.id}: {str(e)}"
                                    )
                                    # Don't fail webhook - payment is still processed
                                except Exception as e:
                                    logger.error(
                                        f"❌ Unexpected error creating Sendcloud parcel for shipment {shipment.id}: {str(e)}",
                                        exc_info=True,
                                    )
                                    # Don't fail webhook - payment is still processed

                            # Return success response immediately for shipment payments
                            return Response(
                                {
                                    "success": True,
                                    "message": "Shipment payment processed",
                                },
                                status=status.HTTP_200_OK,
                            )
                        else:
                            logger.error(
                                f"❌ Shipment is None - cannot process payment for session {session_id}, shipment_id: {shipment_id}"
                            )
                    except Exception as e:
                        logger.error(
                            f"❌ Error processing shipment webhook: {str(e)}",
                            exc_info=True,
                        )

            # Find quote by session_id (stored in payment_id) - for FCL quotes
            try:
                quote = FCLQuote.objects.get(payment_id=session_id)
            except FCLQuote.DoesNotExist:
                if event_type != "shipment":
                    logger.warning(
                        f"Quote not found for Stripe session ID: {session_id}"
                    )
                return Response({"success": True}, status=status.HTTP_200_OK)

            # Update payment status
            quote.payment_status = payment_status
            quote.payment_updated_at = timezone.now()

            # If payment is paid, update amount_paid
            if payment_status == "paid" and session.get("amount_total"):
                paid_amount = (
                    Decimal(session["amount_total"]) / 100
                )  # Convert from cents
                current_amount_paid = quote.amount_paid or Decimal("0")
                total_price = quote.total_price or Decimal("0")

                # Prevent duplicate payment processing
                # Check if this payment would exceed the total price
                expected_new_total = current_amount_paid + paid_amount

                if expected_new_total > total_price:
                    # Cap at total price to prevent overpayment
                    quote.amount_paid = total_price
                    logger.warning(
                        f"Payment for quote {quote.id} would exceed total price. Capped at €{total_price:.2f}"
                    )
                elif current_amount_paid < total_price:
                    # Only add if this payment hasn't been processed yet
                    # Check if the session was already processed by comparing amounts
                    quote.amount_paid = expected_new_total
                    logger.info(
                        f"Payment received for quote {quote.id}: €{paid_amount:.2f}. Total paid: €{quote.amount_paid:.2f}"
                    )
                else:
                    logger.info(
                        f"Payment already processed for quote {quote.id}. Current paid: €{current_amount_paid:.2f}"
                    )

                # If payment is complete (100%), log it
                if quote.total_price and quote.amount_paid >= quote.total_price:
                    logger.info(
                        f"Payment complete for quote {quote.id}: €{quote.amount_paid:.2f} / €{quote.total_price:.2f}"
                    )

            quote.save()

            logger.info(
                f"Webhook processed for quote {quote.id}: Stripe session {session_id} status updated to {payment_status}"
            )

        elif event["type"] == "checkout.session.async_payment_succeeded":
            # Handle async payment succeeded (for delayed payment methods)
            session = event["data"]["object"]
            session_id = session.get("id")

            try:
                quote = FCLQuote.objects.get(payment_id=session_id)
                quote.payment_status = "paid"
                quote.payment_updated_at = timezone.now()

                if session.get("amount_total"):
                    paid_amount = Decimal(session["amount_total"]) / 100
                    current_amount_paid = quote.amount_paid or Decimal("0")
                    if current_amount_paid < quote.total_price:
                        quote.amount_paid = current_amount_paid + paid_amount

                quote.save()
                logger.info(
                    f"Async payment succeeded for quote {quote.id}: Stripe session {session_id}"
                )
            except FCLQuote.DoesNotExist:
                logger.warning(
                    f"Quote not found for async payment session ID: {session_id}"
                )

        elif event["type"] == "checkout.session.async_payment_failed":
            # Handle async payment failed
            session = event["data"]["object"]
            session_id = session.get("id")

            try:
                quote = FCLQuote.objects.get(payment_id=session_id)
                quote.payment_status = "failed"
                quote.payment_updated_at = timezone.now()
                quote.save()
                logger.warning(
                    f"Async payment failed for quote {quote.id}: Stripe session {session_id}"
                )
            except FCLQuote.DoesNotExist:
                logger.warning(
                    f"Quote not found for failed payment session ID: {session_id}"
                )

        elif event["type"] == "payment_intent.succeeded":
            # Handle payment intent succeeded (backup handler)
            payment_intent = event["data"]["object"]
            payment_intent_id = payment_intent.get("id")

            # Try to find quote by metadata if available
            metadata = payment_intent.get("metadata", {})
            quote_id = metadata.get("quote_id")

            if quote_id:
                try:
                    quote = FCLQuote.objects.get(pk=quote_id)
                    # Only update if we have a payment_id and it matches
                    if quote.payment_id:
                        # The checkout.session.completed event should handle this
                        # But we log it for reference
                        logger.info(
                            f"Payment intent succeeded for quote {quote.id}: Payment Intent {payment_intent_id}"
                        )
                except FCLQuote.DoesNotExist:
                    logger.warning(
                        f"Quote {quote_id} not found for payment intent {payment_intent_id}"
                    )
            else:
                logger.info(
                    f"Payment intent succeeded: {payment_intent_id} (no quote_id in metadata)"
                )

        logger.info("✅ Webhook processing completed, returning 200 OK")
        return Response({"success": True}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"❌ Error processing Stripe webhook: {str(e)}", exc_info=True)
        logger.error(f"❌ Exception type: {type(e).__name__}")
        import traceback

        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        # Always return 200 OK to Stripe even on error (to prevent retries)
        # But log the error for debugging
        return Response(
            {"error": "Internal server error", "received": True},
            status=status.HTTP_200_OK,
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
        product_requests = ProductRequest.objects.filter(user=request.user).order_by(
            "-created_at"
        )

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


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_product_request_view(request, pk):
    """Delete product request (Admin only)"""
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can delete product requests"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        product_request = ProductRequest.objects.get(pk=pk)
        product_name = product_request.product_name
        product_request.delete()

        return Response(
            {
                "success": True,
                "message": f"Product request '{product_name}' deleted successfully",
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
        logger.error(f"Error in delete_product_request_view: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to delete product request"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================================
# SENDCLOUD API ENDPOINTS
# ============================================================================


@api_view(["POST"])
@permission_classes([AllowAny])  # Allow authenticated users and guests
def calculate_eu_shipping_view(request):
    """
    Calculate EU internal shipping rates using Sendcloud API

    POST /api/calculate-eu-shipping/

    Request Body:
    {
        "sender_address": "Wattweg 5",
        "sender_city": "Bergen op Zoom",
        "sender_postal_code": "4622RA",
        "sender_country": "NL",
        "receiver_address": "Main Street 123",
        "receiver_city": "Amsterdam",
        "receiver_postal_code": "1012AB",
        "receiver_country": "NL",
        "weight": 25.5,
        "length": 50,  (optional)
        "width": 40,   (optional)
        "height": 30   (optional)
    }

    Response:
    {
        "success": true,
        "shipping_methods": [
            {
                "id": 1,
                "name": "PostNL",
                "carrier": "postnl",
                "price": 6.25,
                "currency": "EUR",
                "delivery_days": "2-3"
            }
        ]
    }

    Security:
    - All inputs are validated and sanitized
    - Only EU country codes accepted
    - Weight/dimension limits enforced
    - Secure logging (no personal data)
    """
    from .sendcloud_service import (
        SendcloudAPIError,
        SendcloudValidationError,
        get_shipping_methods,
    )

    logger = logging.getLogger(__name__)

    try:
        # ✅ Extract and validate request data
        sender_address = request.data.get("sender_address")
        sender_city = request.data.get("sender_city")
        sender_postal_code = request.data.get("sender_postal_code")
        sender_country = request.data.get("sender_country")
        receiver_address = request.data.get("receiver_address")
        receiver_city = request.data.get("receiver_city")
        receiver_postal_code = request.data.get("receiver_postal_code")
        receiver_country = request.data.get("receiver_country")
        weight = request.data.get("weight")

        # Optional dimensions
        length = request.data.get("length")
        width = request.data.get("width")
        height = request.data.get("height")

        # ✅ Check required fields
        required_fields = {
            "sender_address": sender_address,
            "sender_city": sender_city,
            "sender_postal_code": sender_postal_code,
            "sender_country": sender_country,
            "receiver_address": receiver_address,
            "receiver_city": receiver_city,
            "receiver_postal_code": receiver_postal_code,
            "receiver_country": receiver_country,
            "weight": weight,
        }

        missing_fields = [
            field for field, value in required_fields.items() if not value
        ]
        if missing_fields:
            return Response(
                {
                    "success": False,
                    "error": f"Missing required fields: {', '.join(missing_fields)}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ Call Sendcloud service (validation happens inside)
        shipping_methods = get_shipping_methods(
            sender_address=sender_address,
            sender_city=sender_city,
            sender_postal_code=sender_postal_code,
            sender_country=sender_country,
            receiver_address=receiver_address,
            receiver_city=receiver_city,
            receiver_postal_code=receiver_postal_code,
            receiver_country=receiver_country,
            weight=weight,
            length=length,
            width=width,
            height=height,
        )

        logger.info(
            f"✅ Retrieved {len(shipping_methods)} shipping methods from Sendcloud"
        )

        # ✅ Calculate profit margin from ShippingSettings
        try:
            from .models import ShippingSettings

            settings_obj = ShippingSettings.get_settings()
            profit_margin_percent = float(
                settings_obj.sendcloud_profit_margin
            )  # Get percentage

            logger.info(f"📊 Calculating profit margin: {profit_margin_percent}%")

            for method in shipping_methods:
                sendcloud_price = method["price"]  # Original Sendcloud price
                profit_amount = round(
                    sendcloud_price * (profit_margin_percent / 100), 2
                )  # Calculate profit
                total_price = round(
                    sendcloud_price + profit_amount, 2
                )  # Calculate total

                # Add all prices to response
                method["profit_amount"] = profit_amount
                method["profit_margin_percent"] = profit_margin_percent
                method["total_price"] = total_price  # Frontend just displays this

                logger.info(
                    f"  💰 {method['name']}: Sendcloud=€{sendcloud_price} + Profit=€{profit_amount} = Total=€{total_price}"
                )

            logger.info(f"✅ Calculated profit for {len(shipping_methods)} methods")
        except Exception as e:
            logger.error(f"❌ Could not calculate profit margin: {str(e)}")
            logger.error(traceback.format_exc())
            logger.warning("⚠️ Profit margin not added.")

        return Response(
            {
                "success": True,
                "shipping_methods": shipping_methods,
            },
            status=status.HTTP_200_OK,
        )

    except SendcloudValidationError as e:
        # Input validation failed
        logger.warning(f"Validation error in calculate_eu_shipping: {str(e)}")
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except SendcloudAPIError as e:
        # Sendcloud API call failed
        logger.error(f"Sendcloud API error in calculate_eu_shipping: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "Unable to fetch shipping rates. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    except Exception as e:
        # Unexpected error
        logger.error(f"Unexpected error in calculate_eu_shipping: {type(e).__name__}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_shipping_methods_simple_view(request):
    """
    Get shipping methods filtered by weight and country (using test=1)

    GET /api/sendcloud/shipping-methods-simple/?weight=10&country=NL

    Query params:
    - weight: Package weight in kg (required)
    - country: Destination country code (required)

    Returns:
    {
        "success": true,
        "shipping_methods": [
            {
                "id": 1,
                "name": "PostNL",
                "carrier": "postnl",
                "min_weight": "0.0",
                "max_weight": "30.0",
                "countries": [...]
            },
            ...
        ]
    }
    """
    from .sendcloud_service import (
        SendcloudAPIError,
        SendcloudValidationError,
        get_shipping_methods_simple,
    )

    logger = logging.getLogger(__name__)

    try:
        weight = request.query_params.get("weight")
        country = request.query_params.get("country")

        if not weight:
            return Response(
                {"success": False, "error": "Weight parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not country:
            return Response(
                {"success": False, "error": "Country parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            weight_float = float(weight)
        except (TypeError, ValueError):
            return Response(
                {"success": False, "error": "Invalid weight value"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipping_methods = get_shipping_methods_simple(
            weight=weight_float,
            country=country,
        )

        logger.info(
            f"✅ Retrieved {len(shipping_methods)} shipping methods for weight={weight}kg, country={country}"
        )

        # ✅ Calculate profit margin from ShippingSettings (same as calculate_eu_shipping_view)
        try:
            from .models import ShippingSettings

            settings_obj = ShippingSettings.get_settings()
            profit_margin_percent = float(
                settings_obj.sendcloud_profit_margin
            )  # Get percentage

            logger.info(f"📊 Calculating profit margin: {profit_margin_percent}%")

            for method in shipping_methods:
                sendcloud_price = method.get("price", 0)  # Original Sendcloud price
                profit_amount = round(
                    sendcloud_price * (profit_margin_percent / 100), 2
                )  # Calculate profit
                total_price = round(
                    sendcloud_price + profit_amount, 2
                )  # Calculate total

                # Add all prices to response
                method["profit_amount"] = profit_amount
                method["profit_margin_percent"] = profit_margin_percent
                method["total_price"] = total_price  # Frontend uses this for pricing

                logger.info(
                    f"  💰 {method.get('name', 'Unknown')}: Sendcloud=€{sendcloud_price} + Profit=€{profit_amount} = Total=€{total_price}"
                )

            logger.info(
                f"✅ Calculated profit for {len(shipping_methods)} shipping methods"
            )
        except Exception as e:
            logger.error(f"❌ Could not calculate profit margin: {str(e)}")
            logger.error(traceback.format_exc())
            logger.warning("⚠️ Profit margin not added, using base prices only.")
            # If profit calculation fails, set total_price to base price
            for method in shipping_methods:
                if "total_price" not in method:
                    method["total_price"] = method.get("price", 0)
                    method["profit_amount"] = 0
                    method["profit_margin_percent"] = 0

        return Response(
            {
                "success": True,
                "shipping_methods": shipping_methods,
            },
            status=status.HTTP_200_OK,
        )

    except SendcloudValidationError as e:
        logger.warning(f"Validation error: {str(e)}")
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except SendcloudAPIError as e:
        logger.error(f"Sendcloud API error: {str(e)}")
        return Response(
            {
                "success": False,
                "error": "Unable to fetch shipping methods. Please try again.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except Exception as e:
        logger.error(f"Unexpected error: {type(e).__name__}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_sendcloud_label_view(request, shipment_id):
    """
    Download Sendcloud label for a shipment (proxy with authentication)

    GET /api/shipments/<shipment_id>/download-sendcloud-label/?type=normal_printer

    Query params:
        type: 'normal_printer' (A4) or 'label' (A6), default: 'normal_printer'
    """
    from django.http import HttpResponse

    from .sendcloud_service import (
        SendcloudAPIError,
        SendcloudValidationError,
        download_label,
    )

    logger = logging.getLogger(__name__)

    try:
        # Get shipment
        shipment = LCLShipment.objects.filter(id=shipment_id).first()
        if not shipment:
            return Response(
                {"success": False, "error": "Shipment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if user has permission (owner or admin)
        if not request.user.is_superuser and shipment.user != request.user:
            return Response(
                {"success": False, "error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if shipment has sendcloud_id
        if not shipment.sendcloud_id:
            return Response(
                {
                    "success": False,
                    "error": "Shipment does not have a Sendcloud parcel",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get label type from query params
        label_type = request.query_params.get("type", "normal_printer")

        # Download label from Sendcloud
        try:
            label_content = download_label(shipment.sendcloud_id, label_type)
        except (SendcloudAPIError, SendcloudValidationError) as e:
            logger.error(f"Failed to download label: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Return PDF as response
        response = HttpResponse(label_content, content_type="application/pdf")
        filename = f"label_{shipment.shipment_number or shipment.id}_{label_type}.pdf"
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        logger.info(f"✅ Downloaded {label_type} label for shipment {shipment_id}")
        return response

    except Exception as e:
        logger.error(f"Unexpected error: {type(e).__name__}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_eu_shipping_view(request, shipment_id):
    """
    Admin endpoint to approve and create Sendcloud parcel for a shipment

    POST /api/shipments/<shipment_id>/approve-eu-shipping/

    Creates a parcel in Sendcloud using the form data from the shipment
    """
    from .sendcloud_service import (
        SendcloudAPIError,
        SendcloudValidationError,
        create_parcel,
    )

    logger = logging.getLogger(__name__)

    # Check if user is admin
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can approve EU shipping"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        # Get shipment
        shipment = LCLShipment.objects.filter(id=shipment_id).first()
        if not shipment:
            return Response(
                {"success": False, "error": "Shipment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if shipment already has sendcloud_id
        if shipment.sendcloud_id:
            return Response(
                {
                    "success": False,
                    "error": "Shipment already has a Sendcloud parcel created",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if required fields are present
        if not shipment.selected_eu_shipping_method:
            return Response(
                {
                    "success": False,
                    "error": "No shipping method selected for this shipment",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate all required EU pickup fields with fallbacks for older shipments
        missing_fields = []

        # Use fallback for name if missing (use receiver_name for EU pickup)
        pickup_name = shipment.eu_pickup_name
        if not pickup_name or not pickup_name.strip():
            pickup_name = shipment.receiver_name
            if not pickup_name or not pickup_name.strip():
                missing_fields.append("name")

        # Check address
        if not shipment.eu_pickup_address or not shipment.eu_pickup_address.strip():
            missing_fields.append("address")

        # Check city
        if not shipment.eu_pickup_city or not shipment.eu_pickup_city.strip():
            missing_fields.append("city")

        # Check postal_code
        if (
            not shipment.eu_pickup_postal_code
            or not shipment.eu_pickup_postal_code.strip()
        ):
            missing_fields.append("postal_code")

        # Check country
        if not shipment.eu_pickup_country or not shipment.eu_pickup_country.strip():
            missing_fields.append("country")

        # Check weight
        if not shipment.eu_pickup_weight or float(shipment.eu_pickup_weight) <= 0:
            missing_fields.append("weight")

        if missing_fields:
            return Response(
                {
                    "success": False,
                    "error": f"Missing required EU pickup information: {', '.join(missing_fields)}",
                    "missing_fields": missing_fields,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prepare shipment data for Sendcloud (using new form fields with fallbacks)
        shipment_data = {
            "name": pickup_name.strip(),
            "address": shipment.eu_pickup_address.strip(),
            "city": shipment.eu_pickup_city.strip(),
            "postal_code": shipment.eu_pickup_postal_code.strip(),
            "country": shipment.eu_pickup_country.strip(),
            "weight": float(shipment.eu_pickup_weight),
        }

        # Add optional fields with fallbacks
        if shipment.eu_pickup_company_name:
            shipment_data["company_name"] = shipment.eu_pickup_company_name

        if shipment.eu_pickup_house_number:
            shipment_data["house_number"] = shipment.eu_pickup_house_number

        # Use fallback for email if missing (use receiver_email)
        pickup_email = shipment.eu_pickup_email
        if not pickup_email or not pickup_email.strip():
            pickup_email = shipment.receiver_email
        if pickup_email and pickup_email.strip():
            shipment_data["email"] = pickup_email.strip()

        # Use fallback for telephone if missing (use receiver_phone)
        pickup_telephone = shipment.eu_pickup_telephone
        if not pickup_telephone or not pickup_telephone.strip():
            pickup_telephone = shipment.receiver_phone
        if pickup_telephone and pickup_telephone.strip():
            shipment_data["telephone"] = pickup_telephone.strip()

        if shipment.shipment_number:
            shipment_data["order_number"] = shipment.shipment_number

        # Create parcel in Sendcloud
        logger.info(
            f"Admin {request.user.username} approving EU shipping for shipment {shipment_id}"
        )
        logger.info(
            f"Shipment data being sent to Sendcloud: {list(shipment_data.keys())}"
        )
        logger.debug(f"Full shipment data: {shipment_data}")
        logger.info(
            f"Selected shipping method ID: {shipment.selected_eu_shipping_method}"
        )

        try:
            sendcloud_result = create_parcel(
                shipment_data=shipment_data,
                selected_shipping_method=shipment.selected_eu_shipping_method,
            )
        except Exception as e:
            logger.error(f"Error calling create_parcel: {type(e).__name__}: {str(e)}")
            import traceback

            logger.error(f"Traceback: {traceback.format_exc()}")
            raise

        # Update shipment with Sendcloud data
        shipment.sendcloud_id = sendcloud_result.get("sendcloud_id")
        tracking_number = sendcloud_result.get("tracking_number", "")
        shipment.tracking_number = tracking_number if tracking_number else ""

        tracking_url = sendcloud_result.get("tracking_url")
        shipment.tracking_url = tracking_url if tracking_url else None

        label_url_a6 = sendcloud_result.get("label_url_a6")
        label_url = sendcloud_result.get("label_url")
        shipment.sendcloud_label_url = label_url_a6 or label_url or None

        # Store A4 labels
        normal_printer_labels = sendcloud_result.get("normal_printer_labels", [])
        shipment.normal_printer_labels = (
            normal_printer_labels if normal_printer_labels else []
        )

        # Update status
        if shipment.sendcloud_id:
            shipment.status = "PENDING_PICKUP"

        shipment.save()

        logger.info(
            f"✅ Admin approved EU shipping for shipment {shipment_id}: sendcloud_id={shipment.sendcloud_id}"
        )

        return Response(
            {
                "success": True,
                "message": "EU shipping approved and Sendcloud parcel created",
                "sendcloud_id": shipment.sendcloud_id,
                "tracking_number": shipment.tracking_number,
            },
            status=status.HTTP_200_OK,
        )

    except SendcloudValidationError as e:
        logger.warning(f"Validation error: {str(e)}")
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except SendcloudAPIError as e:
        error_msg = str(e)
        logger.error(f"Sendcloud API error: {error_msg}")
        # Return the actual error message to help with debugging
        return Response(
            {"success": False, "error": error_msg},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except Exception as e:
        logger.error(f"Unexpected error: {type(e).__name__}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_eu_shipping_view(request, shipment_id):
    """
    Admin endpoint to delete/remove EU shipping method from a shipment

    POST /api/shipments/<shipment_id>/delete-eu-shipping/

    Removes the selected EU shipping method and related data
    """
    logger = logging.getLogger(__name__)

    # Check if user is admin
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can delete EU shipping"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        # Get shipment
        shipment = LCLShipment.objects.filter(id=shipment_id).first()
        if not shipment:
            return Response(
                {"success": False, "error": "Shipment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if sendcloud_id exists (parcel already created)
        if shipment.sendcloud_id:
            return Response(
                {
                    "success": False,
                    "error": "Cannot delete EU shipping: Sendcloud parcel already created. Contact Sendcloud support to cancel.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Remove EU shipping method and related data
        shipment.selected_eu_shipping_method = None
        shipment.selected_eu_shipping_name = ""
        shipment.save()

        logger.info(f"✅ Admin deleted EU shipping method for shipment {shipment_id}")

        return Response(
            {
                "success": True,
                "message": "EU shipping method removed successfully",
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger.error(f"Unexpected error: {type(e).__name__}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])  # Webhooks come from Sendcloud, not authenticated users
def sendcloud_webhook_view(request):
    """
    Handle Sendcloud webhook notifications

    POST /api/sendcloud/webhook/

    Headers:
        Sendcloud-Signature: HMAC signature for verification

    Body:
    {
        "parcel": {
            "id": 12345,
            "tracking_number": "3SABCD...",
            "status": {
                "id": 1,
                "message": "delivered"
            },
            "carrier": {
                "code": "postnl"
            }
        },
        "timestamp": "2024-01-01T10:00:00Z",
        "action": "parcel_status_changed"
    }

    Security:
    - Webhook signature verification (HMAC-SHA256)
    - Payload validation
    - Prevents fake webhook attacks
    """
    from .sendcloud_service import (
        SendcloudValidationError,
        parse_webhook_data,
        verify_webhook_signature,
    )

    logger = logging.getLogger(__name__)

    try:
        # ✅ STEP 1: Get signature from headers
        signature = request.headers.get("Sendcloud-Signature", "")

        # ✅ STEP 2: Verify webhook signature
        if not verify_webhook_signature(request.body, signature):
            logger.error(
                "⚠️ Sendcloud webhook signature verification FAILED - rejecting request"
            )
            return Response(
                {"success": False, "error": "Invalid signature"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        logger.info("✅ Sendcloud webhook signature verified")

        # ✅ STEP 3: Parse request body
        try:
            webhook_data = request.data
        except Exception:
            logger.error("Failed to parse webhook JSON")
            return Response(
                {"success": False, "error": "Invalid JSON"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ✅ STEP 4: Validate and extract webhook data
        validated_data = parse_webhook_data(webhook_data)

        sendcloud_id = validated_data["sendcloud_id"]
        tracking_number = validated_data["tracking_number"]
        status_message = validated_data["status"]
        carrier = validated_data["carrier"]

        logger.info(
            f"Webhook received: Parcel {sendcloud_id}, "
            f"Tracking: {tracking_number}, Status: {status_message}, Carrier: {carrier}"
        )

        # ✅ STEP 5: Update shipment in database
        # TODO: Find and update the LCL shipment based on sendcloud_id
        # For now, just log and acknowledge

        # Note: This will be implemented when we create LCLShipment model
        logger.info(f"Webhook processed successfully for parcel {sendcloud_id}")

        # ✅ Return 200 OK to acknowledge receipt
        return Response(
            {"success": True, "message": "Webhook processed"},
            status=status.HTTP_200_OK,
        )

    except SendcloudValidationError as e:
        logger.warning(f"Webhook validation failed: {str(e)}")
        return Response(
            {"success": False, "error": "Invalid webhook data"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        logger.error(f"Unexpected error in sendcloud_webhook: {type(e).__name__}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Internal server error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================================
# SYRIAN INTERNAL TRANSPORT PRICING API ENDPOINTS
# ============================================================================


@api_view(["GET"])
@permission_classes([AllowAny])
def get_syrian_provinces_view(request):
    """
    Get list of all active Syrian provinces with pricing

    GET /api/syrian-provinces/

    Response:
    {
        "success": true,
        "provinces": [
            {
                "id": 1,
                "province_code": "DAMASCUS",
                "province_name_ar": "دمشق",
                "province_name_en": "Damascus",
                "min_price": "10.00",
                "rate_per_kg": "0.07",
                "is_active": true,
                "display_order": 1
            }
        ]
    }
    """
    try:
        provinces = SyrianProvincePrice.objects.filter(is_active=True)
        serializer = SyrianProvincePriceSerializer(provinces, many=True)

        return Response(
            {"success": True, "provinces": serializer.data},
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching Syrian provinces: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to fetch provinces"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def calculate_syria_transport_view(request):
    """
    Calculate Syrian internal transport price

    POST /api/calculate-syria-transport/

    Request Body:
    {
        "province_code": "DAMASCUS",
        "weight": 100.5
    }

    Response:
    {
        "success": true,
        "province": {
            "code": "DAMASCUS",
            "name_ar": "دمشق",
            "name_en": "Damascus"
        },
        "weight": 100.5,
        "min_price": 10.00,
        "rate_per_kg": 0.07,
        "calculated_price": 14.04,
        "breakdown": {
            "weight_cost": 7.04,
            "min_price": 10.00,
            "final_price": 14.04
        }
    }
    """
    try:
        province_code = request.data.get("province_code")
        weight = request.data.get("weight")

        # Validation
        if not province_code:
            return Response(
                {"success": False, "error": "Province code is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if weight is None or weight <= 0:
            return Response(
                {"success": False, "error": "Valid weight is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get province
        try:
            province = SyrianProvincePrice.objects.get(
                province_code=province_code.upper(), is_active=True
            )
        except SyrianProvincePrice.DoesNotExist:
            return Response(
                {"success": False, "error": "Province not found or inactive"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Calculate price using model method
        final_price = province.calculate_price(float(weight))
        weight_cost = float(weight) * float(province.rate_per_kg)

        return Response(
            {
                "success": True,
                "province": {
                    "code": province.province_code,
                    "name_ar": province.province_name_ar,
                    "name_en": province.province_name_en,
                },
                "weight": float(weight),
                "min_price": float(province.min_price),
                "rate_per_kg": float(province.rate_per_kg),
                "calculated_price": round(final_price, 2),
                "breakdown": {
                    "weight_cost": round(weight_cost, 2),
                    "min_price": float(province.min_price),
                    "final_price": round(final_price, 2),
                },
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error calculating Syria transport price: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {"success": False, "error": "Failed to calculate price"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ============================================================================
# ADMIN CRUD FOR SYRIAN PROVINCE PRICING
# ============================================================================


@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def admin_syrian_provinces_view(request):
    """
    Admin endpoint to list all provinces or create new province

    GET /api/admin/syrian-provinces/
    Returns all provinces (active and inactive)

    POST /api/admin/syrian-provinces/
    Create new province
    """
    if request.method == "GET":
        try:
            provinces = SyrianProvincePrice.objects.all()
            serializer = SyrianProvincePriceSerializer(provinces, many=True)

            return Response(
                {"success": True, "provinces": serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error fetching all provinces (admin): {str(e)}")
            return Response(
                {"success": False, "error": "Failed to fetch provinces"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    elif request.method == "POST":
        try:
            serializer = SyrianProvincePriceSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                logger = logging.getLogger(__name__)
                logger.info(
                    f"✅ Admin created new Syrian province: {serializer.data['province_code']}"
                )

                return Response(
                    {
                        "success": True,
                        "message": "Province created successfully",
                        "province": serializer.data,
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    {"success": False, "errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating province (admin): {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"success": False, "error": "Failed to create province"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAdminUser])
def admin_syrian_province_detail_view(request, pk):
    """
    Admin endpoint to retrieve, update or delete a specific province

    GET /api/admin/syrian-provinces/<id>/
    Retrieve province details

    PUT /api/admin/syrian-provinces/<id>/
    Update province

    DELETE /api/admin/syrian-provinces/<id>/
    Delete province
    """
    try:
        province = SyrianProvincePrice.objects.get(pk=pk)
    except SyrianProvincePrice.DoesNotExist:
        return Response(
            {"success": False, "error": "Province not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = SyrianProvincePriceSerializer(province)
        return Response(
            {"success": True, "province": serializer.data},
            status=status.HTTP_200_OK,
        )

    elif request.method == "PUT":
        try:
            serializer = SyrianProvincePriceSerializer(
                province, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                logger = logging.getLogger(__name__)
                logger.info(
                    f"✅ Admin updated Syrian province: {province.province_code}"
                )

                return Response(
                    {
                        "success": True,
                        "message": "Province updated successfully",
                        "province": serializer.data,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"success": False, "errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating province (admin): {str(e)}")
            return Response(
                {"success": False, "error": "Failed to update province"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    elif request.method == "DELETE":
        try:
            province_code = province.province_code
            province.delete()

            logger = logging.getLogger(__name__)
            logger.info(f"✅ Admin deleted Syrian province: {province_code}")

            return Response(
                {"success": True, "message": "Province deleted successfully"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error deleting province (admin): {str(e)}")
            return Response(
                {"success": False, "error": "Failed to delete province"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============================================================================
# ADMIN SHIPPING SETTINGS API
# ============================================================================


@api_view(["GET", "PUT"])
@permission_classes([IsAdminUser])
def admin_shipping_settings_view(request):
    """
    Admin endpoint to get or update shipping settings

    GET /api/admin/shipping-settings/
    Returns the shipping settings (singleton)

    PUT /api/admin/shipping-settings/
    Update shipping settings
    Body: {
        "sendcloud_profit_margin": 10.00
    }
    """
    from .models import ShippingSettings

    if request.method == "GET":
        try:
            settings = ShippingSettings.get_settings()

            return Response(
                {
                    "success": True,
                    "settings": {
                        "id": settings.id,
                        "sendcloud_profit_margin": float(
                            settings.sendcloud_profit_margin
                        ),
                        "created_at": settings.created_at,
                        "updated_at": settings.updated_at,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error fetching shipping settings (admin): {str(e)}")
            return Response(
                {"success": False, "error": "Failed to fetch shipping settings"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    elif request.method == "PUT":
        try:
            settings = ShippingSettings.get_settings()

            # Get profit margin from request
            profit_margin = request.data.get("sendcloud_profit_margin")

            if profit_margin is None:
                return Response(
                    {"success": False, "error": "sendcloud_profit_margin is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate profit margin
            try:
                profit_margin = float(profit_margin)
                if profit_margin < 0:
                    return Response(
                        {"success": False, "error": "Profit margin cannot be negative"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except (ValueError, TypeError):
                return Response(
                    {"success": False, "error": "Invalid profit margin value"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update settings
            settings.sendcloud_profit_margin = profit_margin
            settings.save()

            logger = logging.getLogger(__name__)
            logger.info(f"✅ Admin updated Sendcloud profit margin to {profit_margin}%")

            return Response(
                {
                    "success": True,
                    "message": "Shipping settings updated successfully",
                    "settings": {
                        "id": settings.id,
                        "sendcloud_profit_margin": float(
                            settings.sendcloud_profit_margin
                        ),
                        "updated_at": settings.updated_at,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating shipping settings (admin): {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"success": False, "error": "Failed to update shipping settings"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ===================================================================================================
# LCL Shipment Views
# ===================================================================================================


class LCLShipmentView(generics.CreateAPIView):
    """API endpoint to create LCL shipment"""

    serializer_class = LCLShipmentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        """Override create to handle FormData with images and add reCAPTCHA verification"""
        logger = logging.getLogger(__name__)
        import json
        import os

        from django.core.files.base import ContentFile
        from django.core.files.storage import default_storage

        # Log immediately to verify method is called
        logger.info("=" * 80)
        logger.info("LCLShipmentView.create - METHOD CALLED")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"request.data type: {type(request.data)}")
        logger.info(
            f"request.data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'N/A'}"
        )
        logger.info(f"request.FILES keys: {list(request.FILES.keys())}")
        logger.info(f"request.FILES count: {len(request.FILES)}")

        # Check if request contains FormData with shipment_data
        shipment_data_json = request.data.get("shipment_data")
        logger.info(f"shipment_data_json exists: {shipment_data_json is not None}")
        logger.info(f"shipment_data_json type: {type(shipment_data_json)}")
        if shipment_data_json:
            logger.info(f"shipment_data_json length: {len(str(shipment_data_json))}")

        if shipment_data_json:
            # Parse JSON data
            try:
                if isinstance(shipment_data_json, str):
                    shipment_data = json.loads(shipment_data_json)
                else:
                    shipment_data = shipment_data_json
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to parse shipment_data JSON: {str(e)}")
                return Response(
                    {"success": False, "error": "Invalid shipment data format"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Extract parcels from shipment_data
            parcels = shipment_data.get("parcels", [])
            logger.info(f"Processing {len(parcels)} parcels with images")
            logger.info(f"Available FILES keys: {list(request.FILES.keys())}")

            # Process images and add URLs to parcels
            for parcel_index, parcel in enumerate(parcels):
                logger.info(
                    f"Processing parcel {parcel_index}: isElectronics={parcel.get('isElectronicsShipment')}"
                )
                # Initialize image arrays
                parcel["photo_urls"] = []
                parcel["device_photo_url"] = None
                parcel["electronics_picture_url"] = None

                # Process parcel photos (for non-electronics)
                photo_index = 0
                while True:
                    photo_key = f"parcel_{parcel_index}_photo_{photo_index}"
                    if photo_key in request.FILES:
                        photo_file = request.FILES[photo_key]
                        logger.info(
                            f"Found photo: {photo_key}, size: {photo_file.size}"
                        )
                        # Save photo
                        file_path = f"parcel_photos/shipment_{parcel_index}/photo_{photo_index}_{photo_file.name}"
                        saved_path = default_storage.save(
                            file_path, ContentFile(photo_file.read())
                        )
                        # Get URL
                        photo_url = default_storage.url(saved_path)
                        parcel["photo_urls"].append(photo_url)
                        logger.info(f"Saved photo {photo_index} to: {photo_url}")
                        photo_index += 1
                    else:
                        break
                logger.info(
                    f"Parcel {parcel_index} has {len(parcel['photo_urls'])} photos"
                )

                # Process electronics photos
                if parcel.get("isElectronicsShipment") or parcel.get(
                    "is_electronics_shipment"
                ):
                    # Device photo
                    device_photo_key = f"parcel_{parcel_index}_device_photo"
                    if device_photo_key in request.FILES:
                        device_photo_file = request.FILES[device_photo_key]
                        file_path = f"electronics_photos/shipment_{parcel_index}/device_{device_photo_file.name}"
                        saved_path = default_storage.save(
                            file_path, ContentFile(device_photo_file.read())
                        )
                        parcel["device_photo_url"] = default_storage.url(saved_path)

                    # Electronics picture
                    electronics_picture_key = (
                        f"parcel_{parcel_index}_electronics_picture"
                    )
                    if electronics_picture_key in request.FILES:
                        electronics_picture_file = request.FILES[
                            electronics_picture_key
                        ]
                        file_path = f"electronics_photos/shipment_{parcel_index}/electronics_{electronics_picture_file.name}"
                        saved_path = default_storage.save(
                            file_path, ContentFile(electronics_picture_file.read())
                        )
                        parcel["electronics_picture_url"] = default_storage.url(
                            saved_path
                        )

            # Clean up parcels: remove any File objects that might have been included
            for parcel in parcels:
                # Remove any File objects or empty objects that might have been serialized
                if "photos" in parcel and isinstance(parcel["photos"], list):
                    # Remove empty objects from photos array (these are File objects that were serialized)
                    parcel["photos"] = [
                        p
                        for p in parcel["photos"]
                        if p and not (isinstance(p, dict) and len(p) == 0)
                    ]
                    # If photos array is now empty or only contains empty objects, remove it
                    if not parcel["photos"]:
                        del parcel["photos"]

                # Remove devicePhoto and electronicsPicture if they're empty objects
                if (
                    "devicePhoto" in parcel
                    and isinstance(parcel["devicePhoto"], dict)
                    and len(parcel["devicePhoto"]) == 0
                ):
                    del parcel["devicePhoto"]
                if (
                    "electronicsPicture" in parcel
                    and isinstance(parcel["electronicsPicture"], dict)
                    and len(parcel["electronicsPicture"]) == 0
                ):
                    del parcel["electronicsPicture"]

            # Update shipment_data with processed parcels
            shipment_data["parcels"] = parcels
            logger.info(
                f"Updated parcels with photo URLs. Parcel 0 has {parcels[0].get('photo_urls', []) if parcels else []} photos"
            )
            logger.info(
                f"Final parcels data: {json.dumps(parcels, indent=2, default=str)[:500]}"
            )

            # Replace request.data with processed data for serializer
            request._full_data = shipment_data
        else:
            # Regular JSON request (backward compatibility)
            shipment_data = dict(request.data)

        # Verify reCAPTCHA v3 token if provided
        # Extract token the same way as registration - try request.data first, then shipment_data
        recaptcha_token = request.data.get("recaptcha_token") or shipment_data.get(
            "recaptcha_token"
        )

        # Check if reCAPTCHA is configured (standard v3 only)
        from django.conf import settings

        has_recaptcha_config = getattr(settings, "RECAPTCHA_SECRET_KEY", None)

        if has_recaptcha_config:
            # reCAPTCHA is configured, so token is required
            if not recaptcha_token:
                return Response(
                    {
                        "success": False,
                        "error": "reCAPTCHA verification is required. Please complete the reCAPTCHA verification.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verify the token
            from .recaptcha_verify import verify_recaptcha_token

            verification_result = verify_recaptcha_token(
                token=recaptcha_token, action="create_shipment"
            )

            if not verification_result.get("success"):
                logger.warning(
                    f"reCAPTCHA verification failed for LCL shipment: {verification_result.get('error')}"
                )
                return Response(
                    {
                        "success": False,
                        "error": "reCAPTCHA verification failed. Please try again.",
                        "details": verification_result.get("error", "Unknown error"),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif recaptcha_token:
            # Token provided but reCAPTCHA not configured - verify anyway (might be test key)
            from .recaptcha_verify import verify_recaptcha_token

            verification_result = verify_recaptcha_token(
                token=recaptcha_token, action="create_shipment"
            )
            # Log warning but don't block submission if reCAPTCHA is not configured
            if not verification_result.get("success"):
                logger.warning(
                    f"reCAPTCHA token provided but verification failed (reCAPTCHA may not be configured): {verification_result.get('error')}"
                )

        # If we processed FormData, manually create serializer with processed data
        if shipment_data_json:
            # Ensure parcels is a list (not string) for JSONField
            if "parcels" in shipment_data and isinstance(shipment_data["parcels"], str):
                try:
                    shipment_data["parcels"] = json.loads(shipment_data["parcels"])
                except (json.JSONDecodeError, TypeError):
                    logger.error("Failed to parse parcels JSON string")

            logger.info(
                f"Final shipment_data parcels type: {type(shipment_data.get('parcels'))}"
            )
            if shipment_data.get("parcels"):
                logger.info(
                    f"Final shipment_data first parcel: {json.dumps(shipment_data['parcels'][0] if len(shipment_data['parcels']) > 0 else {}, indent=2, default=str)[:500]}"
                )

            serializer = self.get_serializer(data=shipment_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            # Refresh shipment from DB to get saved parcels
            shipment = serializer.instance
            shipment.refresh_from_db()
            if shipment.parcels and len(shipment.parcels) > 0:
                logger.info(
                    f"After save, first parcel: {json.dumps(shipment.parcels[0], indent=2, default=str)[:500]}"
                )

            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )

        # Call parent create method for regular JSON requests
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        """Set user to current authenticated user"""
        serializer.save(user=self.request.user)

        # Log creation
        logger = logging.getLogger(__name__)
        shipment = serializer.instance
        logger.info(
            f"Created LCL shipment {shipment.id} - {shipment.shipment_number} for user {self.request.user.id}"
        )

        # Send email notifications asynchronously to prevent timeout
        try:
            import threading

            from .email_service import (
                send_lcl_shipment_confirmation_email,
                send_lcl_shipment_notification_to_admin,
            )

            def send_emails_async():
                """Send emails in background thread"""
                try:
                    # Send confirmation email to user
                    send_lcl_shipment_confirmation_email(shipment)
                    # Send notification email to admin
                    send_lcl_shipment_notification_to_admin(shipment)
                except Exception as email_error:
                    logger.error(
                        f"Failed to send LCL shipment email notifications: {str(email_error)}",
                        exc_info=True,
                    )

            # Start email sending in background thread
            email_thread = threading.Thread(target=send_emails_async, daemon=True)
            email_thread.start()
            logger.info(
                f"Started background thread for sending LCL shipment emails for shipment {shipment.id}"
            )
        except Exception as email_error:
            logger.error(
                f"Failed to start email thread for LCL shipment: {str(email_error)}",
                exc_info=True,
            )
            # Don't fail the request if email fails


class LCLShipmentListView(generics.ListAPIView):
    """API endpoint to list user's LCL shipments (or all shipments for admin)"""

    serializer_class = LCLShipmentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return shipments for the authenticated user, or all shipments if admin"""
        if not self.request.user.is_authenticated:
            return LCLShipment.objects.none()

        # If user is superuser, return all shipments
        if self.request.user.is_superuser:
            return LCLShipment.objects.all().order_by("-created_at")
        else:
            # Regular user - only their shipments
            return LCLShipment.objects.filter(user=self.request.user).order_by(
                "-created_at"
            )


class LCLShipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint to retrieve, update, or delete a specific LCL shipment"""

    serializer_class = LCLShipmentSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """Return shipments for the authenticated user, or all shipments if admin"""
        if not self.request.user.is_authenticated:
            return LCLShipment.objects.none()

        # Admin can access all shipments, regular users only their own
        if self.request.user.is_superuser:
            return LCLShipment.objects.all()
        return LCLShipment.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        """Override update to support partial updates"""
        partial = kwargs.pop("partial", True)  # Always allow partial updates
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_object_cache", None):
            instance._prefetched_object_cache = {}

        logger = logging.getLogger(__name__)
        logger.info(
            f"Updated LCL shipment {instance.id} - {instance.shipment_number} by user {request.user.id}"
        )

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete LCL shipment"""
        instance = self.get_object()

        # Check if user is not admin and shipment status is PENDING_PAYMENT or later
        if not request.user.is_superuser:
            locked_statuses = [
                "PENDING_PAYMENT",
                "PENDING_PICKUP",
                "IN_TRANSIT_TO_WATTWEG_5",
                "ARRIVED_WATTWEG_5",
                "SORTING_WATTWEG_5",
                "READY_FOR_EXPORT",
                "IN_TRANSIT_TO_DESTINATION",
                "ARRIVED_DESTINATION",
                "DESTINATION_SORTING",
                "READY_FOR_DELIVERY",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ]
            if instance.status in locked_statuses:
                return Response(
                    {
                        "success": False,
                        "error": "Cannot delete shipment after payment process has started. Only admins can delete shipments in this status.",
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        self.perform_destroy(instance)
        return Response(
            {"success": True, "message": "LCL shipment deleted successfully."},
            status=status.HTTP_200_OK,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_lcl_shipment_status_view(request, pk):
    """API endpoint for admin to update LCL shipment status and amount_paid"""
    logger = logging.getLogger(__name__)

    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only superusers can update shipment status."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        shipment = LCLShipment.objects.get(pk=pk)
        new_status = request.data.get("status")
        amount_paid = request.data.get("amount_paid")
        tracking_number = request.data.get("tracking_number")

        # Store old status for email notification (before any updates)
        old_status = shipment.status
        old_payment_status = shipment.payment_status

        logger.info(
            f"📝 Updating shipment {shipment.id}: old_status={old_status}, new_status={new_status}, old_payment_status={old_payment_status}, amount_paid={amount_paid}, current_amount_paid={shipment.amount_paid}, total_price={shipment.total_price}"
        )

        # Update status if provided
        if new_status:
            # Validate status
            valid_statuses = [choice[0] for choice in LCLShipment.STATUS_CHOICES]
            if new_status not in valid_statuses:
                return Response(
                    {
                        "success": False,
                        "error": f"Invalid status. Valid statuses are: {', '.join(valid_statuses)}",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if payment is 100% before allowing status updates to certain statuses
            restricted_statuses = [
                "IN_TRANSIT_TO_WATTWEG_5",
                "ARRIVED_WATTWEG_5",
                "SORTING_WATTWEG_5",
                "READY_FOR_EXPORT",
                "IN_TRANSIT_TO_DESTINATION",
                "ARRIVED_DESTINATION",
                "DESTINATION_SORTING",
                "READY_FOR_DELIVERY",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
            ]
            if new_status in restricted_statuses:
                if shipment.total_price and shipment.total_price > 0:
                    payment_percentage = (
                        (shipment.amount_paid or 0) / shipment.total_price * 100
                        if shipment.amount_paid
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

            shipment.status = new_status

        # Update amount_paid if provided
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
                if shipment.total_price and amount_paid_decimal > shipment.total_price:
                    return Response(
                        {
                            "success": False,
                            "error": "Amount paid cannot be greater than total price.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                shipment.amount_paid = amount_paid_decimal
            except (ValueError, TypeError):
                return Response(
                    {
                        "success": False,
                        "error": "Invalid amount_paid value.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Update tracking_number if provided
        if tracking_number is not None:
            shipment.tracking_number = tracking_number

        # Auto-update payment_status to "paid" when status changes from PENDING_PAYMENT to any other status
        # This means admin confirmed the payment by changing the status
        payment_status_updated = False

        # If status is changing from PENDING_PAYMENT to any other status, payment is confirmed
        if (
            new_status
            and old_status == "PENDING_PAYMENT"
            and new_status != "PENDING_PAYMENT"
        ):
            # If admin is changing status from PENDING_PAYMENT, it means payment is confirmed
            # Update payment_status to "paid" automatically
            if shipment.payment_status != "paid":
                shipment.payment_status = "paid"
                payment_status_updated = True
                if not shipment.paid_at:
                    from django.utils import timezone

                    shipment.paid_at = timezone.now()
                logger.info(
                    f"✅ Auto-updated payment_status to 'paid' for shipment {shipment.id} (admin confirmed payment by changing status from {old_status} to {new_status})"
                )
            else:
                logger.info(
                    f"ℹ️ payment_status already 'paid' for shipment {shipment.id}"
                )

        # Also: if status is being changed to PENDING_PICKUP or any status after PENDING_PAYMENT,
        # and payment_status is still pending, update it to paid (admin confirmed payment)
        if (
            not payment_status_updated
            and new_status
            and new_status != "PENDING_PAYMENT"
        ):
            # Statuses that come after PENDING_PAYMENT (payment must be confirmed)
            post_payment_statuses = [
                "PENDING_PICKUP",
                "IN_TRANSIT_TO_WATTWEG_5",
                "ARRIVED_WATTWEG_5",
                "SORTING_WATTWEG_5",
                "READY_FOR_EXPORT",
                "IN_TRANSIT_TO_DESTINATION",
                "ARRIVED_DESTINATION",
                "DESTINATION_SORTING",
                "READY_FOR_DELIVERY",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
            ]
            if (
                new_status in post_payment_statuses
                and shipment.payment_status == "pending"
            ):
                shipment.payment_status = "paid"
                payment_status_updated = True
                if not shipment.paid_at:
                    from django.utils import timezone

                    shipment.paid_at = timezone.now()
                logger.info(
                    f"✅ Auto-updated payment_status to 'paid' for shipment {shipment.id} (status changed to {new_status}, which requires payment confirmation)"
                )

        # Also update payment_status if amount_paid is being set and equals total_price
        if (
            not payment_status_updated
            and amount_paid is not None
            and shipment.total_price
            and shipment.total_price > 0
        ):
            if (
                float(amount_paid) >= float(shipment.total_price)
                and shipment.payment_status != "paid"
            ):
                shipment.payment_status = "paid"
                payment_status_updated = True
                if not shipment.paid_at:
                    from django.utils import timezone

                    shipment.paid_at = timezone.now()
                logger.info(
                    f"✅ Auto-updated payment_status to 'paid' for shipment {shipment.id} (amount_paid {amount_paid} >= total_price {shipment.total_price})"
                )

        # Also check current amount_paid if status is being changed (even if not from PENDING_PAYMENT)
        if not payment_status_updated and new_status and old_status != new_status:
            if (
                shipment.amount_paid
                and shipment.total_price
                and shipment.total_price > 0
            ):
                if (
                    float(shipment.amount_paid) >= float(shipment.total_price)
                    and shipment.payment_status != "paid"
                ):
                    shipment.payment_status = "paid"
                    payment_status_updated = True
                    if not shipment.paid_at:
                        from django.utils import timezone

                        shipment.paid_at = timezone.now()
                    logger.info(
                        f"✅ Auto-updated payment_status to 'paid' for shipment {shipment.id} (current amount_paid {shipment.amount_paid} >= total_price {shipment.total_price})"
                    )

        shipment.save()

        # Generate invoice automatically if status changed from PENDING_PAYMENT to any other status
        # and payment_status is 'paid'
        if (
            new_status
            and old_status == "PENDING_PAYMENT"
            and new_status != "PENDING_PAYMENT"
        ):
            if shipment.payment_status == "paid" and not shipment.invoice_file:
                try:
                    from .document_service import (
                        generate_consolidated_export_invoice,
                        generate_invoice,
                        save_invoice_to_storage,
                    )
                    from .email_service import (
                        send_consolidated_export_invoice_email_to_admin,
                        send_invoice_email_to_admin,
                        send_invoice_email_to_user,
                    )

                    # Generate regular invoice PDF
                    pdf_bytes = generate_invoice(shipment, language="ar")

                    # Save to storage
                    save_invoice_to_storage(shipment, pdf_bytes)

                    # Send standard invoice by email (user + admin)
                    try:
                        user_sent = send_invoice_email_to_user(shipment, pdf_bytes)
                        admin_sent = send_invoice_email_to_admin(shipment, pdf_bytes)
                        if user_sent:
                            logger.info(
                                f"✅ Invoice email sent to user for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Invoice email to user failed for shipment {shipment.id} (check email config or user email)"
                            )
                        if admin_sent:
                            logger.info(
                                f"✅ Invoice email sent to admin for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Invoice email to admin failed for shipment {shipment.id} (check email config)"
                            )
                    except Exception as email_error:
                        logger.error(
                            f"❌ Failed to send invoice emails: {str(email_error)}",
                            exc_info=True,
                        )
                        # Don't fail if email fails

                    logger.info(
                        f"✅ Invoice generated and saved for shipment {shipment.id}"
                    )
                except Exception as invoice_error:
                    # Log error but don't fail the request
                    logger.error(
                        f"Failed to generate invoice automatically: {str(invoice_error)}",
                        exc_info=True,
                    )

            # Additionally, when moving from PENDING_PAYMENT to any other status (like PENDING_PICKUP),
            # generate Consolidated Export Invoice for admin only
            if (
                new_status
                and new_status != "PENDING_PAYMENT"
                and shipment.payment_status == "paid"
            ):
                try:
                    from .document_service import generate_consolidated_export_invoice
                    from .email_service import (
                        send_consolidated_export_invoice_email_to_admin,
                    )

                    consolidated_pdf = generate_consolidated_export_invoice(
                        shipment, language="en"
                    )
                    admin_sent = send_consolidated_export_invoice_email_to_admin(
                        shipment, consolidated_pdf
                    )
                    if admin_sent:
                        logger.info(
                            f"✅ Consolidated export invoice generated and emailed for shipment {shipment.id}"
                        )
                    else:
                        logger.warning(
                            f"⚠️ Consolidated export invoice generated but email failed for shipment {shipment.id} (check email config)"
                        )
                except Exception as consolidated_error:
                    logger.error(
                        f"Failed to generate/send consolidated export invoice: {str(consolidated_error)}",
                        exc_info=True,
                    )

        # Generate receipt automatically when shipment arrives at specific locations
        # For eu-sy: when status changes to ARRIVED_WATTWEG_5
        # For sy-eu: when status changes to ARRIVED_WATTWEG_5 (Arrived at Aleppo)
        if new_status and not shipment.receipt_file:
            should_generate_receipt = False

            if shipment.direction == "eu-sy" and new_status == "ARRIVED_WATTWEG_5":
                should_generate_receipt = True
            elif shipment.direction == "sy-eu" and new_status == "ARRIVED_WATTWEG_5":
                should_generate_receipt = True

            if should_generate_receipt:
                try:
                    from .document_service import (
                        generate_receipt,
                        save_receipt_to_storage,
                    )
                    from .email_service import (
                        send_receipt_email_to_admin,
                        send_receipt_email_to_user,
                    )

                    # Generate receipt PDF
                    pdf_bytes = generate_receipt(shipment, language="ar")

                    # Save to storage
                    save_receipt_to_storage(shipment, pdf_bytes)

                    # Send receipt by email
                    try:
                        user_sent = send_receipt_email_to_user(shipment, pdf_bytes)
                        admin_sent = send_receipt_email_to_admin(shipment, pdf_bytes)
                        if user_sent:
                            logger.info(
                                f"✅ Receipt email sent to user for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Receipt email to user failed for shipment {shipment.id} (check email config or user email)"
                            )
                        if admin_sent:
                            logger.info(
                                f"✅ Receipt email sent to admin for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Receipt email to admin failed for shipment {shipment.id} (check email config)"
                            )
                    except Exception as email_error:
                        logger.error(
                            f"❌ Failed to send receipt emails: {str(email_error)}",
                            exc_info=True,
                        )
                        # Don't fail if email fails

                    logger.info(
                        f"✅ Receipt generated and saved for shipment {shipment.id}"
                    )
                except Exception as receipt_error:
                    # Log error but don't fail the request
                    logger.error(
                        f"Failed to generate receipt automatically: {str(receipt_error)}",
                        exc_info=True,
                    )

        # Send email notifications if status was updated
        if new_status:
            try:
                from .email_service import (
                    send_lcl_shipment_status_update_email,
                    send_lcl_shipment_status_update_notification_to_admin,
                )

                # Send email to user
                send_lcl_shipment_status_update_email(
                    shipment=shipment,
                    old_status=old_status,
                    new_status=new_status,
                )
                # Send email to admin
                send_lcl_shipment_status_update_notification_to_admin(
                    shipment=shipment,
                    old_status=old_status,
                    new_status=new_status,
                )
            except Exception as email_error:
                # Log email error but don't fail the request
                logger = logging.getLogger(__name__)
                logger.error(
                    f"Failed to send status update email notifications: {str(email_error)}"
                )

        logger = logging.getLogger(__name__)
        logger.info(
            f"Admin {request.user.id} updated LCL shipment {shipment.id} - Status: {new_status or shipment.status}, Amount Paid: {amount_paid or shipment.amount_paid}"
        )

        serializer = LCLShipmentSerializer(shipment)
        return Response(
            {
                "success": True,
                "message": "Shipment updated successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "Shipment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating LCL shipment status: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_invoice_view(request, pk):
    """
    Download invoice PDF for LCL shipment.
    GET /api/shipments/{id}/invoice/

    Requirements:
    - Shipment status must not be PENDING_PAYMENT
    - Payment status must be 'paid'
    """
    logger = logging.getLogger(__name__)

    try:
        shipment = LCLShipment.objects.get(pk=pk)

        # Check permissions: user must own the shipment or be admin
        if shipment.user != request.user and not request.user.is_superuser:
            return Response(
                {
                    "success": False,
                    "error": "You can only download invoices for your own shipments.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate shipment status
        if shipment.status == "PENDING_PAYMENT":
            return Response(
                {
                    "success": False,
                    "error": "Invoice can only be generated after payment is confirmed.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate payment status
        if shipment.payment_status != "paid":
            return Response(
                {
                    "success": False,
                    "error": "Payment must be confirmed before generating invoice.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import document service
        from .document_service import generate_invoice, save_invoice_to_storage

        # Get language from request (default: 'ar')
        language = request.GET.get("language", "ar")
        if language not in ["ar", "en"]:
            language = "ar"

        # If invoice file exists, read it and send email, then return
        if shipment.invoice_file:
            try:
                with open(shipment.invoice_file.path, "rb") as pdf_file:
                    pdf_bytes = pdf_file.read()

                    # Send emails even if invoice already exists (same as shipping labels)
                    try:
                        logger.info(
                            f"📧 Invoice file exists, sending emails for shipment {shipment.id}"
                        )
                        from .email_service import (
                            send_invoice_email_to_admin,
                            send_invoice_email_to_user,
                        )

                        user_sent = send_invoice_email_to_user(shipment, pdf_bytes)
                        admin_sent = send_invoice_email_to_admin(shipment, pdf_bytes)
                        if user_sent:
                            logger.info(
                                f"✅ Invoice email sent to user for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Invoice email to user failed for shipment {shipment.id} (check email config or user email)"
                            )
                        if admin_sent:
                            logger.info(
                                f"✅ Invoice email sent to admin for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Invoice email to admin failed for shipment {shipment.id} (check email config)"
                            )
                    except Exception as email_error:
                        logger.error(
                            f"❌ Failed to send invoice emails: {str(email_error)}",
                            exc_info=True,
                        )
                        # Don't fail if email fails

                    response = HttpResponse(pdf_bytes, content_type="application/pdf")
                    response["Content-Disposition"] = (
                        f'inline; filename="Invoice-{shipment.shipment_number}.pdf"'
                    )
                    return response
            except Exception as file_error:
                logger.warning(
                    f"Error reading invoice file, will regenerate: {str(file_error)}"
                )

        # Generate invoice PDF
        try:
            pdf_bytes = generate_invoice(shipment, language=language)
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as gen_error:
            logger.error(
                f"Error generating invoice PDF: {str(gen_error)}", exc_info=True
            )
            return Response(
                {
                    "success": False,
                    "error": f"Failed to generate invoice: {str(gen_error)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save to storage if not already saved (always try to save)
        invoice_saved = False
        if not shipment.invoice_file:
            try:
                save_invoice_to_storage(shipment, pdf_bytes)
                logger.info(f"✅ Invoice saved to storage for shipment {shipment.id}")
                invoice_saved = True
            except Exception as save_error:
                logger.error(
                    f"Failed to save invoice to storage: {str(save_error)}",
                    exc_info=True,
                )
                # Continue anyway - we can still return the PDF

        # Send emails if invoice was just generated (not already existed)
        if invoice_saved:
            try:
                from .email_service import (
                    send_invoice_email_to_admin,
                    send_invoice_email_to_user,
                )

                user_sent = send_invoice_email_to_user(shipment, pdf_bytes)
                admin_sent = send_invoice_email_to_admin(shipment, pdf_bytes)
                if user_sent:
                    logger.info(
                        f"✅ Invoice email sent to user for shipment {shipment.id}"
                    )
                else:
                    logger.warning(
                        f"⚠️ Invoice email to user failed for shipment {shipment.id} (check email config or user email)"
                    )
                if admin_sent:
                    logger.info(
                        f"✅ Invoice email sent to admin for shipment {shipment.id}"
                    )
                else:
                    logger.warning(
                        f"⚠️ Invoice email to admin failed for shipment {shipment.id} (check email config)"
                    )
            except Exception as email_error:
                logger.error(
                    f"❌ Failed to send invoice emails: {str(email_error)}",
                    exc_info=True,
                )
                # Don't fail if email fails

        # Return PDF as response
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="Invoice-{shipment.shipment_number}.pdf"'
        )
        return response

    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "Shipment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error generating invoice: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": f"An error occurred while generating invoice: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_consolidated_export_invoice_view(request, pk):
    """
    Download Consolidated Export Invoice PDF for LCL shipment.
    GET /api/shipments/{id}/consolidated-export-invoice/

    Only available for admin users.
    Requirements:
    - User must be admin (is_superuser)
    - Payment status must be 'paid'
    - Status must not be PENDING_PAYMENT
    """
    logger = logging.getLogger(__name__)

    try:
        shipment = LCLShipment.objects.get(pk=pk)

        # Check permissions: only admin can download consolidated export invoice
        if not request.user.is_superuser:
            return Response(
                {
                    "success": False,
                    "error": "Only admin users can download consolidated export invoice.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate shipment status
        if shipment.status == "PENDING_PAYMENT":
            return Response(
                {
                    "success": False,
                    "error": "Consolidated export invoice can only be generated after payment is confirmed.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate payment status
        if shipment.payment_status != "paid":
            return Response(
                {
                    "success": False,
                    "error": "Payment must be confirmed before generating consolidated export invoice.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import document service
        from .document_service import generate_consolidated_export_invoice

        # Get language from request (default: 'en' for export invoice)
        language = request.GET.get("language", "en")
        if language not in ["ar", "en"]:
            language = "en"

        # Generate consolidated export invoice PDF
        try:
            pdf_bytes = generate_consolidated_export_invoice(
                shipment, language=language
            )
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as gen_error:
            logger.error(
                f"Error generating consolidated export invoice PDF: {str(gen_error)}",
                exc_info=True,
            )
            return Response(
                {
                    "success": False,
                    "error": f"Failed to generate consolidated export invoice: {str(gen_error)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Send consolidated export invoice by email to admin
        try:
            from .email_service import send_consolidated_export_invoice_email_to_admin

            admin_sent = send_consolidated_export_invoice_email_to_admin(
                shipment, pdf_bytes
            )
            if admin_sent:
                logger.info(
                    f"✅ Consolidated export invoice email sent to admin for shipment {shipment.id}"
                )
            else:
                logger.warning(
                    f"⚠️ Consolidated export invoice email to admin failed for shipment {shipment.id} (check email config)"
                )
        except Exception as email_error:
            logger.error(
                f"❌ Failed to send consolidated export invoice email: {str(email_error)}",
                exc_info=True,
            )
            # Don't fail if email fails - still return the PDF

        # Return PDF as response
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="Consolidated-Export-Invoice-{shipment.shipment_number}.pdf"'
        )
        return response

    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "Shipment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(
            f"Error generating consolidated export invoice: {str(e)}", exc_info=True
        )
        return Response(
            {
                "success": False,
                "error": f"An error occurred while generating consolidated export invoice: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_packing_list_view(request, pk):
    """
    Download Packing List PDF for LCL shipment.
    GET /api/shipments/{id}/packing-list/

    Only available for admin users.
    Requirements:
    - User must be admin (is_superuser)
    - Payment status must be 'paid'
    - Status must not be PENDING_PAYMENT
    """
    logger = logging.getLogger(__name__)

    try:
        shipment = LCLShipment.objects.get(pk=pk)

        # Check permissions: only admin can download packing list
        if not request.user.is_superuser:
            return Response(
                {
                    "success": False,
                    "error": "Only admin users can download packing list.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate shipment status
        if shipment.status == "PENDING_PAYMENT":
            return Response(
                {
                    "success": False,
                    "error": "Packing list can only be generated after payment is confirmed.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate payment status
        if shipment.payment_status != "paid":
            return Response(
                {
                    "success": False,
                    "error": "Payment must be confirmed before generating packing list.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import document service
        from .document_service import generate_packing_list

        # Get language from request (default: 'en' for packing list)
        language = request.GET.get("language", "en")
        if language not in ["ar", "en"]:
            language = "en"

        # Generate packing list PDF
        try:
            pdf_bytes = generate_packing_list(shipment, language=language)
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as gen_error:
            logger.error(
                f"Error generating packing list PDF: {str(gen_error)}", exc_info=True
            )
            return Response(
                {
                    "success": False,
                    "error": f"Failed to generate packing list: {str(gen_error)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Send packing list by email to admin
        try:
            from .email_service import send_packing_list_email_to_admin

            send_packing_list_email_to_admin(shipment, pdf_bytes)
            logger.info(
                f"✅ Packing list email sent to admin for shipment {shipment.id}"
            )
        except Exception as email_error:
            logger.warning(f"Failed to send packing list email: {str(email_error)}")
            # Don't fail if email fails - still return the PDF

        # Return PDF as response
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="Packing-List-{shipment.shipment_number}.pdf"'
        )
        return response

    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "Shipment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error generating packing list: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": f"An error occurred while generating packing list: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_receipt_view(request, pk):
    """
    Download receipt PDF for LCL shipment.
    GET /api/shipments/{id}/receipt/

    Requirements:
    - Shipment status must not be PENDING_PAYMENT
    - Payment status must be 'paid'
    - Or status must be ARRIVED_WATTWEG_5 (for receipt generation)
    """
    logger = logging.getLogger(__name__)

    try:
        shipment = LCLShipment.objects.get(pk=pk)

        # Check permissions: user must own the shipment or be admin
        if shipment.user != request.user and not request.user.is_superuser:
            return Response(
                {
                    "success": False,
                    "error": "You can only download receipts for your own shipments.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Validate shipment status - receipt can be generated when:
        # 1. Payment is confirmed (paid) and status is not PENDING_PAYMENT
        # 2. Or shipment has arrived at warehouse (ARRIVED_WATTWEG_5)
        can_generate_receipt = (
            shipment.payment_status == "paid" and shipment.status != "PENDING_PAYMENT"
        ) or (shipment.status == "ARRIVED_WATTWEG_5")

        if not can_generate_receipt:
            return Response(
                {
                    "success": False,
                    "error": "Receipt can only be generated after payment is confirmed or when shipment arrives at warehouse.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Import document service
        from .document_service import generate_receipt, save_receipt_to_storage

        # Get language from request (default: 'en' for receipt)
        language = request.GET.get("language", "en")
        if language not in ["ar", "en"]:
            language = "en"

        # If receipt file exists, read it and send email, then return
        if shipment.receipt_file:
            try:
                with open(shipment.receipt_file.path, "rb") as pdf_file:
                    pdf_bytes = pdf_file.read()

                    # Send emails even if receipt already exists (same as invoice)
                    try:
                        logger.info(
                            f"📧 Receipt file exists, sending emails for shipment {shipment.id}"
                        )
                        from .email_service import (
                            send_receipt_email_to_admin,
                            send_receipt_email_to_user,
                        )

                        user_sent = send_receipt_email_to_user(shipment, pdf_bytes)
                        admin_sent = send_receipt_email_to_admin(shipment, pdf_bytes)
                        if user_sent:
                            logger.info(
                                f"✅ Receipt email sent to user for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Receipt email to user failed for shipment {shipment.id} (check email config or user email)"
                            )
                        if admin_sent:
                            logger.info(
                                f"✅ Receipt email sent to admin for shipment {shipment.id}"
                            )
                        else:
                            logger.warning(
                                f"⚠️ Receipt email to admin failed for shipment {shipment.id} (check email config)"
                            )
                    except Exception as email_error:
                        logger.error(
                            f"❌ Failed to send receipt emails: {str(email_error)}",
                            exc_info=True,
                        )
                        # Don't fail if email fails

                    response = HttpResponse(pdf_bytes, content_type="application/pdf")
                    response["Content-Disposition"] = (
                        f'inline; filename="Receipt-{shipment.shipment_number}.pdf"'
                    )
                    return response
            except Exception as file_error:
                logger.warning(
                    f"Error reading receipt file, will regenerate: {str(file_error)}"
                )
                # Continue to generate new receipt

        # Generate receipt PDF
        try:
            pdf_bytes = generate_receipt(shipment, language=language)
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as gen_error:
            logger.error(
                f"Error generating receipt PDF: {str(gen_error)}", exc_info=True
            )
            return Response(
                {
                    "success": False,
                    "error": f"Failed to generate receipt: {str(gen_error)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save to storage if not already saved (always try to save)
        receipt_saved = False
        if not shipment.receipt_file:
            try:
                save_receipt_to_storage(shipment, pdf_bytes)
                logger.info(f"✅ Receipt saved to storage for shipment {shipment.id}")
                receipt_saved = True
            except Exception as save_error:
                logger.error(
                    f"Failed to save receipt to storage: {str(save_error)}",
                    exc_info=True,
                )
                # Continue anyway - we can still return the PDF

        # Send emails if receipt was just generated (not already existed)
        if receipt_saved:
            try:
                from .email_service import (
                    send_receipt_email_to_admin,
                    send_receipt_email_to_user,
                )

                user_sent = send_receipt_email_to_user(shipment, pdf_bytes)
                admin_sent = send_receipt_email_to_admin(shipment, pdf_bytes)
                if user_sent:
                    logger.info(
                        f"✅ Receipt email sent to user for shipment {shipment.id}"
                    )
                else:
                    logger.warning(
                        f"⚠️ Receipt email to user failed for shipment {shipment.id} (check email config or user email)"
                    )
                if admin_sent:
                    logger.info(
                        f"✅ Receipt email sent to admin for shipment {shipment.id}"
                    )
                else:
                    logger.warning(
                        f"⚠️ Receipt email to admin failed for shipment {shipment.id} (check email config)"
                    )
            except Exception as email_error:
                logger.error(
                    f"❌ Failed to send receipt emails: {str(email_error)}",
                    exc_info=True,
                )
                # Don't fail if email fails

        # Return PDF as response
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="Receipt-{shipment.shipment_number}.pdf"'
        )
        return response

    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "Shipment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error downloading receipt: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": f"An error occurred while generating receipt: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_shipping_labels_view(request, pk):
    """
    Download shipping labels PDF for LCL shipment.
    GET /api/shipments/{id}/shipping-labels/

    Generates one label per parcel (including repeat_count for electronics).
    """
    logger = logging.getLogger(__name__)

    try:
        shipment = LCLShipment.objects.get(pk=pk)

        # Check permissions: user must own the shipment or be admin
        if shipment.user != request.user and not request.user.is_superuser:
            return Response(
                {
                    "success": False,
                    "error": "You can only download shipping labels for your own shipments.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Import document service
        from .document_service import generate_shipping_labels

        # Get language from request (default: 'ar')
        language = request.GET.get("language", "ar")
        if language not in ["ar", "en"]:
            language = "ar"

        # Get number of labels from request (optional)
        num_labels = request.GET.get("num_labels")
        if num_labels:
            try:
                num_labels = int(num_labels)
                if num_labels <= 0:
                    num_labels = None
            except (ValueError, TypeError):
                num_labels = None
        else:
            num_labels = None

        # Generate shipping labels PDF
        try:
            pdf_bytes = generate_shipping_labels(
                shipment, language=language, num_labels=num_labels
            )
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as gen_error:
            logger.error(
                f"Error generating shipping labels PDF: {str(gen_error)}", exc_info=True
            )
            return Response(
                {
                    "success": False,
                    "error": f"Failed to generate shipping labels: {str(gen_error)}",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Send shipping labels by email
        try:
            from .email_service import (
                send_shipping_labels_email_to_admin,
                send_shipping_labels_email_to_user,
            )

            user_sent = send_shipping_labels_email_to_user(
                shipment, pdf_bytes, num_labels=num_labels
            )
            admin_sent = send_shipping_labels_email_to_admin(
                shipment, pdf_bytes, num_labels=num_labels
            )
            if user_sent:
                logger.info(
                    f"✅ Shipping labels email sent to user for shipment {shipment.id}"
                )
            else:
                logger.warning(
                    f"⚠️ Shipping labels email to user failed for shipment {shipment.id} (check email config or user email)"
                )
            if admin_sent:
                logger.info(
                    f"✅ Shipping labels email sent to admin for shipment {shipment.id}"
                )
            else:
                logger.warning(
                    f"⚠️ Shipping labels email to admin failed for shipment {shipment.id} (check email config)"
                )
        except Exception as email_error:
            logger.error(
                f"❌ Failed to send shipping labels emails: {str(email_error)}",
                exc_info=True,
            )
            # Don't fail if email fails

        # Return PDF as response
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'inline; filename="Shipping-Labels-{shipment.shipment_number}.pdf"'
        )
        return response

    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "Shipment not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        logger.error(f"Error generating shipping labels: {str(e)}", exc_info=True)
        return Response(
            {
                "success": False,
                "error": f"An error occurred while generating shipping labels: {str(e)}",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_lcl_shipment_payment_reminder_view(request, pk):
    """API endpoint for admin to send payment reminder email to user for LCL shipment"""
    if not request.user.is_superuser:
        return Response(
            {"success": False, "error": "Only admins can send payment reminders."},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        shipment = LCLShipment.objects.get(pk=pk)

        # Check if shipment has total price set
        if not shipment.total_price or shipment.total_price <= 0:
            return Response(
                {
                    "success": False,
                    "error": "Cannot send payment reminder. Total price must be set first.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if payment is already 100%
        if shipment.total_price > 0:
            payment_percentage = (
                (shipment.amount_paid or 0) / shipment.total_price * 100
                if shipment.amount_paid
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
        email_sent = send_lcl_shipment_payment_reminder_email(shipment)
        # Also send notification to admin
        send_lcl_shipment_payment_reminder_notification_to_admin(shipment)

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
    except LCLShipment.DoesNotExist:
        return Response(
            {"success": False, "error": "LCL shipment not found."},
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_shipment_checkout_session(request):
    """
    Create Stripe checkout session for shipment payment
    """
    logger = logging.getLogger(__name__)

    if not STRIPE_AVAILABLE:
        return Response(
            {"success": False, "error": "Stripe is not available"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if not settings.STRIPE_SECRET_KEY:
        return Response(
            {"success": False, "error": "Stripe API key is not configured"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Log API key type (test vs live)
    api_key_type = (
        "TEST" if settings.STRIPE_SECRET_KEY.startswith("sk_test_") else "LIVE"
    )
    logger.info(
        f"🔑 Using Stripe {api_key_type} API key (first 10 chars: {settings.STRIPE_SECRET_KEY[:10]}...)"
    )

    if api_key_type == "LIVE":
        logger.warning(
            "⚠️ WARNING: Using LIVE Stripe API key! stripe listen only works with TEST keys!"
        )

    try:
        shipment_id = request.data.get("shipment_id")
        amount = float(request.data.get("amount", 0))
        currency = request.data.get("currency", "eur")
        metadata = request.data.get("metadata", {})

        if not shipment_id:
            return Response(
                {"success": False, "error": "Shipment ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if amount <= 0:
            return Response(
                {"success": False, "error": "Amount must be greater than 0"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure minimum amount (0.50 EUR = 50 cents)
        amount_in_cents = max(50, int(amount * 100))

        # Validate amount (Stripe has maximum limits)
        if amount_in_cents > 99999999:  # 999,999.99 EUR
            return Response(
                {"success": False, "error": "Amount exceeds maximum limit"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure shipment_id is in metadata (override if exists in metadata dict)
        # Limit metadata to 20 keys (Stripe limit) and 500 chars per value
        final_metadata = {
            "user_id": str(request.user.id),
            "amount": str(amount)[:500],
            "type": "shipment",
            "shipment_id": str(shipment_id)[
                :500
            ],  # Ensure shipment_id is always in metadata
        }

        # Add additional metadata from request (limit to prevent exceeding Stripe limits)
        if metadata:
            for key, value in list(metadata.items())[
                :15
            ]:  # Limit to 15 additional keys
                if key not in final_metadata:  # Don't override existing keys
                    final_metadata[key] = str(value)[:500]  # Limit value length

        # Ensure shipment_id is still set correctly after merge
        final_metadata["shipment_id"] = str(shipment_id)[:500]

        # Build URLs - use from request if provided, otherwise use settings
        success_url = (
            request.data.get("success_url") or settings.STRIPE_REDIRECT_SUCCESS_URL
        )
        cancel_url = (
            request.data.get("cancel_url") or settings.STRIPE_REDIRECT_CANCEL_URL
        )

        # Add query parameters if not already present
        # Use {CHECKOUT_SESSION_ID} placeholder which Stripe will replace
        if "type=shipment" not in success_url and "shipment_id" not in success_url:
            success_url += (
                ("&" if "?" in success_url else "?")
                + f"type=shipment&shipment_id={shipment_id}&session_id={{CHECKOUT_SESSION_ID}}"
            )
        if "type=shipment" not in cancel_url and "shipment_id" not in cancel_url:
            cancel_url += (
                "&" if "?" in cancel_url else "?"
            ) + f"type=shipment&shipment_id={shipment_id}"

        # Validate URLs
        if not success_url.startswith(("http://", "https://")):
            logger.error(f"❌ Invalid success_url: {success_url}")
            return Response(
                {"success": False, "error": "Invalid success URL configuration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not cancel_url.startswith(("http://", "https://")):
            logger.error(f"❌ Invalid cancel_url: {cancel_url}")
            return Response(
                {"success": False, "error": "Invalid cancel URL configuration"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        logger.info(
            f"🔍 Creating checkout session for shipment {shipment_id}, amount: €{amount} ({amount_in_cents} cents), currency: {currency}"
        )
        logger.info(f"🔍 Success URL: {success_url}")
        logger.info(f"🔍 Cancel URL: {cancel_url}")
        logger.info(f"🔍 Metadata keys: {list(final_metadata.keys())}")

        # Create Stripe Checkout Session
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": currency.lower(),
                            "product_data": {
                                "name": f"Shipment Payment #{shipment_id}",
                                "description": f"Payment for LCL shipment {shipment_id}",
                            },
                            "unit_amount": amount_in_cents,
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=final_metadata,
                customer_email=request.user.email if request.user.email else None,
                expires_at=int(timezone.now().timestamp())
                + (24 * 60 * 60),  # Expire in 24 hours
            )

            logger.info(
                f"✅ Checkout session created: {checkout_session.id}, URL: {checkout_session.url}"
            )
            logger.info(
                f"📝 Session details - mode: {checkout_session.mode}, payment_status: {checkout_session.payment_status}"
            )
        except stripe.error.StripeError as e:
            logger.error(
                f"❌ Stripe API error creating checkout session: {str(e)}",
                exc_info=True,
            )
            return Response(
                {"success": False, "error": f"Stripe payment error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Update the LCLShipment with the Stripe session ID
        try:
            lcl_shipment = LCLShipment.objects.get(pk=shipment_id)
            lcl_shipment.stripe_session_id = checkout_session.id
            lcl_shipment.payment_status = "pending"
            lcl_shipment.save()
            logger.info(
                f"Updated LCLShipment {shipment_id} with Stripe session ID {checkout_session.id}"
            )
        except LCLShipment.DoesNotExist:
            logger.warning(
                f"LCLShipment with ID {shipment_id} not found for Stripe checkout session."
            )

        logger.info(
            f"Created shipment checkout session {checkout_session.id} for user {request.user.id}, amount: €{amount}"
        )

        return Response(
            {
                "success": True,
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id,
                "amount": {
                    "value": float(amount),
                    "currency": currency.upper(),
                },
            },
            status=status.HTTP_200_OK,
        )

    except ValueError as e:
        logger.error(f"Invalid amount in create_shipment_checkout_session: {str(e)}")
        return Response(
            {"success": False, "error": "Invalid amount"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except stripe.error.StripeError as e:
        logger.error(
            f"Stripe API error in create_shipment_checkout_session: {str(e)}",
            exc_info=True,
        )
        return Response(
            {"success": False, "error": f"Stripe payment error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    except Exception as e:
        logger.error(
            f"Error creating shipment checkout session: {str(e)}", exc_info=True
        )
        return Response(
            {"success": False, "error": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_shipment_payment_view(request):
    """
    Confirm shipment payment after Stripe redirect
    Verifies payment with Stripe and updates shipment status
    """
    logger = logging.getLogger(__name__)

    if not STRIPE_AVAILABLE:
        return Response(
            {"success": False, "error": "Stripe is not available"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        shipment_id = request.data.get("shipment_id")
        session_id = request.data.get("session_id")

        if not shipment_id:
            return Response(
                {"success": False, "error": "Shipment ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get shipment
        try:
            shipment = LCLShipment.objects.get(pk=shipment_id, user=request.user)
        except LCLShipment.DoesNotExist:
            return Response(
                {"success": False, "error": "Shipment not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # If session_id not provided, try to get it from shipment's stripe_session_id
        if not session_id and shipment.stripe_session_id:
            session_id = shipment.stripe_session_id
            logger.info(
                f"🔍 Using stripe_session_id from shipment {shipment_id}: {session_id}"
            )

        # If still no session_id, try to find it by searching Stripe checkout sessions with this shipment_id in metadata
        if not session_id:
            try:
                logger.info(
                    f"🔍 No session_id found, searching Stripe for checkout sessions with shipment_id={shipment_id} in metadata..."
                )
                # List recent checkout sessions and find one with this shipment_id
                # We'll search the last 100 sessions (Stripe limit is 100 per page)
                sessions = stripe.checkout.Session.list(
                    limit=100,
                )

                for sess in sessions.data:
                    sess_metadata = sess.get("metadata", {})
                    if (
                        sess_metadata.get("shipment_id") == str(shipment_id)
                        and sess_metadata.get("type") == "shipment"
                    ):
                        session_id = sess.id
                        logger.info(
                            f"✅ Found Stripe session {session_id} for shipment {shipment_id}"
                        )
                        # Also update shipment with this session_id for future reference
                        if not shipment.stripe_session_id:
                            shipment.stripe_session_id = session_id
                            shipment.save()
                        break
            except stripe.error.StripeError as e:
                logger.warning(f"⚠️ Could not search Stripe for sessions: {str(e)}")
            except Exception as e:
                logger.warning(f"⚠️ Error searching for Stripe session: {str(e)}")

        # If session_id available (from request, shipment, or Stripe search), verify with Stripe
        if session_id:
            try:
                session = stripe.checkout.Session.retrieve(session_id)
                payment_status = session.get("payment_status")
                metadata = session.get("metadata") or {}
                if (
                    metadata.get("shipment_id") != str(shipment.id)
                    or metadata.get("type") != "shipment"
                ):
                    logger.warning(
                        f"⚠️ Stripe session {session_id} metadata does not match shipment {shipment_id}"
                    )
                    return Response(
                        {
                            "success": False,
                            "error": "Invalid payment session for this shipment",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                logger.info(
                    f"🔍 Verifying payment for shipment {shipment_id} - session_id: {session_id}, payment_status: {payment_status}"
                )

                if payment_status == "paid":
                    # Get amount from session
                    amount_total = session.get("amount_total")
                    if amount_total:
                        paid_amount = Decimal(str(amount_total)) / 100
                        shipment.amount_paid = paid_amount
                        shipment.payment_status = "paid"
                        # Update stripe_session_id if not already set
                        if not shipment.stripe_session_id:
                            shipment.stripe_session_id = session_id
                        if not shipment.sendcloud_id:
                            shipment.status = "PENDING_PICKUP"
                        shipment.paid_at = timezone.now()
                        shipment.save()

                        logger.info(
                            f"✅ Payment confirmed for shipment {shipment.id} - amount_paid: {paid_amount}, status: {shipment.status}"
                        )

                        return Response(
                            {
                                "success": True,
                                "message": "Payment confirmed successfully",
                                "shipment_id": shipment.id,
                                "amount_paid": float(shipment.amount_paid),
                                "status": shipment.status,
                            }
                        )
                    else:
                        logger.warning(
                            f"⚠️ Payment is paid but amount_total is missing for session {session_id}"
                        )
                        # Still update payment_status even if amount is missing
                        shipment.payment_status = "paid"
                        if not shipment.stripe_session_id:
                            shipment.stripe_session_id = session_id
                        shipment.save()
                elif payment_status == "pending":
                    # Payment is still processing, check if webhook already updated it
                    logger.info(
                        f"ℹ️ Payment status is 'pending' for session {session_id}, checking if webhook already processed..."
                    )
                    # Refresh shipment from DB to get latest state
                    shipment.refresh_from_db()
                    # Check if webhook already updated the shipment
                    if shipment.payment_status == "paid" and shipment.amount_paid:
                        return Response(
                            {
                                "success": True,
                                "message": "Payment already confirmed by webhook",
                                "shipment_id": shipment.id,
                                "amount_paid": float(shipment.amount_paid),
                                "status": shipment.status,
                            }
                        )
                    else:
                        logger.warning(
                            f"⚠️ Payment status is 'pending' for session {session_id} and webhook hasn't processed yet"
                        )
                else:
                    logger.warning(
                        f"⚠️ Payment status is '{payment_status}' (not paid) for session {session_id}"
                    )
            except stripe.error.StripeError as e:
                logger.error(f"❌ Stripe API error: {str(e)}", exc_info=True)
                return Response(
                    {
                        "success": False,
                        "error": f"Stripe verification failed: {str(e)}",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # If no session_id available, check current shipment status
        if not session_id:
            logger.warning(
                f"⚠️ No session_id found for shipment {shipment_id} - checked request, shipment.stripe_session_id, and Stripe search"
            )
            # Check if payment is already confirmed (webhook might have processed it)
            if shipment.payment_status == "paid" and shipment.amount_paid:
                return Response(
                    {
                        "success": True,
                        "message": "Payment already confirmed by webhook",
                        "shipment_id": shipment.id,
                        "amount_paid": float(shipment.amount_paid),
                        "status": shipment.status,
                    }
                )
            else:
                return Response(
                    {
                        "success": False,
                        "error": "Payment not confirmed. Could not find Stripe session. Please wait for webhook processing or provide session_id.",
                        "current_payment_status": shipment.payment_status,
                        "current_amount_paid": float(shipment.amount_paid or 0),
                        "stripe_session_id": shipment.stripe_session_id or None,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # If we reach here, session_id was found but payment wasn't "paid" in Stripe
        # Refresh shipment from DB to get latest state (webhook might have updated it)
        shipment.refresh_from_db()

        # Check if webhook already processed it (final fallback)
        if shipment.payment_status == "paid" and shipment.amount_paid:
            logger.info(
                f"✅ Payment already confirmed by webhook for shipment {shipment_id}"
            )
            return Response(
                {
                    "success": True,
                    "message": "Payment already confirmed by webhook",
                    "shipment_id": shipment.id,
                    "amount_paid": float(shipment.amount_paid),
                    "status": shipment.status,
                }
            )

        # Payment not confirmed yet
        logger.warning(
            f"⚠️ Payment verification failed for shipment {shipment_id} - session_id: {session_id}, Stripe payment_status might not be 'paid' yet"
        )
        return Response(
            {
                "success": False,
                "error": "Payment not confirmed yet. Please wait a moment and refresh, or wait for webhook processing.",
                "current_payment_status": shipment.payment_status,
                "current_amount_paid": float(shipment.amount_paid or 0),
                "stripe_session_id": shipment.stripe_session_id,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        logger.error(f"❌ Error confirming payment: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": "An error occurred while confirming payment"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_fcl_quote_payment_view(request):
    """
    Confirm FCL quote payment after Stripe redirect
    Verifies payment with Stripe and updates quote status
    """
    logger = logging.getLogger(__name__)

    if not STRIPE_AVAILABLE:
        return Response(
            {"success": False, "error": "Stripe is not available"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        quote_id = request.data.get("quote_id")
        session_id = request.data.get("session_id")

        if not quote_id:
            return Response(
                {"success": False, "error": "Quote ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get quote
        try:
            quote = FCLQuote.objects.get(pk=quote_id, user=request.user)
        except FCLQuote.DoesNotExist:
            return Response(
                {"success": False, "error": "Quote not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # If session_id not provided, try to get it from quote's payment_id
        if not session_id and quote.payment_id:
            session_id = quote.payment_id
            logger.info(
                f"🔍 Using payment_id from quote {quote_id}: {session_id}"
            )

        # If still no session_id, try to find it by searching Stripe checkout sessions with this quote_id in metadata
        if not session_id:
            try:
                logger.info(
                    f"🔍 No session_id found, searching Stripe for checkout sessions with quote_id={quote_id} in metadata..."
                )
                # List recent checkout sessions and find one with this quote_id
                # We'll search the last 100 sessions (Stripe limit is 100 per page)
                sessions = stripe.checkout.Session.list(
                    limit=100,
                )

                for sess in sessions.data:
                    sess_metadata = sess.get("metadata", {})
                    if (
                        sess_metadata.get("quote_id") == str(quote_id)
                        and sess_metadata.get("type") == "quote"
                    ):
                        session_id = sess.id
                        logger.info(
                            f"✅ Found Stripe session {session_id} for quote {quote_id}"
                        )
                        # Also update quote with this session_id for future reference
                        if not quote.payment_id:
                            quote.payment_id = session_id
                            quote.save()
                        break
            except stripe.error.StripeError as e:
                logger.warning(f"⚠️ Could not search Stripe for sessions: {str(e)}")
            except Exception as e:
                logger.warning(f"⚠️ Error searching for Stripe session: {str(e)}")

        # If session_id available (from request, quote, or Stripe search), verify with Stripe
        if session_id:
            try:
                session = stripe.checkout.Session.retrieve(session_id)
                payment_status = session.get("payment_status")
                metadata = session.get("metadata") or {}
                if metadata.get("quote_id") != str(quote.id) or metadata.get("type") != "quote":
                    logger.warning(
                        f"⚠️ Stripe session {session_id} metadata does not match quote {quote_id}"
                    )
                    return Response(
                        {
                            "success": False,
                            "error": "Invalid payment session for this quote",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                logger.info(
                    f"🔍 Verifying payment for quote {quote_id} - session_id: {session_id}, payment_status: {payment_status}"
                )

                if payment_status == "paid":
                    # Get amount from session
                    amount_total = session.get("amount_total")
                    if amount_total:
                        paid_amount = Decimal(str(amount_total)) / 100
                        # Set amount_paid to the full paid amount (100% payment)
                        quote.amount_paid = paid_amount
                        quote.payment_status = "paid"
                        # Update payment_id if not already set
                        if not quote.payment_id:
                            quote.payment_id = session_id
                        quote.payment_updated_at = timezone.now()
                        # Update status to PENDING_PAYMENT if it's still CREATED or OFFER_SENT
                        if quote.status in ["CREATED", "OFFER_SENT"]:
                            quote.status = "PENDING_PAYMENT"
                        quote.save()

                        logger.info(
                            f"✅ Payment confirmed for quote {quote.id} - amount_paid: {paid_amount}, payment_status: {quote.payment_status}, status: {quote.status}"
                        )

                        return Response(
                            {
                                "success": True,
                                "message": "Payment confirmed successfully",
                                "quote_id": quote.id,
                                "amount_paid": float(quote.amount_paid),
                                "total_price": float(quote.total_price or 0),
                                "payment_status": quote.payment_status,
                                "status": quote.status,
                            }
                        )
                    else:
                        logger.warning(
                            f"⚠️ Payment is paid but amount_total is missing for session {session_id}"
                        )
                        # Still update payment_status even if amount is missing
                        quote.payment_status = "paid"
                        if not quote.payment_id:
                            quote.payment_id = session_id
                        quote.save()
                elif payment_status == "pending":
                    # Payment is still processing, check if webhook already updated it
                    logger.info(
                        f"ℹ️ Payment status is 'pending' for session {session_id}, checking if webhook already processed..."
                    )
                    # Refresh quote from DB to get latest state
                    quote.refresh_from_db()
                    # Check if webhook already updated the quote
                    if quote.payment_status == "paid" and quote.amount_paid:
                        return Response(
                            {
                                "success": True,
                                "message": "Payment already confirmed by webhook",
                                "quote_id": quote.id,
                                "amount_paid": float(quote.amount_paid),
                                "total_price": float(quote.total_price or 0),
                                "payment_status": quote.payment_status,
                                "status": quote.status,
                            }
                        )
                    else:
                        logger.warning(
                            f"⚠️ Payment status is 'pending' for session {session_id} and webhook hasn't processed yet"
                        )
                else:
                    logger.warning(
                        f"⚠️ Payment status is '{payment_status}' (not paid) for session {session_id}"
                    )
            except stripe.error.StripeError as e:
                logger.error(f"❌ Stripe API error: {str(e)}", exc_info=True)
                return Response(
                    {
                        "success": False,
                        "error": f"Stripe verification failed: {str(e)}",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # If no session_id available, check current quote status
        if not session_id:
            logger.warning(
                f"⚠️ No session_id found for quote {quote_id} - checked request, quote.payment_id, and Stripe search"
            )
            # Check if payment is already confirmed (webhook might have processed it)
            if quote.payment_status == "paid" and quote.amount_paid:
                return Response(
                    {
                        "success": True,
                        "message": "Payment already confirmed by webhook",
                        "quote_id": quote.id,
                        "amount_paid": float(quote.amount_paid),
                        "total_price": float(quote.total_price or 0),
                        "payment_status": quote.payment_status,
                        "status": quote.status,
                    }
                )
            else:
                return Response(
                    {
                        "success": False,
                        "error": "Payment not confirmed. Could not find Stripe session. Please wait for webhook processing or provide session_id.",
                        "current_payment_status": quote.payment_status,
                        "current_amount_paid": float(quote.amount_paid or 0),
                        "payment_id": quote.payment_id or None,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # If we reach here, session_id was found but payment wasn't "paid" in Stripe
        # Refresh quote from DB to get latest state (webhook might have updated it)
        quote.refresh_from_db()

        # Check if webhook already processed it (final fallback)
        if quote.payment_status == "paid" and quote.amount_paid:
            logger.info(
                f"✅ Payment already confirmed by webhook for quote {quote_id}"
            )
            return Response(
                {
                    "success": True,
                    "message": "Payment already confirmed by webhook",
                    "quote_id": quote.id,
                    "amount_paid": float(quote.amount_paid),
                    "total_price": float(quote.total_price or 0),
                    "payment_status": quote.payment_status,
                    "status": quote.status,
                }
            )

        # Payment not confirmed yet
        logger.warning(
            f"⚠️ Payment verification failed for quote {quote_id} - session_id: {session_id}, Stripe payment_status might not be 'paid' yet"
        )
        return Response(
            {
                "success": False,
                "error": "Payment not confirmed yet. Please wait a moment and refresh, or wait for webhook processing.",
                "current_payment_status": quote.payment_status,
                "current_amount_paid": float(quote.amount_paid or 0),
                "payment_id": quote.payment_id,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        logger.error(f"❌ Error confirming payment: {str(e)}", exc_info=True)
        return Response(
            {"success": False, "error": "An error occurred while confirming payment"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
