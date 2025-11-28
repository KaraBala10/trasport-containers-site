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
                    get_prices_view, logout_view,
                    payment_status_view, initiate_stripe_payment_view, stripe_webhook_view,
                    respond_to_offer_view, send_edit_request_reply_view,
                    send_payment_reminder_view, update_fcl_quote_status_view,
                    countries_list_view, cities_list_view, ports_list_view,
                    request_new_product_view, user_product_requests_view,
                    admin_all_product_requests_view, update_product_request_view,
                    get_per_piece_products_view, get_regular_products_view,
                    calculate_eu_shipping_view, sendcloud_webhook_view,
                    get_syrian_provinces_view, calculate_syria_transport_view,
                    admin_syrian_provinces_view, admin_syrian_province_detail_view,
                    admin_shipping_settings_view)

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
    # Mollie payment removed - using Stripe only
    # path(
    #     "fcl/quotes/<int:pk>/initiate-payment/",
    #     initiate_payment_view,
    #     name="fcl_quote_initiate_payment",
    # ),
    path(
        "fcl/quotes/<int:pk>/payment-status/",
        payment_status_view,
        name="fcl_quote_payment_status",
    ),
    # Stripe payment endpoints
    path(
        "fcl/quotes/<int:pk>/initiate-stripe-payment/",
        initiate_stripe_payment_view,
        name="fcl_quote_initiate_stripe_payment",
    ),
    path("fcl/quotes/<int:pk>/", FCLQuoteDetailView.as_view(), name="fcl_quote_detail"),
    # Stripe webhook
    path("stripe/webhook/", stripe_webhook_view, name="stripe_webhook"),
    # Mollie webhook removed - using Stripe only
    # Utility endpoints
    path("calculate-cbm/", calculate_cbm_view, name="calculate_cbm"),
    path("calculate-pricing/", calculate_pricing_view, name="calculate_pricing"),
    path("prices/", get_prices_view, name="get_prices"),
    path("packaging-prices/", get_packaging_prices_view, name="get_packaging_prices"),
    path("regular-products/", get_regular_products_view, name="regular_products"),
    path("per-piece-products/", get_per_piece_products_view, name="per_piece_products"),
    # Location endpoints
    path("countries/", countries_list_view, name="countries_list"),
    path("cities/", cities_list_view, name="cities_list"),
    path("ports/", ports_list_view, name="ports_list"),
    # Product request endpoints
    path("request-product/", request_new_product_view, name="request_product"),
    path("user/product-requests/", user_product_requests_view, name="user_product_requests"),
    path("admin/product-requests/", admin_all_product_requests_view, name="admin_all_product_requests"),
    path("admin/product-requests/<int:pk>/", update_product_request_view, name="update_product_request"),
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
    # Sendcloud Shipping endpoints
    path("calculate-eu-shipping/", calculate_eu_shipping_view, name="calculate_eu_shipping"),
    path("sendcloud/webhook/", sendcloud_webhook_view, name="sendcloud_webhook"),
    # Syrian Internal Transport endpoints
    path("syrian-provinces/", get_syrian_provinces_view, name="syrian_provinces"),
    path("calculate-syria-transport/", calculate_syria_transport_view, name="calculate_syria_transport"),
    # Admin CRUD endpoints for Syrian Province Pricing
    path("admin/syrian-provinces/", admin_syrian_provinces_view, name="admin_syrian_provinces"),
    path("admin/syrian-provinces/<int:pk>/", admin_syrian_province_detail_view, name="admin_syrian_province_detail"),
    # Admin Shipping Settings endpoint
    path("admin/shipping-settings/", admin_shipping_settings_view, name="admin_shipping_settings"),
]
