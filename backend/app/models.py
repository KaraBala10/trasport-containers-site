from django.contrib.auth.models import User
from django.db import models


class ContactMessage(models.Model):
    """Model to store contact form submissions"""

    full_name = models.CharField(max_length=255, verbose_name="Full Name")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=50, verbose_name="Phone")
    subject = models.CharField(max_length=255, verbose_name="Subject")
    message = models.TextField(verbose_name="Message")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    is_read = models.BooleanField(default=False, verbose_name="Is Read")

    class Meta:
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} - {self.subject} ({self.created_at.strftime('%Y-%m-%d')})"


class Country(models.Model):
    """Model to store countries with bilingual support"""

    code = models.CharField(
        max_length=3, unique=True, verbose_name="Country Code (ISO 3166-1)"
    )
    name_en = models.CharField(max_length=255, verbose_name="Name (English)")
    name_ar = models.CharField(
        max_length=255, verbose_name="Name (Arabic)", blank=True, null=True
    )

    class Meta:
        verbose_name = "Country"
        verbose_name_plural = "Countries"
        ordering = ["name_en"]

    def __str__(self):
        return f"{self.name_en} ({self.code})"


class City(models.Model):
    """Model to store cities with bilingual support"""

    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name="cities", verbose_name="Country"
    )
    name_en = models.CharField(max_length=255, verbose_name="Name (English)")
    name_ar = models.CharField(
        max_length=255, verbose_name="Name (Arabic)", blank=True, null=True
    )

    class Meta:
        verbose_name = "City"
        verbose_name_plural = "Cities"
        ordering = ["name_en"]
        indexes = [
            models.Index(fields=["country"]),
        ]

    def __str__(self):
        return f"{self.name_en}, {self.country.name_en}"


class Port(models.Model):
    """Model to store ports with bilingual support"""

    country = models.ForeignKey(
        Country, on_delete=models.CASCADE, related_name="ports", verbose_name="Country"
    )
    name_en = models.CharField(max_length=255, verbose_name="Name (English)")
    name_ar = models.CharField(
        max_length=255, verbose_name="Name (Arabic)", blank=True, null=True
    )
    code = models.CharField(
        max_length=10, verbose_name="Port Code (UN/LOCODE)", blank=True, null=True
    )

    class Meta:
        verbose_name = "Port"
        verbose_name_plural = "Ports"
        ordering = ["name_en"]
        indexes = [
            models.Index(fields=["country"]),
        ]

    def __str__(self):
        return f"{self.name_en}, {self.country.name_en}"


class FCLQuote(models.Model):
    """Model to store FCL quote requests"""

    SERVICE_TYPES = [
        ("commercial", "Commercial"),
        ("personal", "Personal"),
    ]

    CONTAINER_TYPES = [
        ("20ft_standard", "20ft Standard Dry Container"),
        ("40ft_standard", "40ft Standard Dry Container"),
        ("40ft_high_cube", "40ft High Cube Container (HC)"),
        ("reefer", "Reefer Container"),
        ("open_top", "Open Top Container"),
        ("flat_rack", "Flat Rack Container"),
        ("flat_bed", "Flat Bed / Flat Platform Container"),
        ("iso_tank", "ISO Tank Container"),
        ("bulk", "Bulk Container"),
        ("ventilated", "Ventilated Container"),
        ("insulated", "Insulated / Thermal Container"),
        ("car_carrier", "Car Carrier Container"),
        ("double_door", "Double Door Container"),
        ("side_door", "Side Door Container"),
    ]

    CONTACT_METHODS = [
        ("whatsapp", "WhatsApp"),
        ("email", "Email"),
        ("phone", "Phone"),
    ]

    # Route Details
    origin_country = models.CharField(max_length=255, verbose_name="Origin Country")
    origin_city = models.CharField(max_length=255, verbose_name="Origin City")
    origin_zip = models.CharField(max_length=50, blank=True, verbose_name="Origin ZIP")
    port_of_loading = models.CharField(
        max_length=255, verbose_name="Port of Loading (POL)"
    )

    destination_country = models.CharField(
        max_length=255, verbose_name="Destination Country"
    )
    destination_city = models.CharField(max_length=255, verbose_name="Destination City")
    port_of_discharge = models.CharField(
        max_length=255, verbose_name="Port of Discharge (POD)"
    )

    # Container Details
    container_type = models.CharField(
        max_length=50, choices=CONTAINER_TYPES, verbose_name="Container Type"
    )
    number_of_containers = models.PositiveIntegerField(
        default=1, verbose_name="Number of Containers"
    )
    cargo_ready_date = models.DateField(verbose_name="Cargo Ready Date")

    # Cargo Details
    commodity_type = models.CharField(max_length=255, verbose_name="Commodity Type")
    usage_type = models.CharField(
        max_length=20, choices=SERVICE_TYPES, verbose_name="Usage Type"
    )
    total_weight = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Total Weight (KG)"
    )
    total_volume = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Total Volume (CBM)"
    )
    cargo_value = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Cargo Value (EUR)"
    )

    is_dangerous = models.BooleanField(default=False, verbose_name="Is Dangerous Goods")
    un_number = models.CharField(max_length=50, blank=True, verbose_name="UN Number")
    dangerous_class = models.CharField(
        max_length=50, blank=True, verbose_name="Dangerous Class"
    )

    # Additional Services
    pickup_required = models.BooleanField(default=False, verbose_name="Pickup Required")
    pickup_address = models.TextField(blank=True, verbose_name="Pickup Address")
    forklift_available = models.BooleanField(
        default=False, verbose_name="Forklift Available"
    )
    eu_export_clearance = models.BooleanField(
        default=False, verbose_name="EU Export Clearance"
    )
    cargo_insurance = models.BooleanField(default=False, verbose_name="Cargo Insurance")
    on_carriage = models.BooleanField(default=False, verbose_name="On-carriage")

    # Certificate of Origin
    CERTIFICATE_OF_ORIGIN_CHOICES = [
        ("none", "None"),
        ("non_preferential", "Non-Preferential Certificate of Origin"),
        ("preferential", "Preferential Certificate of Origin"),
        ("chamber_of_commerce", "Chamber of Commerce Certificate of Origin"),
        ("manufacturer", "Manufacturer Certificate of Origin (MCO)"),
        ("electronic", "Electronic Certificate of Origin (e-CO)"),
        ("eur1", "EUR.1 Movement Certificate"),
        ("eur_med", "EUR-MED Movement Certificate"),
        ("gsp_form_a", "GSP Certificate of Origin – Form A"),
        ("consular", "Consular Certificate of Origin"),
        ("product_specific", "Special Certificates of Origin (Product-Specific)"),
    ]
    certificate_of_origin_type = models.CharField(
        max_length=50,
        choices=CERTIFICATE_OF_ORIGIN_CHOICES,
        default="none",
        blank=True,
        verbose_name="Certificate of Origin Type",
    )

    # Destination Customs Clearance
    destination_customs_clearance = models.BooleanField(
        default=False, verbose_name="Destination Customs Clearance"
    )

    # Customer Details
    full_name = models.CharField(max_length=255, verbose_name="Full Name")
    company_name = models.CharField(
        max_length=255, blank=True, verbose_name="Company Name"
    )
    country = models.CharField(max_length=255, verbose_name="Country")
    phone = models.CharField(max_length=50, verbose_name="Phone/WhatsApp")
    email = models.EmailField(verbose_name="Email")
    preferred_contact = models.CharField(
        max_length=20, choices=CONTACT_METHODS, verbose_name="Preferred Contact Method"
    )

    # Files
    packing_list = models.FileField(
        upload_to="fcl_quotes/packing_lists/",
        blank=True,
        null=True,
        verbose_name="Packing List",
    )
    photos = models.FileField(
        upload_to="fcl_quotes/photos/", blank=True, null=True, verbose_name="Photos"
    )

    # Terms
    accepted_terms = models.BooleanField(default=False, verbose_name="Accepted Terms")

    # Quote Number
    quote_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Quote Number",
        unique=True,
    )

    # User (link to authenticated user)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="fcl_quotes",
        verbose_name="User",
    )

    # Pricing (calculated)
    price_per_container = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Price Per Container (EUR)",
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Total Price (EUR)",
    )
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        default=0,
        verbose_name="Amount Paid (EUR)",
        help_text="Amount paid by the user",
    )

    # Payment fields (Stripe)
    payment_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Payment ID",
        help_text="Payment gateway ID (Stripe Session ID)",
    )
    payment_status = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ("pending", "Pending"),
            ("paid", "Paid"),
            ("failed", "Failed"),
            ("canceled", "Canceled"),
            ("expired", "Expired"),
        ],
        verbose_name="Payment Status",
        help_text="Current payment status from payment gateway (Stripe)",
    )
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ("stripe", "Stripe"),
            ("cash", "Cash"),
            ("internal-transfer", "Internal Transfer"),
        ],
        verbose_name="Payment Method",
        help_text="Method used for payment",
    )
    payment_created_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Payment Created At",
        help_text="When the payment was initiated",
    )
    payment_updated_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Payment Updated At",
        help_text="When the payment status was last updated",
    )

    # Status
    STATUS_CHOICES = [
        ("CREATED", "Created"),
        ("OFFER_SENT", "Offer Sent"),
        ("PENDING_PAYMENT", "Pending Payment"),
        ("PENDING_PICKUP", "Pending Pickup"),
        ("IN_TRANSIT_TO_WATTWEG_5", "In Transit to Wattweg 5"),
        ("ARRIVED_WATTWEG_5", "Arrived Wattweg 5"),
        ("SORTING_WATTWEG_5", "Sorting Wattweg 5"),
        ("READY_FOR_EXPORT", "Ready for Export"),
        ("IN_TRANSIT_TO_DESTINATION", "In Transit to Destination"),
        ("ARRIVED_DESTINATION", "Arrived at Destination"),
        ("DESTINATION_SORTING", "Sorting at Destination"),
        ("READY_FOR_DELIVERY", "Ready for Delivery"),
        ("OUT_FOR_DELIVERY", "Out for Delivery"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="CREATED",
        verbose_name="Status",
    )

    # Offer and User Response
    USER_RESPONSE_CHOICES = [
        ("PENDING", "Pending"),
        ("ACCEPTED", "Accepted"),
        ("REJECTED", "Rejected"),
        ("EDIT_REQUESTED", "Edit Requested"),
    ]

    offer_message = models.TextField(
        blank=True,
        null=True,
        verbose_name="Offer Message",
        help_text="Message sent to user with the offer",
    )
    offer_sent_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Offer Sent At",
    )
    user_response = models.CharField(
        max_length=20,
        choices=USER_RESPONSE_CHOICES,
        default="PENDING",
        verbose_name="User Response",
    )
    edit_request_message = models.TextField(
        blank=True,
        null=True,
        verbose_name="Edit Request Message",
        help_text="Message from user requesting changes to the offer",
    )
    edit_request_status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("APPROVED", "Approved"),
            ("DECLINED", "Declined"),
        ],
        default="PENDING",
        verbose_name="Edit Request Status",
        help_text="Status of the edit request conversation",
    )

    # Invoice
    invoice_file = models.FileField(
        upload_to="fcl_invoices/",
        blank=True,
        null=True,
        help_text="Generated invoice PDF file",
        verbose_name="Invoice File",
    )
    invoice_generated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when invoice was generated",
        verbose_name="Invoice Generated At",
    )

    class Meta:
        verbose_name = "FCL Quote"
        verbose_name_plural = "FCL Quotes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"FCL Quote - {self.full_name} ({self.port_of_loading} → {self.port_of_discharge}) - {self.created_at.strftime('%Y-%m-%d')}"


class EditRequestMessage(models.Model):
    """Model to store messages in edit request conversation threads"""

    quote = models.ForeignKey(
        FCLQuote,
        on_delete=models.CASCADE,
        related_name="edit_request_messages",
        verbose_name="FCL Quote",
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="edit_request_messages_sent",
        verbose_name="Sender",
    )
    message = models.TextField(verbose_name="Message")
    is_admin = models.BooleanField(
        default=False,
        verbose_name="Is Admin",
        help_text="Whether the sender is an admin",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        verbose_name = "Edit Request Message"
        verbose_name_plural = "Edit Request Messages"
        ordering = ["created_at"]

    def __str__(self):
        sender_name = (
            self.sender.get_full_name() or self.sender.username
            if self.sender
            else "Unknown"
        )
        return f"Message from {sender_name} on Quote #{self.quote.id} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class Price(models.Model):
    """Model to store pricing information for items"""

    PRICING_UNIT_CHOICES = [
        ("per_kg", "Per Kilogram"),
        ("per_piece", "Per Piece"),
    ]

    ar_item = models.CharField(
        max_length=255,
        verbose_name="Ar Item",
        help_text="Name or description of the item",
    )
    en_item = models.CharField(
        max_length=255,
        verbose_name="En Item",
        help_text="Name or description of the item",
    )
    price_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Price Per KG",
        help_text="Price per kilogram in EUR",
    )
    minimum_shipping_weight = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Minimum Shipping Weight",
        help_text="Minimum weight for shipping (can be per kg or per piece)",
    )
    minimum_shipping_unit = models.CharField(
        max_length=20,
        choices=PRICING_UNIT_CHOICES,
        default="per_kg",
        verbose_name="Minimum Shipping Unit",
        help_text="Unit for minimum shipping weight (per kg or per piece)",
    )
    one_cbm = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="One CBM Price",
        help_text="Price for one cubic meter (CBM) in EUR",
    )
    hs_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="HS Code",
        help_text="Harmonized System Code for customs (e.g., 85171200 for mobile phones)",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "Price"
        verbose_name_plural = "Prices"
        ordering = ["ar_item", "en_item"]

    def __str__(self):
        return f"{self.ar_item} / {self.en_item} - €{self.price_per_kg}/kg (Min: {self.minimum_shipping_weight} {self.get_minimum_shipping_unit_display()})"


class PackagingPrice(models.Model):
    """Model to store packaging pricing information"""

    ar_option = models.CharField(
        max_length=255,
        verbose_name="Arabic Option",
        help_text="Arabic name/description of the packaging option",
    )
    en_option = models.CharField(
        max_length=255,
        verbose_name="English Option",
        help_text="English name/description of the packaging option",
    )
    dimension = models.CharField(
        max_length=255,
        verbose_name="Dimension",
        help_text="Dimensions or size specifications",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Price",
        help_text="Price in EUR",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "Packaging Price"
        verbose_name_plural = "Packaging Prices"
        ordering = ["ar_option", "en_option"]

    def __str__(self):
        return f"{self.ar_option} / {self.en_option} - €{self.price}"


class ProductRequest(models.Model):
    """Model to store user requests for new products to be added"""

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="User",
        help_text="User who requested the product",
        null=True,
        blank=True,
    )
    product_name = models.CharField(
        max_length=255,
        verbose_name="Product Name",
        help_text="Name of the requested product",
    )
    language = models.CharField(
        max_length=2,
        choices=[("ar", "Arabic"), ("en", "English")],
        default="en",
        verbose_name="Language",
        help_text="Language of the product name",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
        verbose_name="Status",
    )
    admin_notes = models.TextField(
        blank=True,
        null=True,
        verbose_name="Admin Notes",
        help_text="Notes from admin regarding this request",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "Product Request"
        verbose_name_plural = "Product Requests"
        ordering = ["-created_at"]

    def __str__(self):
        user_info = f"{self.user.username}" if self.user else "Anonymous"
        return f"{self.product_name} - {user_info} ({self.get_status_display()})"


class SyrianProvincePrice(models.Model):
    """Model to store Syrian internal transport pricing by province"""

    province_code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Province Code",
        help_text="Unique code for the province (e.g., DAMASCUS, ALEPPO)",
    )
    province_name_ar = models.CharField(
        max_length=100,
        verbose_name="Province Name (Arabic)",
        help_text="Arabic name of the province",
    )
    province_name_en = models.CharField(
        max_length=100,
        verbose_name="Province Name (English)",
        help_text="English name of the province",
    )
    min_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Minimum Price (€)",
        help_text="Minimum transport price regardless of weight",
    )
    rate_per_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Rate per KG (€)",
        help_text="Price per kilogram of shipment weight",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active",
        help_text="Whether this province is available for selection",
    )
    display_order = models.IntegerField(
        default=0,
        verbose_name="Display Order",
        help_text="Order in which province appears in dropdown (lower = first)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "province_name_en"]
        verbose_name = "Syrian Province Price"
        verbose_name_plural = "Syrian Province Prices"

    def __str__(self):
        return f"{self.province_name_ar} / {self.province_name_en} - Min: €{self.min_price}, Rate: €{self.rate_per_kg}/kg"

    def calculate_price(self, weight: float) -> float:
        """
        Calculate transport price for given weight
        Formula: max(weight × rate_per_kg, min_price)

        Args:
            weight: Weight in kilograms

        Returns:
            Calculated price in EUR
        """
        if weight <= 0:
            return float(self.min_price)
        calculated = float(weight) * float(self.rate_per_kg)
        return max(calculated, float(self.min_price))


class ShippingSettings(models.Model):
    """
    Global shipping settings - Only one instance should exist
    """

    sendcloud_profit_margin = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        verbose_name="Sendcloud Profit Margin (%)",
        help_text="Profit margin percentage added to Sendcloud prices (e.g., 10.00 for 10%)",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Shipping Settings"
        verbose_name_plural = "Shipping Settings"

    def __str__(self):
        return f"Shipping Settings (Sendcloud Margin: {self.sendcloud_profit_margin}%)"

    def save(self, *args, **kwargs):
        """
        Ensure only one instance exists (Singleton pattern)
        """
        if not self.pk and ShippingSettings.objects.exists():
            # If trying to create new instance when one exists, update existing instead
            existing = ShippingSettings.objects.first()
            existing.sendcloud_profit_margin = self.sendcloud_profit_margin
            existing.save()
            return existing
        return super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        """
        Get the shipping settings instance (creates one if doesn't exist)
        """
        settings, created = cls.objects.get_or_create(
            pk=1, defaults={"sendcloud_profit_margin": 10.00}
        )
        if created:
            print("✅ Created default ShippingSettings")
        return settings


class CheckoutSessionRecord(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, help_text="The user who initiated the checkout."
    )
    stripe_customer_id = models.CharField(max_length=255)
    stripe_checkout_session_id = models.CharField(max_length=255)
    stripe_price_id = models.CharField(max_length=255)
    has_access = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)


class LCLShipment(models.Model):
    """Model to store LCL shipment requests"""

    STATUS_CHOICES = [
        ("PENDING_PAYMENT", "Pending Payment"),
        ("PENDING_PICKUP", "Pending Pickup"),
        ("IN_TRANSIT_TO_WATTWEG_5", "In Transit to Wattweg 5"),
        ("ARRIVED_WATTWEG_5", "Arrived Wattweg 5"),
        ("SORTING_WATTWEG_5", "Sorting Wattweg 5"),
        ("READY_FOR_EXPORT", "Ready for Export"),
        ("IN_TRANSIT_TO_DESTINATION", "In Transit to Destination"),
        ("ARRIVED_DESTINATION", "Arrived at Destination"),
        ("DESTINATION_SORTING", "Sorting at Destination"),
        ("READY_FOR_DELIVERY", "Ready for Delivery"),
        ("OUT_FOR_DELIVERY", "Out for Delivery"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    DIRECTION_CHOICES = [
        ("eu-sy", "Europe to Syria"),
        ("sy-eu", "Syria to Europe"),
    ]

    SHIPMENT_TYPE_CHOICES = [
        ("personal", "Personal"),
        ("commercial", "Commercial"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("stripe", "Stripe"),
        ("cash", "Cash"),
        ("internal-transfer", "Internal Transfer"),
    ]

    # User
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="lcl_shipments"
    )

    # Shipment Number
    shipment_number = models.CharField(
        max_length=50, unique=True, blank=True, null=True
    )

    # Direction
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)

    # Shipment Type
    shipment_type = models.CharField(
        max_length=20,
        choices=SHIPMENT_TYPE_CHOICES,
        blank=True,
        null=True,
        help_text="Type of shipment: personal, commercial, or mixed",
    )

    # Sender Information
    sender_name = models.CharField(max_length=255)
    sender_email = models.EmailField()
    sender_phone = models.CharField(max_length=50)
    sender_address = models.TextField()
    sender_city = models.CharField(max_length=255)
    sender_postal_code = models.CharField(max_length=50, blank=True)
    sender_country = models.CharField(max_length=100)

    # Receiver Information
    receiver_name = models.CharField(max_length=255)
    receiver_email = models.EmailField()
    receiver_phone = models.CharField(max_length=50)
    receiver_address = models.TextField()
    receiver_city = models.CharField(max_length=255)
    receiver_postal_code = models.CharField(max_length=50, blank=True)
    receiver_country = models.CharField(max_length=100)

    # Parcels (stored as JSON)
    parcels = models.JSONField(default=list, help_text="List of parcel objects")

    # EU Pickup (for eu-sy direction) - Sendcloud Parcel Form Fields
    eu_pickup_name = models.CharField(
        max_length=255, blank=True, help_text="Name for Sendcloud parcel"
    )
    eu_pickup_company_name = models.CharField(
        max_length=255, blank=True, help_text="Company name for Sendcloud parcel"
    )
    eu_pickup_address = models.TextField(blank=True)
    eu_pickup_house_number = models.CharField(
        max_length=50, blank=True, help_text="House number for Sendcloud parcel"
    )
    eu_pickup_city = models.CharField(max_length=255, blank=True)
    eu_pickup_postal_code = models.CharField(max_length=50, blank=True)
    eu_pickup_country = models.CharField(max_length=100, blank=True)
    eu_pickup_email = models.EmailField(
        blank=True, help_text="Email for Sendcloud parcel"
    )
    eu_pickup_telephone = models.CharField(
        max_length=50, blank=True, help_text="Telephone for Sendcloud parcel"
    )
    eu_pickup_weight = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    selected_eu_shipping_method = models.IntegerField(null=True, blank=True)
    selected_eu_shipping_name = models.CharField(max_length=255, blank=True)

    # Syria Transport (for eu-sy direction)
    syria_province = models.CharField(max_length=255, blank=True)
    syria_weight = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Payment
    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True
    )
    payment_status = models.CharField(max_length=50, default="pending")
    stripe_session_id = models.CharField(max_length=255, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Transfer details (for internal-transfer payment)
    transfer_sender_name = models.CharField(max_length=255, blank=True)
    transfer_reference = models.CharField(max_length=255, blank=True)
    transfer_slip = models.FileField(upload_to="transfer_slips/", blank=True, null=True)

    # Status
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="PENDING_PAYMENT"
    )

    # Tracking
    tracking_number = models.CharField(max_length=255, blank=True, default="")
    sendcloud_id = models.IntegerField(null=True, blank=True)
    sendcloud_label_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to download shipping label from Sendcloud",
    )

    # Invoice
    invoice_file = models.FileField(
        upload_to="invoices/",
        blank=True,
        null=True,
        help_text="Generated invoice PDF file",
    )
    invoice_generated_at = models.DateTimeField(
        null=True, blank=True, help_text="Timestamp when invoice was generated"
    )
    invoice_signature = models.ImageField(
        upload_to="invoice_signatures/",
        blank=True,
        null=True,
        help_text="Electronic signature for invoice",
    )

    # Receipt
    receipt_file = models.FileField(
        upload_to="receipts/",
        blank=True,
        null=True,
        help_text="Generated receipt PDF file",
    )
    receipt_generated_at = models.DateTimeField(
        null=True, blank=True, help_text="Timestamp when receipt was generated"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "LCL Shipment"
        verbose_name_plural = "LCL Shipments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["shipment_number"]),
        ]

    def __str__(self):
        return f"LCL Shipment #{self.id} - {self.shipment_number or 'N/A'} - {self.get_status_display()}"

    def get_shipment_type(self):
        """
        Determine shipment type based on parcels.
        Returns: 'personal' or 'commercial'
        """
        if not self.parcels or len(self.parcels) == 0:
            return None

        shipment_types = []

        for parcel in self.parcels:
            if not isinstance(parcel, dict):
                continue

            # Try multiple possible field names (camelCase, snake_case, lowercase)
            parcel_type = (
                parcel.get("shipmentType")
                or parcel.get("shipment_type")
                or parcel.get("shipmenttype")
            )

            # Normalize the value (handle case variations)
            if parcel_type:
                parcel_type = parcel_type.lower().strip()
                if parcel_type in ["personal", "commercial"]:
                    shipment_types.append(parcel_type)

        # If no parcels have shipmentType, return None (old shipments)
        if not shipment_types:
            return None

        # Return the first type found (or most common if needed)
        unique_types = list(set(shipment_types))
        return unique_types[0] if unique_types else None  # 'personal' or 'commercial'

    def save(self, *args, **kwargs):
        if not self.shipment_number:
            # Generate shipment number: LCL-YYYYMMDD-XXXX
            from django.utils import timezone

            date_str = timezone.now().strftime("%Y%m%d")
            # Use select_related and only to optimize query
            last_shipment = (
                LCLShipment.objects.filter(
                    shipment_number__startswith=f"LCL-{date_str}"
                )
                .only("shipment_number")
                .order_by("-shipment_number")
                .first()
            )

            if last_shipment and last_shipment.shipment_number:
                try:
                    last_num = int(last_shipment.shipment_number.split("-")[-1])
                    next_num = last_num + 1
                except (ValueError, IndexError):
                    next_num = 1
            else:
                next_num = 1

            self.shipment_number = f"LCL-{date_str}-{next_num:04d}"

        super().save(*args, **kwargs)
