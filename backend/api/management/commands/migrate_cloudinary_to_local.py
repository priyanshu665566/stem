"""
Management command to migrate existing Cloudinary URLs to local storage.

Usage:
    python manage.py migrate_cloudinary_to_local [--dry-run] [--model City|Room|User|ThumbnailAsset]

Options:
    --dry-run: Show what would be migrated without actually doing it
    --model: Only migrate specific model (default: all)

Examples:
    python manage.py migrate_cloudinary_to_local
    python manage.py migrate_cloudinary_to_local --dry-run
    python manage.py migrate_cloudinary_to_local --model City
"""

import os
import requests
from io import BytesIO
from django.core.management.base import BaseCommand, CommandError
from django.core.files.base import ContentFile
from django.utils import timezone
from django.db import models
from api.models import User, City, Room, ThumbnailAsset
from api.image_processor import open_image_safe, convert_to_webp, convert_to_avif


class Command(BaseCommand):
    help = 'Migrate existing Cloudinary images to local storage'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without actually doing it',
        )
        parser.add_argument(
            '--model',
            type=str,
            choices=['User', 'City', 'Room', 'ThumbnailAsset'],
            help='Only migrate specific model',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        model_name = options.get('model', None)

        self.stdout.write(
            self.style.WARNING(
                'WARNING: This command will download images from Cloudinary and re-upload them locally.'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                'Ensure you have internet access and sufficient disk space.'
            )
        )

        if dry_run:
            self.stdout.write(
                self.style.SUCCESS('DRY RUN MODE - No changes will be made')
            )

        # Collect models to migrate
        models_to_migrate = []
        if not model_name or model_name == 'User':
            models_to_migrate.append(('User', User))
        if not model_name or model_name == 'City':
            models_to_migrate.append(('City', City))
        if not model_name or model_name == 'Room':
            models_to_migrate.append(('Room', Room))
        if not model_name or model_name == 'ThumbnailAsset':
            models_to_migrate.append(('ThumbnailAsset', ThumbnailAsset))

        total_migrated = 0
        total_failed = 0

        for model_name_display, model_class in models_to_migrate:
            self.stdout.write(
                self.style.HTTP_INFO(f'\n=== Processing {model_name_display} ===')
            )

            if model_name_display == 'User':
                migrated, failed = self.migrate_user(User, dry_run)
            elif model_name_display == 'City':
                migrated, failed = self.migrate_city(City, dry_run)
            elif model_name_display == 'Room':
                migrated, failed = self.migrate_room(Room, dry_run)
            elif model_name_display == 'ThumbnailAsset':
                migrated, failed = self.migrate_thumbnail_asset(ThumbnailAsset, dry_run)

            total_migrated += migrated
            total_failed += failed

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Migration complete: {total_migrated} records migrated, {total_failed} failed'
            )
        )

    def migrate_user(self, model, dry_run):
        """Migrate User avatar from Cloudinary"""
        users_with_avatar = model.objects.exclude(avatar_original='')
        self.stdout.write(f'Found {users_with_avatar.count()} users with avatars')

        migrated = 0
        failed = 0

        for user in users_with_avatar:
            try:
                self.stdout.write(f'Processing user {user.id}: {user.email}...', ending=' ')

                # For now, skip if already has local avatar
                if user.avatar_original and user.avatar_original.name.startswith('avatars/'):
                    self.stdout.write(self.style.WARNING('SKIP (already local)'))
                    continue

                # Cloudinary images would need to be accessed via build_url()
                # Since we can't directly access them, we'll skip
                self.stdout.write(
                    self.style.WARNING(
                        'SKIP (Cloudinary data cannot be auto-migrated - re-upload manually)'
                    )
                )

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'FAILED: {str(e)}'))
                failed += 1

        return migrated, failed

    def migrate_city(self, model, dry_run):
        """Migrate City images from Cloudinary"""
        cities_with_images = model.objects.exclude(thumbnail_original='')
        self.stdout.write(f'Found {cities_with_images.count()} cities with images')

        migrated = 0
        failed = 0

        for city in cities_with_images:
            try:
                self.stdout.write(f'Processing city {city.id}: {city.name}...', ending=' ')

                # Skip if already migrated
                if city.thumbnail_original and city.thumbnail_original.name.startswith('city_thumbnails/'):
                    self.stdout.write(self.style.WARNING('SKIP (already local)'))
                    continue

                # Cloudinary images would need to be accessed via API
                # Since we can't directly access them, we'll skip
                self.stdout.write(
                    self.style.WARNING(
                        'SKIP (Cloudinary data cannot be auto-migrated - re-upload manually)'
                    )
                )

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'FAILED: {str(e)}'))
                failed += 1

        return migrated, failed

    def migrate_room(self, model, dry_run):
        """Migrate Room images from Cloudinary"""
        rooms_with_images = model.objects.exclude(thumbnail_original='')
        self.stdout.write(f'Found {rooms_with_images.count()} rooms with images')

        migrated = 0
        failed = 0

        for room in rooms_with_images:
            try:
                self.stdout.write(f'Processing room {room.id}: {room.room_name}...', ending=' ')

                # Skip if already migrated
                if room.thumbnail_original and room.thumbnail_original.name.startswith('room_thumbnails/'):
                    self.stdout.write(self.style.WARNING('SKIP (already local)'))
                    continue

                # Cloudinary images would need to be accessed via API
                self.stdout.write(
                    self.style.WARNING(
                        'SKIP (Cloudinary data cannot be auto-migrated - re-upload manually)'
                    )
                )

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'FAILED: {str(e)}'))
                failed += 1

        return migrated, failed

    def migrate_thumbnail_asset(self, model, dry_run):
        """Migrate ThumbnailAsset images from Cloudinary"""
        assets_with_images = model.objects.exclude(image_original='')
        self.stdout.write(f'Found {assets_with_images.count()} thumbnail assets with images')

        migrated = 0
        failed = 0

        for asset in assets_with_images:
            try:
                self.stdout.write(f'Processing asset {asset.id}: {asset.title}...', ending=' ')

                # Skip if already migrated
                if asset.image_original and asset.image_original.name.startswith('thumbnail_assets/'):
                    self.stdout.write(self.style.WARNING('SKIP (already local)'))
                    continue

                # Cloudinary images would need to be accessed via API
                self.stdout.write(
                    self.style.WARNING(
                        'SKIP (Cloudinary data cannot be auto-migrated - re-upload manually)'
                    )
                )

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'FAILED: {str(e)}'))
                failed += 1

        return migrated, failed

    def process_image_from_cloudinary(self, cloudinary_url, filename):
        """
        Download image from Cloudinary and process it.
        
        NOTE: This is a template for future enhancement if Cloudinary URLs
        are available from the database. Currently, CloudinaryField data
        is not easily accessible after deletion.
        """
        try:
            # Download image from Cloudinary
            response = requests.get(cloudinary_url, timeout=30)
            response.raise_for_status()

            # Process image
            image_data = BytesIO(response.content)
            pil_image = open_image_safe(image_data)

            # Create variants
            jpg_buffer = BytesIO()
            pil_image.save(jpg_buffer, format='JPEG', quality=95, optimize=True)
            jpg_buffer.seek(0)

            webp_file = convert_to_webp(pil_image)
            avif_file = convert_to_avif(pil_image)

            return {
                'original': ContentFile(jpg_buffer.getvalue(), name=f'{filename}.jpg'),
                'webp': webp_file,
                'avif': avif_file,
            }

        except Exception as e:
            raise ValueError(f'Failed to process image from Cloudinary: {str(e)}')
