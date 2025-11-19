from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "subject", "created_at", "is_read")
    list_filter = ("is_read", "created_at", "subject")
    search_fields = ("full_name", "email", "subject", "message")
    readonly_fields = ("created_at",)
    list_editable = ("is_read",)
    date_hierarchy = "created_at"
    
    fieldsets = (
        ("Contact Information", {
            "fields": ("full_name", "email", "phone")
        }),
        ("Message", {
            "fields": ("subject", "message")
        }),
        ("Status", {
            "fields": ("is_read", "created_at")
        }),
    )
