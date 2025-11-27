from django.contrib import admin

from .models import ContactMessage, FCLQuote, PackagingPrice, Price, ProductRequest, SyrianProvincePrice, ShippingSettings


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "subject", "created_at", "is_read")
    list_filter = ("is_read", "created_at", "subject")
    search_fields = ("full_name", "email", "subject", "message")
    readonly_fields = ("created_at",)
    list_editable = ("is_read",)
    date_hierarchy = "created_at"

    fieldsets = (
        ("Contact Information", {"fields": ("full_name", "email", "phone")}),
        ("Message", {"fields": ("subject", "message")}),
        ("Status", {"fields": ("is_read", "created_at")}),
    )


@admin.register(FCLQuote)
class FCLQuoteAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "user",
        "company_name",
        "port_of_loading",
        "port_of_discharge",
        "container_type",
        "number_of_containers",
        "created_at",
        "status",
    )
    list_filter = (
        "status",
        "container_type",
        "usage_type",
        "created_at",
        "is_dangerous",
    )
    search_fields = (
        "full_name",
        "company_name",
        "email",
        "phone",
        "port_of_loading",
        "port_of_discharge",
    )
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Route Details",
            {
                "fields": (
                    ("origin_country", "origin_city", "origin_zip"),
                    "port_of_loading",
                    ("destination_country", "destination_city"),
                    "port_of_discharge",
                )
            },
        ),
        (
            "Container Details",
            {"fields": ("container_type", "number_of_containers", "cargo_ready_date")},
        ),
        (
            "Cargo Details",
            {
                "fields": (
                    "commodity_type",
                    "usage_type",
                    ("total_weight", "total_volume", "cargo_value"),
                    ("is_dangerous", "un_number", "dangerous_class"),
                )
            },
        ),
        (
            "Additional Services",
            {
                "fields": (
                    ("pickup_required", "pickup_address", "forklift_available"),
                    "eu_export_clearance",
                    "cargo_insurance",
                    "on_carriage",
                )
            },
        ),
        (
            "Customer Details",
            {
                "fields": (
                    ("full_name", "company_name", "country"),
                    ("phone", "email", "preferred_contact"),
                    ("packing_list", "photos"),
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "user",
                    "status",
                    "quote_number",
                    "created_at",
                )
            },
        ),
        ("Terms", {"fields": ("accepted_terms",)}),
    )


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = (
        "ar_item",
        "en_item",
        "price_per_kg",
        "minimum_shipping_weight",
        "minimum_shipping_unit",
        "one_cbm",
        "created_at",
        "updated_at",
    )
    list_filter = ("minimum_shipping_unit", "created_at", "updated_at")
    search_fields = ("ar_item", "en_item")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("price_per_kg", "minimum_shipping_weight", "one_cbm")
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Item Information",
            {
                "fields": ("ar_item", "en_item"),
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "price_per_kg",
                    ("minimum_shipping_weight", "minimum_shipping_unit"),
                    "one_cbm",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )


@admin.register(PackagingPrice)
class PackagingPriceAdmin(admin.ModelAdmin):
    list_display = (
        "ar_option",
        "en_option",
        "dimension",
        "price",
        "created_at",
        "updated_at",
    )
    list_filter = ("created_at", "updated_at")
    search_fields = ("ar_option", "en_option", "dimension")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("price",)
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Packaging Information",
            {
                "fields": ("ar_option", "en_option", "dimension"),
            },
        ),
        (
            "Pricing",
            {
                "fields": ("price",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )


@admin.register(ProductRequest)
class ProductRequestAdmin(admin.ModelAdmin):
    list_display = (
        "product_name",
        "user",
        "language",
        "status",
        "created_at",
        "updated_at",
    )
    list_filter = ("status", "language", "created_at", "updated_at")
    search_fields = ("product_name", "user__username", "user__email")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("status",)
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Request Information",
            {
                "fields": ("user", "product_name", "language"),
            },
        ),
        (
            "Status",
            {
                "fields": ("status", "admin_notes"),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )


@admin.register(SyrianProvincePrice)
class SyrianProvincePriceAdmin(admin.ModelAdmin):
    list_display = (
        "province_name_en",
        "province_name_ar",
        "province_code",
        "min_price",
        "rate_per_kg",
        "is_active",
        "display_order",
        "updated_at",
    )
    list_filter = ("is_active", "created_at", "updated_at")
    search_fields = ("province_name_en", "province_name_ar", "province_code")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("min_price", "rate_per_kg", "is_active", "display_order")
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Province Information",
            {
                "fields": (
                    "province_code",
                    ("province_name_ar", "province_name_en"),
                    "display_order",
                ),
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "min_price",
                    "rate_per_kg",
                ),
                "description": "Formula: max(weight × rate_per_kg, min_price)",
            },
        ),
        (
            "Status",
            {
                "fields": ("is_active",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )


@admin.register(ShippingSettings)
class ShippingSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "sendcloud_profit_margin",
        "updated_at",
    )
    readonly_fields = ("created_at", "updated_at")
    
    fieldsets = (
        (
            "Sendcloud Settings",
            {
                "fields": ("sendcloud_profit_margin",),
                "description": "Profit margin percentage added to Sendcloud shipping prices. Example: 10.00 means 10% profit.",
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )
    
    def has_add_permission(self, request):
        """Only allow one settings instance"""
        return not ShippingSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Don't allow deletion of settings"""
        return False
