from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import ContactMessage, EditRequestMessage, FCLQuote, PackagingPrice, Price


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = (
            "id",
            "full_name",
            "email",
            "phone",
            "subject",
            "message",
            "created_at",
            "is_read",
        )
        read_only_fields = ("id", "created_at", "is_read")

    def validate_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required.")
        return value

    def validate_full_name(self, value):
        """Validate full name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Full name is required.")
        return value.strip()

    def validate_phone(self, value):
        """Validate phone"""
        if not value or not value.strip():
            raise serializers.ValidationError("Phone is required.")
        return value.strip()

    def validate_subject(self, value):
        """Validate subject"""
        if not value or not value.strip():
            raise serializers.ValidationError("Subject is required.")
        return value.strip()

    def validate_message(self, value):
        """Validate message"""
        if not value or not value.strip():
            raise serializers.ValidationError("Message is required.")
        return value.strip()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "is_superuser",
            "is_staff",
        )
        read_only_fields = ("id", "username", "date_joined", "is_superuser", "is_staff")

    def validate_email(self, value):
        """Validate email uniqueness, excluding current user"""
        user = self.instance
        if user and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class FCLQuoteSerializer(serializers.ModelSerializer):
    """Serializer for FCL Quote requests"""

    edit_request_messages = serializers.SerializerMethodField()

    class Meta:
        model = FCLQuote
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "user",
            "offer_sent_at",
        )
        depth = 1  # Include user details in nested format

    def get_edit_request_messages(self, obj):
        """Get all edit request messages for this quote"""
        messages = obj.edit_request_messages.all()
        return EditRequestMessageSerializer(messages, many=True).data

    def to_internal_value(self, data):
        """Convert string booleans to actual booleans for FormData"""
        from django.http import QueryDict

        # Convert QueryDict to regular dict (QueryDict is immutable)
        if isinstance(data, QueryDict):
            data_dict = {}
            for key in data.keys():
                values = data.getlist(key)
                # For most fields, take the first value
                # For files, keep as list
                if len(values) == 1:
                    data_dict[key] = values[0]
                elif len(values) > 1:
                    # Multiple values (e.g., files)
                    data_dict[key] = values
                else:
                    data_dict[key] = None
        elif hasattr(data, "copy"):
            data_dict = data.copy()
        else:
            data_dict = dict(data) if data else {}

        # Handle boolean fields that come as strings from FormData
        boolean_fields = [
            "is_dangerous",
            "pickup_required",
            "forklift_available",
            "eu_export_clearance",
            "cargo_insurance",
            "on_carriage",
            "accepted_terms",
        ]
        for field in boolean_fields:
            if field in data_dict:
                value = data_dict[field]
                if isinstance(value, str):
                    data_dict[field] = value.lower() in ("true", "1", "yes", "on")
                elif isinstance(value, list) and len(value) > 0:
                    # Handle list from QueryDict
                    data_dict[field] = (
                        value[0].lower() in ("true", "1", "yes", "on")
                        if isinstance(value[0], str)
                        else False
                    )

        # Handle empty strings for optional fields
        optional_fields = [
            "origin_zip",
            "company_name",
            "un_number",
            "dangerous_class",
            "pickup_address",
        ]
        for field in optional_fields:
            if field in data_dict:
                value = data_dict[field]
                if isinstance(value, list):
                    value = value[0] if value else ""
                if value == "" or value is None:
                    if field in ["un_number", "dangerous_class", "pickup_address"]:
                        data_dict[field] = None
                    else:
                        data_dict[field] = ""

        return super().to_internal_value(data_dict)

    def validate_accepted_terms(self, value):
        """Validate that terms are accepted (only on create, not on update)"""
        # Only validate on create, not on partial updates
        if self.instance is None and not value:
            raise serializers.ValidationError(
                "You must accept the terms and conditions."
            )
        return value

    def validate_is_dangerous(self, value):
        """Validate dangerous goods fields"""
        if value:
            if not self.initial_data.get("un_number") or not self.initial_data.get(
                "dangerous_class"
            ):
                raise serializers.ValidationError(
                    "UN Number and Dangerous Class are required for dangerous goods."
                )
        return value

    def validate_pickup_required(self, value):
        """Validate pickup address if pickup is required"""
        if value:
            if not self.initial_data.get("pickup_address"):
                raise serializers.ValidationError(
                    "Pickup address is required when pickup service is selected."
                )
        return value

    def save(self, **kwargs):
        """Override save to capture user from perform_create"""
        # Extract user from kwargs (passed from perform_create via serializer.save(user=...))
        user = kwargs.pop("user", None)

        # Store user to use in create() method
        if user is not None:
            self._user_from_perform_create = user

        # Call parent save which will call create() with validated_data
        return super().save(**kwargs)

    def create(self, validated_data):
        """Create FCL quote with user from perform_create or context"""
        import logging

        from django.conf import settings

        logger = logging.getLogger(__name__)

        # Get user from perform_create (stored in save method)
        user = getattr(self, "_user_from_perform_create", None)

        if user and settings.DEBUG:
            logger.debug(f"User from perform_create: {user} (ID: {user.id})")

        # Fallback: Get user from context
        if user is None and self.context and "request" in self.context:
            request = self.context["request"]
            if request.user and request.user.is_authenticated:
                user = request.user
                if settings.DEBUG:
                    logger.debug(f"User from context: {user} (ID: {user.id})")

        # CRITICAL: If user is still None, this is a problem
        if user is None:
            logger.error(
                "CRITICAL: USER IS NONE in serializer.create() - This will cause user_id to be NULL!"
            )

        # Create the quote instance with user
        # Ensure status is CREATED if not provided
        if "status" not in validated_data:
            validated_data["status"] = "CREATED"

        fcl_quote = FCLQuote.objects.create(
            **validated_data,
            user=user,
        )

        if settings.DEBUG:
            logger.debug(
                f"FCLQuote created: ID={fcl_quote.id}, User={fcl_quote.user} "
                f"(ID: {fcl_quote.user.id if fcl_quote.user else 'NULL'})"
            )

        return fcl_quote


class EditRequestMessageSerializer(serializers.ModelSerializer):
    """Serializer for Edit Request Messages"""

    sender_name = serializers.SerializerMethodField()
    sender_email = serializers.SerializerMethodField()

    class Meta:
        model = EditRequestMessage
        fields = (
            "id",
            "quote",
            "sender",
            "sender_name",
            "sender_email",
            "message",
            "is_admin",
            "created_at",
        )
        read_only_fields = ("id", "sender", "is_admin", "created_at")

    def get_sender_name(self, obj):
        """Get sender's full name or username"""
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.username
        return "Unknown"

    def get_sender_email(self, obj):
        """Get sender's email"""
        return obj.sender.email if obj.sender else None

    def create(self, validated_data):
        """Create a new edit request message"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["sender"] = request.user
            validated_data["is_admin"] = request.user.is_superuser
        return super().create(validated_data)


class PriceSerializer(serializers.ModelSerializer):
    """Serializer for Price model"""

    minimum_shipping_unit_display = serializers.CharField(
        source="get_minimum_shipping_unit_display", read_only=True
    )

    class Meta:
        model = Price
        fields = (
            "id",
            "ar_item",
            "en_item",
            "price_per_kg",
            "minimum_shipping_weight",
            "minimum_shipping_unit",
            "minimum_shipping_unit_display",
            "one_cbm",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class PackagingPriceSerializer(serializers.ModelSerializer):
    """Serializer for PackagingPrice model"""

    class Meta:
        model = PackagingPrice
        fields = (
            "id",
            "ar_option",
            "en_option",
            "dimension",
            "price",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
