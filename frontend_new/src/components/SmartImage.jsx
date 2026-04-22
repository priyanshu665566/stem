import React, { useEffect, useRef, useState } from 'react';

/**
 * SmartImage Component - Optimized image display with multiple format support
 * 
 * Replaces cloudinary-react and implements:
 * - AVIF, WebP, and JPG format fallback via <picture> tag
 * - IntersectionObserver-based lazy loading with configurable rootMargin
 * - Priority loading (skip lazy loading for above-fold images)
 * - Loading state with fade-in animation
 * - Proper fetchpriority and decoding attributes
 * - content-visibility: auto for offscreen images (requires CSS support)
 * - Grey placeholder while loading
 * 
 * Usage:
 * <SmartImage
 *   avif="/media/avatars/avif/avatar_1.avif"
 *   webp="/media/avatars/webp/avatar_1.webp"
 *   fallback="/media/avatars/avatar_1.jpg"
 *   alt="User Avatar"
 *   width={200}
 *   height={200}
 *   priority={false}
 *   loading="lazy"
 *   className="w-32 h-32 rounded-full object-cover"
 * />
 * 
 * Props:
 *   - avif: string - URL to AVIF format image (best compression, modern browsers)
 *   - webp: string - URL to WebP format image (good compression, broader support)
 *   - fallback: string - URL to JPG/PNG fallback (universal support)
 *   - alt: string - Alt text for accessibility (REQUIRED)
 *   - width: number - Image width in pixels (optional, improves layout stability)
 *   - height: number - Image height in pixels (optional, improves layout stability)
 *   - priority: boolean - If true, disables lazy loading (default: false)
 *   - loading: string - 'lazy' or 'eager' (default: 'lazy')
 *   - className: string - CSS classes for styling (default: '')
 *   - style: object - Inline styles (default: {})
 *   - onLoad: function - Callback when image loads
 *   - onError: function - Callback if image fails to load
 *   - ...rest - Any other HTML <img> attributes (src, id, data-*, etc.)
 */
const SmartImage = ({
  avif = null,
  webp = null,
  fallback = null,
  alt = 'Image',
  width = undefined,
  height = undefined,
  priority = false,
  loading = 'lazy',
  className = '',
  style = {},
  onLoad = null,
  onError = null,
  ...props
}) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(priority);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Priority images are loaded immediately, no lazy loading
    if (priority) {
      setIsLoaded(true);
      return;
    }

    // Set up IntersectionObserver for lazy loading
    const observerOptions = {
      root: null, // viewport
      rootMargin: '400px', // Start loading 400px before image enters viewport
      threshold: 0, // Trigger as soon as any part is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Image is now in (or near) viewport, load it
          setIsLoaded(true);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    observer.observe(imgElement);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Determine which format to use based on what's available
  const shouldUsePicture = (avif || webp) && fallback;

  // Combine default styles with passed styles
  const combinedStyle = {
    // Grey placeholder while loading
    backgroundColor: !isLoaded ? '#e5e7eb' : 'transparent',
    // Smooth fade-in transition
    transition: 'opacity 300ms ease-in-out, background-color 300ms ease-in-out',
    opacity: isLoaded ? 1 : 0.8,
    // content-visibility improves offscreen performance (for browsers that support it)
    contentVisibility: loading === 'lazy' && !priority ? 'auto' : 'visible',
    // Aspect ratio placeholder (if width/height provided)
    ...(width && height && {
      aspectRatio: `${width} / ${height}`,
    }),
    ...style,
  };

  // Determine fetchpriority attribute (hint to browser about loading priority)
  const fetchPriority = priority ? 'high' : loading === 'eager' ? 'high' : 'auto';

  if (shouldUsePicture) {
    return (
      <picture>
        {/* AVIF format - best compression, smallest file size */}
        {avif && isLoaded && <source srcSet={avif} type="image/avif" />}

        {/* WebP format - good compression, broad browser support */}
        {webp && isLoaded && <source srcSet={webp} type="image/webp" />}

        {/* JPG/PNG fallback - universal support */}
        <img
          ref={imgRef}
          src={isLoaded ? fallback : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={fetchPriority}
          className={className}
          style={combinedStyle}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </picture>
    );
  }

  // Fallback to single image if no format variants provided
  if (fallback) {
    return (
      <img
        ref={imgRef}
        src={isLoaded ? fallback : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={fetchPriority}
        className={className}
        style={combinedStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }

  // No image URL provided
  if (!avif && !webp && !fallback) {
    console.warn('SmartImage: No image URL provided (avif, webp, or fallback)');
    return null;
  }

  return null;
};

export default SmartImage;

/**
 * UTILITY FUNCTION: Extract format URLs from API response
 * 
 * This helper function makes it easy to pass image data from the API
 * to the SmartImage component.
 * 
 * Usage:
 * const imageUrls = extractImageUrls(city.thumbnail);
 * <SmartImage {...imageUrls} alt="City thumbnail" />
 * 
 * API Response Format:
 * {
 *   "thumbnail": {
 *     "original": "http://localhost:8000/media/city_thumbnails/thumbnail_1.jpg",
 *     "webp": "http://localhost:8000/media/city_thumbnails/webp/thumbnail_1.webp",
 *     "avif": "http://localhost:8000/media/city_thumbnails/avif/thumbnail_1.avif"
 *   }
 * }
 */
export const extractImageUrls = (imageData) => {
  if (!imageData) {
    return {
      avif: null,
      webp: null,
      fallback: null,
    };
  }

  // Handle if imageData is an object with original, webp, avif
  if (imageData.original || imageData.webp || imageData.avif) {
    return {
      avif: imageData.avif,
      webp: imageData.webp,
      fallback: imageData.original,
    };
  }

  // Handle if imageData is already a URL string (fallback)
  if (typeof imageData === 'string') {
    return {
      avif: null,
      webp: null,
      fallback: imageData,
    };
  }

  return {
    avif: null,
    webp: null,
    fallback: null,
  };
};

/**
 * UTILITY FUNCTION: Build image props for API response
 * 
 * This helper function simplifies destructuring API responses
 * into SmartImage-ready props.
 * 
 * Usage:
 * const imageProps = buildImageProps(city.thumbnail, 'City thumbnail');
 * <SmartImage {...imageProps} />
 */
export const buildImageProps = (imageData, alt = 'Image') => {
  const urls = extractImageUrls(imageData);
  return {
    ...urls,
    alt,
  };
};
