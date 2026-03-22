import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import user_passes_test
from django.db.models import Sum
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from django.views.decorators.http import require_POST
from django.utils import timezone
from .models import (
    UserProfile, RentalShop, Vehicle, Booking, KYCDocument, OwnerRegistrationRequest, Review
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
    total_users = UserProfile.objects.filter(role="user").count()
    total_shops = RentalShop.objects.count()
    pending_kyc = KYCDocument.objects.filter(status="pending").count()
    registration_pending = OwnerRegistrationRequest.objects.filter(status="pending").count()
    recent_bookings = Booking.objects.select_related("vehicle", "shop", "user").order_by("-start_date")[:10]

    context = {
        'total_users': total_users,
        'total_shops': total_shops,
        'pending_kyc': pending_kyc,
        'registration_pending': registration_pending,
        'recent_bookings': recent_bookings,
    }
    return render(request, 'admin/dashboard.html', context)

@admin_required
def admin_profile(request):
    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'update_general':
            try:
                user = request.user
                user.first_name = request.POST.get('first_name', user.first_name).strip()
                user.last_name = request.POST.get('last_name', user.last_name).strip()
                user.email = request.POST.get('email', user.email).strip()
                user.save()

                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.phone = request.POST.get('phone', profile.phone).strip()
                profile.save()

                from django.contrib import messages
                messages.success(request, "Profile updated successfully.")
            except Exception as e:
                from django.contrib import messages
                messages.error(request, f"Failed to update profile: {str(e)}")

            return redirect('admin_profile')

        if action == 'change_password':
            from django.contrib import messages
            current_password = request.POST.get('current_password', '')
            new_password = request.POST.get('new_password', '')
            confirm_password = request.POST.get('confirm_password', '')

            if not request.user.check_password(current_password):
                messages.error(request, "Current password is incorrect.")
            elif new_password != confirm_password:
                messages.error(request, "New password and confirm password do not match.")
            elif len(new_password) < 8:
                messages.error(request, "New password must be at least 8 characters long.")
            else:
                try:
                    request.user.set_password(new_password)
                    request.user.save()
                    update_session_auth_hash(request, request.user)
                    messages.success(request, "Password updated successfully.")
                except Exception as e:
                    messages.error(request, f"Failed to update password: {str(e)}")

            return redirect('admin_profile')

    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return render(request, 'admin/adminProfile.html', {
        'admin_profile': profile,
        'current_page': 'profile',
    })

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
    
    # Get all bookings for vehicles in this shop
    from django.db.models import Q
    recent_bookings = Booking.objects.filter(
        Q(vehicle__shop=shop)
    ).select_related('user', 'vehicle').order_by('-start_date')[:10]
    
    context = {
        'shop': shop,
        'vehicles': vehicles,
        'recent_bookings': recent_bookings,
    }

    return render(request, 'admin/rentalshopdetails.html', context)

@admin_required
def admin_shop_reviews(request, shop_id):
    shop = get_object_or_404(RentalShop, id=shop_id)
    
    if request.method == 'POST':
        review_id = request.POST.get('review_id')
        action = request.POST.get('action')
        
        if action == 'delete' and review_id:
            try:
                review = Review.objects.get(id=review_id, shop=shop)
                review.delete()
                from django.contrib import messages
                messages.success(request, f"Review by {review.user.username} deleted successfully.")
            except Review.DoesNotExist:
                from django.contrib import messages
                messages.error(request, "Review not found.")
            except Exception as e:
                from django.contrib import messages
                messages.error(request, f"Error deleting review: {str(e)}")
        
        return redirect('admin_shop_reviews', shop_id=shop_id)
    
    # Get all reviews for this shop
    reviews = Review.objects.filter(shop=shop).select_related('user').order_by('-created_at')
    
    context = {
        'shop': shop,
        'reviews': reviews,
    }
    return render(request, 'admin/shop_reviews.html', context)

@admin_required
def admin_customers(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        customer_id = request.POST.get('customer_id')
        
        if customer_id and action:
            try:
                customer = User.objects.get(id=customer_id, user_profile__role='user')
                
                if action == 'activate':
                    customer.is_active = True
                    customer.save()
                    from django.contrib import messages
                    messages.success(request, f"Customer {customer.get_full_name() or customer.username} has been activated successfully.")
                
                elif action == 'deactivate':
                    customer.is_active = False
                    customer.save()
                    from django.contrib import messages
                    messages.success(request, f"Customer {customer.get_full_name() or customer.username} has been deactivated successfully.")
                
                elif action == 'delete':
                    customer_name = customer.get_full_name() or customer.username
                    customer.delete()
                    from django.contrib import messages
                    messages.success(request, f"Customer {customer_name} has been permanently deleted.")
                    
            except User.DoesNotExist:
                from django.contrib import messages
                messages.error(request, "Customer not found.")
            except Exception as e:
                from django.contrib import messages
                messages.error(request, f"Error performing action: {str(e)}")
        
        return redirect('admin_customers')
    
    customers = UserProfile.objects.filter(role="user").select_related("user")
    
    context = {
        'customers': customers,
    }
    return render(request, 'admin/customer.html', context)

@admin_required
def admin_staff(request, shop_id):
    shop = get_object_or_404(RentalShop, id=shop_id)
    staff_users = UserProfile.objects.filter(
        role="staff",
        shop=shop
    ).select_related("user")

    # Apply filters from GET params
    is_active = request.GET.get("is_active")
    if is_active is not None and is_active != "":
        is_active_bool = is_active.lower() in ("true", "1", "yes")
        staff_users = staff_users.filter(user__is_active=is_active_bool)

    sort = request.GET.get("sort")
    if sort == "username":
        sort = "user__username"
    if sort in ["-user__date_joined", "user__username"]:
        staff_users = staff_users.order_by(sort)

    context = {
        "staff_users": staff_users,
        "shop": shop,
    }
    return render(request, "admin/staff.html", context)

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
                owner=profile,
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
    return redirect('admin_approved_owners')

@admin_required
@require_POST
def reject_owner(request, owner_id):
    User.objects.filter(id=owner_id).update(is_active=False)
    return redirect('admin_approved_owners')

@admin_required
@require_POST
def delete_owner(request, owner_id):
    User.objects.filter(id=owner_id).delete()
    return redirect('admin_approved_owners')

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
