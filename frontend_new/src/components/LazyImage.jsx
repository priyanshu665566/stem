import React, { useEffect, useRef, useState } from 'react';
import { observeLazyImage } from '../utilities/cloudinary';

/**
 * LazyImage Component - Loads images with IntersectionObserver
 * 
 * Usage:
 * <LazyImage
 *   src="cloudinary_public_id"
 *   alt="Description"
 *   className="w-full h-auto"
 *   placeholderSrc="placeholder_public_id"
 * />
 */
const LazyImage = ({
    src,
    alt = 'Image',
    className = '',
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    placeholderSrc = null,
    onLoad = null,
    style = {},
    ...props
}) => {
    const imgRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [observerInstance, setObserverInstance] = useState(null);

    useEffect(() => {
        // Build complete Cloudinary URL with transformations
        const { getCloudinaryImageUrl } = require('../utilities/cloudinary');
        
        const cloudinarySrc = getCloudinaryImageUrl(src, {
            width,
            height,
            crop,
            gravity,
            quality,
            format,
        });

        if (imgRef.current) {
            // Build placeholder URL if provided
            let placeholderUrl = null;
            if (placeholderSrc) {
                placeholderUrl = getCloudinaryImageUrl(placeholderSrc, {
                    width: 10,
                    quality: 60,
                    format: 'auto',
                });
                imgRef.current.src = placeholderUrl;
            }

            // Set up the lazy loading observer
            const observer = observeLazyImage(imgRef.current, (img) => {
                setImageLoaded(true);
                onLoad?.(img);
            });

            // Store data-src for intersection observer to load
            imgRef.current.dataset.src = cloudinarySrc;
            setObserverInstance(observer);
        }

        return () => {
            // Cleanup observer
            if (observerInstance) {
                observerInstance.disconnect();
            }
        };
    }, [src, width, height, crop, gravity, quality, format, placeholderSrc, onLoad]);

    return (
        <img
            ref={imgRef}
            alt={alt}
            className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-75'} transition-opacity duration-300`}
            loading="lazy"
            decoding="async"
            style={{
                ...style,
                backgroundColor: '#f0f0f0', // Placeholder background
            }}
            {...props}
        />
    );
};

export default LazyImage;
