# Frontend React App - Cloudinary to Local Storage Migration Guide

## Overview

The Frontend React app is the user-facing application. It currently uses Cloudinary utilities for image URL generation and potentially displays images fetched from the API.

This migration replaces:
- Single Cloudinary URLs → SmartImage component with {original, webp, avif} format
- Direct image display → SmartImage for optimized loading
- Cloudinary transformations → Backend-generated variants

## Changes Required

### 1. Delete/Update Files
- `src/utilities/cloudinary.js` - REMOVE or update (utilities no longer needed)

### 2. Update Files

#### a) `src/components/SmartImage.jsx` - ADD (already created)
This is the new component for image display with format support.

#### b) All Pages Using Images
Update pages to use SmartImage instead of regular <img> tags where image data comes from API.

#### c) API Response Handling
Update how you handle image data from API responses:

**BEFORE:**
```javascript
// API returned single Cloudinary URL
const city = await api.getCity(cityId);
// city.thumbnail_url = "https://res.cloudinary.com/..."
<img src={city.thumbnail_url} alt="City" />
```

**AFTER:**
```javascript
// API now returns format variants
const city = await api.getCity(cityId);
// city.thumbnail = { original: "...", webp: "...", avif: "..." }
<SmartImage
  avif={city.thumbnail.avif}
  webp={city.thumbnail.webp}
  fallback={city.thumbnail.original}
  alt="City"
/>
```

### 3. Update Static Images
For static images (logos, icons, etc.), if you have them in the media folder:

**BEFORE:**
```jsx
import { getCloudinaryImageUrl } from '../utilities/cloudinary';

<img src={getCloudinaryImageUrl('stemcity/assets/logo')} alt="Logo" />
```

**AFTER:**
```jsx
// Use static local path
<img src="/images/logo.png" alt="Logo" />

// OR if serving from media folder:
<img src="/media/assets/logo.jpg" alt="Logo" />
```

### 4. Responsive Images

SmartImage includes support for responsive sizing:

```jsx
import SmartImage from '../components/SmartImage';

<SmartImage
  avif={image.avif}
  webp={image.webp}
  fallback={image.original}
  alt="Responsive image"
  width={800}
  height={600}
  className="w-full h-auto"
  style={{ maxWidth: '100%' }}
/>
```

### 5. Update Package.json

Currently frontend_new package.json doesn't have Cloudinary packages, so no changes needed.

Verify no Cloudinary dependencies:
```json
// These should NOT be present:
- "cloudinary": "x.x.x"
- "cloudinary-react": "x.x.x"
- "cloudinary-core": "x.x.x"
```

If they exist, remove them:
```bash
npm uninstall cloudinary cloudinary-react cloudinary-core
```

## Migration Checklist

### Identify Components to Update
- [ ] Search codebase for API calls fetching image data
- [ ] Search for direct <img> tags using Cloudinary URLs
- [ ] Search for getCloudinaryImageUrl usage
- [ ] Review all pages that display cities, rooms, or user profiles

### Update Each Component
- [ ] Import SmartImage component
- [ ] Replace <img> with <SmartImage>
- [ ] Pass {avif, webp, fallback} from API response
- [ ] Test image loading and format negotiation

### Cleanup
- [ ] Delete src/utilities/cloudinary.js
- [ ] Remove any Cloudinary imports from components
- [ ] Run linter to find any missed imports

### Testing
- [ ] All images load correctly
- [ ] Lazy loading works (images load as they enter viewport)
- [ ] Formats negotiate correctly (check DevTools)
- [ ] No console errors
- [ ] Mobile responsive layouts work

## Example: City List Page

### Before (Cloudinary)
```jsx
import { getCloudinaryImageUrl } from '../utilities/cloudinary';

function CityList() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const data = await api.getCities();
    setCities(data);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {cities.map(city => (
        <div key={city.id} className="border p-4">
          <img
            src={getCloudinaryImageUrl(`stemcity/city_thumbnails/${city.id}`, {
              width: 400,
              height: 300,
              crop: 'fill'
            })}
            alt={city.name}
            className="w-full h-64 object-cover"
          />
          <h3>{city.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

### After (Local Storage)
```jsx
import SmartImage, { buildImageProps } from '../components/SmartImage';

function CityList() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const data = await api.getCities();
    setCities(data);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {cities.map(city => (
        <div key={city.id} className="border p-4">
          <SmartImage
            {...buildImageProps(city.thumbnail, city.name)}
            width={400}
            height={300}
            className="w-full h-64 object-cover"
          />
          <h3>{city.name}</h3>
        </div>
      ))}
    </div>
  );
}
```

## Benefits

✅ Smaller image files (AVIF/WebP compression)
✅ Faster page loads (lazy loading + format optimization)
✅ Automatic format selection based on browser support
✅ No external CDN dependency
✅ Better privacy (no Cloudinary tracking)
✅ No rate limiting issues
✅ Full control over image processing

## API Response Example

When fetching a city:

```json
{
  "id": 1,
  "name": "New York City",
  "thumbnail": {
    "original": "http://localhost:8000/media/city_thumbnails/thumbnail_1.jpg",
    "webp": "http://localhost:8000/media/city_thumbnails/webp/thumbnail_1.webp",
    "avif": "http://localhost:8000/media/city_thumbnails/avif/thumbnail_1.avif"
  },
  "flyin_graphic": {
    "original": "...",
    "webp": "...",
    "avif": "..."
  },
  "rooms": [...]
}
```

All image fields follow this consistent format.

## Troubleshooting

### Images not showing?
1. Check browser DevTools Network tab - are requests being made?
2. Verify URLs are correct (should start with http://localhost:8000/media/)
3. Check that backend is running and media files exist
4. Look for console errors

### Format not changing?
1. Open DevTools → Network tab → Filter by Img
2. Click an image and check Response Headers for Content-Type
3. Verify browser supports the format being used
4. Check that WebP/AVIF files were generated by backend

### Lazy loading not working?
1. Open DevTools → Performance
2. Check that images are not loaded until scrolled into view
3. Verify IntersectionObserver is supported in target browsers
4. Check for console errors related to lazy loading

## File Size Comparison

With proper optimization:
- JPG (original): 150-300 KB
- WebP: 50-100 KB (65-70% smaller)
- AVIF: 30-60 KB (80% smaller)

Actual improvements depend on image content and quality settings.

## Browser Support

| Format | Chrome | Firefox | Safari | Edge | Mobile |
|--------|--------|---------|--------|------|--------|
| JPG    | ✅ All | ✅ All  | ✅ All | ✅ All | ✅ All |
| WebP   | ✅ 23+ | ✅ 65+  | ✅ 16+ | ✅ 18+ | ✅ All modern |
| AVIF   | ✅ 85+ | ⚠️ 113+ | ✅ 16+ | ✅ 85+ | ⚠️ Limited |

SmartImage will automatically fallback to supported formats for older browsers.

## Performance Tips

1. **Use priority for above-fold images:**
   ```jsx
   <SmartImage {...imageProps} priority={true} />
   ```

2. **Specify dimensions to prevent layout shift:**
   ```jsx
   <SmartImage {...imageProps} width={400} height={300} />
   ```

3. **Use className for responsive sizing:**
   ```jsx
   <SmartImage {...imageProps} className="w-full h-auto max-w-xl" />
   ```

4. **Monitor performance with Lighthouse:**
   - Run in browser DevTools → Lighthouse
   - Check "Defer offscreen images" audit
   - Verify images are properly optimized

## Next Steps

1. Identify all components using images from API
2. Update each to use SmartImage
3. Test thoroughly on different devices/browsers
4. Delete old cloudinary.js file
5. Deploy to staging and verify
6. Deploy to production
