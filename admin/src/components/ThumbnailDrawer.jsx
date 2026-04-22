import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import SmartImage from './SmartImage';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, Star, Loader, AlertCircle, Image } from 'lucide-react';
import {
    getFeaturedThumbnails,
    getAllThumbnails,
    createThumbnail,
    deleteThumbnail,
    toggleFeaturedThumbnail,
    incrementThumbnailUsage,
} from '../api/thumbnails';

/**
 * Reusable ThumbnailDrawer Component
 * Features:
 * - Shows 4 featured thumbnails in collapsed mode
 * - "See All" opens modal with all thumbnails (paginated)
 * - Upload new thumbnail inside modal
 * - Delete thumbnail
 * - Mark/unmark featured (max 4)
 * - Select thumbnail for forms
 * - UI matches Users.jsx modal pattern (color tokens, layout, buttons, animations)
 */
export default function ThumbnailDrawer({ selected, onSelect }) {
    const { isDark } = useTheme();

    // State
    const [featuredThumbnails, setFeaturedThumbnails] = useState([]);
    const [allThumbnails, setAllThumbnails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingFile, setUploadingFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    /* ── Colour tokens (mirrored from Users.jsx) ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const subColor     = isDark ? '#5a8a96' : '#211f2f';
    const labelColor   = isDark ? '#8ab4be' : '#211f2f';
    const textColor    = isDark ? '#d4e8ee' : '#211f2f';
    const tableBorderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)';

    const cardStyle = isDark
        ? {
            background: 'rgba(15, 25, 35, 0.72)',
            border: `1px solid ${tableBorderColor}`,
            backdropFilter: 'blur(14px)',
            boxShadow: '4px 4px 24px rgba(0,0,0,0.5), -2px -2px 10px rgba(255,255,255,0.02)',
        }
        : {
            background: '#e8e6e1',
            border: `1px solid rgba(255,255,255,0.75)`,
            boxShadow: '5px 5px 12px rgba(0,0,0,0.10), -4px -4px 12px rgba(255,255,255,0.88)',
        };

    const inputStyle = {
        width: '100%',
        padding: '0.55rem 0.875rem',
        borderRadius: '0.625rem',
        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
        color: isDark ? '#d4e8ee' : '#1a1a1a',
        fontSize: '0.875rem',
        outline: 'none',
        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.75)',
    };

    const toastErrorStyle = {
        background: isDark
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.05) 100%)',
        color: isDark ? '#fca5a5' : '#991b1b',
        border: isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(239,68,68,0.3)',
        backdropFilter: 'blur(12px)',
    };

    /* Cancel button style (red glassmorphic — from Users.jsx) */
    const cancelBtnStyle = {
        border: isDark
            ? '1px solid rgba(255,255,255,0.10)'
            : '1px solid rgba(0,0,0,0.10)',

        background: isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',

        color: isDark
            ? '#d4e8ee'
            : '#1a1a1a',

        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.55)',

        backdropFilter: 'blur(6px)',
    };

    /* Confirm/action button style (green glassmorphic — from Users.jsx) */
    const confirmBtnStyle = {
        border: isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(5,150,105,0.20)',
        background: isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)',
        color: isDark ? '#d4e8ee' : '#1a1a1a',
        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
        backdropFilter: 'blur(6px)',
    };

    const deleteBtnStyle = {
        border: isDark ? '1px solid rgba(255,0,0,0.35)' : '1px solid rgba(255,0,0,0.20)',
        background: isDark ? 'rgba(255,0,0,0.19)' : 'rgba(255,0,0,0.29)',
        color: isDark ? '#d4e8ee' : '#1a1a1a',
        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
        backdropFilter: 'blur(6px)',
    };

    const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
    const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

    // Load featured thumbnails on mount
    useEffect(() => {
        loadFeaturedThumbnails();
    }, []);

    const loadFeaturedThumbnails = async () => {
        try {
            setLoading(true);
            const response = await getFeaturedThumbnails();
            setFeaturedThumbnails(response.data.data || []);
            setError('');
        } catch (err) {
            console.error('Error loading featured thumbnails:', err);
            setError('Failed to load thumbnails');
        } finally {
            setLoading(false);
        }
    };

    const loadAllThumbnails = async (page = 1) => {
        try {
            setModalLoading(true);
            const response = await getAllThumbnails(page, 12);
            setAllThumbnails(response.data.data || []);
            setTotalPages(response.data.total_pages || 1);
            setCurrentPage(page);
            setError('');
        } catch (err) {
            console.error('Error loading all thumbnails:', err);
            setError('Failed to load thumbnails');
        } finally {
            setModalLoading(false);
        }
    };

    const handleUploadChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            setUploadingFile(file);
            setError('');
        }
    };

    const handleUploadSubmit = async () => {
        if (!uploadingFile) {
            setError('Please select an image');
            return;
        }
        try {
            setUploadProgress(50);
            const formData = new FormData();
            formData.append('image_original', uploadingFile);
            formData.append('title', uploadingFile.name.split('.')[0]);
            await createThumbnail(formData);
            setUploadProgress(100);
            setUploadingFile(null);
            setError('');
            await Promise.all([loadFeaturedThumbnails(), loadAllThumbnails(currentPage)]);
            setTimeout(() => setUploadProgress(0), 500);
        } catch (err) {
            console.error('Error uploading thumbnail:', err);
            setError(err.response?.data?.error || 'Failed to upload thumbnail');
            setUploadProgress(0);
        }
    };

    const handleSelectThumbnail = async (thumbnail) => {
        onSelect(thumbnail);
        setShowModal(false); // Close modal after selection
        try {
            await incrementThumbnailUsage(thumbnail.id);
        } catch (err) {
            console.error('Error incrementing usage:', err);
        }
    };

    const handleDeleteThumbnail = async (thumbnailId) => {
        try {
            await deleteThumbnail(thumbnailId);
            setDeleteConfirm(null);
            setError('');
            await Promise.all([loadFeaturedThumbnails(), loadAllThumbnails(currentPage)]);
        } catch (err) {
            console.error('Error deleting thumbnail:', err);
            setError('Failed to delete thumbnail');
        }
    };

    const handleToggleFeatured = async (thumbnailId) => {
        const thumbnail = allThumbnails.find(item => item.id === thumbnailId) || featuredThumbnails.find(item => item.id === thumbnailId);
        if (!thumbnail) return;

        const nextIsFeatured = !thumbnail.is_featured;
        const featuredCount = allThumbnails.filter(item => item.is_featured).length;

        if (nextIsFeatured && featuredCount >= 4) {
            setError('Maximum 4 featured thumbnails allowed. Unmark others first.');
            return;
        }

        setError('');
        setAllThumbnails(prev =>
            prev.map(item =>
                item.id === thumbnailId ? { ...item, is_featured: nextIsFeatured } : item
            )
        );
        setFeaturedThumbnails(prev => {
            if (nextIsFeatured) {
                if (prev.some(item => item.id === thumbnailId)) {
                    return prev;
                }
                return [...prev, { ...thumbnail, is_featured: true }]
                    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    .slice(0, 4);
            }
            return prev.filter(item => item.id !== thumbnailId);
        });

        try {
            await toggleFeaturedThumbnail(thumbnailId);
        } catch (err) {
            setAllThumbnails(prev =>
                prev.map(item =>
                    item.id === thumbnailId ? { ...item, is_featured: thumbnail.is_featured } : item
                )
            );
            await Promise.all([loadFeaturedThumbnails(), loadAllThumbnails(currentPage)]);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Failed to toggle featured status');
            }
            console.error('Error toggling featured:', err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setError('');
        setUploadingFile(null);
        setUploadProgress(0);
    };

    return (
        <>
            {/* ── Collapsed Featured Thumbnails Card ── */}
            <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ ...cardStyle, padding: '1.25rem', marginBottom: '1rem' }}
                >
                    {/* Card header */}
                    <div className="mb-4">
                        <label
                            className="block text-xs font-semibold uppercase tracking-wider mb-1"
                            style={{ color: labelColor }}
                        >
                            Select Thumbnail
                        </label>
                        <p className="text-xs" style={{ color: subColor }}>
                            Choose from featured templates or upload your own
                        </p>
                    </div>

                    {/* Loading dots (matches Users.jsx loading pattern) */}
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex gap-2">
                                {[0, 1, 2].map(i => (
                                    <Motion.div
                                        key={i}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: isDark ? '#7ec8d8' : '#2d2d2d' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured thumbnails grid */}
                    {!loading && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                gap: '0.75rem',
                                marginBottom: '1rem',
                            }}
                        >
                            {featuredThumbnails.length > 0 ? (
                                featuredThumbnails.map(thumbnail => (
                                    <Motion.div
                                        key={thumbnail.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelectThumbnail(thumbnail)}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('application/json', JSON.stringify(thumbnail));
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: '0.625rem',
                                            overflow: 'hidden',
                                            border: selected?.id === thumbnail.id
                                                ? `2px solid ${isDark ? '#5dd9f5' : '#059669'}`
                                                : `2px solid transparent`,
                                            transition: 'all 0.2s',
                                            boxShadow: selected?.id === thumbnail.id
                                                ? `0 0 0 2px ${isDark ? 'rgba(93,217,245,0.25)' : 'rgba(5,150,105,0.2)'}`
                                                : 'none',
                                        }}
                                    >
                                        <SmartImage
                                            avif={thumbnail.image?.avif}
                                            webp={thumbnail.image?.webp}
                                            fallback={thumbnail.image?.original || thumbnail.thumbnail_url}
                                            alt={thumbnail.title || 'Thumbnail'}
                                            width={120}
                                            height={90}
                                            className="w-full h-[90px] object-cover block"
                                            priority={false}
                                        />
                                    </Motion.div>
                                ))
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center py-6 gap-2"
                                    style={{ gridColumn: '1 / -1', color: subColor, opacity: 0.6 }}
                                >
                                    <Image size={28} />
                                    <span className="text-xs">No featured thumbnails yet</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* See All button */}
                    <button
                        onClick={() => {
                            setShowModal(true);
                            loadAllThumbnails(1);
                        }}
                        className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                        style={confirmBtnStyle}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.29)' : 'rgba(5,150,105,0.36)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)';
                        }}
                    >
                        See All Thumbnails
                    </button>
                </div>
            </Motion.div>

            {/* ── All Thumbnails Modal (matched to Users.jsx modal pattern) ── */}
            <AnimatePresence>
                {showModal && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
                        onClick={closeModal}
                    >
                        <Motion.div
                            initial={{ scale: 0.95, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 40 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-3xl rounded-2xl shadow-2xl border border-white/10 p-6"
                            style={{ ...cardStyle, maxHeight: '85vh', overflowY: 'auto' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header — identical structure to Users.jsx */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: headingColor }}>
                                        All Thumbnails
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        Browse, upload, feature, or remove thumbnails from the library.
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            {/* Error banner — matches toastErrorStyle from Users.jsx */}
                            {error && (
                                <Motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 rounded-lg p-3 text-sm font-medium flex items-center gap-3"
                                    style={toastErrorStyle}
                                >
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </Motion.div>
                            )}

                            {/* Upload section */}
                            <div
                                className="rounded-xl p-4 mb-6"
                                style={{
                                    background: hoverBg,
                                    border: `1px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                                }}
                            >
                                <label
                                    className="flex flex-col items-center gap-2 cursor-pointer"
                                >
                                    <Upload size={22} style={{ color: labelColor }} />
                                    <span className="text-sm font-semibold" style={{ color: labelColor }}>
                                        Upload New Thumbnail
                                    </span>
                                    <span className="text-xs" style={{ color: subColor }}>
                                        {uploadingFile ? uploadingFile.name : 'Click to select an image file'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {uploadingFile && (
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setUploadingFile(null); setUploadProgress(0); }}
                                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                            style={cancelBtnStyle}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.29)' : 'rgba(255,0,0,0.36)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.19)' : 'rgba(255,0,0,0.29)';
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleUploadSubmit}
                                            disabled={uploadProgress > 0}
                                            className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                                            style={confirmBtnStyle}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.29)' : 'rgba(5,150,105,0.36)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)';
                                            }}
                                        >
                                            {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Upload'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Loading dots */}
                            {modalLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex gap-2">
                                        {[0, 1, 2].map(i => (
                                            <Motion.div
                                                key={i}
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                                                className="w-2 h-2 rounded-full"
                                                style={{ background: isDark ? '#7ec8d8' : '#2d2d2d' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {!modalLoading && allThumbnails.length === 0 && (
                                <Motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-12"
                                >
                                    <Image size={36} style={{ color: subColor, opacity: 0.4, margin: '0 auto 0.75rem' }} />
                                    <p className="text-sm font-medium" style={{ color: labelColor }}>
                                        No thumbnails available. Upload one to get started!
                                    </p>
                                </Motion.div>
                            )}

                            {/* Thumbnails grid */}
                            {!modalLoading && allThumbnails.length > 0 && (
                                <>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '1.5rem',
                                        }}
                                    >
                                        {allThumbnails.map(thumbnail => (
                                            <Motion.div
                                                key={thumbnail.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                whileHover={{ scale: 1.04 }}
                                                onClick={() => handleSelectThumbnail(thumbnail)}
                                                style={{
                                                    position: 'relative',
                                                    borderRadius: '0.625rem',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: selected?.id === thumbnail.id
                                                        ? `3px solid ${isDark ? '#5dd9f5' : '#059669'}`
                                                        : `2px solid ${divider}`,
                                                    boxShadow: selected?.id === thumbnail.id
                                                        ? `0 0 0 2px ${isDark ? 'rgba(93,217,245,0.2)' : 'rgba(5,150,105,0.15)'}`
                                                        : 'none',
                                                    transition: 'border 0.2s, box-shadow 0.2s',
                                                }}
                                            >
                                                {/* Thumbnail image */}
                                                {thumbnail.image ? (
                                                    <SmartImage
                                                        avif={thumbnail.image.avif}
                                                        webp={thumbnail.image.webp}
                                                        fallback={thumbnail.image.original}
                                                        alt={thumbnail.title || 'Thumbnail'}
                                                        width={160}
                                                        height={110}
                                                        className="w-full h-[110px] object-cover"
                                                        priority={false}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            height: '110px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                        }}
                                                    >
                                                        <Image size={24} style={{ color: subColor, opacity: 0.5 }} />
                                                    </div>
                                                )}

                                                {/* Hover overlay with actions */}
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, right: 0, bottom: 0,
                                                        background: 'rgba(0,0,0,0.52)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem',
                                                        opacity: 0,
                                                        transition: 'opacity 0.2s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                                >
                                                    {/* Featured toggle button */}
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleToggleFeatured(thumbnail.id);
                                                        }}
                                                        style={{
                                                            background: thumbnail.is_featured
                                                                ? '#FFD700'
                                                                : 'rgba(255,255,255,0.2)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            padding: '0.45rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        title={thumbnail.is_featured ? 'Remove from featured' : 'Add to featured'}
                                                    >
                                                        <Star size={16} color={thumbnail.is_featured ? '#333' : '#fff'} />
                                                    </button>

                                                    {/* Delete button */}
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setDeleteConfirm(thumbnail.id);
                                                        }}
                                                        style={{
                                                            background: 'rgba(239,68,68,0.75)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            padding: '0.45rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        title="Delete thumbnail"
                                                    >
                                                        <Trash2 size={16} color="#fff" />
                                                    </button>
                                                </div>

                                                {/* Featured badge */}
                                                {thumbnail.is_featured && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '0.3rem',
                                                            right: '0.3rem',
                                                            background: '#FFD700',
                                                            borderRadius: '50%',
                                                            padding: '0.2rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Star size={11} color="#333" fill="#FFD700" />
                                                    </div>
                                                )}
                                            </Motion.div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div
                                            className="flex items-center justify-center gap-2 pt-4"
                                            style={{ borderTop: `1px solid ${divider}` }}
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => loadAllThumbnails(page)}
                                                    className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium"
                                                    style={
                                                        currentPage === page
                                                            ? confirmBtnStyle
                                                            : {
                                                                background: 'transparent',
                                                                border: `1px solid ${divider}`,
                                                                color: labelColor,
                                                            }
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Modal Footer — Close button */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                    style={cancelBtnStyle}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.29)' : 'rgba(255,0,0,0.36)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background= isDark? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.05)';
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation Modal ── */}
            <AnimatePresence>
                {deleteConfirm && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <Motion.div
                            initial={{ scale: 0.95, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 40 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 p-6 text-center"
                            style={cardStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: headingColor }}>
                                        Delete Thumbnail?
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                    style={cancelBtnStyle}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = isDark
                                            ? 'rgba(255,255,255,0.09)'
                                            : 'rgba(0,0,0,0.08)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = isDark
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(0,0,0,0.05)';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteThumbnail(deleteConfirm)}
                                    className="flex-1 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                    style={deleteBtnStyle}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.29)' : 'rgba(255,0,0,0.36)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.19)' : 'rgba(255,0,0,0.29)';
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
