import logging
import traceback

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

        return Response(
            {
                "success": True,
                "message": "Your FCL quote request has been submitted successfully. We will contact you soon.",
                "id": quote_id,
                "quote_number": f"FCL-{quote_id:06d}" if quote_id is not None else None,
            },
            status=response.status_code,
        )


class FCLQuoteListView(generics.ListAPIView):
    """API endpoint to list user's FCL quotes"""

    serializer_class = FCLQuoteSerializer
    authentication_classes = [JWTAuthentication]  # Explicitly use JWT authentication
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only quotes for the authenticated user"""
        if settings.DEBUG:
            logger = logging.getLogger(__name__)
            logger.debug(
                f"Fetching quotes for user: {self.request.user} (ID: {self.request.user.id if self.request.user.is_authenticated else 'N/A'})"
            )

        if not self.request.user.is_authenticated:
            return FCLQuote.objects.none()

        queryset = FCLQuote.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

        if settings.DEBUG:
            logger.debug(
                f"Found {queryset.count()} quotes for user {self.request.user.id}"
            )

        return queryset


class FCLQuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint to retrieve, update, or delete a specific FCL quote"""

    serializer_class = FCLQuoteSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """Return only quotes for the authenticated user"""
        if not self.request.user.is_authenticated:
            return FCLQuote.objects.none()
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
