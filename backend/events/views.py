from django.shortcuts import render
from cities.models import City
from rooms.models import Room
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status   
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Event       
from .serializers import EventSerializer
from django.db.models import Q
# Create your views here.
# Event views
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_event(request):
    serializer = EventSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_events(request):
    events = Event.objects.all().order_by('-created_at')
    serializer = EventSerializer(events, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = EventSerializer(event, data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(EventSerializer(serializer.instance, context={'request': request}).data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        event.delete()
        return Response({'message': 'Event deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def publish_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
        event.event_state = 'published'
        event.save()
        serializer = EventSerializer(event, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_my_events(request):
    """
    Returns events where event.room is in the same room queryset as my-rooms
    """
    managed_city_ids = City.objects.filter(city_manager=request.user).values_list('id', flat=True)
    allowed_rooms = Room.objects.filter(
        Q(added_by=request.user, city_id__in=managed_city_ids) |
        Q(added_by__role='ccg-admin', city_id__in=managed_city_ids) |
        Q(added_by=request.user)
    ).values_list('id', flat=True)
    events = Event.objects.filter(room_id__in=allowed_rooms).order_by('-created_at')
    serializer = EventSerializer(events, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_events(request):
    """Returns only events where event.created_by == request.user"""
    events = Event.objects.filter(created_by=request.user).order_by('-created_at')
    serializer = EventSerializer(events, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)