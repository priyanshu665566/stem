from rest_framework.decorators import api_view, permission_classes, authentication_classes # pyright: ignore[reportMissingImports]
from rest_framework.permissions import IsAuthenticated, AllowAny # pyright: ignore[reportMissingImports]
from rest_framework.response import Response # pyright: ignore[reportMissingImports]
from rest_framework import status # pyright: ignore[reportMissingImports]
from rest_framework_simplejwt.authentication import JWTAuthentication # type: ignore
from .models import User, PasswordResetToken
from .utils import generate_password, is_valid_email
from django.core.mail import send_mail # pyright: ignore[reportMissingModuleSource]
from rest_framework_simplejwt.tokens import RefreshToken # pyright: ignore[reportMissingImports]
from django.contrib.auth import authenticate # pyright: ignore[reportMissingModuleSource]
from django.conf import settings # pyright: ignore[reportMissingModuleSource]
from django.db.models import Q
from django.db.models import F


def serializer_context(request):
    return {'request': request}


@api_view(['POST'])
def register(request):
    email = request.data.get('email')

    if not email:
        return Response({'error': 'Email is required'}, status= status.HTTP_400_BAD_REQUEST)
    
    if not is_valid_email(email):
        return Response({'error': 'Invalid email format.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'error':'User exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    password = generate_password()

    user = User.objects.create_user(email=email, password=password)

    try:
        send_mail(
            'Your CMS Password',
            f'Your password is: {password}',
            settings.EMAIL_HOST_USER,
            [email],
        )
    except Exception:
        user.delete()
        return Response({'error':'Email failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'Password sent to email'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(email=email, password=password)

    if not user:
        return Response({'error' : 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
    ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
    ActivityLog.objects.create(user=user, action='login', detail='User Successfully Logged In', ip_address=ip or None)

    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'role': user.role, # pyright: ignore[reportAttributeAccessIssue]
        'user_id': user.id, # pyright: ignore[reportAttributeAccessIssue]
        'name': user.name, # pyright: ignore[reportAttributeAccessIssue]
    })

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')

    if not email:
        return Response({'error':'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not User.objects.filter(email=email).exists():
        return Response({'message':'If this email is registered you will recieve a reset link'}, status=status.HTTP_200_OK)
    
    user = User.objects.get(email=email)
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()

    token = PasswordResetToken.objects.create(user=user)
    reset_link = f"http://localhost:5173/reset-password?token={token.token}"

    try:
        send_mail(
            'Reset Your CMS Password',
            f'Click the link to reset your password:\n\n{reset_link}\n\nThis link expires in 1 hour.',
            settings.EMAIL_HOST_USER,
            [email],
        )
    except Exception:
        return Response({'error': 'Email failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({'message': 'If this email is registered you will receive a reset link'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def reset_password(request):
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not token or not new_password or not confirm_password:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
    elif len(new_password) > 30:
        return Response({'error': 'Password cannot exceed 30 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
    except PasswordResetToken.DoesNotExist:
         return Response({'error': 'Invalid or expired link'}, status=status.HTTP_400_BAD_REQUEST)
    
    if reset_token.is_expired():
        reset_token.delete()
        return Response({'error': 'Link has expired, please request a new one'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = reset_token.user 
    user.set_password(new_password)
    user.save()

    reset_token.is_used = True
    reset_token.save()

    return Response({'message':'Password reset successfully'},status=status.HTTP_200_OK)

from .models import User, ActivityLog
from .serializers import UserSerializer, UserProfileSerializer, ActivityLogSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def get_profile(request):
    serializer = UserProfileSerializer(request.user, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def update_profile(request):
    user = request.user
    if 'name' in request.data:
        user.name = request.data.get('name', '') or ''
    if 'contact_no' in request.data:
        user.contact_no = request.data.get('contact_no', '') or ''
    user.save()
    serializer = UserProfileSerializer(user, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def change_password(request):
    new_password = request.data.get('newPassword')

    if not new_password:
        return Response({'error': 'New password is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) > 30:
        return Response({'error': 'Password cannot exceed 30 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def upload_avatar(request):
    file = request.FILES.get('avatar')
    if not file:
        return Response({'error': 'No avatar file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    user.avatar_original = file
    user.save()

    # Build URLs for the variants
    avatar_variants = {
        'original': request.build_absolute_uri(user.avatar_original.url) if user.avatar_original else None,
        'webp': request.build_absolute_uri(user.avatar_webp.url) if user.avatar_webp else None,
        'avif': request.build_absolute_uri(user.avatar_avif.url) if user.avatar_avif else None,
    }
    
    return Response({
        'message': 'Avatar uploaded successfully.',
        'avatar': avatar_variants
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_users(request):
    users = User.objects.filter(is_active=True).order_by('-id')
    serializer = UserSerializer(users, many=True, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = User.objects.order_by('-id')
    serializer = UserSerializer(users, many=True, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_user(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    contact_no = request.data.get('contact_no', '').strip()
    role = request.data.get('role', '').strip()
    avatar = request.FILES.get('avatar')

    if not name or not email or not role:
        return Response({'error': 'Name, email, and role are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not is_valid_email(email):
        return Response({'error': 'Invalid email format.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error':'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    if role not in dict(User.ROLE_CHOICES):
        return Response({'error': 'Invalid role selected.'}, status=status.HTTP_400_BAD_REQUEST)

    password = generate_password()
    user = User.objects.create_user(
        email=email,
        password=password,
        name=name,
        contact_no=contact_no,
        role=role,
        is_staff=(role == 'ccg-admin')
    )

    if avatar:
        user.avatar_original = avatar
        user.save()

    try:
        send_mail(
            'Your CMS Account is Ready',
            f'Hello {name},\n\nYour account has been created. Your login details are below:\n\nEmail: {email}\nPassword: {password}\n\nPlease keep this information secure.',
            settings.EMAIL_HOST_USER,
            [email],
        )
    except Exception:
        user.delete()
        return Response({'error':'Email failed to send.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = UserSerializer(user, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    if 'email' in data:
        email = data.get('email', '').strip()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not is_valid_email(email):
            return Response({'error': 'Invalid email format.'}, status=status.HTTP_400_BAD_REQUEST)
        if email != user.email and User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = email

    if 'name' in data:
        user.name = data.get('name', '').strip()

    if 'contact_no' in data:
        user.contact_no = data.get('contact_no', '').strip()

    if 'role' in data:
        role = data.get('role', '').strip()
        if role not in dict(User.ROLE_CHOICES):
            return Response({'error': 'Invalid role selected.'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = role
        user.is_staff = (role == 'ccg-admin')

    if 'is_active' in data:
        is_active = str(data.get('is_active')).lower() == 'true'
        user.is_active = is_active

    if 'password' in data and data.get('password'):
        user.set_password(data.get('password'))

    avatar = request.FILES.get('avatar')
    if avatar:
        user.avatar = avatar

    user.save()
    serializer = UserSerializer(user, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Activity Log views
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_activity_logs(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    logs = ActivityLog.objects.filter(user=user).order_by('-timestamp')
    serializer = ActivityLogSerializer(logs, many=True, context=serializer_context(request))
    return Response(serializer.data, status=status.HTTP_200_OK)

# ──────────────────────────────────────────────────────────────
# THUMBNAIL ASSET ENDPOINTS
# ──────────────────────────────────────────────────────────────

from .models import ThumbnailAsset
from .serializers import ThumbnailAssetSerializer

@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def get_all_thumbnails(request):
    """Get all thumbnails with pagination support"""
    thumbnails = ThumbnailAsset.objects.all().order_by('sort_order', '-created_at')
    
    # Optional pagination
    page = request.query_params.get('page', 1)
    per_page = request.query_params.get('per_page', 12)
    
    try:
        page = int(page)
        per_page = int(per_page)
    except (ValueError, TypeError):
        page = 1
        per_page = 12
    
    start = (page - 1) * per_page
    end = start + per_page
    
    total = thumbnails.count()
    paginated = thumbnails[start:end]
    
    serializer = ThumbnailAssetSerializer(paginated, many=True, context=serializer_context(request))
    return Response({
        'data': serializer.data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def get_featured_thumbnails(request):
    """Get only 4 featured thumbnails"""
    thumbnails = ThumbnailAsset.objects.filter(is_featured=True).order_by('sort_order')[:4]
    serializer = ThumbnailAssetSerializer(thumbnails, many=True, context=serializer_context(request))
    return Response({'data': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_thumbnail(request):
    """Upload new thumbnail image"""
    serializer = ThumbnailAssetSerializer(data=request.data, context=serializer_context(request))
    if serializer.is_valid():
        thumbnail = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_thumbnail(request, thumbnail_id):
    """
    Delete thumbnail from database
    Image variants are cleaned up in model's delete() method
    """

    try:
        thumbnail = ThumbnailAsset.objects.get(id=thumbnail_id)

        # Delete thumbnail (image variants are cleaned up in model's delete() method)
        thumbnail.delete()

        return Response(
            {
                "message": "Thumbnail deleted successfully"
            },
            status=status.HTTP_200_OK
        )

    except ThumbnailAsset.DoesNotExist:
        return Response(
            {
                "error": "Thumbnail not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return Response(
            {
                "error": str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def toggle_featured_thumbnail(request, thumbnail_id):
    """Toggle featured status of thumbnail (max 4 featured)"""
    try:
        thumbnail = ThumbnailAsset.objects.get(id=thumbnail_id)
        
        # If marking as featured, enforce limit
        if not thumbnail.is_featured:
            featured_count = ThumbnailAsset.get_featured_count()
            if featured_count >= 4:
                return Response(
                    {'error': 'Maximum 4 featured thumbnails allowed. Unmark others first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        thumbnail.is_featured = not thumbnail.is_featured
        thumbnail.save(update_fields=['is_featured'])
        
        serializer = ThumbnailAssetSerializer(thumbnail, context=serializer_context(request))
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except ThumbnailAsset.DoesNotExist:
        return Response(
            {'error': 'Thumbnail not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_thumbnail(request, thumbnail_id):
    """Update thumbnail details (title, sort_order, etc.)"""
    try:
        thumbnail = ThumbnailAsset.objects.get(id=thumbnail_id)
        serializer = ThumbnailAssetSerializer(thumbnail, data=request.data, partial=True, context=serializer_context(request))
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except ThumbnailAsset.DoesNotExist:
        return Response(
            {'error': 'Thumbnail not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def increment_usage_count(request, thumbnail_id):
    """Increment usage count when thumbnail is used"""
    try:
        ThumbnailAsset.objects.filter(id=thumbnail_id).update(usage_count=F('usage_count') + 1)
        thumbnail = ThumbnailAsset.objects.get(id=thumbnail_id)
        
        serializer = ThumbnailAssetSerializer(thumbnail, context=serializer_context(request))
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except ThumbnailAsset.DoesNotExist:
        return Response(
            {'error': 'Thumbnail not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
