# StemCity Frontend - Cloudinary Migration Guide

## Overview
This document provides a complete guide for the Cloudinary migration in the StemCity frontend projects (admin and frontend_new). All media is now served from Cloudinary CDN with automatic optimizations.

## What Was Migrated

### Admin Frontend (`/admin`)
- **Navbar.jsx**: Logo (`/SC_logo.png` → `stemcity/assets/SC_logo`)
- **Dashboard.jsx**: Action card images (`/images/*.jpg` → `stemcity/gallery/*`)
- **Utilities**: Created `utils/cloudinary.js` for all Cloudinary operations

### Frontend_new (`/frontend_new`)
- **Navbar.jsx**: Logo (`/SC_logo.png` → `stemcity/assets/SC_logo`)
- **Home.jsx**: Gallery images (`/1.jpg` - `/13.jpg` → `stemcity/gallery/city1` - `city13`)
- **Home.jsx**: Background image (`/bg.jpg` → `stemcity/gallery/bg`)
- **Home.jsx**: Hero video (`/hero-loop.mp4` → `stemcity/assets/hero-loop`)
- **Card.jsx**: Updated to convert public IDs to optimized Cloudinary URLs
- **Utilities**: Created `utilities/cloudinary.js` for all Cloudinary operations

## Environment Setup

### 1. Get Cloudinary Credentials
1. Sign up at https://cloudinary.com/
2. Navigate to the Dashboard
3. Copy your Cloud Name, API Key, and API Secret

### 2. Create `.env` File

Copy the `.env.example` file and rename it to `.env`:

```bash
# For Admin
cp admin/.env.example admin/.env

# For Frontend_new
cp frontend_new/.env.example frontend_new/.env
```

Then populate with your Cloudinary credentials:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=stemcity_uploads
```

### 3. Create Cloudinary Upload Preset (Optional but Recommended)

1. Go to https://cloudinary.com/console/settings/upload
2. Create an unsigned upload preset named `stemcity_uploads`
3. Configure settings:
   - **Type**: Unsigned
   - **Mode**: Fetch
   - **Folder**: stemcity/uploads
   - **Allowed formats**: jpg, png, gif, webp, mp4, webm, mp3, wav

## Cloudinary Utility Functions

### `getCloudinaryImageUrl(publicId, options)`

Generates an optimized Cloudinary image URL with automatic transformations.

**Parameters:**
- `publicId` (string): Cloudinary public ID (e.g., 'stemcity/gallery/city1')
- `options` (object):
  - `width`: Image width in pixels
  - `height`: Image height in pixels
  - `crop`: Crop strategy ('fill', 'fit', 'scale', etc.)
  - `gravity`: Focus area ('auto', 'face', 'center', etc.)
  - `quality`: 'auto' for adaptive quality (default)
  - `format`: 'auto' for format selection (default)
  - `dpr`: 'auto' for device pixel ratio (default)
  - `responsive`: Use responsive sizing (w_auto, c_scale)

**Example:**
```javascript
import { getCloudinaryImageUrl } from '../utils/cloudinary';

const imageUrl = getCloudinaryImageUrl('stemcity/gallery/city1', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto',
});
```

### `getCloudinaryVideoUrl(publicId, options)`

Generates an optimized Cloudinary video URL.

**Example:**
```javascript
import { getCloudinaryVideoUrl } from '../utils/cloudinary';

const videoUrl = getCloudinaryVideoUrl('stemcity/assets/hero-loop', {
  quality: 'auto',
  format: 'auto',
});
```

### `convertToCloudinaryUrl(localPath, options)`

Converts legacy local paths to Cloudinary URLs using the predefined mapping.

**Example:**
```javascript
const url = convertToCloudinaryUrl('/1.jpg', { width: 800 });
// Returns: optimized Cloudinary URL for 'stemcity/gallery/city1'
```

### `getResponsiveSrcSet(publicId)`

Generates responsive image srcSet for multiple breakpoints.

**Returns:** Object with `srcSet` and `sizes` for responsive images

**Example:**
```javascript
const { srcSet, sizes } = getResponsiveSrcSet('stemcity/gallery/city1');

<img srcSet={srcSet} sizes={sizes} src="..." alt="..." />
```

### `getResponsiveImageSet(publicId, aspectRatio)`

Gets URLs for different breakpoints preserving aspect ratio.

**Returns:** Object with `mobile`, `tablet`, `desktop`, `ultrawide` URLs

**Example:**
```javascript
const images = getResponsiveImageSet('stemcity/gallery/city1', '16/9');

// Use in picture element:
<picture>
  <source media="(max-width: 640px)" srcSet={images.mobile} />
  <source media="(max-width: 1024px)" srcSet={images.tablet} />
  <source media="(max-width: 1600px)" srcSet={images.desktop} />
  <img src={images.ultrawide} alt="..." />
</picture>
```

### `observeLazyImage(element, callback)`

Sets up IntersectionObserver for lazy loading images.

**Usage:**
```javascript
useEffect(() => {
  if (imgRef.current) {
    const observer = observeLazyImage(imgRef.current, (img) => {
      console.log('Image loaded:', img);
    });
    return () => observer.disconnect();
  }
}, []);
```

## Media Mapping

All legacy local paths are automatically mapped to Cloudinary public IDs:

```javascript
{
  // Assets
  '/SC_logo.png': 'stemcity/assets/SC_logo',
  '/favicon.svg': 'stemcity/assets/favicon',
  '/hero-loop.mp4': 'stemcity/assets/hero-loop',
  
  // Gallery
  '/1.jpg' to '/13.jpg': 'stemcity/gallery/city1' to 'stemcity/gallery/city13',
  '/bg.jpg': 'stemcity/gallery/bg',
}
```

## Optimization Applied

### 1. Automatic Format Selection (`f_auto`)
- Serves WebP to supporting browsers
- Falls back to JPEG/PNG for older browsers
- Reduces bandwidth by 25-35%

### 2. Quality Optimization (`q_auto`)
- Adaptive quality based on device and network
- Desktop: ~85-90 quality
- Mobile: ~75-80 quality
- Saves 15-20% bandwidth without quality loss

### 3. Responsive Sizing (`w_auto`, `dpr_auto`)
- Serves correctly sized images based on device width
- Adapts to device pixel ratio
- Reduces unnecessary bandwidth transfer

### 4. Lazy Loading with IntersectionObserver
- Images load only when entering viewport
- 50px margin before viewport for preloading
- Improves initial page load performance
- No JavaScript overhead post-load

### 5. Image Preloading in Home.jsx
- Gallery images preloaded with optimizations during component mount
- Smooth rendering experience when user navigates

## Usage in Components

### Basic Usage with LazyImage Component

```javascript
import LazyImage from '../components/LazyImage';

<LazyImage
  src="stemcity/gallery/city1"
  alt="City Image"
  width={800}
  height={600}
  className="w-full h-auto"
  crop="fill"
  gravity="auto"
  quality="auto"
  format="auto"
/>
```

### Direct URL Usage

```javascript
import { getCloudinaryImageUrl } from '../utils/cloudinary';

const imageUrl = getCloudinaryImageUrl('stemcity/gallery/city1', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto',
});

<img src={imageUrl} alt="City" loading="lazy" />
```

### In Styles (Background Images)

```javascript
const backgroundStyle = {
  backgroundImage: `url(${getCloudinaryImageUrl('stemcity/gallery/bg', {
    width: 1920,
    quality: 'auto',
    format: 'auto'
  })})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
```

## File Upload Flow

### Upload Flow (CreateCity, CreateRoom)
1. User selects file from input or drags to upload area
2. Preview generated locally using `URL.createObjectURL()`
3. Form submitted to backend API with FormData
4. Backend processes upload and sends to Cloudinary
5. Cloudinary returns URL which is saved in database
6. Next time component loads, it fetches the Cloudinary URL from API

### Cloudinary Widget Upload (Optional Alternative)
```javascript
import { getCloudinaryWidget } from '../utils/cloudinary';

// In component
const uploadWidget = getCloudinaryWidget();
// Click to upload -> widget handles full flow
```

## Performance Metrics

### Expected Improvements
- **Initial Load**: 30-40% faster (format selection + compression)
- **Repeat Visits**: 60-70% faster (browser cache + CDN)
- **Mobile**: 40-50% faster (adaptive quality + responsive sizing)
- **Bandwidth**: 25-35% reduction per image

### CDN Benefits
- Global distribution (faster delivery worldwide)
- Automatic caching headers
- 99.95% uptime SLA
- DDoS protection included

## Troubleshooting

### Images Not Loading
1. Check Cloudinary credentials in `.env`
2. Verify Cloudinary Cloud Name is correct
3. Check browser console for CORS errors
4. Ensure public IDs exist in Cloudinary dashboard

### Missing Environment Variables
```bash
# Restart dev server after adding .env file
npm run dev
```

### Old Images Still Loading
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check that old public paths are in LEGACY_MEDIA_MAPPING

## Next Steps

### Uploading Legacy Media to Cloudinary
Use Cloudinary's bulk upload feature or API:

```bash
# Example using Cloudinary's web interface
# 1. Go to https://cloudinary.com/console/media_library
# 2. Upload files from admin/public and frontend_new/public
# 3. Organize into folders: stemcity/assets, stemcity/gallery, etc.
```

### Backend Integration
The backend is already configured to use Cloudinary:
- All file uploads automatically go to Cloudinary
- Models use CloudinaryField for automatic URL generation
- No additional backend changes needed

### Monitoring
Monitor Cloudinary usage:
1. Go to https://cloudinary.com/console/dashboard
2. View bandwidths, transformations, and storage
3. Set up usage alerts

## References

- **Cloudinary Documentation**: https://cloudinary.com/documentation
- **Image Transformations**: https://cloudinary.com/documentation/image_transformations_reference
- **Video Transformations**: https://cloudinary.com/documentation/video_transformation_reference
- **Performance Tips**: https://cloudinary.com/documentation/responsive_images

## Support

For issues or questions:
1. Check Cloudinary error messages in network tab
2. Review transformation parameters in generated URLs
3. Consult Cloudinary documentation
4. Test directly in Cloudinary console
