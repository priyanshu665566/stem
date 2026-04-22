# Admin React App - Cloudinary to Local Storage Migration Guide

## Overview

The Admin React app is a custom CMS for managing content. It currently uses Cloudinary SDK functions for image manipulation and display.

This migration replaces:
- `getCloudinaryImageUrl()` → Use SmartImage component with image URL variants
- `getCloudinaryVideoUrl()` → Use `<video>` tag with local URL
- `LazyImage` component → SmartImage component
- Cloudinary utilities → Removed (no longer needed)

## Changes Required

### 1. Delete/Deprecate Files
- `src/utils/cloudinary.js` - REMOVE (no longer needed, utilities replaced by backend)
- `src/components/LazyImage.jsx` - REMOVE (replaced by SmartImage)

### 2. Update Files

#### a) `src/components/SmartImage.jsx` - ADD (already created)
This is the new component for image display with format support.

#### b) `src/components/layout/Navbar.jsx`
**BEFORE:**
```jsx
import { getCloudinaryImageUrl } from "../../utils/cloudinary";

// Usage:
<img src={getCloudinaryImageUrl('stemcity/assets/SC_logo', { width: 14, height: 14 })} alt="" />
```

**AFTER:**
```jsx
import SmartImage from '../SmartImage';

// Usage - for static assets, just use direct local URL:
<img src="/images/logo.png" alt="Logo" />

// For dynamic images from API:
<SmartImage
  avif={logoImage.avif}
  webp={logoImage.webp}
  fallback={logoImage.original}
  alt="Logo"
  width={14}
  height={14}
/>
```

#### c) `src/components/layout/Sidebar.jsx`
Same changes as Navbar - remove getCloudinaryImageUrl and use SmartImage

#### d) `src/pages/Dashboard.jsx`
Replace getCloudinaryImageUrl with SmartImage or direct static URLs

#### e) `src/pages/CreateCity.jsx` and `src/pages/CreateRoom.jsx`
Update form handling to accept the new image format:
- When uploading an image, the backend will generate 3 variants
- Store/display the response object with {original, webp, avif}
- Use SmartImage to display images

#### f) API Client Code
Update all API calls that expect Cloudinary URLs to handle the new format:

**BEFORE:**
```javascript
const city = await getCityAPI(cityId);
// Returns: city.thumbnail_url = "https://res.cloudinary.com/..."
<img src={city.thumbnail_url} alt="Thumbnail" />
```

**AFTER:**
```javascript
const city = await getCityAPI(cityId);
// Returns: city.thumbnail = { original: "...", webp: "...", avif: "..." }
<SmartImage
  avif={city.thumbnail.avif}
  webp={city.thumbnail.webp}
  fallback={city.thumbnail.original}
  alt="Thumbnail"
/>
// OR use helper:
import { buildImageProps } from '../SmartImage';
<SmartImage {...buildImageProps(city.thumbnail, 'City thumbnail')} />
```

### 3. Update Styles (if needed)

The SmartImage component includes built-in styling:
- Grey placeholder while loading (#e5e7eb)
- Smooth fade-in transition
- Content visibility optimization for offscreen images
- Aspect ratio support if width/height provided

### 4. Update Form Uploads

When uploading images through forms:
1. Send the file to the API
2. Backend processes and returns: `{ original: "...", webp: "...", avif: "..." }`
3. Store this response
4. Pass to SmartImage component

### 5. Package.json
Remove any Cloudinary packages (currently none in admin package.json):
- cloudinary ❌
- cloudinary-react ❌
- cloudinary-core ❌

Already clean - no changes needed!

## Migration Checklist

### Files to Update
- [ ] src/components/layout/Navbar.jsx
- [ ] src/components/layout/Sidebar.jsx
- [ ] src/pages/Dashboard.jsx
- [ ] src/pages/CreateCity.jsx
- [ ] src/pages/CreateRoom.jsx
- [ ] src/pages/EditCity.jsx
- [ ] src/pages/EditRoom.jsx
- [ ] src/pages/ManageCities.jsx
- [ ] src/pages/ManageRooms.jsx
- [ ] Any other components using getCloudinaryImageUrl

### Files to Delete
- [ ] src/utils/cloudinary.js
- [ ] src/components/LazyImage.jsx

### Testing Checklist
- [ ] Logo displays correctly
- [ ] City/Room thumbnails display in lists
- [ ] Upload form works and generates variants
- [ ] Images fade in smoothly when loading
- [ ] Lazy loading works (images load as they enter viewport)
- [ ] Browser DevTools shows images loading in correct format (WebP/AVIF when supported)

## Example: Before & After

### Before (Cloudinary)
```jsx
import LazyImage from '../components/LazyImage';

function CityCard({ city }) {
  return (
    <div>
      <LazyImage
        src={`stemcity/city_thumbnails/${city.id}`}
        alt={city.name}
        width={400}
        height={300}
      />
      <h3>{city.name}</h3>
    </div>
  );
}
```

### After (Local Storage)
```jsx
import SmartImage, { buildImageProps } from '../components/SmartImage';

function CityCard({ city }) {
  return (
    <div>
      <SmartImage
        {...buildImageProps(city.thumbnail, city.name)}
        width={400}
        height={300}
      />
      <h3>{city.name}</h3>
    </div>
  );
}
```

## Benefits of SmartImage

✅ Automatic format negotiation (AVIF → WebP → JPG)
✅ Lazy loading built-in (400px before viewport)
✅ Priority support for above-fold images
✅ No external dependencies (pure React)
✅ Better performance (content-visibility: auto)
✅ Smaller file sizes with AVIF/WebP
✅ Fallback support for older browsers
✅ Accessibility support (alt text, proper attributes)

## API Response Format

The API now returns image data as:

```json
{
  "id": 1,
  "thumbnail": {
    "original": "http://localhost:8000/media/city_thumbnails/thumbnail_1.jpg",
    "webp": "http://localhost:8000/media/city_thumbnails/webp/thumbnail_1.webp",
    "avif": "http://localhost:8000/media/city_thumbnails/avif/thumbnail_1.avif"
  },
  "flyin_graphic": {
    "original": "...",
    "webp": "...",
    "avif": "..."
  }
}
```

All image-related fields follow this pattern.

## Support & Troubleshooting

### Images not loading?
1. Check browser console for errors
2. Verify URLs are correct using DevTools Network tab
3. Ensure backend is serving media files (MEDIA_URL configured)
4. Check that image processing succeeded (check /media/webp/ directory exists)

### Format not negotiating correctly?
1. Check browser support (AVIF: Chrome 85+, Safari 16+; WebP: Chrome 23+, Firefox 65+)
2. Verify fallback URL is correct
3. Use DevTools to see which format was loaded

### Performance issues?
1. Ensure priority=true for above-fold images
2. Check that lazy loading is working (use DevTools Lighthouse)
3. Verify WebP/AVIF files are smaller than originals
4. Consider responsive image sizes with srcset if needed

## Next Steps

1. Update each component listed in checklist
2. Test thoroughly
3. Delete old cloudinary.js and LazyImage.jsx
4. Deploy to staging
5. Verify in production
