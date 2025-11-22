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


class FCLQuote(models.Model):
    """Model to store FCL quote requests"""

    SERVICE_TYPES = [
        ("commercial", "Commercial"),
        ("personal", "Personal"),
    ]

    CONTAINER_TYPES = [
        ("20DV", "20DV - 20ft Dry Van"),
        ("40DV", "40DV - 40ft Dry Van"),
        ("40HC", "40HC - 40ft High Cube"),
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
        max_length=10, choices=CONTAINER_TYPES, verbose_name="Container Type"
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

    # Status
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    is_processed = models.BooleanField(default=False, verbose_name="Is Processed")
    is_rejected = models.BooleanField(default=False, verbose_name="Is Rejected")

    class Meta:
        verbose_name = "FCL Quote"
        verbose_name_plural = "FCL Quotes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"FCL Quote - {self.full_name} ({self.port_of_loading} → {self.port_of_discharge}) - {self.created_at.strftime('%Y-%m-%d')}"
