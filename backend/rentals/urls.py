from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RentalShopViewSet, VehicleViewSet, BookingViewSet,
    register, login, create_booking,
    shop_reviews,
    conversation_list, message_list,
    user_profile, user_stats,
    user_profile_update, user_settings_view,
    payment_methods_view, saved_locations_view, kyc_document_view,
    change_password,
    notification_list, mark_notification_read, delete_notification, create_notification,
    complaints_view,
    staff_assigned_complaints_view,
    staff_resolve_complaint_view,
    favorites_view,
)

router = DefaultRouter()
router.register(r'shops', RentalShopViewSet)
router.register(r'vehicles', VehicleViewSet)
# Register bookings ViewSet. This will handle list/detail (but create_booking is mapped explicitly below)
router.register(r'bookings', BookingViewSet)

# Notification routes - function-based views, so use direct path routing
# These are handled as regular API views, not ViewSets

# Auto-generated routes:
# /api/shops/     -> List/Create/Detail Rental Shops
# /api/vehicles/  -> List/Create/Detail Vehicles
# /api/notifications/ -> List/Create/Mark Read Notifications
# /api/bookings/  -> List/Create/Detail Bookings
#
# Chat routes:
# GET  /api/chat/conversations/              -> list user's conversations
# POST /api/chat/conversations/              -> get or create conversation with a shop
# GET  /api/chat/conversations/<id>/messages/ -> get all messages in conversation
# POST /api/chat/conversations/<id>/messages/ -> send a message
urlpatterns = [
    path('bookings/create/', create_booking, name='create-booking'),
    path('shops/<int:shop_id>/reviews/', shop_reviews, name='shop-reviews'),
    path('', include(router.urls)),
    # Auth
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    # Complaints
    path('complaints/', complaints_view, name='complaints'),
    path('staff-complaints/', staff_assigned_complaints_view, name='staff-complaints'),
    path('staff-complaints/<int:complaint_id>/resolve/', staff_resolve_complaint_view, name='staff-complaint-resolve'),
    # Favorites
    path('favorites/', favorites_view, name='favorites'),
    # Profile
    path('profile/', user_profile, name='user-profile'),
    path('profile/stats/', user_stats, name='user-stats'),
    path('profile/update/', user_profile_update, name='user-profile-update'),
    path('profile/settings/', user_settings_view, name='user-settings'),
    path('profile/change-password/', change_password, name='change-password'),
    # Payment Methods
    path('payments/', payment_methods_view, name='payment-methods'),
    path('payments/<int:pk>/', payment_methods_view, name='payment-method-detail'),
    # Saved Locations
    path('locations/', saved_locations_view, name='saved-locations'),
    path('locations/<int:pk>/', saved_locations_view, name='saved-location-detail'),
    # KYC
    path('kyc/', kyc_document_view, name='kyc-document'),
    # Notifications
    path('notifications/', notification_list, name='notification-list'),
    path('notifications/mark-read/<int:notification_id>/', mark_notification_read, name='mark-notification-read'),
    path('notifications/delete/<int:notification_id>/', delete_notification, name='delete-notification'),
    path('notifications/create/', create_notification, name='create-notification'),
    # Chat
    path('chat/conversations/', conversation_list, name='chat-conversations'),
    path('chat/conversations/<int:conversation_id>/messages/', message_list, name='chat-messages'),
]
