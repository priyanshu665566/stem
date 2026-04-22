/**
 * Cloudinary Configuration and Utility Functions
 * 
 * Handles all Cloudinary media operations:
 * - URL generation with optimizations
 * - Image transformations
 * - Lazy loading helpers
 */

const CLOUDINARY_CONFIG = {
    CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'stemcity',
    API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY,
    API_SECRET: import.meta.env.VITE_CLOUDINARY_API_SECRET,
    UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'stemcity_uploads',
};

// Base Cloudinary URL
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`;
const CLOUDINARY_VIDEO_URL = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/video/upload`;

/**
 * Generate a Cloudinary image URL with optimizations
 * @param {string} publicId - Cloudinary public ID (folder/filename)
 * @param {Object} options - Transformation options
 * @returns {string} Optimized Cloudinary URL
 */
export const getCloudinaryImageUrl = (publicId, options = {}) => {
    if (!publicId) return '';

    const {
        width,
        height,
        crop = 'fill',
        gravity = 'auto',
        quality = 'auto:best',
        format = 'auto',
        dpr = 'auto',
        responsive = false,
        fetchFormat = 'auto',
        flags = [],
        ...customTransforms
    } = options;

    let transforms = [];

    // Quality optimization
    if (quality === 'auto' || quality) {
        transforms.push(`q_${quality}`);
    }

    // Format optimization
    if (format === 'auto' || format) {
        transforms.push(`f_${format}`);
    }

    // DPR (Device Pixel Ratio) - responsive for all devices
    if (dpr === 'auto' || dpr) {
        transforms.push(`dpr_${dpr}`);
    }

    // Responsive width
    if (responsive) {
        transforms.push('w_auto', 'c_scale');
    } else if (width && height) {
        transforms.push(
            `w_${Math.round(width)}`,
            `h_${Math.round(height)}`,
            `c_${crop}`,
            `g_${gravity}`
        );
    } else if (width) {
        transforms.push(
            `w_${Math.round(width)}`,
            `c_fill`,
            `g_auto`
        );
    }

    // Custom flags for optimization
    if (flags.length > 0) {
        transforms.push(`fl_${flags.join(',')}`);
    }

    // Add any additional custom transforms
    Object.entries(customTransforms).forEach(([key, value]) => {
        if (value) transforms.push(`${key}_${value}`);
    });

    const transformString = transforms.join('/');
    return `${CLOUDINARY_BASE_URL}${transformString ? '/' + transformString : ''}/${publicId}`;
};

/**
 * Generate a Cloudinary video URL with optimizations
 * @param {string} publicId - Cloudinary public ID (folder/filename)
 * @param {Object} options - Transformation options
 * @returns {string} Optimized Cloudinary video URL
 */
export const getCloudinaryVideoUrl = (publicId, options = {}) => {
    if (!publicId) return '';

    const {
        width,
        quality = 'auto:best',
        format = 'auto',
        ...customTransforms
    } = options;

    let transforms = [];

    if (quality === 'auto' || quality) {
        transforms.push(`q_${quality}`);
    }

    if (format === 'auto' || format) {
        transforms.push(`f_${format}`);
    }

    if (width) {
        transforms.push(`w_${width}`, 'c_scale');
    }

    Object.entries(customTransforms).forEach(([key, value]) => {
        if (value) transforms.push(`${key}_${value}`);
    });

    const transformString = transforms.join('/');
    return `${CLOUDINARY_VIDEO_URL}${transformString ? '/' + transformString : ''}/${publicId}`;
};

/**
 * Mapping of local media files to Cloudinary public IDs
 * This maps legacy local paths to Cloudinary storage
 */

/**
 * Convert legacy local path to Cloudinary URL
 * @param {string} localPath - Local file path
 * @param {Object} options - Transformation options
 * @returns {string} Cloudinary URL or fallback
 */


/**
 * Lazy loading observer - preload images above viewport fold
 * Usage: <img ref={imgRef} data-src="..." onLoad={trackImageLoad} ... />
 */
export const observeLazyImage = (element, callback) => {
    if (!element) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const cloudinarySrc = img.dataset.src;

                    if (cloudinarySrc) {
                        img.src = cloudinarySrc;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                        callback?.(img);
                    }
                }
            });
        },
        {
            rootMargin: '50px', // Start loading 50px before entering viewport
        }
    );

    observer.observe(element);
    return observer;
};

export default {
    CLOUDINARY_CONFIG,
    CLOUDINARY_BASE_URL,
    CLOUDINARY_VIDEO_URL,
    getCloudinaryImageUrl,
    getCloudinaryVideoUrl,
    observeLazyImage,
};
