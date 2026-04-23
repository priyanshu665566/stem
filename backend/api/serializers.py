from rest_framework import serializers
from .models import User, ActivityLog, ThumbnailAsset


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'contact_no', 'role', 'role_display', 'is_active', 'avatar']

    def get_avatar(self, obj):
        """Return avatar in original, webp, and avif formats"""
        if not obj.avatar_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        base_url = request.build_absolute_uri('/') if request else ''
        
        return {
            'original': request.build_absolute_uri(obj.avatar_original.url) if request and obj.avatar_original else None,
            'webp': request.build_absolute_uri(obj.avatar_webp.url) if request and obj.avatar_webp else None,
            'avif': request.build_absolute_uri(obj.avatar_avif.url) if request and obj.avatar_avif else None,
        }


class UserProfileSerializer(serializers.ModelSerializer):
    designation = serializers.SerializerMethodField(read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'contact_no', 'designation', 'avatar']

    def get_designation(self, obj):
        return obj.get_role_display()

    def get_avatar(self, obj):
        """Return avatar in original, webp, and avif formats"""
        if not obj.avatar_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.avatar_original.url) if request and obj.avatar_original else None,
            'webp': request.build_absolute_uri(obj.avatar_webp.url) if request and obj.avatar_webp else None,
            'avif': request.build_absolute_uri(obj.avatar_avif.url) if request and obj.avatar_avif else None,
        }


class ActivityLogSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'email', 'action', 'detail', 'timestamp']


class ThumbnailAssetSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)
    image_original = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = ThumbnailAsset
        fields = ['id', 'image', 'image_original', 'title', 'is_featured', 'sort_order', 'usage_count', 'created_at', 'updated_at']

    def get_image(self, obj):
        """Return image in original, webp, and avif formats"""
        if not obj.image_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.image_original.url) if request and obj.image_original else None,
            'webp': request.build_absolute_uri(obj.image_webp.url) if request and obj.image_webp else None,
            'avif': request.build_absolute_uri(obj.image_avif.url) if request and obj.image_avif else None,
        }
