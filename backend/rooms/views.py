
from django.shortcuts import render
from django.db.models import Q
from cities.models import City
from rooms.models import Room
from rooms.serializers import RoomSerializer
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_room(request):
    serializer = RoomSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(added_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_rooms(request):
    rooms = Room.objects.all().order_by('-created_at')
    serializer = RoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
        serializer = RoomSerializer(room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = RoomSerializer(room, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def request_review_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
        room.status = 'in_review'
        room.save()
        return Response({'message': 'Review requested', 'status': room.status}, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def publish_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
        room.status = 'published'
        room.save()
        return Response({'message': 'Room published', 'status': room.status}, status=status.HTTP_200_OK)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    try:
        room = Room.objects.get(id=room_id)

        # Delete room (image variants are cleaned up in model's delete() method)
        room.delete()

        return Response(
            {
                "message": "Room deleted successfully"
            },
            status=status.HTTP_200_OK
        )

    except Room.DoesNotExist:
        return Response(
            {"error": "Room not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_my_rooms(request):
    """
    Returns rooms for content-creator using 3 conditions:
    1. room.added_by == me AND room.city in my managed cities
    2. room.added_by is admin AND room.city in my managed cities
    3. room.added_by == me (any city)
    """
    managed_city_ids = City.objects.filter(city_manager=request.user).values_list('id', flat=True)
    rooms = Room.objects.filter(
        Q(added_by=request.user, city_id__in=managed_city_ids) |
        Q(added_by__role='ccg-admin', city_id__in=managed_city_ids) |
        Q(added_by=request.user)
    ).distinct().order_by('-created_at')
    serializer = RoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_allowed_rooms(request):
    """
    Same queryset as my-rooms - used for room dropdown when content-creator adds/edits an event
    """
    managed_city_ids = City.objects.filter(city_manager=request.user).values_list('id', flat=True)
    rooms = Room.objects.filter(
        Q(added_by=request.user, city_id__in=managed_city_ids) |
        Q(added_by__role='ccg-admin', city_id__in=managed_city_ids) |
        Q(added_by=request.user)
    ).distinct().order_by('-created_at')
    serializer = RoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)