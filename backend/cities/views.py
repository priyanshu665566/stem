from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from .models import City
from .serializers import CitySerializer

# Create your views here.
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_city(request):
    serializer = CitySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def get_cities(request):
    if request.user and request.user.is_authenticated:
        cities = City.objects.all().order_by('-created_at')
    else:
        cities = City.objects.filter(status='published').order_by('-created_at')
    serializer = CitySerializer(cities, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def get_city_by_slug(request, slug):
    try:
        city = City.objects.get(slug=slug)
        if not (request.user and request.user.is_authenticated) and city.status != 'published':
            return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CitySerializer(city, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_city(request, city_id):
    try:
        city = City.objects.get(id=city_id)

        # Delete city (image variants are cleaned up in model's delete() method)
        city.delete()

        return Response(
            {
                "message": "City deleted successfully"
            },
            status=status.HTTP_200_OK
        )

    except City.DoesNotExist:
        return Response(
            {"error": "City not found"},
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
def get_city(request, city_id):
    try:
        city = City.objects.get(id=city_id)
        serializer = CitySerializer(city, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_city(request, city_id):
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
        
    # React passes 'is_active' as string 'true' or 'false' in FormData sometimes
    data = request.data.copy()
    if 'is_active' in data:
        data['is_active'] = str(data['is_active']).lower() == 'true'

    serializer = CitySerializer(city, data=data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def request_review_city(request, city_id):
    try:
        city = City.objects.get(id=city_id)
        city.status = 'in_review'
        city.save()
        return Response({'message': 'Review requested', 'status': city.status}, status=status.HTTP_200_OK)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def publish_city(request, city_id):
    try:
        city = City.objects.get(id=city_id)
        city.status = 'published'
        city.save()
        return Response({'message': 'City published', 'status': city.status}, status=status.HTTP_200_OK)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_my_cities(request):
    """Returns only cities where city_manager == request.user"""
    cities = City.objects.filter(city_manager=request.user).order_by('-created_at')
    serializer = CitySerializer(cities, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def manage_city_logo(request, city_id):
    """Upload or delete city logo"""
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        # Upload logo
        if 'logo_original' not in request.FILES:
            return Response({'error': 'No logo file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        city.logo_original = request.FILES['logo_original']
        city.save()
        serializer = CitySerializer(city, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        # Delete logo
        from api.image_processor import delete_image_variants
        delete_image_variants(city.logo_original)
        delete_image_variants(city.logo_webp)
        delete_image_variants(city.logo_avif)
        city.logo_original = None
        city.logo_webp = None
        city.logo_avif = None
        city.save()
        return Response({'message': 'Logo deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_city_rooms(request, city_id):
    """Fetch all rooms belonging to a city"""
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
    
    from rooms.models import Room
    from rooms.serializers import RoomSerializer
    
    rooms = city.rooms.all().order_by('-created_at')
    serializer = RoomSerializer(rooms, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_city_navbar_slots(request, city_id):
    """Update navbar slots (room assignments) for a city"""
    try:
        city = City.objects.get(id=city_id)
    except City.DoesNotExist:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
    
    navbar_slots = request.data.get('navbar_slots', {})
    city.navbar_slots = navbar_slots
    city.save()
    serializer = CitySerializer(city, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)