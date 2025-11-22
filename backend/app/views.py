import logging
import traceback

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
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
    permission_classes = [IsAuthenticated]  # Require authentication
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # Support file uploads

    def create(self, request, *args, **kwargs):
        # Log request data for debugging (only in DEBUG mode)
        if settings.DEBUG:
            logger = logging.getLogger(__name__)
            logger.debug(f"Request data keys: {list(request.data.keys())}")

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Calculate pricing
            # Pricing calculation can be added here if FCLPricing model is created
            # For now, pricing will be calculated manually by admin
            price_per_container = None
            total_price = None

            # Save quote with pricing
            fcl_quote = serializer.save(
                price_per_container=price_per_container, total_price=total_price
            )

            # TODO: Send email notification here
            # You can use Django's email backend or a service like SendGrid

            return Response(
                {
                    "success": True,
                    "message": "Your FCL quote request has been submitted successfully. We will contact you soon.",
                    "id": fcl_quote.id,
                    "quote_number": f"FCL-{fcl_quote.id:06d}",
                    "price_per_container": (
                        float(price_per_container) if price_per_container else None
                    ),
                    "total_price": float(total_price) if total_price else None,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            error_details = traceback.format_exc() if settings.DEBUG else None
            return Response(
                {
                    "success": False,
                    "error": str(e),
                    "details": error_details,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
