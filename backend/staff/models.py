from django.db import models
from django.contrib.auth.models import User
from rentals.models import Vehicle, Booking

class StaffTask(models.Model):
    TASK_TYPES = [
        ('delivery', 'Delivery'),
        ('pickup', 'Pickup'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_tasks')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='staff_tasks')
    type = models.CharField(max_length=20, choices=TASK_TYPES)
    
    # Store directly, or we can fetch through booking.
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'staff_task'

    def __str__(self):
        return f"Task #{self.id} - {self.type} - {self.staff.username}"


