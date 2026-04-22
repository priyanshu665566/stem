import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { UploadCloud, XCircle, Image as ImageIcon, CheckCircle2, Music, X } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Loader3D from '../components/Loader3D';
import CustomSelect from '../components/CustomSelect';
import ThumbnailDrawer from '../components/ThumbnailDrawer';
import { createCity } from '../api/cities';

/* ── Custom animated checkmark icon ── */
const AnimatedCheckIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <Motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        <Motion.path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }} />
    </svg>
);

/* ── Custom animated error icon ── */
const AnimatedErrorIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <Motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        <Motion.path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }} />
    </svg>
);

export default function CreateCity() {
    const { isDark } = useTheme();

    const [formData, setFormData] = useState({
        name: '',
        assistant: '',
        meeting_url: '',
        thumbnail: null,
        flyin_graphic: null,
        loop_graphic: null,
        support_audio: null,
    });

    const [selectedThumbnail, setSelectedThumbnail] = useState(null);

    const [previewUrls, setPreviewUrls] = useState({
        thumbnail: null,
        flyin_graphic: null,
        loop_graphic: null,
        support_audio: null,
    });
    const [dragActive, setDragActive] = useState('');

    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    /* ── colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const subColor     = isDark ? '#5a8a96' : '#211f2f';
    const labelColor   = isDark ? '#8ab4be' : '#211f2f';
    const textColor    = isDark ? '#d4e8ee' : '#211f2f';
    const tableBorderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)';

    const ASSISTANT_OPTIONS = [
        { value: 'assistant1', label: 'Assistant 1' },
        { value: 'assistant2', label: 'Assistant 2' },
        { value: 'assistant3', label: 'Assistant 3' },
    ];

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
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.75)',
    };

    const divider  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    const fileText = isDark ? '#5a8a96' : '#888';

    /* Submit button — green glassmorphic (matches Users.jsx) */
    const submitBtnStyle = {
        border: isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(5,150,105,0.20)',
        background: isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)',
        color: isDark ? '#d4e8ee' : '#1a1a1a',
        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
        backdropFilter: 'blur(6px)',
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, dropName, dropFiles) => {
        const name = e ? e.target.name : dropName;
        const file = e ? e.target.files[0] : dropFiles[0];

        if (!file) return;

        setFormData(prev => ({ ...prev, [name]: file }));

        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [name]: url }));

        if (name === 'thumbnail') {
            setSelectedThumbnail(null);
        }
    };
    const handleDrag = (e, name) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(name);
        } else if (e.type === 'dragleave') {
            setDragActive('');
        }
    };

    const handleDrop = (e, name) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive('');
        
        // Check if dropping a thumbnail from drawer
        const thumbnailData = e.dataTransfer.getData('application/json');
        if (thumbnailData) {
            try {
                const thumbnail = JSON.parse(thumbnailData);
                if (name === 'thumbnail') {
                    setSelectedThumbnail(thumbnail);
                    // Clear any uploaded file for thumbnail
                    if (formData.thumbnail) {
                        removeFile('thumbnail');
                    }
                }
                return;
            } catch (err) {
                console.error('Error parsing dropped thumbnail:', err);
            }
        }
        
        const files = e.dataTransfer?.files;
        if (files && files[0]) {
            handleFileChange(null, name, files);
        }
    };

    const removeFile = (name, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        setFormData(prev => ({ ...prev, [name]: null }));
        if (previewUrls[name]) {
            URL.revokeObjectURL(previewUrls[name]);
        }
        setPreviewUrls(prev => ({ ...prev, [name]: null }));

        const fileInput = document.querySelector(`input[name="${name}"]`);
        if (fileInput) fileInput.value = '';
    };

    const showToast = (isSuccess, nextMessage) => {
        setSuccess(isSuccess);
        setMessage(nextMessage);
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
            setTimeout(() => setMessage(''), 400);
        }, 5000);
    };

    // Helper: get the selected thumbnail - either from drawer or uploaded file
    const getThumbnailFile = async () => {
        // Explicit file upload takes precedence
        if (formData.thumbnail) {
            return formData.thumbnail;
        }

        // If drawer selected a thumbnail asset, use its image URL
        if (selectedThumbnail && selectedThumbnail.image) {
            const candidateUrls = [
                selectedThumbnail.image.original,
                selectedThumbnail.image.webp,
                selectedThumbnail.image.avif,
            ].filter(Boolean);

            try {
                for (const imageUrl of candidateUrls) {
                    const res = await fetch(imageUrl);
                    if (!res.ok) continue;

                    const blob = await res.blob();
                    if (!blob.type.startsWith('image/')) continue;

                    const extensionMap = {
                        'image/jpeg': 'jpg',
                        'image/jpg': 'jpg',
                        'image/png': 'png',
                        'image/webp': 'webp',
                        'image/avif': 'avif',
                    };
                    const extension = extensionMap[blob.type] || 'jpg';
                    const baseName = selectedThumbnail.title || `thumbnail-${selectedThumbnail.id}`;

                    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
                }

                console.error('No valid thumbnail asset URL returned an image blob.');
                return null;
            } catch (err) {
                console.error("Failed to load thumbnail asset:", err);
                return null;
            }
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.thumbnail && !selectedThumbnail) {
            showToast(false, 'Please upload or select a thumbnail before creating a city.');
            return;
        }

        setLoading(true);
        setMessage('');
        setShowMessage(false);
        setSuccess(false);
        setShowLoader(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('assistant', formData.assistant);
        data.append('meeting_url', formData.meeting_url);

        // Resolve Final Thumbnail
        const finalThumbnail = await getThumbnailFile();
        if (finalThumbnail) {
            data.append('thumbnail_original', finalThumbnail);
        } else {
            setLoading(false);
            setShowLoader(false);
            showToast(false, 'Thumbnail is required.');
            return;
        }

        if (formData.flyin_graphic) data.append('flyin_graphic_original', formData.flyin_graphic);
        if (formData.loop_graphic) data.append('loop_graphic_original', formData.loop_graphic);
        if (formData.support_audio) data.append('support_audio', formData.support_audio);

        try {
            await createCity(data);

            // Revert state
            setFormData({
                name: '', assistant: '', meeting_url: '',
                thumbnail: null, flyin_graphic: null, loop_graphic: null, support_audio: null,
            });
            setSelectedThumbnail(null);
            setPreviewUrls({ thumbnail: null, flyin_graphic: null, loop_graphic: null, support_audio: null });
            document.querySelectorAll('input[type="file"]').forEach(i => (i.value = ''));
            setShowLoader(false);
            showToast(true, 'City created successfully!');
        } catch (err) {
            console.error(err);
            const backendError = err?.response?.data;
            const errorMessage =
                backendError?.thumbnail_original?.[0] ||
                backendError?.detail ||
                backendError?.error ||
                'Error creating city. Please try again.';
            setShowLoader(false);
            showToast(false, errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const FILE_FIELDS = [
        { label: 'City Thumbnail', name: 'thumbnail', accept: 'image/*' },
        { label: 'Flyin Graphic', name: 'flyin_graphic', accept: 'image/*' },
        { label: 'Loop Graphic', name: 'loop_graphic', accept: 'image/*' },
        { label: 'Support Audio', name: 'support_audio', accept: 'audio/*' },
    ];

    /* ── Toast notification styles ── */
    const toastSuccessStyle = {
        background: isDark
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.06) 100%)',
        color: isDark ? '#86efac' : '#166534',
        border: isDark ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(34,197,94,0.3)',
        backdropFilter: 'blur(12px)',
    };

    const toastErrorStyle = {
        background: isDark
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.05) 100%)',
        color: isDark ? '#fca5a5' : '#991b1b',
        border: isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(239,68,68,0.3)',
        backdropFilter: 'blur(12px)',
    };

    return (
        <>
            {/* ── Full-screen 3D Loader Overlay ── */}
            <AnimatePresence>
                {showLoader && (
                    <Motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', alignItems: 'center',
                            background: isDark ? 'rgba(4, 8, 14, 0.92)' : 'rgba(230, 228, 224, 0.95)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        <Loader3D />
                        <Motion.p
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
                            style={{
                                marginTop: '-2rem', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.08em', color: isDark ? '#5a8a96' : '#888',
                            }}
                        >
                            Creating your city…
                        </Motion.p>
                    </Motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 lg:px-8">
                {/* Header */}
                <div className="mb-8 sm:mb-10 animate-fade-up">
                    <h1
                        className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                        style={{ color: headingColor }}
                    >
                        Create New City
                    </h1>
                    <p className="text-sm sm:text-base" style={{ color: subColor }}>
                        Configure and launch a new city environment.
                    </p>
                </div>

                {/* 70/30 Split Layout Wrapper */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                    {/* LEFT SIDE : 70% FORM */}
                    <div className="w-full lg:w-[70%] animate-fade-up">
                        <div className="rounded-2xl p-5 sm:p-7" style={cardStyle}>
                            {/* Animated Toast Notification */}
                            <AnimatePresence>
                                {showMessage && message && (
                                    <Motion.div
                                        initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(6px)' }}
                                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -12, scale: 0.97, filter: 'blur(4px)' }}
                                        transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.8 }}
                                        className="mb-5 p-4 rounded-xl flex items-center gap-3 text-sm font-medium relative overflow-hidden"
                                        style={success ? toastSuccessStyle : toastErrorStyle}
                                    >
                                        <Motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}>
                                            {success ? <AnimatedCheckIcon size={22} /> : <AnimatedErrorIcon size={22} />}
                                        </Motion.div>
                                        <Motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3 }} style={{ flex: 1 }}>
                                            {message}
                                        </Motion.span>
                                        <Motion.button
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                            onClick={() => { setShowMessage(false); setTimeout(() => setMessage(''), 400); }}
                                            className="ml-auto text-lg leading-none hover:opacity-70 transition-opacity cursor-pointer"
                                            style={{ padding: '2px 4px' }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                                        >
                                            ×
                                        </Motion.button>
                                        <Motion.div initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 5, ease: 'linear' }}
                                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: success ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)', transformOrigin: 'left' }}
                                        />
                                    </Motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>City Name</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="E.g., Neo Tokyo" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>Assistant</label>
                                    <CustomSelect
                                        name="assistant"
                                        required
                                        value={formData.assistant}
                                        onChange={handleInputChange}
                                        placeholder="Select an Assistant"
                                        isDark={isDark}
                                        options={ASSISTANT_OPTIONS}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>Meeting URL</label>
                                    <input type="url" name="meeting_url" required value={formData.meeting_url} onChange={handleInputChange} style={inputStyle} placeholder="https://zoom.us/j/123456789" />
                                </div>

                                {/* File uploads */}
                                <div>
                                    <p className="text-xs font-semibold tracking-wide uppercase mb-3 flex items-center gap-2" style={{ color: labelColor }}>
                                        <UploadCloud size={14} />
                                        Media Assets
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {FILE_FIELDS.map(({ label, name, accept }) => {
                                            const isAudio = accept.includes('audio');
                                            const hasPreview = previewUrls[name];
                                            const isDragging = dragActive === name;

                                            return (
                                                <div
                                                    key={name}
                                                    className={`p-3 rounded-xl transition-all relative overflow-hidden group cursor-pointer flex flex-col`}
                                                    onDragEnter={(e) => handleDrag(e, name)}
                                                    onDragLeave={(e) => handleDrag(e, name)}
                                                    onDragOver={(e) => handleDrag(e, name)}
                                                    onDrop={(e) => handleDrop(e, name)}
                                                    onClick={() => document.querySelector(`input[name="${name}"]`).click()}
                                                    style={{
                                                        background: isDark ? (isDragging ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)') : (isDragging ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)'),
                                                        border: isDark ? (isDragging ? '1px dashed rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.07)') : (isDragging ? '1px dashed rgba(0,0,0,0.3)' : '1px solid rgba(0,0,0,0.07)'),
                                                        boxShadow: isDark ? 'inset 2px 2px 6px rgba(0,0,0,0.3)' : 'inset 3px 3px 8px rgba(0,0,0,0.07), inset -3px -3px 8px rgba(255,255,255,0.65)',
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="block text-[11px] font-semibold tracking-wide uppercase pointer-events-none" style={{ color: labelColor }}>
                                                            {label} {name === 'thumbnail' && <span className="text-red-500 ml-1">*</span>}
                                                            {(name === 'thumbnail' && selectedThumbnail && !formData.thumbnail) && (
                                                                <span className="ml-1 text-[9px] text-gray-500">(Drawer Selected)</span>
                                                            )}
                                                        </label>
                                                        {(hasPreview || (name === 'thumbnail' && selectedThumbnail && !formData.thumbnail)) && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();   // IMPORTANT
                                                                    e.preventDefault();

                                                                    if (name === 'thumbnail' && selectedThumbnail && !formData.thumbnail) {
                                                                        setSelectedThumbnail(null);
                                                                    } else {
                                                                        removeFile(name, e);
                                                                    }
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 z-10"
                                                            >
                                                                <X size={14} style={{ color: headingColor }} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 flex flex-col items-center justify-center min-h-20 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 relative overflow-hidden pointer-events-none transition-colors">
                                                        {hasPreview ? (
                                                            isAudio ? (
                                                                <div className="flex flex-col items-center justify-center gap-1 w-full h-full p-2" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }}>
                                                                    <Music size={24} style={{ color: fileText }} />
                                                                    <span className="text-[10px] truncate max-w-30" style={{ color: fileText }}>
                                                                        {formData[name]?.name || "Audio File"}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <img src={previewUrls[name]} alt="Preview" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                                            )
                                                        ) : name === 'thumbnail' && selectedThumbnail ? (
                                                            <img src={selectedThumbnail.image?.original || selectedThumbnail.image?.webp || selectedThumbnail.image?.avif || selectedThumbnail.thumbnail_url} alt="Selected Thumbnail" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                                        ) : (
                                                            <div className="flex flex-col items-center py-2 gap-1 opacity-60">
                                                                <UploadCloud size={18} style={{ color: fileText }} />
                                                                <span className="text-[10px] text-center px-2" style={{ color: fileText }}>
                                                                    {name === 'thumbnail' ? 'Upload or Drop Drawer Item' : 'Click or Drag to Upload'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <input
                                                        type="file"
                                                        name={name}
                                                        accept={accept}
                                                        onChange={handleFileChange}
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end" style={{ borderTop: `1px solid ${divider}` }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                                        style={submitBtnStyle}
                                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.29)' : 'rgba(5,150,105,0.36)'; }}
                                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)'; }}
                                    >
                                        {loading ? 'Creating…' : 'Create City'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT SIDE : 30% THUMBNAIL DRAWER */}
                        <ThumbnailDrawer 
                            selected={selectedThumbnail} 
                            onSelect={setSelectedThumbnail} 
                        />
                    

                </div>
            </div>
        </>
    );
}
