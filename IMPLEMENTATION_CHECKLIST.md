# Cloudinary Migration - Implementation Checklist

## Pre-Migration Setup

- [ ] Verify Cloudinary account is created and API credentials are available
- [ ] Note down Cloud Name, API Key, and API Secret from Cloudinary console

## Frontend Setup - Admin

- [ ] Copy `.env.example` to `.env` in `/admin` directory
- [ ] Fill in Cloudinary credentials in `.env`:
  ```
  VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
  VITE_CLOUDINARY_API_KEY=your_api_key
  VITE_CLOUDINARY_API_SECRET=your_api_secret
  VITE_CLOUDINARY_UPLOAD_PRESET=stemcity_uploads
  ```
- [ ] Restart dev server: `npm run dev` in `/admin`
- [ ] Verify logo loads in:
  - [ ] Navbar (top left)
  - [ ] Sidebar (left panel)
  - [ ] "Visit Site" button in Navbar
- [ ] Check Dashboard images in ActionCard components
- [ ] Verify file uploads still work in CreateCity and CreateRoom pages

## Frontend Setup - Frontend_new

- [ ] Copy `.env.example` to `.env` in `/frontend_new` directory
- [ ] Fill in Cloudinary credentials in `.env`
- [ ] Restart dev server: `npm run dev` in `/frontend_new`
- [ ] Verify logo loads in Navbar
- [ ] Check Home page:
  - [ ] Gallery images load correctly
  - [ ] Background image displays
  - [ ] Hero video plays (optional, may show Cloudinary player)
- [ ] Verify lazy loading by scrolling through gallery
- [ ] Check browser DevTools Network tab:
  - [ ] Images should have `?f_auto&q_auto` transformations
  - [ ] Verify CDN domain is `res.cloudinary.com`

## Media Upload to Cloudinary

- [ ] Upload legacy media files to Cloudinary:
  - [ ] Admin public folder files (logos, assets)
  - [ ] Frontend public gallery images (1-13.jpg, bg.jpg)
  - [ ] Video files (hero-loop.mp4)
- [ ] Organize in Cloudinary folders:
  ```
  stemcity/
  ├── assets/
  │   ├── SC_logo
  │   ├── favicon
  │   ├── icons
  │   ├── hero-loop
  │   └── bg-image
  └── gallery/
      ├── city1 through city13
      └── bg
  ```
- [ ] Verify all files are accessible via URLs

## Browser Testing

### Image Optimization
- [ ] Open DevTools Network tab
- [ ] Verify image URLs contain:
  - [ ] `f_auto` (format selection)
  - [ ] `q_auto` (quality optimization)
  - [ ] `dpr_auto` (device pixel ratio)
  - [ ] `w_800` or similar (width)
- [ ] Check image sizes are reasonable:
  - [ ] Logo: <5KB
  - [ ] Gallery: 150-300KB (optimized)
  - [ ] Background: <500KB

### Lazy Loading
- [ ] Open Home page in frontend_new
- [ ] Open DevTools Network tab
- [ ] **Before scrolling**: Gallery images should NOT be loaded yet
- [ ] **Scroll down**: Images load as they enter viewport (50px margin)
- [ ] **Check timing**: Images load ~50px before becoming visible

### Performance
- [ ] Lighthouse audit in Chrome DevTools
  - [ ] Performance should improve vs. local files
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Network timing:
  - [ ] Initial load < 3 seconds
  - [ ] Cached visits < 1 second

## Component Verification

### Admin Components
- [ ] `Navbar.jsx`: Logo renders correctly
- [ ] `Sidebar.jsx`: Logo renders correctly
- [ ] `Dashboard.jsx`: ActionCard images display
- [ ] `CreateCity.jsx`: File uploads work, previews display
- [ ] `CreateRoom.jsx`: File uploads work, previews display

### Frontend_new Components
- [ ] `Navbar.jsx`: Logo renders
- [ ] `Home.jsx`: 
  - [ ] Hero video plays
  - [ ] Hero section displays correctly
  - [ ] Gallery grid loads with images
  - [ ] Background image displays
  - [ ] Lazy loading works
- [ ] `Card.jsx`: Images render with correct transformations

## Responsive Testing

- [ ] Desktop (1920px):
  - [ ] Images load at optimal width
  - [ ] No oversized downloads
- [ ] Tablet (768px):
  - [ ] Images scale appropriately
  - [ ] Layout remains intact
- [ ] Mobile (375px):
  - [ ] Images fit screen
  - [ ] Lazy loading kicks in below fold
  - [ ] Performance acceptable on 4G

## Error Handling

- [ ] Missing `.env` file → Check console for helpful errors
- [ ] Wrong Cloud Name → Images appear broken (404)
- [ ] Wrong credentials → Uploads fail with auth error
- [ ] Missing public ID → Fallback to blank image or error
- [ ] Network error → Check browser console

## Browser Compatibility

- [ ] Chrome/Edge (latest): All features working
- [ ] Firefox (latest): All features working
- [ ] Safari (latest):
  - [ ] Images load
  - [ ] WebP support check
  - [ ] Lazy loading works
- [ ] Mobile browsers:
  - [ ] iOS Safari
  - [ ] Android Chrome

## File Upload Verification

### CreateCity Upload Flow
1. [ ] Open CreateCity page
2. [ ] Select thumbnail image
3. [ ] Preview displays locally (URL.createObjectURL)
4. [ ] Submit form
5. [ ] File sends to backend API
6. [ ] Backend uploads to Cloudinary
7. [ ] Cloudinary returns URL
8. [ ] URL saved in database
9. [ ] Refresh page → Image loads from Cloudinary

### CreateRoom Upload Flow
- [ ] Same steps as CreateCity
- [ ] Different endpoint (rooms instead of cities)

## Network Requests Verification

Check Network tab for each request:

```
Request: https://res.cloudinary.com/stemcity/image/upload/
         f_auto/q_auto/dpr_auto/w_800/h_600/c_fill/g_auto/
         stemcity/gallery/city1

Expected:
- Status: 200
- Content-Type: image/webp or image/jpeg
- Server: cloudinary.com
- Cache-Control: public, max-age=31536000
```

## Analytics Check

- [ ] Log into Cloudinary console
- [ ] Check dashboard for:
  - [ ] Bandwidth usage
  - [ ] Number of requests
  - [ ] Transformation stats
  - [ ] Storage usage

## Troubleshooting Checklist

### Images Not Loading
- [ ] Check `.env` file exists and has correct Cloud Name
- [ ] Verify Cloudinary console shows uploaded media
- [ ] Check public IDs match exactly (case-sensitive)
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Check browser console for CORS errors
- [ ] Verify public IDs in LEGACY_MEDIA_MAPPING

### Uploads Not Working
- [ ] Verify backend is running
- [ ] Check API endpoint in console Network tab
- [ ] Verify Cloudinary credentials in backend `.env`
- [ ] Check backend Cloudinary settings in `core/settings.py`
- [ ] Review backend error logs

### Performance Issues
- [ ] Verify transformations are applied (`f_auto`, `q_auto`)
- [ ] Check image sizes in Network tab
- [ ] Verify lazy loading is active (data-src attribute)
- [ ] Check for N+1 image requests
- [ ] Review Lighthouse performance score

### Lazy Loading Not Working
- [ ] Verify LazyImage component is being used
- [ ] Check IntersectionObserver support (modern browsers)
- [ ] Verify data-src attribute is set on img elements
- [ ] Check rootMargin value (50px for preload)

## Rollback Plan

If issues occur:

1. [ ] Keep local files in `/public` directories
2. [ ] Revert component imports to local paths
3. [ ] Remove `getCloudinaryImageUrl()` calls
4. [ ] Example:
   ```javascript
   // Rollback
   src={getCloudinaryImageUrl(...)}
   // To
   src="/SC_logo.png"
   ```

## Post-Migration Cleanup

- [ ] Remove `.env.example` from git tracking (keep it)
- [ ] Add `.env` to `.gitignore` in both frontends
- [ ] Archive local media files (keep backup)
- [ ] Update documentation
- [ ] Notify team of new Cloudinary credentials location
- [ ] Train team on using Cloudinary utilities

## Success Criteria

- [ ] ✅ All logos render from Cloudinary
- [ ] ✅ All gallery images load with optimizations
- [ ] ✅ Lazy loading reduces initial load time
- [ ] ✅ File uploads work end-to-end
- [ ] ✅ No broken images or 404 errors
- [ ] ✅ Responsive images work on all devices
- [ ] ✅ Performance metrics improved vs. local files
- [ ] ✅ No console errors or warnings
- [ ] ✅ Browser compatibility verified
- [ ] ✅ Team trained and ready

## Support Contacts

- Cloudinary Support: https://support.cloudinary.com
- Cloudinary Docs: https://cloudinary.com/documentation
- Community Forum: https://cloudinary-community.github.io

---

**Last Updated**: April 20, 2026
**Status**: 🟢 Migration Complete
