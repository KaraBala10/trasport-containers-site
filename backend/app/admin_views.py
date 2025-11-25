"""Admin CRUD views for Price and PackagingPrice models"""
from rest_framework import permissions, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import PackagingPrice, Price
from .serializers import PackagingPriceSerializer, PriceSerializer


# ==================== Admin CRUD Endpoints for Price ====================

class PriceListCreateView(ListCreateAPIView):
    """List all prices or create a new price (Admin only)"""
    queryset = Price.objects.all().order_by("ar_item", "en_item")
    serializer_class = PriceSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        """Only allow superusers to access this endpoint"""
        if self.request.method == "GET":
            return [AllowAny()]  # Allow anyone to read prices
        return [IsAuthenticated()]  # Require authentication for create

    def perform_create(self, serializer):
        """Check if user is superuser before creating"""
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied(
                "Only administrators can create prices."
            )
        serializer.save()


class PriceDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a price (Admin only)"""
    queryset = Price.objects.all()
    serializer_class = PriceSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        """Only allow superusers to modify prices"""
        if self.request.method == "GET":
            return [AllowAny()]  # Allow anyone to read a price
        return [IsAuthenticated()]  # Require authentication for modify

    def perform_update(self, serializer):
        """Check if user is superuser before updating"""
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied(
                "Only administrators can update prices."
            )
        serializer.save()

    def perform_destroy(self, instance):
        """Check if user is superuser before deleting"""
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied(
                "Only administrators can delete prices."
            )
        instance.delete()


# ==================== Admin CRUD Endpoints for PackagingPrice ====================

class PackagingPriceListCreateView(ListCreateAPIView):
    """List all packaging prices or create a new packaging price (Admin only)"""
    queryset = PackagingPrice.objects.all().order_by("ar_option", "en_option")
    serializer_class = PackagingPriceSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        """Only allow superusers to access this endpoint"""
        if self.request.method == "GET":
            return [AllowAny()]  # Allow anyone to read packaging prices
        return [IsAuthenticated()]  # Require authentication for create

    def perform_create(self, serializer):
        """Check if user is superuser before creating"""
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied(
                "Only administrators can create packaging prices."
            )
        serializer.save()


class PackagingPriceDetailView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a packaging price (Admin only)"""
    queryset = PackagingPrice.objects.all()
    serializer_class = PackagingPriceSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_permissions(self):
        """Only allow superusers to modify packaging prices"""
        if self.request.method == "GET":
            return [AllowAny()]  # Allow anyone to read a packaging price
        return [IsAuthenticated()]  # Require authentication for modify

    def perform_update(self, serializer):
        """Check if user is superuser before updating"""
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied(
                "Only administrators can update packaging prices."
            )
        serializer.save()

    def perform_destroy(self, instance):
        """Check if user is superuser before deleting"""
        if not self.request.user.is_superuser:
            raise permissions.PermissionDenied(
                "Only administrators can delete packaging prices."
            )
        instance.delete()

