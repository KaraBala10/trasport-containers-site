import logging
import traceback
from datetime import datetime

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import generics, permissions, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import ContactMessage, FCLQuote
from .serializers import (
    ChangePasswordSerializer,
    ContactMessageSerializer,
    FCLQuoteSerializer,
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
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
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
    """API endpoint to calculate pricing based on weight and CBM"""
    try:
        total_weight_kg = float(request.data.get("total_weight_kg", 0))
        total_cbm = float(request.data.get("total_cbm", 0))

        # Validate inputs
        if total_weight_kg < 0 or total_cbm < 0:
            return Response(
                {
                    "success": False,
                    "error": "Weight and CBM must be non-negative numbers",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate pricing according to the formula:
        # priceByWeight = total_weight_kg * 3
        # priceByCBM = total_cbm * 300
        # basePrice = max(priceByWeight, priceByCBM, 75)
        price_by_weight = total_weight_kg * 3
        price_by_cbm = total_cbm * 300
        base_price = max(price_by_weight, price_by_cbm, 75)

        return Response(
            {
                "success": True,
                "priceByWeight": round(price_by_weight, 2),
                "priceByCBM": round(price_by_cbm, 2),
                "basePrice": round(base_price, 2),
                "formula": {
                    "priceByWeight": f"{total_weight_kg} × 3 = {price_by_weight:.2f}",
                    "priceByCBM": f"{total_cbm} × 300 = {price_by_cbm:.2f}",
                    "basePrice": f"max({price_by_weight:.2f}, {price_by_cbm:.2f}, 75) = {base_price:.2f}",
                },
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
        logger.error(f"Error calculating pricing: {str(e)}")
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

        quote.status = new_status

        # If status is OFFER_SENT, save message and timestamp
        if new_status == "OFFER_SENT" and offer_message:
            quote.offer_message = offer_message
            from django.utils import timezone

            quote.offer_sent_at = timezone.now()
            quote.user_response = (
                "PENDING"  # Reset user response when new offer is sent
            )

        quote.save()

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

        if user_response not in ["ACCEPTED", "REJECTED"]:
            return Response(
                {
                    "success": False,
                    "error": "Invalid response. Must be 'ACCEPTED' or 'REJECTED'.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        quote.user_response = user_response

        # If user accepts, change status to PENDING_PAYMENT
        if user_response == "ACCEPTED":
            quote.status = "PENDING_PAYMENT"
        # If user rejects, keep status as OFFER_SENT but mark as rejected

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
