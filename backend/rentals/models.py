from django.db import models
from django.contrib.auth.models import User

class RentalShop(models.Model):
    owner = models.ForeignKey('UserProfile', on_delete=models.CASCADE, related_name='shops', null=True, blank=True)
    name = models.CharField(max_length=255)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    image = models.ImageField(upload_to='owner_img/', blank=True, null=True)
    rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    operating_hours = models.CharField(max_length=100, blank=True, null=True)
    is_open = models.BooleanField(default=True)

    class Meta:
        db_table = 'rental_shop'

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ('car', 'Car'),
        ('bike', 'Bike'),
    ]

    FUEL_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
    ]

    TRANSMISSION_CHOICES = [
        ('auto', 'Automatic'),
        ('manual', 'Manual'),
    ]

    SEATING_CHOICES = [
        (5, '5 Seater'),
        (7, '7 Seater'),
    ]
    
    shop = models.ForeignKey(RentalShop, related_name='vehicles', on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=VEHICLE_TYPES)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    number = models.CharField(max_length=50) # Registration number
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2)
    fuel_type = models.CharField(max_length=10, choices=FUEL_CHOICES)
    transmission = models.CharField(max_length=10, choices=TRANSMISSION_CHOICES)
    seating = models.IntegerField(choices=SEATING_CHOICES, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        db_table = 'vehicle'

    @property
    def images(self):
        return [img.image.url for img in self.image_set.all() if img.image]

    @property
    def features(self):
        return [feat.feature_name for feat in self.feature_set.all()]

    def __str__(self):
        return f"{self.brand} {self.model} ({self.number})"

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='image_set', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='vehicles_img/')

    class Meta:
        db_table = 'vehicle_image'

    def __str__(self):
        return f"Image for {self.vehicle.brand} {self.vehicle.model}"

class VehicleFeature(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='feature_set', on_delete=models.CASCADE)
    feature_name = models.CharField(max_length=255)

    class Meta:
        db_table = 'vehicle_feature'

    def __str__(self):
        return self.feature_name

class Booking(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('upcoming', 'Upcoming'),
        ('pickup_requested', 'Pickup Requested'),
    ]
    
    BOOKING_TYPES = [
        ('hour', 'Hourly'),
        ('day', 'Daily'),
    ]
    
    DELIVERY_OPTIONS = [
        ('pickup', 'Self Pickup'),
        ('delivery', 'Home Delivery'),
    ]
    
    PAYMENT_METHODS = [
        ('card', 'Credit/Debit Card'),
        ('upi', 'UPI Payment'),
        ('wallet', 'Digital Wallet'),
    ]

    user = models.ForeignKey(User, related_name='bookings', on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, related_name='bookings', on_delete=models.CASCADE)
    shop = models.ForeignKey(RentalShop, related_name='bookings', on_delete=models.CASCADE)
    
    # Booking details
    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPES, default='hour')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    duration = models.IntegerField(help_text="Duration in hours or days")
    
    # Pricing
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=10, decimal_places=2, default=5)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Delivery details
    delivery_option = models.CharField(max_length=10, choices=DELIVERY_OPTIONS, default='pickup')
    delivery_address = models.TextField(blank=True, null=True)
    return_location = models.TextField(blank=True, null=True)
    
    # Payment details
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    payment_status = models.CharField(max_length=20, default='pending')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'booking'
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} - {self.vehicle.name} ({self.user.username})"

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    push_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    booking_updates = models.BooleanField(default=True)
    payment_alerts = models.BooleanField(default=True)
    promotions = models.BooleanField(default=True)
    reminders = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_settings'

    def __str__(self):
        return f"{self.user.username}'s settings"

class PaymentMethod(models.Model):
    PAYMENT_TYPES = [
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    type = models.CharField(max_length=10, choices=PAYMENT_TYPES)
    name = models.CharField(max_length=255)
    details = models.CharField(max_length=255)
    card_number = models.CharField(max_length=20, blank=True, null=True)
    card_holder = models.CharField(max_length=255, blank=True, null=True)
    expiry_date = models.CharField(max_length=10, blank=True, null=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_method'

    def __str__(self):
        return f"{self.name} - {self.user.username}"

class SavedLocation(models.Model):
    LOCATION_TYPES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('favorite', 'Favorite'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_locations')
    name = models.CharField(max_length=255)
    address = models.TextField()
    type = models.CharField(max_length=10, choices=LOCATION_TYPES)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_location'

    def __str__(self):
        return f"{self.name} - {self.user.username}"

class KYCDocument(models.Model):
    KYC_STATUS = [
        ('not_submitted', 'Not Submitted'),
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    DOC_TYPES = [
        ('aadhar', 'Aadhar Card'),
        ('voter', 'Voter ID'),
        ('passport', 'Passport'),
        ('pan', 'PAN Card'),
        ('national_id', 'National ID'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc_document')
    date_of_birth = models.DateField(null=True, blank=True)
    driving_license_number = models.CharField(max_length=50, blank=True, null=True)
    driving_license_photo = models.FileField(upload_to='kyc/driving_license/', blank=True, null=True)
    secondary_doc_type = models.CharField(max_length=20, choices=DOC_TYPES, blank=True, null=True)
    secondary_doc_number = models.CharField(max_length=50, blank=True, null=True)
    secondary_doc_photo = models.FileField(upload_to='kyc/secondary_doc/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=KYC_STATUS, default='not_submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='kyc_reviews'
    )

    class Meta:
        db_table = 'kyc_document'

    @property
    def full_name(self):
        name = self.user.get_full_name()
        return name if name else self.user.username

    @property
    def email(self):
        return self.user.email

    @property
    def phone(self):
        return self.user.user_profile.phone if hasattr(self.user, 'user_profile') else ''

    @property
    def address(self):
        return self.user.user_profile.address if hasattr(self.user, 'user_profile') else ''

    def __str__(self):
        return f"KYC - {self.user.username}"


# ── Chat ──────────────────────────────────────────────────────────────────────

class Conversation(models.Model):
    """A conversation between a customer and a RentalShop, OR tied to a specific Booking."""
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='conversations'
    )
    shop = models.ForeignKey(
        RentalShop, on_delete=models.CASCADE, related_name='conversations'
    )
    booking = models.ForeignKey(
        'Booking', on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'conversation'
        ordering = ['-updated_at']

    def __str__(self):
        if self.booking:
            return f"Conv #{self.id}: {self.user.username} ↔ Booking #{self.booking.id}"
        return f"Conv #{self.id}: {self.user.username} ↔ {self.shop.name}"

    @property
    def unread_count(self):
        """Messages from others that the user has not read."""
        return self.messages.filter(
            sender_role__in=['staff', 'owner'], is_read=False
        ).count()

    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()


class Message(models.Model):
    """A single message inside a Conversation."""
    SENDER_ROLES = [
        ('user', 'User'),
        ('staff', 'Staff'),
        ('owner', 'Owner'),
    ]

    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_messages'
    )
    sender_role = models.CharField(max_length=10, choices=SENDER_ROLES, default='user')
    text = models.TextField(blank=True, default='')
    image_url = models.URLField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message'
        ordering = ['created_at']

    def __str__(self):
        return f"Msg #{self.id} [{self.sender_role}]: {self.text[:40]}"


class UserProfile(models.Model):
    """Extended user profile information"""
    ROLE_CHOICES = [
        ('user', 'User'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
        ('owner', 'Owner'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='user_img/', blank=True, null=True)
    
    class Meta:
        db_table = 'user_profile'

    def __str__(self):
        return f"{self.user.username} - {self.role}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'user_profile'):
        instance.user_profile.save()

@receiver(post_save, sender='rentals.Booking')
def update_vehicle_availability(sender, instance, **kwargs):
    """
    Automatically manage vehicle availability based on booking status.
    - upcoming / active / pickup_requested  → unavailable
    - completed / cancelled                 → available again
    """
    vehicle = instance.vehicle
    if instance.status in ('upcoming', 'active', 'pickup_requested'):
        new_value = False
    elif instance.status in ('completed', 'cancelled'):
        new_value = True
    else:
        return  # Unknown status — do nothing

    if vehicle.is_available != new_value:
        vehicle.is_available = new_value
        vehicle.save(update_fields=['is_available'])


class Review(models.Model):
    """Customer review for the rental shop, with optional owner reply."""
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_reviews')
    shop = models.ForeignKey(RentalShop, on_delete=models.CASCADE, related_name='shop_reviews')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    owner_reply = models.TextField(blank=True, null=True)
    replied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'review'
        ordering = ['-created_at']
        unique_together = ('user', 'shop')

    def __str__(self):
        return f"Review by {self.user.username} — {self.rating}★"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate shop rating and review_count after every save
        from django.db.models import Avg
        shop = self.shop
        agg = Review.objects.filter(shop=shop).aggregate(avg=Avg('rating'))
        shop.rating = round(agg['avg'] or 0, 1)
        shop.review_count = Review.objects.filter(shop=shop).count()
        shop.save(update_fields=['rating', 'review_count'])


class Complaint(models.Model):
    """User complaint that can be assigned to a staff member by the owner."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('resolved', 'Resolved'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_complaints')
    shop = models.ForeignKey(RentalShop, on_delete=models.CASCADE, related_name='shop_complaints')
    booking = models.ForeignKey('Booking', on_delete=models.SET_NULL, null=True, blank=True, related_name='booking_complaints')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'complaint'
        ordering = ['-created_at']

    def __str__(self):
        return f"Complaint #{self.id} by {self.user.username} — {self.status}"


class FavoriteShop(models.Model):
    """A user's saved/favourite rental shop."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_shops')
    shop = models.ForeignKey('RentalShop', on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorite_shop'
        unique_together = ('user', 'shop')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ♥ {self.shop.name}"


class Notification(models.Model):
    """User notifications for mobile app"""
    NOTIFICATION_TYPES = [
        ('booking', 'Booking'),
        ('payment', 'Payment'), 
        ('promo', 'Promotion'),
        ('alert', 'Alert'),
        ('success', 'Success'),
        ('system', 'System'),
    ]
    
    type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='system'
    )
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification'
        app_label = 'rentals'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class OwnerRegistrationRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    owner_name = models.CharField(max_length=255)
    shop_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    password_hash = models.CharField(max_length=128) # Store hashed password
    certificate_id = models.CharField(max_length=100, blank=True, null=True)
    certificate_file = models.FileField(upload_to='owner_certificates/', blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'owner_registration_request'

    def __str__(self):
        return f"{self.shop_name} - {self.owner_name} ({self.status})"

