# Cloudinary Migration - Quick Start Guide

## What Changed?

All local media files (logos, images, videos) are now served from Cloudinary CDN with automatic optimizations.

### Before (Local Storage)
```javascript
<img src="/SC_logo.png" alt="Logo" />
<img src="/1.jpg" alt="Gallery" />
```

### After (Cloudinary)
```javascript
import { getCloudinaryImageUrl } from '../utils/cloudinary';

<img src={getCloudinaryImageUrl('stemcity/assets/SC_logo')} alt="Logo" />
<img src={getCloudinaryImageUrl('stemcity/gallery/city1')} alt="Gallery" />
```

## 5-Minute Setup

### Step 1: Get Cloudinary Credentials (2 min)
1. Sign up at https://cloudinary.com
2. Go to Dashboard and copy:
   - Cloud Name
   - API Key  
   - API Secret

### Step 2: Configure Frontend (2 min)

**For Admin:**
```bash
cd admin
cp .env.example .env
```

**For Frontend_new:**
```bash
cd frontend_new
cp .env.example .env
```

Edit `.env` with your credentials:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=stemcity_uploads
```

### Step 3: Restart & Test (1 min)
```bash
npm run dev
```

Visit app and verify:
- ✅ Logo loads in Navbar
- ✅ Dashboard images display
- ✅ Gallery loads in Home page

## Using Cloudinary URLs in Components

### Simple Image
```javascript
import { getCloudinaryImageUrl } from '../utils/cloudinary';

const imageUrl = getCloudinaryImageUrl('stemcity/gallery/city1', {
  width: 800,
  quality: 'auto',
  format: 'auto',
});

<img src={imageUrl} alt="City" loading="lazy" />
```

### Responsive Image
```javascript
import { getResponsiveImageSet } from '../utils/cloudinary';

const images = getResponsiveImageSet('stemcity/gallery/city1', '16/9');

<picture>
  <source media="(max-width: 640px)" srcSet={images.mobile} />
  <source media="(max-width: 1024px)" srcSet={images.tablet} />
  <source media="(max-width: 1600px)" srcSet={images.desktop} />
  <img src={images.ultrawide} alt="City" />
</picture>
```

### Lazy Load Component
```javascript
import LazyImage from '../components/LazyImage';

<LazyImage
  src="stemcity/gallery/city1"
  alt="City"
  width={800}
  height={600}
  className="w-full h-auto"
  loading="lazy"
/>
```

### Video
```javascript
import { getCloudinaryVideoUrl } from '../utils/cloudinary';

const videoUrl = getCloudinaryVideoUrl('stemcity/assets/hero-loop', {
  quality: 'auto',
  format: 'auto',
});

<video src={videoUrl} autoPlay muted loop />
```

## File Uploads

File uploads work exactly as before - no code changes needed:

```javascript
// CreateCity.jsx - unchanged
const handleSubmit = async (e) => {
  const formData = new FormData();
  formData.append('thumbnail', file);
  
  // Backend automatically uploads to Cloudinary
  await createCity(formData);
};
```

## Auto-Optimizations Applied

Every Cloudinary URL automatically includes:

| Transform | Benefit |
|-----------|---------|
| `f_auto` | Choose best format (WebP/JPEG/PNG) |
| `q_auto` | Adaptive quality (saves 15-20% bandwidth) |
| `w_auto` | Responsive sizing per device |
| `dpr_auto` | Device pixel ratio scaling |

Example URL:
```
https://res.cloudinary.com/stemcity/image/upload/
f_auto/q_auto/dpr_auto/w_800/
stemcity/gallery/city1
```

## Common Tasks

### Upload New Media
1. Go to https://cloudinary.com/console/media_library
2. Upload files
3. Organize in folders: `stemcity/assets/`, `stemcity/gallery/`, etc.
4. Copy public ID
5. Use in code: `getCloudinaryImageUrl('stemcity/path/to/image')`

### Change Image Size
```javascript
// Before (400px)
getCloudinaryImageUrl('stemcity/gallery/city1', { width: 400 })

// After (800px)
getCloudinaryImageUrl('stemcity/gallery/city1', { width: 800 })
```

### Different Crop/Focus
```javascript
// Auto-focus (default)
getCloudinaryImageUrl(id, { crop: 'fill', gravity: 'auto' })

// Face focus
getCloudinaryImageUrl(id, { crop: 'fill', gravity: 'face' })

// Center focus
getCloudinaryImageUrl(id, { crop: 'fill', gravity: 'center' })

// Scale to fit (no crop)
getCloudinaryImageUrl(id, { crop: 'scale' })
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Images don't load | Check `.env` has correct Cloud Name |
| Can't find public ID | Verify media uploaded to Cloudinary dashboard |
| 404 errors | Check public ID exactly matches (case-sensitive) |
| Uploads fail | Verify backend `.env` has Cloudinary credentials |
| Slow loading | Check image sizes in Network tab, verify transformations |
| Broken on mobile | Verify lazy loading attribute `loading="lazy"` |

## Environment Variables

```bash
# Required
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Optional (for client-side uploads)
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=stemcity_uploads
```

## Files Modified

### Admin
- `src/utils/cloudinary.js` - New utility functions
- `src/components/LazyImage.jsx` - Lazy image component
- `src/components/layout/Navbar.jsx` - Updated logo
- `src/components/layout/Sidebar.jsx` - Updated logo
- `src/pages/Dashboard.jsx` - Updated dashboard images
- `.env.example` - Environment template

### Frontend_new
- `src/utilities/cloudinary.js` - New utility functions
- `src/components/LazyImage.jsx` - Lazy image component
- `src/components/Navbar.jsx` - Updated logo
- `src/utilities/Card.jsx` - Updated to use Cloudinary URLs
- `src/pages/Home.jsx` - Updated all gallery images
- `.env.example` - Environment template

## Next Steps

1. ✅ Set up `.env` files with credentials
2. ✅ Restart dev servers
3. ✅ Verify images load
4. ✅ Upload legacy media to Cloudinary (optional, can use existing)
5. ✅ Deploy to production

## Questions?

Refer to:
- 📖 [Full Migration Guide](./CLOUDINARY_FRONTEND_MIGRATION.md)
- ✅ [Implementation Checklist](./IMPLEMENTATION_CHECKLIST.md)
- 🔗 [Cloudinary Docs](https://cloudinary.com/documentation)

---

**Status**: 🟢 Ready to Deploy  
**Tested**: April 20, 2026
