from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    added_by_name = serializers.SerializerMethodField(read_only=True)
    thumbnail = serializers.SerializerMethodField(read_only=True)
    flyin_graphic = serializers.SerializerMethodField(read_only=True)
    loop_graphic = serializers.SerializerMethodField(read_only=True)
    support_audio_url = serializers.SerializerMethodField(read_only=True)
    thumbnail_original = serializers.ImageField(write_only=True, required=False, allow_null=True)
    flyin_graphic_original = serializers.ImageField(write_only=True, required=False, allow_null=True)
    loop_graphic_original = serializers.ImageField(write_only=True, required=False, allow_null=True)
    support_audio = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Room
        fields = [
            'id', 'city', 'city_name', 'room_name', 'description', 'assistant', 'meeting_url',
            'status', 'added_by', 'added_by_name', 'thumbnail', 'flyin_graphic', 'loop_graphic',
            'support_audio_url', 'thumbnail_original', 'flyin_graphic_original',
            'loop_graphic_original', 'support_audio', 'created_at'
        ]

    def get_added_by_name(self, obj):
        if obj.added_by:
            return obj.added_by.email
        if obj.city and obj.city.content_creator_id:
            return obj.city.content_creator_id.email
        return "No Manager"

    def get_thumbnail(self, obj): # type: ignore
        """Return thumbnail in original, webp, and avif formats"""
        if not obj.thumbnail_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.thumbnail_original.url) if request and obj.thumbnail_original else None,
            'webp': request.build_absolute_uri(obj.thumbnail_webp.url) if request and obj.thumbnail_webp else None,
            'avif': request.build_absolute_uri(obj.thumbnail_avif.url) if request and obj.thumbnail_avif else None,
        }

    def get_flyin_graphic(self, obj): # type: ignore
        """Return flyin_graphic in original, webp, and avif formats"""
        if not obj.flyin_graphic_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.flyin_graphic_original.url) if request and obj.flyin_graphic_original else None,
            'webp': request.build_absolute_uri(obj.flyin_graphic_webp.url) if request and obj.flyin_graphic_webp else None,
            'avif': request.build_absolute_uri(obj.flyin_graphic_avif.url) if request and obj.flyin_graphic_avif else None,
        }

    def get_loop_graphic(self, obj): # type: ignore
        """Return loop_graphic in original, webp, and avif formats"""
        if not obj.loop_graphic_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.loop_graphic_original.url) if request and obj.loop_graphic_original else None,
            'webp': request.build_absolute_uri(obj.loop_graphic_webp.url) if request and obj.loop_graphic_webp else None,
            'avif': request.build_absolute_uri(obj.loop_graphic_avif.url) if request and obj.loop_graphic_avif else None,
        }

    def get_support_audio_url(self, obj): # type: ignore
        """Return support_audio URL"""
        if obj.support_audio:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.support_audio.url)
            return obj.support_audio.url
        return None

    def get_thumbnail(self, obj):
        """Return thumbnail in original, webp, and avif formats"""
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.thumbnail_original.url) if request and obj.thumbnail_original else None,
            'webp': request.build_absolute_uri(obj.thumbnail_webp.url) if request and obj.thumbnail_webp else None,
            'avif': request.build_absolute_uri(obj.thumbnail_avif.url) if request and obj.thumbnail_avif else None,
        }

    def get_flyin_graphic(self, obj):
        """Return flyin_graphic in original, webp, and avif formats"""
        if not obj.flyin_graphic_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.flyin_graphic_original.url) if request and obj.flyin_graphic_original else None,
            'webp': request.build_absolute_uri(obj.flyin_graphic_webp.url) if request and obj.flyin_graphic_webp else None,
            'avif': request.build_absolute_uri(obj.flyin_graphic_avif.url) if request and obj.flyin_graphic_avif else None,
        }

    def get_loop_graphic(self, obj):
        """Return loop_graphic in original, webp, and avif formats"""
        if not obj.loop_graphic_original:
            return {
                'original': None,
                'webp': None,
                'avif': None,
            }
        
        request = self.context.get('request')
        
        return {
            'original': request.build_absolute_uri(obj.loop_graphic_original.url) if request and obj.loop_graphic_original else None,
            'webp': request.build_absolute_uri(obj.loop_graphic_webp.url) if request and obj.loop_graphic_webp else None,
            'avif': request.build_absolute_uri(obj.loop_graphic_avif.url) if request and obj.loop_graphic_avif else None,
        }

    def get_support_audio_url(self, obj):
        """Return support_audio URL"""
        if obj.support_audio:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.support_audio.url)
            return obj.support_audio.url
        return None