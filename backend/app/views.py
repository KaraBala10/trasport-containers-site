from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import ContactMessage, FCLQuote, FCLPricing
from .serializers import (
    ChangePasswordSerializer,
    ContactMessageSerializer,
    FCLQuoteSerializer,
    FCLPricingSerializer,
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


class FCLPricingView(generics.ListAPIView):
    """API endpoint to get FCL pricing rates"""
    queryset = FCLPricing.objects.filter(is_active=True)
    serializer_class = FCLPricingSerializer
    permission_classes = [AllowAny]


class FCLQuoteCalculateView(generics.GenericAPIView):
    """API endpoint to calculate FCL quote price"""
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        port_of_loading = request.data.get('port_of_loading')
        port_of_discharge = request.data.get('port_of_discharge')
        container_type = request.data.get('container_type')
        number_of_containers = int(request.data.get('number_of_containers', 1))
        
        if not all([port_of_loading, port_of_discharge, container_type]):
            return Response(
                {"error": "Port of loading, port of discharge, and container type are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            pricing = FCLPricing.objects.get(
                port_of_loading=port_of_loading,
                port_of_discharge=port_of_discharge,
                container_type=container_type,
                is_active=True
            )
            
            price_per_container = pricing.total_price_per_container
            total_price = price_per_container * number_of_containers
            
            return Response(
                {
                    "success": True,
                    "price_per_container": float(price_per_container),
                    "total_price": float(total_price),
                    "number_of_containers": number_of_containers,
                    "pricing_details": {
                        "base_ocean_freight": float(pricing.base_ocean_freight),
                        "origin_charges": float(pricing.origin_charges),
                        "destination_charges": float(pricing.destination_charges),
                        "documentation_fee": float(pricing.documentation_fee),
                        "margin": float(pricing.margin),
                    },
                    "note": "Price is estimated until booking confirmation."
                },
                status=status.HTTP_200_OK
            )
        except FCLPricing.DoesNotExist:
            return Response(
                {"error": "Pricing not found for the selected route and container type."},
                status=status.HTTP_404_NOT_FOUND
            )


class FCLQuoteView(generics.CreateAPIView):
    """API endpoint for submitting FCL quote requests"""
    queryset = FCLQuote.objects.all()
    serializer_class = FCLQuoteSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # Support file uploads
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Calculate pricing
        port_of_loading = serializer.validated_data.get('port_of_loading')
        port_of_discharge = serializer.validated_data.get('port_of_discharge')
        container_type = serializer.validated_data.get('container_type')
        number_of_containers = serializer.validated_data.get('number_of_containers', 1)
        
        price_per_container = None
        total_price = None
        
        try:
            pricing = FCLPricing.objects.get(
                port_of_loading=port_of_loading,
                port_of_discharge=port_of_discharge,
                container_type=container_type,
                is_active=True
            )
            price_per_container = pricing.total_price_per_container
            total_price = price_per_container * number_of_containers
        except FCLPricing.DoesNotExist:
            pass  # Pricing will be calculated manually
        
        # Save quote with pricing
        fcl_quote = serializer.save(
            price_per_container=price_per_container,
            total_price=total_price
        )
        
        # TODO: Send email notification here
        # You can use Django's email backend or a service like SendGrid
        
        return Response(
            {
                "success": True,
                "message": "Your FCL quote request has been submitted successfully. We will contact you soon.",
                "id": fcl_quote.id,
                "quote_number": f"FCL-{fcl_quote.id:06d}",
                "price_per_container": float(price_per_container) if price_per_container else None,
                "total_price": float(total_price) if total_price else None,
            },
            status=status.HTTP_201_CREATED,
        )
