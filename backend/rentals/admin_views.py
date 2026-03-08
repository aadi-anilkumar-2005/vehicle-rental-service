import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Sum
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST
from django.utils import timezone
from .models import (
    UserProfile, RentalShop, Vehicle, Booking, KYCDocument, OwnerRegistrationRequest
)

def is_admin(user):
    # Check if user role is "admin" or is_staff is True
    if user.is_authenticated:
        if user.is_staff:
            return True
        if hasattr(user, 'user_profile') and user.user_profile.role == 'admin':
            return True
    return False

# Admin access control decorator
admin_required = user_passes_test(is_admin, login_url='/login/')

@admin_required
def admin_dashboard(request):
    total_revenue = Booking.objects.filter(payment_status="completed").aggregate(Sum('total_price'))['total_price__sum'] or 0
    active_bookings = Booking.objects.filter(status__in=["active", "upcoming"]).count()
    vehicle_count = Vehicle.objects.count()
    staff_count = UserProfile.objects.filter(role="staff").count()
    pending_kyc = KYCDocument.objects.filter(status="pending").count()
    recent_bookings = Booking.objects.select_related("vehicle", "shop", "user").order_by("-start_date")[:10]

    context = {
        'total_revenue': total_revenue,
        'active_bookings': active_bookings,
        'total_vehicles': vehicle_count,
        'total_staff': staff_count,
        'pending_kyc': pending_kyc,
        'recent_bookings': recent_bookings,
    }
    return render(request, 'admin/dashboard.html', context)

@admin_required
def admin_rentalshops(request):
    shops = RentalShop.objects.all()

    # Filtering
    is_open = request.GET.get('is_open')
    if is_open is not None and is_open != '':
        is_open_bool = is_open.lower() in ('true', '1', 'yes')
        shops = shops.filter(is_open=is_open_bool)

    # Sorting
    sort_by = request.GET.get('sort_by')
    if sort_by in ['name', 'rating', 'review_count', '-name', '-rating', '-review_count']:
        shops = shops.order_by(sort_by)

    context = {
        'shops': shops,
    }
    return render(request, 'admin/rentalshop.html', context)

@admin_required
def admin_shop_detail(request, shop_id):
    shop = get_object_or_404(RentalShop, id=shop_id)
    vehicles = Vehicle.objects.filter(shop=shop)
    
    context = {
        'shop': shop,
        'vehicles': vehicles,
    }

    return render(request, 'admin/rentalshopdetails.html', context)

@admin_required
def admin_customers(request):
    customers = UserProfile.objects.filter(role="user").select_related("user")
    
    context = {
        'customers': customers,
    }
    return render(request, 'admin/customer.html', context)

@admin_required
def admin_staff(request):
    staff_list = UserProfile.objects.filter(role="staff").select_related("user")
    
    context = {
        'staff_members': staff_list,
    }
    return render(request, 'admin/rentalstaff.html', context)

@admin_required
def admin_vehicles(request):
    vehicles = Vehicle.objects.select_related("shop")

    # Filtering
    vehicle_type = request.GET.get('type')
    if vehicle_type:
        vehicles = vehicles.filter(type=vehicle_type)

    is_available = request.GET.get('is_available')
    if is_available is not None and is_available != '':
        is_available_bool = is_available.lower() in ('true', '1', 'yes')
        vehicles = vehicles.filter(is_available=is_available_bool)

    fuel_type = request.GET.get('fuel_type')
    if fuel_type:
        vehicles = vehicles.filter(fuel_type=fuel_type)

    transmission = request.GET.get('transmission')
    if transmission:
        vehicles = vehicles.filter(transmission=transmission)

    # Sorting
    sort_by = request.GET.get('sort_by')
    if sort_by in ['price_per_hour', 'price_per_day', '-price_per_hour', '-price_per_day']:
        vehicles = vehicles.order_by(sort_by)

    context = {
        'vehicles': vehicles,
    }
    return render(request, 'admin/vehicle.html', context)

@admin_required
def admin_vehicle_detail(request, vehicle_id):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id)
    
    context = {
        'vehicle': vehicle,
    }
    return render(request, 'admin/vehicledetails.html', context)

@admin_required
def admin_bookings(request):
    bookings = Booking.objects.select_related("vehicle", "shop", "user")

    # Filtering
    status = request.GET.get('status')
    if status:
        bookings = bookings.filter(status=status)

    booking_type = request.GET.get('booking_type')
    if booking_type:
        bookings = bookings.filter(booking_type=booking_type)

    delivery_option = request.GET.get('delivery_option')
    if delivery_option:
        bookings = bookings.filter(delivery_option=delivery_option)

    # Sorting
    sort_by = request.GET.get('sort_by')
    if sort_by in ['start_date', 'total_price', '-start_date', '-total_price']:
        bookings = bookings.order_by(sort_by)
    else:
        bookings = bookings.order_by('-created_at') # Default sorting

    context = {
        'bookings': bookings,
    }
    return render(request, 'admin/booking.html', context)

@admin_required
def admin_payments(request):
    # Retrieve bookings that have a payment_status set (or are not null/empty if that's the requirement)
    # The requirement says payment_status__isnull=False, but in the model it's a CharField with default='pending'. 
    # Usually we filter out empty strings as well. Let's use what the prompt specifically requested.
    payments = Booking.objects.filter(payment_status__isnull=False)

    # Filtering
    payment_method = request.GET.get('payment_method')
    if payment_method:
        payments = payments.filter(payment_method=payment_method)

    payment_status = request.GET.get('payment_status')
    if payment_status:
        payments = payments.filter(payment_status=payment_status)

    context = {
        'payments': payments,
    }
    return render(request, 'admin/payment.html', context)

@admin_required
def admin_owners(request):
    # Fetch all owner registration requests
    all_requests = OwnerRegistrationRequest.objects.all().order_by('-created_at')
    
    # Compute counts
    pending_count = all_requests.filter(status='pending').count()
    approved_count = all_requests.filter(status='approved').count()
    rejected_count = all_requests.filter(status='rejected').count()
    
    context = {
        'all_requests': all_requests,
        'pending_count': pending_count,
        'approved_count': approved_count,
        'rejected_count': rejected_count,
        'current_page': 'owners',
    }
    return render(request, 'admin/ownermanagement.html', context)


@admin_required
def admin_approved_owners(request):
    # Fetch active owners
    owners = UserProfile.objects.filter(role='owner').select_related('user').order_by('-user__date_joined')
    
    context = {
        'owners': owners,
        'current_page': 'approved_owners',
    }
    return render(request, 'admin/approved_owners.html', context)

@admin_required
@require_POST
def admin_owner_action(request):
    from django.contrib import messages
    action = request.POST.get('action')
    request_id = request.POST.get('request_id')
    owner_id = request.POST.get('owner_id')

    if owner_id:
        try:
            user = User.objects.get(id=owner_id, user_profile__role='owner')
            if action == 'approve':
                user.is_active = True
                user.save()
                messages.success(request, f"Owner {user.first_name} activated successfully.")
            elif action == 'reject':
                user.is_active = False
                user.save()
                messages.success(request, f"Owner {user.first_name} suspended successfully.")
        except User.DoesNotExist:
            messages.error(request, "Owner not found.")
        except Exception as e:
            messages.error(request, f"Error processing owner action: {str(e)}")
        
        # If we came from the details page, redirect back to it. Otherwise, return to management list.
        referer = request.META.get('HTTP_REFERER', '')
        if 'details' in referer or f'owners/{owner_id}' in referer:
            return redirect('admin_owner_detail', owner_id=owner_id)
        return redirect('admin_owner_management')

    if not request_id:
        messages.error(request, "Registration request ID is missing.")
        return redirect('admin_owner_management')

    try:
        reg_request = OwnerRegistrationRequest.objects.get(id=request_id)
        
        if action == 'approve':
            if User.objects.filter(email=reg_request.email).exists():
                messages.error(request, "A user with this email already exists.")
                return redirect('admin_owner_management')
            
            # Extract names
            name_parts = reg_request.owner_name.split(' ', 1) if reg_request.owner_name else ["", ""]
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

            # Create User
            user = User.objects.create_user(
                username=reg_request.email,
                email=reg_request.email,
                password='temp_password', # Wil be replaced
                first_name=first_name,
                last_name=last_name
            )
            # Override password hash with the stored hash
            user.password = reg_request.password_hash
            user.is_active = True
            user.save()

            # Create UserProfile
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.role = 'owner'
            profile.phone = reg_request.phone
            profile.save()

            # Create RentalShop
            RentalShop.objects.create(
                name=reg_request.shop_name, 
                address="Pending Address", 
                latitude=0, 
                longitude=0
            )

            reg_request.status = 'approved'
            reg_request.is_approved = True
            reg_request.is_rejected = False
            reg_request.resolved_at = timezone.now()
            reg_request.save()
            messages.success(request, f"Owner {reg_request.owner_name} approved successfully.")

        elif action == 'reject':
            reg_request.status = 'rejected'
            reg_request.is_rejected = True
            reg_request.is_approved = False
            reg_request.resolved_at = timezone.now()
            reg_request.save()
            messages.success(request, f"Owner {reg_request.owner_name} registration rejected.")
            
    except OwnerRegistrationRequest.DoesNotExist:
        messages.error(request, "Registration request not found.")
    except Exception as e:
        messages.error(request, f"Error processing action: {str(e)}")

    return redirect('admin_owner_management')

@admin_required
@require_POST
def approve_owner(request, owner_id):
    User.objects.filter(id=owner_id).update(is_active=True)
    return redirect('admin_owners_list')

@admin_required
@require_POST
def reject_owner(request, owner_id):
    User.objects.filter(id=owner_id).update(is_active=False)
    return redirect('admin_owners_list')

@admin_required
@require_POST
def delete_owner(request, owner_id):
    User.objects.filter(id=owner_id).delete()
    return redirect('admin_owners_list')

@admin_required
def admin_owner_detail(request, owner_id):
    from django.contrib import messages
    is_pending = request.GET.get('pending') == '1'

    if is_pending:
        try:
            pending_request = OwnerRegistrationRequest.objects.get(id=owner_id)
            context = {
                'pending_request': pending_request,
                'is_pending': True,
            }
            return render(request, 'admin/ownerdetails.html', context)
        except OwnerRegistrationRequest.DoesNotExist:
            messages.error(request, "Pending registration not found.")
            return redirect('admin_owner_management')
    else:
        try:
            owner = UserProfile.objects.select_related('user').get(user__id=owner_id, role='owner')
        except UserProfile.DoesNotExist:
            messages.error(request, "Owner not found.")
            return redirect('admin_owner_management')

        # Get their first associated shop if it exists
        shop = owner.shops.first() if hasattr(owner, 'shops') else None
        
        context = {
            'owner': owner,
            'shop': shop,
            'is_pending': False,
        }
        return render(request, 'admin/ownerdetails.html', context)

@admin_required
def admin_kyc_list(request):
    from django.utils import timezone
    from django.contrib import messages

    if request.method == 'POST':
        action = request.POST.get('action')
        kyc_id = request.POST.get('kyc_id')

        try:
            kyc = KYCDocument.objects.get(id=kyc_id)

            if action == 'approve':
                kyc.status = 'verified'
                kyc.verified_at = timezone.now()
                kyc.rejection_reason = None
                kyc.reviewed_by = request.user
                kyc.save()
                messages.success(request, f"KYC for {kyc.full_name} has been approved.")

            elif action == 'reject':
                reason = request.POST.get('rejection_reason', '').strip()
                if not reason:
                    messages.error(request, "Please provide a rejection reason.")
                else:
                    kyc.status = 'rejected'
                    kyc.rejection_reason = reason
                    kyc.verified_at = None
                    kyc.reviewed_by = request.user
                    kyc.save()
                    messages.success(request, f"KYC for {kyc.full_name} has been rejected.")

        except KYCDocument.DoesNotExist:
            messages.error(request, "KYC record not found.")
        except Exception as e:
            messages.error(request, f"Error processing KYC action: {str(e)}")

        return redirect('admin_kyc_management')

    # GET – list KYC documents with optional status filter
    status_filter = request.GET.get('status', '')
    kyc_docs = KYCDocument.objects.select_related('user', 'reviewed_by').order_by('-submitted_at')

    if status_filter in ('pending', 'verified', 'rejected', 'not_submitted'):
        kyc_docs = kyc_docs.filter(status=status_filter)

    counts = {
        'total': KYCDocument.objects.count(),
        'pending': KYCDocument.objects.filter(status='pending').count(),
        'verified': KYCDocument.objects.filter(status='verified').count(),
        'rejected': KYCDocument.objects.filter(status='rejected').count(),
    }

    return render(request, 'admin/kycmanagement.html', {
        'kyc_docs': kyc_docs,
        'status_filter': status_filter,
        'counts': counts,
    })

@admin_required
def admin_kyc_detail(request, kyc_id):
    from django.utils import timezone
    from django.contrib import messages

    try:
        kyc = KYCDocument.objects.select_related('user', 'reviewed_by').get(id=kyc_id)
    except KYCDocument.DoesNotExist:
        messages.error(request, "KYC record not found.")
        return redirect('admin_kyc_management')

    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'approve':
            kyc.status = 'verified'
            kyc.verified_at = timezone.now()
            kyc.rejection_reason = None
            kyc.reviewed_by = request.user
            kyc.save()
            messages.success(request, f"KYC for {kyc.full_name} has been approved successfully.")
            return redirect('admin_kyc_management')

        elif action == 'reject':
            reason = request.POST.get('rejection_reason', '').strip()
            if not reason:
                messages.error(request, "Please provide a rejection reason.")
            else:
                kyc.status = 'rejected'
                kyc.rejection_reason = reason
                kyc.verified_at = None
                kyc.reviewed_by = request.user
                kyc.save()
                messages.success(request, f"KYC for {kyc.full_name} has been rejected.")
                return redirect('admin_kyc_management')

    return render(request, 'admin/kycdetails.html', {'kyc': kyc})
