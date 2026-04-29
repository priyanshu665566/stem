from django.db import models
from django.utils.text import slugify
from api.models import _process_variant_image
from api.image_processor import delete_image_variants
from api.models import User

# Create your models here.


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
    
    # Logo - original, webp, avif variants
    logo_original = models.ImageField(upload_to='city_logos/', null=True, blank=True)
    logo_webp = models.ImageField(upload_to='city_logos/webp/', null=True, blank=True)
    logo_avif = models.ImageField(upload_to='city_logos/avif/', null=True, blank=True)
    
    # Navbar slots - stores room assignments for the 7 navbar buttons
    # Structure: {1: room_id, 2: room_id, ...} or empty if not assigned
    navbar_slots = models.JSONField(default=dict, blank=True)
    
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
            ('logo_original', 'logo_webp', 'logo_avif', 'city_logos', 'logo'),
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
        delete_image_variants(self.logo_original)
        delete_image_variants(self.logo_webp)
        delete_image_variants(self.logo_avif)
        
        # Delete audio file
        if self.support_audio:
            self.support_audio.delete()
        
        super().delete(*args, **kwargs)