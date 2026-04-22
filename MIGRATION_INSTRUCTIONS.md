"""
MIGRATION INSTRUCTIONS FOR CLOUDINARY TO LOCAL STORAGE CONVERSION

This document provides step-by-step instructions for migrating the database schema
from Cloudinary to local file storage.

IMPORTANT: Follow these steps EXACTLY in order to avoid data loss!

=========================
STEP 1: BACKUP YOUR DATABASE
=========================

Before running any migrations, create a backup of your PostgreSQL database:

```bash
cd c:\Users\priyanshut\Documents\StemCity\backend
pg_dump -U postgres -h localhost stemty_db1 > backup_before_migration.sql
```

Save this file in a safe location!

=========================
STEP 2: INSTALL NEW DEPENDENCIES
=========================

```bash
cd c:\Users\priyanshut\Documents\StemCity\backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

This will install:
- Pillow (already had, but ensuring it's there)
- pillow-avif-plugin (NEW - for AVIF conversion)
- Whitenoise (NEW - for serving media efficiently)

=========================
STEP 3: AUTO-GENERATE MIGRATION
=========================

Django will automatically detect the model changes and create a migration file:

```bash
cd c:\Users\priyanshut\Documents\StemCity\backend
python manage.py makemigrations api
```

This will create a file like: api/migrations/000X_cloudinary_to_local_storage.py

REVIEW THE MIGRATION OUTPUT! Make sure it shows:
- Removing CloudinaryField columns (avatar, thumbnail, flyin_graphic, loop_graphic, support_audio, image)
- Adding new ImageField columns (*_original, *_webp, *_avif)

If the migration looks correct, proceed to STEP 4.

If something looks wrong, DO NOT proceed. Contact support or revert changes.

=========================
STEP 4: RUN THE MIGRATION
=========================

```bash
cd c:\Users\priyanshut\Documents\StemCity\backend
python manage.py migrate api
```

Wait for this to complete. The migration will:
1. Create the new image field columns in all models
2. Make them nullable initially
3. All existing images will be NULL (since Cloudinary data can't be auto-converted)

This is EXPECTED and OK - see STEP 5 to recover existing images.

=========================
STEP 5: MIGRATE EXISTING CLOUDINARY DATA (OPTIONAL)
=========================

If you have existing records with Cloudinary URLs and want to preserve them,
run the data migration command created in "management_command_migrate_cloudinary_data.py":

```bash
cd c:\Users\priyanshut\Documents\StemCity\backend
python manage.py migrate_cloudinary_to_local
```

This will:
- Download each image from Cloudinary
- Re-upload it through the new Pillow pipeline
- Generate WebP and AVIF variants
- Update database records with new local paths
- Log success/failure for each record

WARNING: This requires internet access (to download from Cloudinary)!

=========================
STEP 6: VERIFY MIGRATION
=========================

Check that migration was successful:

```bash
python manage.py showmigrations api
```

You should see checkmarks (✓) next to all migrations including the new one.

Test the API:
1. Start the development server: `python manage.py runserver`
2. Try uploading an image through the admin panel or API
3. Verify the image appears in /media/avatars/, /media/city_thumbnails/, etc.
4. Check that WebP and AVIF variants were created in /media/webp/ and /media/avif/ subdirectories

=========================
TROUBLESHOOTING
=========================

If the migration fails:

1. Restore from backup:
   ```bash
   psql -U postgres -h localhost stemty_db1 < backup_before_migration.sql
   ```

2. Check Django logs for the specific error

3. Make sure all Python dependencies are installed:
   ```bash
   pip install -r requirements.txt
   ```

4. Verify Pillow and pillow-avif-plugin installed correctly:
   ```bash
   python -c "from PIL import Image; import PIL.ImageFile; print('Pillow OK')"
   python -c "from PIL import AvifImagePlugin; print('AVIF plugin OK')"
   ```

=========================
WHAT THE MIGRATION DOES
=========================

OLD SCHEMA (Cloudinary):
- User.avatar: CloudinaryField
- City.thumbnail: CloudinaryField
- City.flyin_graphic: CloudinaryField
- City.loop_graphic: CloudinaryField
- City.support_audio: CloudinaryField (raw)
- Room.thumbnail: CloudinaryField
- Room.flyin_graphic: CloudinaryField
- Room.loop_graphic: CloudinaryField
- Room.support_audio: CloudinaryField (raw)
- ThumbnailAsset.image: CloudinaryField

NEW SCHEMA (Local Storage):
- User.avatar_original, avatar_webp, avatar_avif: ImageField
- City.thumbnail_original, thumbnail_webp, thumbnail_avif: ImageField
- City.flyin_graphic_original, flyin_graphic_webp, flyin_graphic_avif: ImageField
- City.loop_graphic_original, loop_graphic_webp, loop_graphic_avif: ImageField
- City.support_audio: FileField (unchanged)
- Room.thumbnail_original, thumbnail_webp, thumbnail_avif: ImageField
- Room.flyin_graphic_original, flyin_graphic_webp, flyin_graphic_avif: ImageField
- Room.loop_graphic_original, loop_graphic_webp, loop_graphic_avif: ImageField
- Room.support_audio: FileField (unchanged)
- ThumbnailAsset.image_original, image_webp, image_avif: ImageField

Each image now has 3 variants:
- original: JPG format (quality=95)
- webp: WebP format (quality=82)
- avif: AVIF format (quality=72)

=========================
REVERSING THE MIGRATION
=========================

To reverse the migration (go back to Cloudinary):

```bash
python manage.py migrate api 000X-1
```

Replace 000X with the number of the previous migration before the Cloudinary migration.

WARNING: This will delete all local image data that was not previously in Cloudinary!

=========================
NEXT STEPS
=========================

After migration is complete:

1. Update frontend React components to use the new SmartImage component
2. Update API client code to destructure {original, webp, avif} instead of single URL
3. Update .env files to remove CLOUDINARY_* variables
4. Test all image uploads and displays
5. Run full test suite
6. Deploy to production

See the other documentation files for details on React component updates.
"""
