# Complete Testing & Verification Checklist

## Pre-Migration Testing

Before running any migrations or deploying changes:

### 1. Database Backup
- [ ] Created backup of PostgreSQL database
  ```bash
  pg_dump -U postgres -h localhost stemty_db1 > pre_migration_backup.sql
  ```
- [ ] Backup file size is reasonable (larger than 1MB expected)
- [ ] Can restore backup if needed
  ```bash
  psql -U postgres -h localhost stemty_db1 < pre_migration_backup.sql
  ```

### 2. Code Review
- [ ] All Python files updated for image handling
- [ ] All React components updated to use SmartImage
- [ ] No remaining cloudinary imports
  ```bash
  # Backend
  grep -r "from cloudinary" backend/api/
  grep -r "import cloudinary" backend/api/
  # Should return nothing
  
  # Admin
  grep -r "cloudinary" admin/src/ --include="*.js" --include="*.jsx"
  # Should return nothing
  
  # Frontend
  grep -r "cloudinary" frontend_new/src/ --include="*.js" --include="*.jsx"
  # Should return nothing
  ```

### 3. Environment Setup
- [ ] Removed Cloudinary variables from all .env files
- [ ] Backend .env has no CLOUDINARY_* variables
- [ ] Admin .env has no VITE_CLOUDINARY_* variables
- [ ] Frontend .env has no VITE_CLOUDINARY_* variables

### 4. Dependencies Installed
- [ ] Backend: `pip install -r requirements.txt`
  ```bash
  cd backend
  pip install Pillow pillow-avif-plugin Whitenoise
  ```
- [ ] Admin: `npm install` (no new dependencies)
- [ ] Frontend: `npm install` (no new dependencies)

## Migration Execution

### 5. Run Django Migrations

```bash
cd backend

# Step 1: Create migrations
python manage.py makemigrations api
# Review output - should show removing CloudinaryField columns
# and adding new ImageField columns

# Step 2: Run migrations
python manage.py migrate api

# Step 3: Verify migration ran
python manage.py showmigrations api
# All should have ✓ checkmark
```

- [ ] makemigrations completed without errors
- [ ] migrate completed without errors
- [ ] showmigrations shows all migrations applied
- [ ] No database errors in Django logs

### 6. Verify Database Schema

```bash
# Connect to database and verify new columns exist:
psql -U postgres -h localhost stemty_db1

# In psql:
\d api_user
# Should see: avatar_original, avatar_webp, avatar_avif (not avatar)

\d api_city
# Should see: thumbnail_original, thumbnail_webp, thumbnail_avif

\d api_room
# Should see: thumbnail_original, thumbnail_webp, thumbnail_avif

\d api_thumbnailasset
# Should see: image_original, image_webp, image_avif
```

- [ ] User table has new avatar columns
- [ ] City table has new image columns
- [ ] Room table has new image columns
- [ ] ThumbnailAsset table has new image columns
- [ ] Old CloudinaryField columns are removed

## Backend Testing

### 7. Start Backend Server

```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver
# Server should start without errors
```

- [ ] Server starts successfully
- [ ] No "ModuleNotFoundError" for Pillow or pillow-avif-plugin
- [ ] No "cloudinary" import errors
- [ ] Django admin accessible at http://localhost:8000/admin/

### 8. Test Image Upload

```python
# Via Django shell:
python manage.py shell

from api.models import User
from django.core.files.base import ContentFile
from PIL import Image
from io import BytesIO

# Create test image
img = Image.new('RGB', (200, 200), color='red')
img_bytes = BytesIO()
img.save(img_bytes, format='JPEG')
img_bytes.seek(0)

# Create/update user with image
user = User.objects.create(email='test@test.com', password='test123')
user.avatar_original.save('test.jpg', ContentFile(img_bytes.getvalue()), save=True)

# Verify image was processed
print(f"Original: {user.avatar_original.name}")
print(f"WebP: {user.avatar_webp.name}")
print(f"AVIF: {user.avatar_avif.name}")

# Check files exist in media directory
import os
from django.conf import settings
original_path = os.path.join(settings.MEDIA_ROOT, user.avatar_original.name)
print(f"File exists: {os.path.exists(original_path)}")
```

- [ ] Image upload succeeds
- [ ] Original file saved to media/avatars/
- [ ] WebP variant created in media/avatars/webp/
- [ ] AVIF variant created in media/avatars/avif/
- [ ] All 3 files exist on disk
- [ ] File sizes are reasonable (smaller than originals)

### 9. Test API Endpoints

```bash
# Get city list
curl http://localhost:8000/api/auth/cities/

# Response should include image variants:
# "thumbnail": {
#   "original": "http://localhost:8000/media/...",
#   "webp": "http://localhost:8000/media/webp/...",
#   "avif": "http://localhost:8000/media/avif/..."
# }
```

- [ ] /api/auth/cities/ returns correct image format
- [ ] Each image field has {original, webp, avif}
- [ ] URLs are correct and accessible
- [ ] No Cloudinary URLs in response

### 10. Test File Serving

```bash
# Try to access a media file directly
curl -v http://localhost:8000/media/avatars/avatar_1.jpg
# Should return 200 OK with image data

curl -v http://localhost:8000/media/avatars/webp/avatar_1.webp
# Should return 200 OK with WebP image

curl -v http://localhost:8000/media/avatars/avif/avatar_1.avif
# Should return 200 OK with AVIF image
```

- [ ] Original JPG files serve correctly (200 OK)
- [ ] WebP files serve correctly (200 OK)
- [ ] AVIF files serve correctly (200 OK)
- [ ] Content-Type headers correct
- [ ] No 404 Not Found errors
- [ ] File sizes reasonable for format

### 11. Test Admin Panel

```bash
# Start Django admin
python manage.py runserver
# Visit http://localhost:8000/admin/
```

- [ ] Admin panel loads without errors
- [ ] Can log in successfully
- [ ] Can view User, City, Room, ThumbnailAsset models
- [ ] Image fields display correctly (show URLs)
- [ ] Can upload new images through admin
- [ ] Uploaded images create variants successfully

## Frontend Testing

### 12. Start React Apps

```bash
# Terminal 1: Admin
cd admin
npm run dev
# Should start at http://localhost:5173

# Terminal 2: Frontend
cd frontend_new
npm run dev
# Should start at http://localhost:5174 or 5173 (different port)
```

- [ ] Admin app starts without errors
- [ ] Frontend app starts without errors
- [ ] No console errors about Cloudinary
- [ ] No "getCloudinaryImageUrl is not defined" errors
- [ ] No "LazyImage" import errors

### 13. Test Admin App

```bash
# Visit http://localhost:5173
# Login with credentials
```

- [ ] Admin dashboard loads
- [ ] Static logo images display (if any)
- [ ] Can navigate to Cities page
- [ ] City thumbnails display using SmartImage
- [ ] Images lazy load correctly (check DevTools)
- [ ] Can navigate to Create City form
- [ ] Can upload image in form
- [ ] Form validates and shows preview
- [ ] After upload, can see images in WebP/AVIF formats

### 14. Test Frontend App

```bash
# Visit http://localhost:5174 or 5173 (different port)
```

- [ ] Frontend loads
- [ ] Can view cities list
- [ ] City thumbnails display correctly
- [ ] Images are lazy loading (check DevTools Network)
- [ ] Format negotiation works (AVIF/WebP in Chrome)
- [ ] Fallback to JPG in unsupported browsers
- [ ] Can click into city details
- [ ] Room images display correctly
- [ ] No console errors

### 15. Image Format Verification

```bash
# Check DevTools Network tab:
# 1. Open DevTools (F12 or Cmd+Shift+I)
# 2. Go to Network tab
# 3. Filter by Img
# 4. Click an image in the app
# 5. Check:
```

- [ ] Image request made to /media/... URL
- [ ] Response Content-Type header correct:
  - AVIF: `image/avif`
  - WebP: `image/webp`
  - JPG: `image/jpeg`
- [ ] Response size is optimized:
  - AVIF/WebP should be significantly smaller than JPG
- [ ] Status 200 OK (not 304 Not Modified on first load)

### 16. Performance Testing

```bash
# Chrome DevTools Lighthouse:
# 1. Open DevTools
# 2. Go to Lighthouse tab
# 3. Run Audit (mobile view recommended)
# 4. Check metrics:
```

- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] All images marked as "Defer offscreen images" if not above-fold
- [ ] WebP/AVIF being used in supported browsers
- [ ] No "Unsized images" warnings (width/height provided)

### 17. Responsive Design Testing

Test on multiple screen sizes:

```bash
# Chrome DevTools:
# 1. Press F12
# 2. Press Ctrl+Shift+M (toggle device toolbar)
# 3. Test devices: iPhone 12, iPad, Desktop
```

- [ ] Images scale correctly on mobile
- [ ] Images scale correctly on tablet
- [ ] Images scale correctly on desktop
- [ ] No broken layouts
- [ ] Lazy loading works on all sizes
- [ ] Touch interactions work properly

### 18. Browser Compatibility Testing

Test on multiple browsers:

| Browser | Version | Status | Issues |
|---------|---------|--------|--------|
| Chrome | Latest | | |
| Firefox | Latest | | |
| Safari | Latest | | |
| Edge | Latest | | |
| Mobile Chrome | Latest | | |
| Mobile Safari | Latest | | |

For each browser:
- [ ] Images load correctly
- [ ] Correct format negotiated (AVIF/WebP if supported)
- [ ] No console errors
- [ ] Lazy loading works
- [ ] Responsive design works

## Error Handling Testing

### 19. Test Error Conditions

```bash
# Test 1: Missing image files
# Manually delete a webp file and refresh page
# Expected: Should fallback to JPG
```

- [ ] Missing WebP → falls back to JPG
- [ ] Missing AVIF → falls back to JPG
- [ ] Missing JPG → shows broken image icon (expected)
- [ ] No JavaScript errors

```bash
# Test 2: Corrupted image upload
# Try uploading corrupted/invalid image file
```

- [ ] Backend validates image format
- [ ] Returns appropriate error to frontend
- [ ] Frontend shows error message
- [ ] No unhandled exceptions

```bash
# Test 3: Very large image upload
# Try uploading 100MB+ file
```

- [ ] Backend handles gracefully
- [ ] Returns error if too large
- [ ] Frontend shows clear error message
- [ ] No server crash

### 20. Network Error Handling

```bash
# Simulate network issues:
# 1. Open DevTools → Network tab
# 2. Set throttling to "Slow 3G"
# 3. Refresh page and observe
```

- [ ] Images still load eventually
- [ ] Grey placeholder shows while loading
- [ ] Fade-in animation works
- [ ] No console errors
- [ ] User can still interact with page

## Data Consistency Testing

### 21. Verify Old Records (if any)

If you had existing images before migration:

```bash
# In Django shell:
from api.models import City

# Check that old images have NULL values (expected)
cities = City.objects.all()
for city in cities:
    print(f"{city.name}: original={city.thumbnail_original}, webp={city.thumbnail_webp}")
    # Should be empty/NULL
```

- [ ] Old Cloudinary data properly removed
- [ ] New fields are NULL for old records
- [ ] No broken references
- [ ] Database integrity maintained

### 22. Run Data Migration (if repatriating images)

```bash
# If you had Cloudinary images to migrate:
python manage.py migrate_cloudinary_to_local --dry-run
# Review what would be migrated

python manage.py migrate_cloudinary_to_local
# Actually migrate images
```

- [ ] Images successfully downloaded from Cloudinary
- [ ] Variants generated for each image
- [ ] Database records updated
- [ ] Log shows success/failure for each record
- [ ] Failed migrations logged for manual review

## Cleanup & Finalization

### 23. Delete Old Code

```bash
# Admin
rm admin/src/utils/cloudinary.js
rm admin/src/components/LazyImage.jsx

# Frontend  
rm frontend_new/src/utilities/cloudinary.js
```

- [ ] Old cloudinary.js utility deleted
- [ ] Old LazyImage component deleted
- [ ] No remaining Cloudinary-related files

### 24. Verify No References

```bash
# Final verification - search for "cloudinary" everywhere:
grep -r "cloudinary" backend/ --include="*.py" 2>/dev/null | grep -v "migrations" | grep -v ".pyc"
# Should return nothing

grep -r "cloudinary\|Cloudinary" admin/src --include="*.js" --include="*.jsx"
# Should return nothing

grep -r "cloudinary\|Cloudinary" frontend_new/src --include="*.js" --include="*.jsx"
# Should return nothing
```

- [ ] No Cloudinary references in backend code
- [ ] No Cloudinary references in admin code
- [ ] No Cloudinary references in frontend code

### 25. Update Documentation

- [ ] Update README with new image handling approach
- [ ] Document API response format
- [ ] Document SmartImage component usage
- [ ] Update deployment documentation
- [ ] Add notes about media directory backup requirements

## Production Deployment Testing

### 26. Staging Environment

If you have a staging server:

```bash
# Deploy code to staging
# Run through all tests (12-25) on staging
# Verify everything works as expected
```

- [ ] Code deployed to staging
- [ ] All tests pass on staging
- [ ] Performance acceptable
- [ ] No unexpected errors

### 27. Database Backup Before Production

```bash
# Final backup before production deployment
pg_dump -U postgres -h localhost stemty_db1 > production_backup_pre_deploy.sql
```

- [ ] Production database backed up
- [ ] Backup file verified
- [ ] Backup location documented
- [ ] Restore procedure documented

### 28. Production Deployment

- [ ] Code deployed to production
- [ ] Migrations run on production database
- [ ] Media directory accessible
- [ ] Performance acceptable
- [ ] No unusual errors in logs

## Post-Deployment Monitoring

### 29. Monitor Application

For 24 hours after deployment:

- [ ] No spike in error rates
- [ ] Image loading times normal
- [ ] No performance degradation
- [ ] User reports no issues
- [ ] Server logs clean (no errors)

### 30. User Acceptance Testing

Have users test:

- [ ] Can view all existing content
- [ ] Images display correctly
- [ ] Upload/create new content works
- [ ] Performance feels normal
- [ ] No broken features

## Rollback Plan

If something goes wrong:

```bash
# Restore database from backup
psql -U postgres -h localhost stemty_db1 < pre_migration_backup.sql

# Revert code to previous version
git revert <migration-commit-hash>

# Restart application
```

- [ ] Rollback procedure documented
- [ ] Backups easily accessible
- [ ] Communication plan for users
- [ ] Previous version available

## Final Verification

- [ ] All 30 test items completed
- [ ] All items marked with ✓
- [ ] No open issues or blockers
- [ ] Documentation complete
- [ ] Team confident in deployment
- [ ] Ready for production

---

**Estimated Total Testing Time: 4-6 hours**

**Do not proceed to production until all items are verified!**
