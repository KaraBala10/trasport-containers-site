from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .admin_views import (PackagingPriceDetailView,
                          PackagingPriceListCreateView, PriceDetailView,
                          PriceListCreateView)
from .views import (ChangePasswordView, ContactMessageView, FCLQuoteDetailView,
                    FCLQuoteListView, FCLQuoteView, LoginView, RegisterView,
                    UserProfileView, approve_or_decline_edit_request_view,
                    calculate_cbm_view, calculate_pricing_view,
                    current_user_view, get_packaging_prices_view,
                    get_prices_view, initiate_payment_view, logout_view,
                    mollie_webhook_view, payment_status_view,
                    respond_to_offer_view, send_edit_request_reply_view,
                    send_payment_reminder_view, update_fcl_quote_status_view,
                    countries_list_view, cities_list_view, ports_list_view,
                    request_new_product_view)

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
    path(
        "fcl/quotes/<int:pk>/initiate-payment/",
        initiate_payment_view,
        name="fcl_quote_initiate_payment",
    ),
    path(
        "fcl/quotes/<int:pk>/payment-status/",
        payment_status_view,
        name="fcl_quote_payment_status",
    ),
    path("fcl/quotes/<int:pk>/", FCLQuoteDetailView.as_view(), name="fcl_quote_detail"),
    # Mollie webhook
    path("mollie/webhook/", mollie_webhook_view, name="mollie_webhook"),
    # Utility endpoints
    path("calculate-cbm/", calculate_cbm_view, name="calculate_cbm"),
    path("calculate-pricing/", calculate_pricing_view, name="calculate_pricing"),
    path("prices/", get_prices_view, name="get_prices"),
    path("packaging-prices/", get_packaging_prices_view, name="get_packaging_prices"),
    # Location endpoints
    path("countries/", countries_list_view, name="countries_list"),
    path("cities/", cities_list_view, name="cities_list"),
    path("ports/", ports_list_view, name="ports_list"),
    # Product request endpoint
    path("request-product/", request_new_product_view, name="request_product"),
    # Admin CRUD endpoints for Price
    path(
        "admin/prices/", PriceListCreateView.as_view(), name="admin_price_list_create"
    ),
    path(
        "admin/prices/<int:pk>/", PriceDetailView.as_view(), name="admin_price_detail"
    ),
    # Admin CRUD endpoints for PackagingPrice
    path(
        "admin/packaging-prices/",
        PackagingPriceListCreateView.as_view(),
        name="admin_packaging_price_list_create",
    ),
    path(
        "admin/packaging-prices/<int:pk>/",
        PackagingPriceDetailView.as_view(),
        name="admin_packaging_price_detail",
    ),
]
