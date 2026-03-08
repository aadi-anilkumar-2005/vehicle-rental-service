from django.urls import path
from . import admin_views
from owner.views import logout_view as admin_logout_view

urlpatterns = [
    # Dashboard
    path('dashboard/', admin_views.admin_dashboard, name='admin_dashboard'),
    
    # Rental Shops
    path('rental-shops/', admin_views.admin_rentalshops, name='admin_rental_shops'),
    path('rental-shops/<int:shop_id>/', admin_views.admin_shop_detail, name='admin_shop_detail'),
    
    # Users
    path('customers/', admin_views.admin_customers, name='admin_customers'),
    path('staff/', admin_views.admin_staff, name='admin_rental_staff'),
    
    # Vehicles & Bookings
    path('vehicles/', admin_views.admin_vehicles, name='admin_vehicles'),
    path('vehicles/<int:vehicle_id>/', admin_views.admin_vehicle_detail, name='admin_vehicle_detail'),
    path('bookings/', admin_views.admin_bookings, name='admin_bookings'),
    path('payments/', admin_views.admin_payments, name='admin_payments'),
    
    # Owners
    path('owners/registrations/', admin_views.admin_owners, name='admin_owner_management'), 
    path('owners/approved/', admin_views.admin_approved_owners, name='admin_approved_owners'),
    path('owners/<int:owner_id>/', admin_views.admin_owner_detail, name='admin_owner_detail'),
    path('owners/<int:owner_id>/approve/', admin_views.approve_owner, name='admin_approve_owner'),
    path('owners/<int:owner_id>/reject/', admin_views.reject_owner, name='admin_reject_owner'),
    path('owners/<int:owner_id>/delete/', admin_views.delete_owner, name='admin_delete_owner'),
    # This action endpoint handles approve/reject POST requests
    path('owners/action/', admin_views.admin_owner_action, name='admin_owner_action'),
    
    # KYC
    path('kyc/', admin_views.admin_kyc_list, name='admin_kyc_management'),
    path('kyc/<int:kyc_id>/', admin_views.admin_kyc_detail, name='admin_kyc_detail'),
    # This action endpoint seems to be missing in admin_views, mapping to kyc list for now to prevent NoReverseMatch
    path('kyc/action/', admin_views.admin_kyc_list, name='admin_kyc_action'),

    # Logout (mapping to owner_login or owner_logout from somewhere else or just owner login temporarily)
    path('logout/', admin_logout_view, name='admin_logout'),
]
