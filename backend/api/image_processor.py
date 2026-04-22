"""
Image processing utility for converting images to WebP and AVIF formats.
Uses Pillow and pillow-avif-plugin for efficient image optimization.
"""

import os
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings


def get_image_formats_paths(original_filename):
    """
    Generate paths for original, WebP, and AVIF versions of an image.
    
    Args:
        original_filename: The uploaded filename (e.g., 'city_thumbnail.jpg')
    
    Returns:
        dict with keys: original, webp, avif containing the relative paths
    """
    # Get base filename without extension
    name_without_ext = os.path.splitext(original_filename)[0]
    
    return {
        'original': f'{name_without_ext}.jpg',  # Original always saved as JPG
        'webp': f'webp/{name_without_ext}.webp',
        'avif': f'avif/{name_without_ext}.avif',
    }


def open_image_safe(image_file):
    """
    Safely open an image file, handling various formats and potential corruption.
    
    Args:
        image_file: Django UploadedFile or file-like object
    
    Returns:
        PIL.Image.Image in RGB format, or None if failed
    
    Raises:
        ValueError: If image cannot be opened or is corrupted
    """
    try:
        # Convert to BytesIO if needed
        if hasattr(image_file, 'read'):
            image_file.seek(0)
            image_data = image_file.read()
        else:
            image_data = image_file
        
        img = Image.open(BytesIO(image_data))
        
        # Convert to RGB if necessary (handle RGBA, grayscale, etc.)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        return img
    
    except Exception as e:
        raise ValueError(f"Cannot open image file: {str(e)}")


def convert_to_webp(image, quality=None):
    """
    Convert PIL Image to WebP format.
    
    Args:
        image: PIL.Image.Image object
        quality: Quality setting (0-100, default from settings)
    
    Returns:
        ContentFile with WebP image data
    """
    if quality is None:
        quality = getattr(settings, 'IMAGE_QUALITY_WEBP', 82)
    
    method = getattr(settings, 'IMAGE_WEBP_METHOD', 6)
    
    webp_buffer = BytesIO()
    image.save(
        webp_buffer,
        format='WebP',
        quality=quality,
        method=method,
    )
    webp_buffer.seek(0)
    
    return ContentFile(webp_buffer.getvalue(), name='image.webp')


def convert_to_avif(image, quality=None):
    """
    Convert PIL Image to AVIF format using pillow-avif-plugin.
    
    Args:
        image: PIL.Image.Image object
        quality: Quality setting (0-100, default from settings)
    
    Returns:
        ContentFile with AVIF image data
    """
    if quality is None:
        quality = getattr(settings, 'IMAGE_QUALITY_AVIF', 72)
    
    speed = getattr(settings, 'IMAGE_AVIF_SPEED', 4)
    
    avif_buffer = BytesIO()
    try:
        image.save(
            avif_buffer,
            format='AVIF',
            quality=quality,
            speed=speed,
        )
        avif_buffer.seek(0)
        return ContentFile(avif_buffer.getvalue(), name='image.avif')
    except Exception as e:
        # AVIF conversion might fail on some systems
        # Return None instead of raising to allow fallback
        return None


def save_image_variants(image_field, original_file, upload_to_path):
    """
    Save original, WebP, and AVIF variants of an image.
    Deletes previous variants before saving new ones to prevent orphan files.
    
    Args:
        image_field: The model's ImageField instance (e.g., user.avatar)
        original_file: The uploaded file (Django UploadedFile)
        upload_to_path: Base path for storing images (e.g., 'avatars')
    
    Returns:
        dict with keys: original, webp, avif containing the saved field names
    """
    try:
        # Open and validate the original image
        pil_image = open_image_safe(original_file)
        
        # Get filename paths
        filename = getattr(original_file, 'name', 'image.jpg')
        paths = get_image_formats_paths(filename)
        
        # Clean up old variants before saving new ones
        delete_image_variants(image_field)
        
        # Save original as JPG
        jpg_buffer = BytesIO()
        pil_image.save(
            jpg_buffer,
            format='JPEG',
            quality=95,
            optimize=True,
        )
        jpg_buffer.seek(0)
        jpg_file = ContentFile(jpg_buffer.getvalue(), name=paths['original'])
        
        # Save original variant
        original_path = f"{upload_to_path}/{paths['original']}"
        image_field.save(original_path, jpg_file, save=False)
        
        # Save WebP variant
        webp_file = convert_to_webp(pil_image)
        webp_path = f"{upload_to_path}/{paths['webp']}"
        
        # Save AVIF variant (may be None if conversion failed)
        avif_file = convert_to_avif(pil_image)
        avif_path = f"{upload_to_path}/{paths['avif']}" if avif_file else None
        
        variants = {
            'original': image_field.name,  # After save, original is in image_field.name
            'webp': webp_path,
            'avif': avif_path,
        }
        
        return variants
    
    except Exception as e:
        raise ValueError(f"Image variant generation failed: {str(e)}")


def delete_image_variants(image_field):
    """
    Delete all variant files (original, WebP, AVIF) associated with an image field.
    Prevents orphan files when an image is updated.
    
    Args:
        image_field: Django ImageField or FileField instance
    """
    if not image_field:
        return
    
    try:
        # Get the storage backend
        storage = image_field.storage
        
        # Delete the main file
        if image_field.name:
            storage.delete(image_field.name)
        
        # Try to delete WebP variant
        webp_name = image_field.name.replace(
            os.path.splitext(image_field.name)[1],
            '.webp'
        )
        webp_path = webp_name.replace(
            os.path.dirname(webp_name),
            os.path.dirname(webp_name) + '/webp'
        )
        try:
            storage.delete(webp_path)
        except Exception:
            pass  # File might not exist
        
        # Try to delete AVIF variant
        avif_name = image_field.name.replace(
            os.path.splitext(image_field.name)[1],
            '.avif'
        )
        avif_path = avif_name.replace(
            os.path.dirname(avif_name),
            os.path.dirname(avif_name) + '/avif'
        )
        try:
            storage.delete(avif_path)
        except Exception:
            pass  # File might not exist
    
    except Exception as e:
        print(f"Warning: Could not delete image variants: {str(e)}")


def get_image_url_variants(image_field, request=None):
    """
    Build absolute URLs for original, WebP, and AVIF variants.
    
    Args:
        image_field: Django ImageField instance
        request: Django request object for building absolute URLs (optional)
    
    Returns:
        dict with keys: original, webp, avif containing full URLs
    """
    if not image_field or not image_field.name:
        return {
            'original': None,
            'webp': None,
            'avif': None,
        }
    
    storage = image_field.storage
    original_url = storage.url(image_field.name)
    
    # Build WebP and AVIF URLs by replacing the extension and directory
    base_path = os.path.dirname(image_field.name)
    filename_without_ext = os.path.splitext(os.path.basename(image_field.name))[0]
    
    webp_name = f"{base_path}/webp/{filename_without_ext}.webp"
    avif_name = f"{base_path}/avif/{filename_without_ext}.avif"
    
    webp_url = storage.url(webp_name) if storage.exists(webp_name) else None
    avif_url = storage.url(avif_name) if storage.exists(avif_name) else None
    
    # Make URLs absolute if request is provided
    if request:
        if original_url.startswith('/'):
            original_url = request.build_absolute_uri(original_url)
        if webp_url and webp_url.startswith('/'):
            webp_url = request.build_absolute_uri(webp_url)
        if avif_url and avif_url.startswith('/'):
            avif_url = request.build_absolute_uri(avif_url)
    
    return {
        'original': original_url,
        'webp': webp_url,
        'avif': avif_url,
    }
