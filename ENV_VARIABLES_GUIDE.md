# Environment Variables - Cloudinary to Local Storage

## Backend (.env) - Changes Required

### REMOVE - Cloudinary Configuration

These variables should be **REMOVED** from `backend/.env`:

```bash
# DELETE THESE:
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

### ADD - Optional (Already configured in settings.py)

No new environment variables are required. All image processing settings are configured in `backend/core/settings.py`:

```python
IMAGE_QUALITY_WEBP = 82        # WebP quality (0-100)
IMAGE_QUALITY_AVIF = 72        # AVIF quality (0-100)
IMAGE_WEBP_METHOD = 6          # WebP encoding method (0-6)
IMAGE_AVIF_SPEED = 4           # AVIF encoding speed (0-8)
MEDIA_URL = '/media/'          # URL prefix for media files
MEDIA_ROOT = 'media'           # Disk location for media files
```

If you want to make these configurable via .env, add to `backend/.env`:

```bash
# Optional - Image Processing (defaults in settings.py)
IMAGE_QUALITY_WEBP=82
IMAGE_QUALITY_AVIF=72
IMAGE_WEBP_METHOD=6
IMAGE_AVIF_SPEED=4
```

Then update `backend/core/settings.py` to use them:

```python
IMAGE_QUALITY_WEBP = int(os.getenv('IMAGE_QUALITY_WEBP', 82))
IMAGE_QUALITY_AVIF = int(os.getenv('IMAGE_QUALITY_AVIF', 72))
IMAGE_WEBP_METHOD = int(os.getenv('IMAGE_WEB_METHOD', 6))
IMAGE_AVIF_SPEED = int(os.getenv('IMAGE_AVIF_SPEED', 4))
```

## Admin React (.env) - Changes Required

### REMOVE - Cloudinary Configuration

These variables should be **REMOVED** from `admin/.env`:

```bash
# DELETE THESE:
VITE_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
VITE_CLOUDINARY_API_KEY=<your_api_key>
VITE_CLOUDINARY_API_SECRET=<your_api_secret>
VITE_CLOUDINARY_UPLOAD_PRESET=<your_preset>
```

### ADD - Backend API Configuration

```bash
# Backend API URL (already likely present)
VITE_API_URL=http://localhost:8000
```

No other environment variables needed for image handling.

## Frontend React (.env) - Changes Required

### REMOVE - Cloudinary Configuration

These variables should be **REMOVED** from `frontend_new/.env`:

```bash
# DELETE THESE:
VITE_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
VITE_CLOUDINARY_API_KEY=<your_api_key>
VITE_CLOUDINARY_API_SECRET=<your_api_secret>
VITE_CLOUDINARY_UPLOAD_PRESET=<your_preset>
```

### ADD - Backend API Configuration

```bash
# Backend API URL (already likely present)
VITE_API_URL=http://localhost:8000
```

No other environment variables needed for image handling.

## Steps to Update .env Files

### 1. Backend (.env)

```bash
cd backend

# Backup current .env
cp .env .env.backup

# Remove Cloudinary variables
# Edit .env and delete these lines:
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...

# Keep everything else as is
```

### 2. Admin (.env)

```bash
cd admin

# Backup current .env
cp .env .env.backup

# Remove Cloudinary variables
# Edit .env and delete these lines:
# VITE_CLOUDINARY_CLOUD_NAME=...
# VITE_CLOUDINARY_API_KEY=...
# VITE_CLOUDINARY_API_SECRET=...
# VITE_CLOUDINARY_UPLOAD_PRESET=...

# Keep VITE_API_URL and other settings
```

### 3. Frontend (.env)

```bash
cd frontend_new

# Backup current .env
cp .env .env.backup

# Remove Cloudinary variables
# Edit .env and delete these lines:
# VITE_CLOUDINARY_CLOUD_NAME=...
# VITE_CLOUDINARY_API_KEY=...
# VITE_CLOUDINARY_API_SECRET=...
# VITE_CLOUDINARY_UPLOAD_PRESET=...

# Keep VITE_API_URL and other settings
```

## Verification

After removing Cloudinary variables:

### Backend
```bash
cd backend
grep -i cloudinary .env  # Should return nothing
```

### Admin
```bash
cd admin
grep -i cloudinary .env  # Should return nothing
```

### Frontend
```bash
cd frontend_new
grep -i cloudinary .env  # Should return nothing
```

If grep returns matches, those lines still need to be deleted.

## Environment Variables Reference

### Backend - Full Example

```bash
# Database
DB_NAME=stemty_db1
DB_USER=postgres
DB_PASSWORD=123
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Django
DEBUG=True
SECRET_KEY=your-secret-key-here

# Note: Cloudinary variables are REMOVED
# No CLOUDINARY_* variables needed anymore
```

### Admin React - Full Example

```bash
# API
VITE_API_URL=http://localhost:8000

# Note: Cloudinary variables are REMOVED
# No VITE_CLOUDINARY_* variables needed anymore
```

### Frontend React - Full Example

```bash
# API
VITE_API_URL=http://localhost:8000

# Note: Cloudinary variables are REMOVED
# No VITE_CLOUDINARY_* variables needed anymore
```

## Production Deployment

For production, ensure:

1. **Backend:**
   - No Cloudinary variables in environment
   - MEDIA_ROOT points to persistent storage (not ephemeral)
   - MEDIA_URL correctly configured for your domain
   - Whitenoise configured for serving static/media files

2. **Frontend Apps:**
   - VITE_API_URL points to production backend URL
   - No Cloudinary variables
   - Build time: `npm run build`

3. **Server Configuration:**
   - Nginx/Apache configured to serve `/media/` directory
   - Or use Whitenoise in Django for serving
   - Ensure media directory has appropriate permissions
   - Regular backups of media directory

## Troubleshooting

### "Cloudinary is not defined" error
1. Check that all Cloudinary imports have been removed
2. Verify code doesn't reference cloudinary variables
3. Grep for "cloudinary" in source code
4. Clear node_modules and reinstall: `npm install`

### Images not loading
1. Verify VITE_API_URL environment variable is set correctly
2. Check backend is running and serving media files
3. Verify media files exist in `backend/media/`
4. Check browser DevTools Network tab for actual URLs

### Database errors after removing Cloudinary
1. This is expected - old Cloudinary URLs can't be used
2. See MIGRATION_INSTRUCTIONS.md for handling existing data
3. Re-upload images to generate new local variants

## Checklist

- [ ] Backup all .env files
- [ ] Remove CLOUDINARY_* variables from backend/.env
- [ ] Remove VITE_CLOUDINARY_* variables from admin/.env
- [ ] Remove VITE_CLOUDINARY_* variables from frontend_new/.env
- [ ] Verify no Cloudinary variables remain
- [ ] Test backend API still runs
- [ ] Test admin panel connects to backend
- [ ] Test frontend connects to backend
- [ ] Verify images load correctly in all apps

## Security Note

Removing Cloudinary credentials from environment variables improves security:
- No API credentials exposed in logs
- No accidental credential commits to git
- Reduced attack surface
- Simpler deployment configuration

Ensure you have removed the old credentials from:
- GitHub Actions secrets (if using CI/CD)
- Deployment platform environment variables
- Git history (run `git log --all -- .env` to verify)
- Old server configurations
