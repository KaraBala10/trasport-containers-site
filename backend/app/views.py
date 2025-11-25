import logging
import traceback
from datetime import datetime

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

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
from .models import ContactMessage, EditRequestMessage, FCLQuote, PackagingPrice, Price
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import (
    ChangePasswordSerializer,
    ContactMessageSerializer,
    EditRequestMessageSerializer,
    FCLQuoteSerializer,
    PackagingPriceSerializer,
    PriceSerializer,
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

        # Calculate final price: max(priceByWeight, priceByCBM, 75) + packaging costs
        base_price = max(total_price_by_weight, total_price_by_cbm, 75)
        calculation_total = base_price + total_packaging_cost

        # Calculate insurance if declaredShipmentValue is provided
        declared_shipment_value = float(
            request.data.get("declaredShipmentValue", 0) or 0
        )
        insurance_cost = 0
        if declared_shipment_value > 0:
            # Insurance: (Calculation + Declared Shipment Value) * 1.5%
            insurance_cost = (calculation_total + declared_shipment_value) * 0.015

        total_price = calculation_total + insurance_cost

        formula_dict = {
            "priceByWeight": f"Total Weight × Price per KG = {total_price_by_weight:.2f}",
            "priceByCBM": f"Total CBM × One CBM Price = {total_price_by_cbm:.2f}",
            "basePrice": f"max({total_price_by_weight:.2f}, {total_price_by_cbm:.2f}, 75) = {base_price:.2f}",
            "packagingCost": f"Total Packaging Cost = {total_packaging_cost:.2f}",
            "calculation": f"{base_price:.2f} + {total_packaging_cost:.2f} = {calculation_total:.2f}",
        }

        if insurance_cost > 0:
            formula_dict["insurance"] = (
                f"({calculation_total:.2f} + {declared_shipment_value:.2f}) × 1.5% = {insurance_cost:.2f}"
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
                "basePrice": round(base_price, 2),
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
