import React, { useRef } from 'react';

/**
 * DEPRECATED: LazyImage Component
 * 
 * This component is deprecated and kept for backward compatibility.
 * Use SmartImage component instead for better format support (AVIF, WebP, JPG fallback).
 * 
 * This component now simply renders a lazy-loaded image without Cloudinary transformations.
 * It works with local image URLs from the backend storage.
 * 
 * Usage:
 * <LazyImage
 *   src="/media/images/image.jpg"
 *   alt="Description"
 *   className="w-full h-auto"
 * />
 * 
 * Recommended replacement:
 * <SmartImage
 *   avif="/media/images/avif/image.avif"
 *   webp="/media/images/webp/image.webp"
 *   fallback="/media/images/image.jpg"
 *   alt="Description"
 * />
 */
const LazyImage = ({
    src,
    alt = 'Image',
    className = '',
    onLoad = null,
    style = {},
    ...props
}) => {
    const imgRef = useRef(null);

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300`}
            loading="lazy"
            decoding="async"
            onLoad={() => {
                if (imgRef.current) {
                    imgRef.current.style.opacity = '1';
                }
                onLoad?.();
            }}
            style={{
                opacity: '0.8',
                ...style,
            }}
            {...props}
        />
    );
};

export default LazyImage;
