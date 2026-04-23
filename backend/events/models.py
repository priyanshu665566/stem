from django.db import models

from api.models import User
from rooms.models import Room

# Create your models here.
class Event(models.Model):
    event_name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='events')
    start_date = models.DateField()
    start_time = models.TimeField()
    end_date = models.DateField()
    end_time = models.TimeField()
    event_state = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('published', 'Published'),
    ], default='draft')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_events')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.event_name
