from django.db import models # pyright: ignore[reportMissingModuleSource]

from api.image_processor import delete_image_variants
from api.models import User, _process_variant_image
from cities.models import City

# Create your models here.
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