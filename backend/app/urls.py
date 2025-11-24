from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    ContactMessageView,
    FCLQuoteDetailView,
    FCLQuoteListView,
    FCLQuoteView,
    LoginView,
    RegisterView,
    UserProfileView,
    approve_or_decline_edit_request_view,
    calculate_cbm_view,
    calculate_pricing_view,
    current_user_view,
    logout_view,
    respond_to_offer_view,
    send_edit_request_reply_view,
    send_payment_reminder_view,
    update_fcl_quote_status_view,
)

app_name = "app"

urlpatterns = [
    # Authentication endpoints
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", logout_view, name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User endpoints
    path("user/", current_user_view, name="current_user"),
    path("user/profile/", UserProfileView.as_view(), name="user_profile"),
    path("user/change-password/", ChangePasswordView.as_view(), name="change_password"),
    # Contact endpoint
    path("contact/", ContactMessageView.as_view(), name="contact"),
    # FCL endpoints
    path("fcl/quote/", FCLQuoteView.as_view(), name="fcl_quote"),
    path("fcl/quotes/", FCLQuoteListView.as_view(), name="fcl_quote_list"),
    path(
        "fcl/quotes/<int:pk>/status/",
        update_fcl_quote_status_view,
        name="fcl_quote_status",
    ),
    path(
        "fcl/quotes/<int:pk>/respond/",
        respond_to_offer_view,
        name="fcl_quote_respond",
    ),
    path(
        "fcl/quotes/<int:pk>/edit-request/reply/",
        send_edit_request_reply_view,
        name="fcl_quote_edit_request_reply",
    ),
    path(
        "fcl/quotes/<int:pk>/edit-request/approve-decline/",
        approve_or_decline_edit_request_view,
        name="fcl_quote_edit_request_approve_decline",
    ),
    path(
        "fcl/quotes/<int:pk>/send-payment-reminder/",
        send_payment_reminder_view,
        name="fcl_quote_send_payment_reminder",
    ),
    path("fcl/quotes/<int:pk>/", FCLQuoteDetailView.as_view(), name="fcl_quote_detail"),
    # Utility endpoints
    path("calculate-cbm/", calculate_cbm_view, name="calculate_cbm"),
    path("calculate-pricing/", calculate_pricing_view, name="calculate_pricing"),
]
