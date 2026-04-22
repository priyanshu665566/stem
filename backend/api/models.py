from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from typing import ClassVar
import uuid
from django.utils import timezone
from django.utils.text import slugify
import os
import io
from .image_processor import (
    save_image_variants,
    delete_image_variants,
    get_image_url_variants,
)


def _process_variant_image(instance, original_attr, webp_attr, avif_attr, base_dir, base_name):
    original_field = getattr(instance, original_attr, None)
    if not original_field or not getattr(original_field, 'name', None) or not instance.pk:
        return False

    original_file_name = f'{base_name}_{instance.pk}.jpg'
    webp_file_name = f'{base_name}_{instance.pk}.webp'
    avif_file_name = f'{base_name}_{instance.pk}.avif'

    original_upload_to = getattr(original_field.field, 'upload_to', '')
    webp_field = getattr(instance, webp_attr)
    avif_field = getattr(instance, avif_attr)
    webp_upload_to = getattr(webp_field.field, 'upload_to', '')
    avif_upload_to = getattr(avif_field.field, 'upload_to', '')

    expected_original = f'{original_upload_to}{original_file_name}'
    expected_webp = f'{webp_upload_to}{webp_file_name}'
    expected_avif = f'{avif_upload_to}{avif_file_name}'

    current_original = original_field.name
    current_webp_field = webp_field
    current_avif_field = avif_field
    current_webp = current_webp_field.name if current_webp_field else ''
    current_avif = current_avif_field.name if current_avif_field else ''

    already_processed = (
        current_original == expected_original and
        current_webp == expected_webp and
        (not current_avif or current_avif == expected_avif)
    )
    if already_processed:
        return False

    from .image_processor import open_image_safe, convert_to_webp, convert_to_avif
    from django.core.files.base import ContentFile

    if hasattr(original_field, 'seek'):
        original_field.seek(0)
    image_bytes = original_field.read()
    pil_image = open_image_safe(image_bytes)
    storage = original_field.storage

    for path in (expected_original, expected_webp, expected_avif):
        storage.delete(path)

    jpg_buffer = io.BytesIO()
    pil_image.save(jpg_buffer, format='JPEG', quality=95, optimize=True)
    jpg_buffer.seek(0)
    getattr(instance, original_attr).save(
        original_file_name,
        ContentFile(jpg_buffer.getvalue(), name=original_file_name),
        save=False,
    )

    webp_file = convert_to_webp(pil_image)
    if webp_file:
        getattr(instance, webp_attr).save(webp_file_name, webp_file, save=False)
    else:
        setattr(instance, webp_attr, None)

    avif_file = convert_to_avif(pil_image)
    if avif_file:
        getattr(instance, avif_attr).save(avif_file_name, avif_file, save=False)
    else:
        setattr(instance, avif_attr, None)

    if current_original not in {expected_original, expected_webp, expected_avif}:
        storage.delete(current_original)

    return True


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('ccg-admin', 'CCG Admin'),
        ('content-creator', 'Content Creator'),
    ]

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    date_joined = models.DateTimeField(default=timezone.now)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    name = models.CharField(max_length=150, blank=True)
    contact_no = models.CharField(max_length=20, blank=True)
    
    # Avatar - stored as original, webp, avif variants
    avatar_original = models.ImageField(upload_to='avatars/', null=True, blank=True)
    avatar_webp = models.ImageField(upload_to='avatars/webp/', null=True, blank=True)
    avatar_avif = models.ImageField(upload_to='avatars/avif/', null=True, blank=True)

    objects: ClassVar[UserManager] = UserManager()  # type: ignore[assignment]

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            if _process_variant_image(self, 'avatar_original', 'avatar_webp', 'avatar_avif', 'avatars', 'avatar'):
                super().save(update_fields=['avatar_original', 'avatar_webp', 'avatar_avif'])
        except Exception as e:
            print(f"Warning: Failed to process avatar variants: {str(e)}")

    def delete(self, *args, **kwargs):
        # Delete image variants
        delete_image_variants(self.avatar_original)
        delete_image_variants(self.avatar_webp)
        delete_image_variants(self.avatar_avif)
        super().delete(*args, **kwargs)


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return (timezone.now() - self.created_at).seconds > 3600


class City(models.Model):
    ASSISTANT_CHOICES = [
        ('assistant1', 'Assistant 1'),
        ('assistant2', 'Assistant 2'),
        ('assistant3', 'Assistant 3'),
    ]

    name = models.CharField(max_length=255)
    assistant = models.CharField(max_length=50, choices=ASSISTANT_CHOICES)
    meeting_url = models.URLField()
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_review', 'In Review'),
        ('published', 'Published'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    content_creator_id = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_cities')
    city_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_cities')
    is_active = models.BooleanField(default=False)

    # Thumbnail - original, webp, avif variants
    thumbnail_original = models.ImageField(upload_to='city_thumbnails/', null=True, blank=True)
    thumbnail_webp = models.ImageField(upload_to='city_thumbnails/webp/', null=True, blank=True)
    thumbnail_avif = models.ImageField(upload_to='city_thumbnails/avif/', null=True, blank=True)
    
    # Flyin Graphic - original, webp, avif variants
    flyin_graphic_original = models.ImageField(upload_to='city_flyin_graphics/', null=True, blank=True)
    flyin_graphic_webp = models.ImageField(upload_to='city_flyin_graphics/webp/', null=True, blank=True)
    flyin_graphic_avif = models.ImageField(upload_to='city_flyin_graphics/avif/', null=True, blank=True)
    
    # Loop Graphic - original, webp, avif variants
    loop_graphic_original = models.ImageField(upload_to='city_loop_graphics/', null=True, blank=True)
    loop_graphic_webp = models.ImageField(upload_to='city_loop_graphics/webp/', null=True, blank=True)
    loop_graphic_avif = models.ImageField(upload_to='city_loop_graphics/avif/', null=True, blank=True)
    
    # Support Audio - raw file (no variants)
    support_audio = models.FileField(upload_to='city_support_audios/', null=True, blank=True)
    
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Generate slug if not set
        if not self.slug:
            base_slug = slugify(self.name)
            unique_slug = base_slug
            counter = 1
            while City.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = unique_slug

        super().save(*args, **kwargs)

        updated_fields = []
        variant_fields = [
            ('thumbnail_original', 'thumbnail_webp', 'thumbnail_avif', 'city_thumbnails', 'thumbnail'),
            ('flyin_graphic_original', 'flyin_graphic_webp', 'flyin_graphic_avif', 'city_flyin_graphics', 'flyin'),
            ('loop_graphic_original', 'loop_graphic_webp', 'loop_graphic_avif', 'city_loop_graphics', 'loop'),
        ]
        for original_attr, webp_attr, avif_attr, base_dir, base_name in variant_fields:
            try:
                if _process_variant_image(self, original_attr, webp_attr, avif_attr, base_dir, base_name):
                    updated_fields.extend([original_attr, webp_attr, avif_attr])
            except Exception as e:
                print(f"Warning: Failed to process {original_attr} variants: {str(e)}")

        if updated_fields:
            super().save(update_fields=list(dict.fromkeys(updated_fields)))

        # Handle slug duplication
        if City.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{self.slug}-{self.pk}"
            super().save(update_fields=['slug'])

    def delete(self, *args, **kwargs):
        # Delete all image variants
        delete_image_variants(self.thumbnail_original)
        delete_image_variants(self.thumbnail_webp)
        delete_image_variants(self.thumbnail_avif)
        delete_image_variants(self.flyin_graphic_original)
        delete_image_variants(self.flyin_graphic_webp)
        delete_image_variants(self.flyin_graphic_avif)
        delete_image_variants(self.loop_graphic_original)
        delete_image_variants(self.loop_graphic_webp)
        delete_image_variants(self.loop_graphic_avif)
        
        # Delete audio file
        if self.support_audio:
            self.support_audio.delete()
        
        super().delete(*args, **kwargs)


class Room(models.Model):
    ASSISTANT_CHOICES = [
        ('assistant1', 'Assistant 1'),
        ('assistant2', 'Assistant 2'),
        ('assistant3', 'Assistant 3'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_review', 'In Review'),
        ('published', 'Published'),
    ]

    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='rooms')
    room_name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    assistant = models.CharField(max_length=50, choices=ASSISTANT_CHOICES)
    meeting_url = models.URLField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='added_rooms')
    
    # Thumbnail - original, webp, avif variants
    thumbnail_original = models.ImageField(upload_to='room_thumbnails/', null=True, blank=True)
    thumbnail_webp = models.ImageField(upload_to='room_thumbnails/webp/', null=True, blank=True)
    thumbnail_avif = models.ImageField(upload_to='room_thumbnails/avif/', null=True, blank=True)
    
    # Flyin Graphic - original, webp, avif variants
    flyin_graphic_original = models.ImageField(upload_to='room_flyin_graphics/', null=True, blank=True)
    flyin_graphic_webp = models.ImageField(upload_to='room_flyin_graphics/webp/', null=True, blank=True)
    flyin_graphic_avif = models.ImageField(upload_to='room_flyin_graphics/avif/', null=True, blank=True)
    
    # Loop Graphic - original, webp, avif variants
    loop_graphic_original = models.ImageField(upload_to='room_loop_graphics/', null=True, blank=True)
    loop_graphic_webp = models.ImageField(upload_to='room_loop_graphics/webp/', null=True, blank=True)
    loop_graphic_avif = models.ImageField(upload_to='room_loop_graphics/avif/', null=True, blank=True)
    
    # Support Audio - raw file (no variants)
    support_audio = models.FileField(upload_to='room_support_audios/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.room_name} in {self.city.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        updated_fields = []
        variant_fields = [
            ('thumbnail_original', 'thumbnail_webp', 'thumbnail_avif', 'room_thumbnails', 'thumbnail'),
            ('flyin_graphic_original', 'flyin_graphic_webp', 'flyin_graphic_avif', 'room_flyin_graphics', 'flyin'),
            ('loop_graphic_original', 'loop_graphic_webp', 'loop_graphic_avif', 'room_loop_graphics', 'loop'),
        ]
        for original_attr, webp_attr, avif_attr, base_dir, base_name in variant_fields:
            try:
                if _process_variant_image(self, original_attr, webp_attr, avif_attr, base_dir, base_name):
                    updated_fields.extend([original_attr, webp_attr, avif_attr])
            except Exception as e:
                print(f"Warning: Failed to process {original_attr} variants: {str(e)}")

        if updated_fields:
            super().save(update_fields=list(dict.fromkeys(updated_fields)))

    def delete(self, *args, **kwargs):
        # Delete all image variants
        delete_image_variants(self.thumbnail_original)
        delete_image_variants(self.thumbnail_webp)
        delete_image_variants(self.thumbnail_avif)
        delete_image_variants(self.flyin_graphic_original)
        delete_image_variants(self.flyin_graphic_webp)
        delete_image_variants(self.flyin_graphic_avif)
        delete_image_variants(self.loop_graphic_original)
        delete_image_variants(self.loop_graphic_webp)
        delete_image_variants(self.loop_graphic_avif)
        
        # Delete audio file
        if self.support_audio:
            self.support_audio.delete()
        
        super().delete(*args, **kwargs)


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


class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    detail = models.CharField(max_length=255, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.timestamp}"


class ThumbnailAsset(models.Model):
    """Reusable thumbnail asset with local storage"""
    # Image - original, webp, avif variants
    image_original = models.ImageField(upload_to='thumbnail_assets/', null=True, blank=True)
    image_webp = models.ImageField(upload_to='thumbnail_assets/webp/', null=True, blank=True)
    image_avif = models.ImageField(upload_to='thumbnail_assets/avif/', null=True, blank=True)
    
    title = models.CharField(max_length=255, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    usage_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title or f"Thumbnail {self.id}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            if _process_variant_image(self, 'image_original', 'image_webp', 'image_avif', 'thumbnail_assets', 'thumbnail'):
                super().save(update_fields=['image_original', 'image_webp', 'image_avif'])
        except Exception as e:
            print(f"Warning: Failed to process thumbnail asset variants: {str(e)}")

    def delete(self, *args, **kwargs):
        # Delete image variants
        delete_image_variants(self.image_original)
        delete_image_variants(self.image_webp)
        delete_image_variants(self.image_avif)
        super().delete(*args, **kwargs)

    @classmethod
    def get_featured_count(cls):
        """Get count of featured thumbnails"""
        return cls.objects.filter(is_featured=True).count()

    @classmethod
    def enforce_featured_limit(cls, max_featured=4):
        """Ensure only max_featured images are marked as featured"""
        featured = cls.objects.filter(is_featured=True).order_by('-updated_at')
        if featured.count() > max_featured:
            for thumbnail in featured[max_featured:]:
                thumbnail.is_featured = False
                thumbnail.save()
