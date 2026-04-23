from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.room_name', read_only=True)
    room_owner = serializers.SerializerMethodField(read_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__' 
    
    def get_room_owner(self, obj):
        if obj.room.added_by:
            return obj.room.added_by.email
        if obj.room.city and obj.room.city.content_creator_id:
            return obj.room.city.content_creator_id.email
        return "No Manager"