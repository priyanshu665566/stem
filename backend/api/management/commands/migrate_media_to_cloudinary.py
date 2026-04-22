import os
import cloudinary.uploader
from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from api.models import User, City, Room


class Command(BaseCommand):
    help = 'Migrate existing local media files to Cloudinary'

    def handle(self, *args, **kwargs):
        """Main handler that orchestrates migration for all models."""
        self.stdout.write(self.style.WARNING('\n=== Starting Media Migration to Cloudinary ===\n'))
        
        self._migrate_model(User, [('avatar', 'stemcity/avatars', 'image')])
        self._migrate_model(City, [
            ('thumbnail', 'stemcity/city_thumbnails', 'image'),
            ('flyin_graphic', 'stemcity/city_flyin_graphics', 'image'),
            ('loop_graphic', 'stemcity/city_loop_graphics', 'image'),
            ('support_audio', 'stemcity/city_support_audios', 'raw'),
        ])
        self._migrate_model(Room, [
            ('thumbnail', 'stemcity/room_thumbnails', 'image'),
            ('flyin_graphic', 'stemcity/room_flyin_graphics', 'image'),
            ('loop_graphic', 'stemcity/room_loop_graphics', 'image'),
            ('support_audio', 'stemcity/room_support_audios', 'raw'),
        ])
        
        self.stdout.write(self.style.SUCCESS('\n✓ Migration complete.\n'))

    def _migrate_model(self, model, fields):
        """Migrate media fields for a specific model."""
        model_name = model.__name__
        self.stdout.write(self.style.WARNING(f'\nProcessing {model_name}...'))
        
        total = model.objects.count()
        if total == 0:
            self.stdout.write(f"  • No {model_name} records found.")
            return
        
        migrated_count = 0
        skipped_count = 0
        failed_count = 0
        
        for obj in model.objects.all():
            for field_name, folder, resource_type in fields:
                field_value = getattr(obj, field_name)
                
                # Skip empty fields
                if not field_value:
                    continue
                
                # Determine if this is already a Cloudinary resource
                is_cloudinary = self._is_cloudinary_resource(field_value)
                
                if is_cloudinary:
                    self.stdout.write(
                        f"  • {model_name} id={obj.id} field={field_name}: "
                        f"SKIPPED (already on Cloudinary)"
                    )
                    skipped_count += 1
                    continue
                
                # Try to migrate local file
                migration_result = self._migrate_file(
                    field_value, 
                    obj, 
                    field_name, 
                    folder, 
                    resource_type, 
                    model_name
                )
                
                if migration_result == 'migrated':
                    setattr(obj, field_name, getattr(obj, field_name))
                    obj.save()
                    migrated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  ✓ {model_name} id={obj.id} field={field_name}: MIGRATED"
                        )
                    )
                elif migration_result == 'skipped':
                    skipped_count += 1
                else:
                    failed_count += 1
        
        # Summary
        self.stdout.write(
            f"\n{model_name} Summary: "
            f"{migrated_count} migrated, "
            f"{skipped_count} skipped, "
            f"{failed_count} failed\n"
        )

    def _is_cloudinary_resource(self, field_value):
        """
        Detect if a field value is already a Cloudinary resource.
        
        CloudinaryResource objects have a 'public_id' attribute.
        Local Django FileField objects have a 'file' attribute.
        """
        # Check if it's a CloudinaryResource (has public_id attribute)
        if hasattr(field_value, 'public_id'):
            return True
        
        # Check string representation - Cloudinary public IDs don't start with /
        # but local paths usually do or reference media/
        value_str = str(field_value)
        
        # If it starts with http, it's already on Cloudinary CDN
        if value_str.startswith('http'):
            return True
        
        # If the string value looks like a Cloudinary public_id (no path separators
        # or only forward slashes in folder structure), it might be Cloudinary
        # But we can't be 100% sure, so rely on .path attribute check instead
        
        return False

    def _migrate_file(self, field_value, obj, field_name, folder, resource_type, model_name):
        """
        Attempt to migrate a single file to Cloudinary.
        
        Returns:
            'migrated' - file was successfully uploaded
            'skipped' - file doesn't exist or is already migrated
            'failed' - error occurred during migration
        """
        try:
            # Check if the field_value has a .path attribute (Django FileField)
            if not hasattr(field_value, 'path'):
                self.stdout.write(
                    f"  • {model_name} id={obj.id} field={field_name}: "
                    f"SKIPPED (no local file path available)"
                )
                return 'skipped'
            
            file_path = field_value.path
            
            # Check if the file actually exists on disk
            if not os.path.exists(file_path):
                self.stdout.write(
                    f"  ⚠ {model_name} id={obj.id} field={field_name}: "
                    f"SKIPPED (local file not found at {file_path})"
                )
                return 'skipped'
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_path,
                folder=folder,
                resource_type=resource_type,
            )
            
            # Store the public_id in the field
            setattr(obj, field_name, result['public_id'])
            obj.save()
            
            return 'migrated'
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f"  ✗ {model_name} id={obj.id} field={field_name}: FAILED - {str(e)}"
                )
            )
            return 'failed'
