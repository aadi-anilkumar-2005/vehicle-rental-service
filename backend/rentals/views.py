from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import RentalShop, Vehicle, Booking, Conversation, Message, UserSettings, PaymentMethod, SavedLocation, KYCDocument, UserProfile, Notification, Review
from .serializers import (
    RentalShopSerializer, VehicleSerializer, BookingSerializer, BookingCreateSerializer,
    UserSerializer, ConversationSerializer, MessageSerializer,
    UserProfileSerializer, UserStatsSerializer,
    UserSettingsSerializer, PaymentMethodSerializer, PaymentMethodCreateSerializer,
    SavedLocationSerializer, KYCDocumentSerializer, KYCDocumentCreateSerializer,
    UserProfileUpdateSerializer, NotificationSerializer, ReviewSerializer,
)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data.copy()
    # Map 'username' (name from frontend) to 'first_name'
    # Map 'email' to 'username' (unique identifier)
    data['first_name'] = data.get('username')
    data['username'] = data.get('email')
    
    # Ensure role is passed correctly
    rule = data.get('role', 'user')
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username_or_email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')

    # First try authenticating by assuming the input is a username
    user = authenticate(username=username_or_email, password=password)
    
    # If that fails, see if the input is an email, and authenticate with the matching username
    if not user:
        from django.contrib.auth.models import User
        try:
            user_obj = User.objects.get(email=username_or_email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if not user:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    return Response({
        'token': token.key,
        'user': serializer.data
    })

class RentalShopViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rental shops to be viewed or edited.
    PRO TIP: ModelViewSet handles GET, POST, PUT, PATCH, DELETE automatically.
    """
    queryset = RentalShop.objects.all()
    serializer_class = RentalShopSerializer

    def get_queryset(self):
        """
        Returns all shops, optionally filtered by a ?search= query param.
        Matches against name and address (case-insensitive).
        Example: GET /api/shops/?search=speedwheels
        """
        queryset = RentalShop.objects.all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(address__icontains=search)
            )
        return queryset

class VehicleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows vehicles to be viewed or edited.
    Supports filtering by shop: /api/vehicles/?shop=<shop_id>
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def get_queryset(self):
        """
        Logic to filter vehicles if needed.
        Currently returns all vehicles for the details page.
        """
        queryset = Vehicle.objects.all()
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            queryset = queryset.filter(shop__id=shop_id)
        return queryset

class BookingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing bookings.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        """Filter bookings by current user"""
        if self.request.user.is_authenticated:
            return Booking.objects.filter(user=self.request.user)
        return Booking.objects.none()
    
    def perform_create(self, serializer):
        """Set user when creating booking"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['POST'])
    def request_pickup(self, request, pk=None):
        booking = self.get_object()
        
        if booking.status != 'active':
            return Response({'error': 'Only active bookings can request pickup.'}, status=status.HTTP_400_BAD_REQUEST)
            
        return_location = request.data.get('return_location')
        if not return_location:
            return Response({'error': 'Return location is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = 'pickup_requested'
        booking.return_location = return_location
        booking.save()
        
        return Response({'success': True, 'status': booking.status})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    """
    Create a new booking
    """
    from .serializers import BookingCreateSerializer, BookingSerializer
    from .models import Booking, Notification
    
    serializer = BookingCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            booking = serializer.save(user=request.user)
            
            # Create notification for successful booking
            Notification.objects.create(
                user=request.user,
                title='Booking Confirmed',
                message=f'Your booking for {booking.vehicle.name} has been confirmed',
                type='booking',
                is_read=False
            )
            

            # Return booking details
            response_serializer = BookingSerializer(booking)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print("CREATE BOOKING EXCEPTION:", str(e))
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    print("CREATE BOOKING VALIDATION ERRORS:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complaints_view(request):
    """
    POST /api/complaints/
    Body: { "subject": "...", "description": "...", "shop_id": <int> (optional), "booking_id": <int> (optional) }
    Creates a new complaint for the user.
    """
    from .models import Complaint, RentalShop, Booking
    
    subject = request.data.get('subject')
    description = request.data.get('description')
    shop_id = request.data.get('shop_id')
    booking_id = request.data.get('booking_id')
    
    if not subject or not description:
        return Response({'error': 'Subject and description are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    shop = None
    booking = None
    
    if booking_id:
        from django.shortcuts import get_object_or_404
        try:
            booking_id = int(booking_id)
        except ValueError:
            return Response({'error': 'Invalid booking_id format.'}, status=status.HTTP_400_BAD_REQUEST)
        booking = get_object_or_404(Booking, id=booking_id)
        shop = booking.shop
    elif shop_id:
        from django.shortcuts import get_object_or_404
        try:
            shop_id = int(shop_id)
        except ValueError:
            return Response({'error': 'Invalid shop_id format.'}, status=status.HTTP_400_BAD_REQUEST)
        shop = get_object_or_404(RentalShop, id=shop_id)
    else:
        return Response({'error': 'Either shop_id or booking_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
    complaint = Complaint.objects.create(
        user=request.user,
        shop=shop,
        booking=booking,
        subject=subject,
        description=description,
        status='open'
    )
    
    return Response({
        'id': complaint.id,
        'subject': complaint.subject,
        'status': complaint.status,
        'message': 'Complaint submitted successfully'
    }, status=status.HTTP_201_CREATED)


# ── Staff Complaints View (for assigned complaints) ─────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_assigned_complaints_view(request):
    """
    GET /api/staff-complaints/
    Returns all complaints assigned to the currently logged-in staff member.
    """
    from .models import Complaint
    complaints = Complaint.objects.filter(assigned_to=request.user).select_related('user', 'shop', 'booking')
    data = []
    for c in complaints:
        data.append({
            'id': c.id,
            'subject': c.subject,
            'description': c.description,
            'status': c.status,
            'customer_name': c.user.first_name or c.user.username,
            'shop_name': c.shop.name if c.shop else '',
            'booking_id': c.booking.id if c.booking else None,
            'created_at': c.created_at.isoformat(),
        })
    return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def staff_resolve_complaint_view(request, complaint_id):
    """
    PATCH /api/staff-complaints/<complaint_id>/resolve/
    Allows the assigned staff member to mark a complaint as resolved.
    """
    from .models import Complaint
    try:
        complaint = Complaint.objects.get(id=complaint_id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found.'}, status=status.HTTP_404_NOT_FOUND)

    if complaint.assigned_to != request.user:
        return Response({'error': 'You are not assigned to this complaint.'}, status=status.HTTP_403_FORBIDDEN)

    if complaint.status == 'resolved':
        return Response({'error': 'Complaint is already resolved.'}, status=status.HTTP_400_BAD_REQUEST)

    complaint.status = 'resolved'
    complaint.save()

    return Response({
        'id': complaint.id,
        'status': complaint.status,
        'message': 'Complaint marked as resolved.'
    })


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def favorites_view(request):
    """
    GET    /api/favorites/            → list user's favourite shops
    POST   /api/favorites/            → { "shop_id": <int> } toggle favorite
    DELETE /api/favorites/?shop_id=X  → remove a favorite
    """
    from .models import FavoriteShop, RentalShop

    if request.method == 'GET':
        favs = FavoriteShop.objects.filter(user=request.user).select_related('shop')
        data = []
        for fav in favs:
            s = fav.shop
            data.append({
                'id': fav.id,
                'shop_id': s.id,
                'name': s.name,
                'address': s.address,
                'image': s.image,
                'rating': float(s.rating) if s.rating else 0,
                'is_open': s.is_open,
            })
        return Response(data)

    if request.method == 'POST':
        shop_id = request.data.get('shop_id')
        if not shop_id:
            return Response({'error': 'shop_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            shop_id = int(shop_id)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid shop_id.'}, status=status.HTTP_400_BAD_REQUEST)
        from django.shortcuts import get_object_or_404
        shop = get_object_or_404(RentalShop, id=shop_id)
        fav, created = FavoriteShop.objects.get_or_create(user=request.user, shop=shop)
        if not created:
            # Toggle off — already favorited → remove
            fav.delete()
            return Response({'favorited': False})
        return Response({'favorited': True}, status=status.HTTP_201_CREATED)

    if request.method == 'DELETE':
        shop_id = request.query_params.get('shop_id')
        if not shop_id:
            return Response({'error': 'shop_id query param required.'}, status=status.HTTP_400_BAD_REQUEST)
        FavoriteShop.objects.filter(user=request.user, shop_id=shop_id).delete()
        return Response({'favorited': False})


# ── Reviews Views ────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shop_reviews(request, shop_id):
    """
    GET  /api/shops/<shop_id>/reviews/
        Returns all reviews for the shop plus user_has_reviewed flag.

    POST /api/shops/<shop_id>/reviews/
        Body: { "rating": 1-5, "comment": "..." }
        Creates or updates the user's review. One review per user per shop.
    """
    shop = get_object_or_404(RentalShop, id=shop_id)

    if request.method == 'GET':
        reviews = Review.objects.filter(shop=shop).select_related('user')
        user_has_reviewed = reviews.filter(user=request.user).exists()
        user_review = reviews.filter(user=request.user).first()
        return Response({
            'reviews': ReviewSerializer(reviews, many=True).data,
            'user_has_reviewed': user_has_reviewed,
            'user_review': ReviewSerializer(user_review).data if user_review else None,
            'avg_rating': shop.rating,
            'review_count': shop.review_count,
        })

    # POST – upsert
    rating = request.data.get('rating')
    comment = request.data.get('comment', '').strip()
    if not rating:
        return Response({'error': 'Rating is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        rating = int(rating)
        if not (1 <= rating <= 5):
            raise ValueError
    except (ValueError, TypeError):
        return Response({'error': 'Rating must be 1–5.'}, status=status.HTTP_400_BAD_REQUEST)
    if not comment:
        return Response({'error': 'Comment cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

    review, created = Review.objects.update_or_create(
        user=request.user, shop=shop,
        defaults={'rating': rating, 'comment': comment},
    )
    return Response(
        ReviewSerializer(review).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


# ── Profile Views ───────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the current user's profile information.
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """
    Get the current user's booking statistics.
    """
    from django.db.models import Sum, Count, Q
    
    # Get all bookings for the user
    user_bookings = Booking.objects.filter(
        vehicle__shop__conversations__user=request.user
    ).distinct()
    
    # Calculate statistics
    total_bookings = user_bookings.count()
    total_spent = user_bookings.aggregate(
        total=Sum('total_price')
    )['total'] or 0
    
    active_bookings = user_bookings.filter(
        status__in=['active', 'upcoming']
    ).count()
    
    completed_bookings = user_bookings.filter(
        status='completed'
    ).count()
    
    # Count unique shops the user has interacted with (saved places)
    saved_places = Conversation.objects.filter(
        user=request.user
    ).count()
    
    stats_data = {
        'total_bookings': total_bookings,
        'total_spent': total_spent,
        'saved_places': saved_places,
        'active_bookings': active_bookings,
        'completed_bookings': completed_bookings,
    }
    
    serializer = UserStatsSerializer(stats_data)
    return Response(serializer.data)


# ── Profile Management Views ───────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_update(request):
    """
    GET: Get current user profile with extended info
    PUT: Update user profile information
    """
    if request.method == 'GET':
        try:
            user_settings = UserSettings.objects.get_or_create(user=request.user)
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            profile_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'phone': getattr(request.user, 'phone', ''),
                'address': user_profile.address or '',
                'role': user_profile.role,
                'settings': UserSettingsSerializer(user_settings).data,
            }
            return Response(profile_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'PUT':
        try:
            serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings_view(request):
    """
    GET: Get user notification settings
    PUT: Update user notification settings
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserSettingsSerializer(user_settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSettingsSerializer(user_settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def payment_methods_view(request, pk=None):
    """
    GET: List all payment methods for user
    POST: Create new payment method
    PUT: Update payment method
    DELETE: Delete payment method
    """
    if request.method == 'GET':
        payment_methods = PaymentMethod.objects.filter(user=request.user).order_by('-is_default', '-created_at')
        serializer = PaymentMethodSerializer(payment_methods, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PaymentMethodCreateSerializer(data=request.data)
        if serializer.is_valid():
            # If setting as default, unset other defaults
            if serializer.validated_data.get('is_default', False):
                PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
            
            payment_method = serializer.save(user=request.user)
            response_serializer = PaymentMethodSerializer(payment_method)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT' and pk:
        try:
            payment_method = PaymentMethod.objects.get(pk=pk, user=request.user)
            serializer = PaymentMethodCreateSerializer(payment_method, data=request.data, partial=True)
            if serializer.is_valid():
                # If setting as default, unset other defaults
                if serializer.validated_data.get('is_default', False):
                    PaymentMethod.objects.filter(user=request.user, is_default=True).exclude(pk=pk).update(is_default=False)
                
                serializer.save()
                response_serializer = PaymentMethodSerializer(payment_method)
                return Response(response_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Payment method not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE' and pk:
        try:
            payment_method = PaymentMethod.objects.get(pk=pk, user=request.user)
            payment_method.delete()
            return Response({'message': 'Payment method deleted successfully'})
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Payment method not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def saved_locations_view(request, pk=None):
    """
    GET: List all saved locations for user
    POST: Create new saved location
    PUT: Update saved location
    DELETE: Delete saved location
    """
    if request.method == 'GET':
        locations = SavedLocation.objects.filter(user=request.user).order_by('-created_at')
        serializer = SavedLocationSerializer(locations, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SavedLocationSerializer(data=request.data)
        if serializer.is_valid():
            location = serializer.save(user=request.user)
            response_serializer = SavedLocationSerializer(location)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT' and pk:
        try:
            location = SavedLocation.objects.get(pk=pk, user=request.user)
            serializer = SavedLocationSerializer(location, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                response_serializer = SavedLocationSerializer(location)
                return Response(response_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except SavedLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE' and pk:
        try:
            location = SavedLocation.objects.get(pk=pk, user=request.user)
            location.delete()
            return Response({'message': 'Location deleted successfully'})
        except SavedLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def kyc_document_view(request):
    """
    GET: Get KYC document status
    POST: Submit KYC documents
    PUT: Update KYC documents (if not verified)
    """
    try:
        kyc_doc = KYCDocument.objects.get(user=request.user)
    except KYCDocument.DoesNotExist:
        # Create new KYC document if none exists
        kyc_doc = KYCDocument.objects.create(user=request.user)    
    if request.method == 'GET':
        serializer = KYCDocumentSerializer(kyc_doc)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if kyc_doc.status != 'not_submitted':
            return Response({'error': 'KYC already submitted'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCDocumentCreateSerializer(kyc_doc, data=request.data, partial=True)
        if serializer.is_valid():
            kyc_doc = serializer.save(status='pending')
            response_serializer = KYCDocumentSerializer(kyc_doc)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':
        if kyc_doc.status in ['verified', 'rejected']:
            return Response({'error': 'Cannot modify verified/rejected KYC'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCDocumentCreateSerializer(kyc_doc, data=request.data, partial=True)
        if serializer.is_valid():
            kyc_doc = serializer.save(status='pending')
            response_serializer = KYCDocumentSerializer(kyc_doc)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Chat Views ─────────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def conversation_list(request):
    """
    GET  /api/chat/conversations/
        List all conversations for the logged-in user, newest first.

    POST /api/chat/conversations/
        Body: { "shop_id": <int> }
        Get or create the conversation between the user and the shop.
    """
    if request.method == 'GET':
        # Need to capture both user and staff conversations
        try:
            role = getattr(request.user.user_profile, "role", "user")
        except Exception:
            role = 'user'

        if role in ['staff', 'owner']:
            # If shop/staff, load all conversations for their shop or assigned tasks
            # This is simplified: Staff app usually doesn't query the full list, but if they do:
            convs = Conversation.objects.all().prefetch_related('messages')
        else:
            convs = Conversation.objects.filter(user=request.user).prefetch_related('messages')

        serializer = ConversationSerializer(convs, many=True, context={'request': request})
        return Response(serializer.data)

    # POST – get_or_create conversation
    shop_id = request.data.get('shop_id')
    booking_id = request.data.get('booking_id')
    
    if booking_id:
        booking = get_object_or_404(Booking, id=booking_id)
        # If staff is requesting, the conversation is between the booking user and the shop
        conv, _ = Conversation.objects.get_or_create(user=booking.user, shop=booking.shop, booking=booking)
    elif shop_id:
        shop = get_object_or_404(RentalShop, id=shop_id)
        # Regular customer-to-shop chat without booking context
        conv, _ = Conversation.objects.get_or_create(user=request.user, shop=shop, booking=None)
    else:
        return Response({'error': 'shop_id or booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ConversationSerializer(conv, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def message_list(request, conversation_id):
    """
    GET  /api/chat/conversations/<id>/messages/
        Return all messages in the conversation (oldest first).
        Also marks incoming messages as read.

    POST /api/chat/conversations/<id>/messages/
        Body: { "text": "...", "image_url": "..." (optional) }
        Send a new message as the logged-in user (role = 'user').
    """
    conv = get_object_or_404(Conversation, id=conversation_id)

    # Determine sender_role from the user's profile
    try:
        sender_role = getattr(request.user.user_profile, "role", "user")
    except Exception:
        sender_role = 'user'

    if sender_role == 'user' and conv.user != request.user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        # Mark unread messages from the other side as read
        if sender_role in ['staff', 'owner']:
            conv.messages.filter(sender_role='user', is_read=False).update(is_read=True)
        else:
            conv.messages.filter(sender_role__in=['staff', 'owner'], is_read=False).update(is_read=True)

        messages = conv.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    # POST – send message
    text = request.data.get('text', '').strip()
    image_url = request.data.get('image_url', None)

    if not text and not image_url:
        return Response(
            {'error': 'A message must have text or an image_url.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    message = Message.objects.create(
        conversation=conv,
        sender=request.user,
        sender_role=sender_role,
        text=text,
        image_url=image_url,
    )

    # Bump conversation updated_at so list re-sorts correctly
    from django.utils import timezone
    conv.updated_at = timezone.now()
    conv.save(update_fields=['updated_at'])

    serializer = MessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data.copy()
    # Map 'username' (name from frontend) to 'first_name'
    # Map 'email' to 'username' (unique identifier)
    data['first_name'] = data.get('username')
    data['username'] = data.get('email')
    
    # Ensure role is passed correctly
    rule = data.get('role', 'user')
    # The serializer expects 'profile': {'role': ...} structure for nested writes, 
    # OR we can manually handle it. 
    # Since we modified UserSerializer.create to look for profile.role in validated_data 
    # derived from source='profile.role', we need to pass it in a way DRF understands 
    # or just pass it as a separate field if we adjusted the serializer.
    
    # Actually, with source='profile.role', DRF expects the input data to match the structure 
    # unless we define it as a write-only field or handle it in validate/create.
    # Let's simplify: pass 'role' in data, acts as a simple field, serializer handles it.
    
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RentalShopViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rental shops to be viewed or edited.
    Supports filtering by name/address: GET /api/shops/?search=<term>
    """
    queryset = RentalShop.objects.all()
    serializer_class = RentalShopSerializer

    def get_queryset(self):
        queryset = RentalShop.objects.all()
        search = self.request.query_params.get('search', '').strip()
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(address__icontains=search)
            )
        return queryset

class VehicleViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows vehicles to be viewed or edited.
    Supports filtering by shop: /api/vehicles/?shop=<shop_id>
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def get_queryset(self):
        """
        Logic to filter vehicles if needed.
        Currently returns all vehicles for the details page.
        """
        queryset = Vehicle.objects.all()
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            queryset = queryset.filter(shop__id=shop_id)
        return queryset

class BookingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing bookings.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'cancelled':
            return Response({'status': 'already cancelled'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'cancelled'
        booking.save()
        return Response({'status': 'cancelled', 'booking_id': booking.id})


# ── Profile Views ───────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get the current user's profile information.
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """
    Get the current user's booking statistics.
    """
    from django.db.models import Sum, Count, Q
    
    # Get all bookings for the user
    user_bookings = Booking.objects.filter(
        vehicle__shop__conversations__user=request.user
    ).distinct()
    
    # Calculate statistics
    total_bookings = user_bookings.count()
    total_spent = user_bookings.aggregate(
        total=Sum('total_price')
    )['total'] or 0
    
    active_bookings = user_bookings.filter(
        status__in=['active', 'upcoming']
    ).count()
    
    completed_bookings = user_bookings.filter(
        status='completed'
    ).count()
    
    # Count unique shops the user has interacted with (saved places)
    saved_places = Conversation.objects.filter(
        user=request.user
    ).count()
    
    stats_data = {
        'total_bookings': total_bookings,
        'total_spent': total_spent,
        'saved_places': saved_places,
        'active_bookings': active_bookings,
        'completed_bookings': completed_bookings,
    }
    
    serializer = UserStatsSerializer(stats_data)
    return Response(serializer.data)


# ── Profile Management Views ───────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_update(request):
    """
    GET: Get current user profile with extended info
    PUT: Update user profile information
    """
    if request.method == 'GET':
        try:
            user_settings = UserSettings.objects.get_or_create(user=request.user)
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)
            
            profile_data = {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'phone': getattr(request.user, 'phone', ''),
                'address': user_profile.address or '',
                'role': user_profile.role,
                'settings': UserSettingsSerializer(user_settings).data,
            }
            return Response(profile_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'PUT':
        try:
            # Extract address from request data
            address = request.data.get('address')
            
            # Remove address from data since it's not a User field
            update_data = request.data.copy()
            if 'address' in update_data:
                del update_data['address']
            
            serializer = UserProfileUpdateSerializer(request.user, data=update_data, partial=True, context={'address': address})
            if serializer.is_valid():
                updated_user = serializer.save()
                
                # Return updated profile data
                user_profile, created = UserProfile.objects.get_or_create(user=updated_user)
                response_data = {
                    'id': updated_user.id,
                    'username': updated_user.username,
                    'email': updated_user.email,
                    'first_name': updated_user.first_name,
                    'phone': getattr(updated_user, 'phone', ''),
                    'address': user_profile.address or '',
                    'role': user_profile.role,
                }
                    
                return Response(response_data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings_view(request):
    """
    GET: Get user notification settings
    PUT: Update user notification settings
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserSettingsSerializer(user_settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        try:
            # Extract address from request data
            address = request.data.get('address')
            
            # Remove address from data since it's not a User field
            update_data = request.data.copy()
            if 'address' in update_data:
                del update_data['address']
            
            serializer = UserProfileUpdateSerializer(request.user, data=update_data, partial=True, context={'address': address})
            if serializer.is_valid():
                updated_user = serializer.save()
                
                # Return updated profile data
                user_profile, created = UserProfile.objects.get_or_create(user=updated_user)
                response_data = {
                    'id': updated_user.id,
                    'username': updated_user.username,
                    'email': updated_user.email,
                    'first_name': updated_user.first_name,
                    'phone': getattr(updated_user, 'phone', ''),
                    'address': user_profile.address or '',
                    'role': user_profile.role,
                }
                    
                return Response(response_data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def payment_methods_view(request, pk=None):
    """
    GET: List all payment methods for user
    POST: Create new payment method
    PUT: Update payment method
    DELETE: Delete payment method
    """
    if request.method == 'GET':
        payment_methods = PaymentMethod.objects.filter(user=request.user).order_by('-is_default', '-created_at')
        serializer = PaymentMethodSerializer(payment_methods, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PaymentMethodCreateSerializer(data=request.data)
        if serializer.is_valid():
            # If setting as default, unset other defaults
            if serializer.validated_data.get('is_default', False):
                PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
            
            payment_method = serializer.save(user=request.user)
            response_serializer = PaymentMethodSerializer(payment_method)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT' and pk:
        try:
            payment_method = PaymentMethod.objects.get(pk=pk, user=request.user)
            serializer = PaymentMethodCreateSerializer(payment_method, data=request.data, partial=True)
            if serializer.is_valid():
                # If setting as default, unset other defaults
                if serializer.validated_data.get('is_default', False):
                    PaymentMethod.objects.filter(user=request.user, is_default=True).exclude(pk=pk).update(is_default=False)
                
                serializer.save()
                response_serializer = PaymentMethodSerializer(payment_method)
                return Response(response_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Payment method not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE' and pk:
        try:
            payment_method = PaymentMethod.objects.get(pk=pk, user=request.user)
            payment_method.delete()
            return Response({'message': 'Payment method deleted successfully'})
        except PaymentMethod.DoesNotExist:
            return Response({'error': 'Payment method not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def saved_locations_view(request, pk=None):
    """
    GET: List all saved locations for user
    POST: Create new saved location
    PUT: Update saved location
    DELETE: Delete saved location
    """
    if request.method == 'GET':
        locations = SavedLocation.objects.filter(user=request.user).order_by('-created_at')
        serializer = SavedLocationSerializer(locations, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SavedLocationSerializer(data=request.data)
        if serializer.is_valid():
            location = serializer.save(user=request.user)
            response_serializer = SavedLocationSerializer(location)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT' and pk:
        try:
            location = SavedLocation.objects.get(pk=pk, user=request.user)
            serializer = SavedLocationSerializer(location, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                response_serializer = SavedLocationSerializer(location)
                return Response(response_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except SavedLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE' and pk:
        try:
            location = SavedLocation.objects.get(pk=pk, user=request.user)
            location.delete()
            return Response({'message': 'Location deleted successfully'})
        except SavedLocation.DoesNotExist:
            return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    """
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({'error': 'Current password and new password are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Verify current password
    if not request.user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Validate new password
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters long'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Change password
    try:
        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Password changed successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def kyc_document_view(request):
    """
    GET: Get KYC document status
    POST: Submit KYC documents
    PUT: Update KYC documents (if not verified)
    """
    kyc_doc, created = KYCDocument.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = KYCDocumentSerializer(kyc_doc)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if kyc_doc.status != 'not_submitted':
            return Response({'error': 'KYC already submitted'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = KYCDocumentCreateSerializer(kyc_doc, data=request.data, partial=True)
        if serializer.is_valid():
            kyc_doc = serializer.save(status='pending')
            response_serializer = KYCDocumentSerializer(kyc_doc)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PUT':
        try:
            # Extract address from request data
            address = request.data.get('address')
            
            # Remove address from data since it's not a User field
            update_data = request.data.copy()
            if 'address' in update_data:
                del update_data['address']
            
            serializer = UserProfileUpdateSerializer(request.user, data=update_data, partial=True, context={'address': address})
            if serializer.is_valid():
                updated_user = serializer.save()
                
                # Return updated profile data
                user_profile, created = UserProfile.objects.get_or_create(user=updated_user)
                response_data = {
                    'id': updated_user.id,
                    'username': updated_user.username,
                    'email': updated_user.email,
                    'first_name': updated_user.first_name,
                    'phone': getattr(updated_user, 'phone', ''),
                    'address': user_profile.address or '',
                    'role': user_profile.role,
                }
                    
                return Response(response_data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """Get user notifications"""
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """Delete notification"""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.delete()
        return Response({'message': 'Notification deleted successfully'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """Create new notification (for system use)"""
    title = request.data.get('title')
    message = request.data.get('message')
    notification_type = request.data.get('type', 'system')
    
    if title and message:
        notification = Notification.objects.create(
            user=request.user,
            title=title,
            message=message,
            type=notification_type,
            is_read=False
        )
        return Response({'id': notification.id, 'message': 'Notification created'}, status=status.HTTP_201_CREATED)
    
    return Response({'error': 'Title and message are required'}, status=status.HTTP_400_BAD_REQUEST)
