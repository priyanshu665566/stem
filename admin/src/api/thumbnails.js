import API from './axiosInstance'

/**
 * Get all thumbnails with optional pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 12)
 * @returns {Promise}
 */
export const getAllThumbnails = (page = 1, perPage = 12) =>
    API.get('/auth/thumbnails/', {
        params: { page, per_page: perPage }
    })

/**
 * Get only featured thumbnails (max 4)
 * @returns {Promise}
 */
export const getFeaturedThumbnails = () =>
    API.get('/auth/thumbnails/featured/')

/**
 * Upload new thumbnail image
 * @param {FormData} formData - Form data with 'image' and optional 'title' fields
 * @returns {Promise}
 */
export const createThumbnail = (formData) =>
    API.post('/auth/thumbnails/create/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

/**
 * Delete thumbnail from database and Cloudinary
 * @param {number} thumbnailId - Thumbnail ID to delete
 * @returns {Promise}
 */
export const deleteThumbnail = (thumbnailId) =>
    API.delete(`/auth/thumbnails/${thumbnailId}/delete/`)

/**
 * Toggle featured status of a thumbnail (max 4 featured allowed)
 * @param {number} thumbnailId - Thumbnail ID to toggle
 * @returns {Promise}
 */
export const toggleFeaturedThumbnail = (thumbnailId) =>
    API.patch(`/auth/thumbnails/${thumbnailId}/feature/`)

/**
 * Update thumbnail details (title, sort_order, etc.)
 * @param {number} thumbnailId - Thumbnail ID to update
 * @param {Object} data - Data to update
 * @returns {Promise}
 */
export const updateThumbnail = (thumbnailId, data) =>
    API.patch(`/auth/thumbnails/${thumbnailId}/update/`, data)

/**
 * Increment usage count when thumbnail is selected
 * @param {number} thumbnailId - Thumbnail ID
 * @returns {Promise}
 */
export const incrementThumbnailUsage = (thumbnailId) =>
    API.patch(`/auth/thumbnails/${thumbnailId}/increment-usage/`)
