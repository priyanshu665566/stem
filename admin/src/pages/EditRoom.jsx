/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, updateRoom, deleteRoom, requestReviewRoom } from '../api/rooms';
import { getUsers } from '../api/users';
import { useTheme } from '../context/ThemeContext';
import { UploadCloud, XCircle, CheckCircle2, Music, X, ArrowLeft, Loader2, AlertCircle, Info } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

/* ── Custom animated icons ── */
const AnimatedCheckIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <Motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        <Motion.path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }} />
    </svg>
);

const AnimatedErrorIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <Motion.circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        <Motion.path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.45, ease: 'easeOut' }} />
    </svg>
);

export default function EditRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [formData, setFormData] = useState({
        room_name: '',
        description: '',
        meeting_url: '',
        assistant: '',
        thumbnail: null,
        flyin_graphic: null,
        loop_graphic: null,
        support_audio: null,
    });
    
    // Track original data to know what's changed and to store initial API string URLs
    const [originalData, setOriginalData] = useState(null);
    const [status, setStatus] = useState('draft');

    const [usersList, setUsersList] = useState([]);
    
    const [previewUrls, setPreviewUrls] = useState({
        thumbnail: null,
        flyin_graphic: null,
        loop_graphic: null,
        support_audio: null,
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    const BASE_URL = "http://localhost:8000/";

    const ASSISTANT_OPTIONS = [
        { value: 'assistant1', label: 'Assistant 1' },
        { value: 'assistant2', label: 'Assistant 2' },
        { value: 'assistant3', label: 'Assistant 3' },
    ];

    /* ── colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const subColor = isDark ? '#AFEEEE' : '#777';
    const labelColor = isDark ? '#AFEEEE' : '#444';
    const cardStyle = isDark
        ? { background: 'rgba(15, 25, 35, 0.72)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(14px)', boxShadow: '4px 4px 24px rgba(0,0,0,0.5), -2px -2px 10px rgba(255,255,255,0.02)' }
        : { background: '#e8e6e1', border: '1px solid rgba(255,255,255,0.75)', boxShadow: '5px 5px 12px rgba(0,0,0,0.10), -4px -4px 12px rgba(255,255,255,0.88)' };
    const inputStyle = {
        width: '100%', padding: '0.55rem 0.875rem', borderRadius: '0.625rem', border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)', color: isDark ? '#d4e8ee' : '#1a1a1a', fontSize: '0.875rem', outline: 'none',
        boxShadow: isDark ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)' : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.75)',
    };
    const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
    const btnBg = isDark ? '#1a4a5a' : '#2d2d2d';
    const btnHover = isDark ? '#1e5a6e' : '#111';
    const fileText = isDark ? '#5a8a96' : '#888';

    const toastSuccessStyle = {
        background: isDark ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.08) 100%)' : 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.06) 100%)',
        color: isDark ? '#86efac' : '#166534', border: isDark ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(34,197,94,0.3)', backdropFilter: 'blur(12px)',
    };
    const toastErrorStyle = {
        background: isDark ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.05) 100%)',
        color: isDark ? '#fca5a5' : '#991b1b', border: isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(239,68,68,0.3)', backdropFilter: 'blur(12px)',
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [roomRes, usersRes] = await Promise.all([getRoom(id), getUsers()]);
                const room = roomRes.data;
                const users = usersRes.data;

                setUsersList(users);
                
                setFormData({
                    room_name: room.room_name || '',
                    description: room.description || '',
                    meeting_url: room.meeting_url || '',
                    assistant: room.assistant || '',
                    thumbnail: null,
                    flyin_graphic: null,
                    loop_graphic: null,
                    support_audio: null,
                });
                setStatus(room.status || 'draft');
                setOriginalData(room);
                
                // Handle new image format: {original, webp, avif}
                setPreviewUrls({
                    thumbnail: room.thumbnail?.original || null,
                    flyin_graphic: room.flyin_graphic?.original || null,
                    loop_graphic: room.loop_graphic?.original || null,
                    support_audio: room.support_audio_url || null,
                });
            } catch (err) {
                console.error('Error fetching data:', err);
                setMessage('Failed to load room data.');
                setSuccess(false);
                setShowMessage(true);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const showToast = (isSuccess, msg) => {
        setSuccess(isSuccess);
        setMessage(msg);
        setShowMessage(true);
        setTimeout(() => { setShowMessage(false); setTimeout(() => setMessage(''), 400); }, 5000);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e, name) => {
        if (status === 'in_review') return;
        const file = e.target.files[0];
        if (!file) return;

        setFormData(prev => ({ ...prev, [name]: file }));
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [name]: url }));
    };

    const removeFile = (name, e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        if (status === 'in_review') return;

        setFormData(prev => ({ ...prev, [name]: null }));
        setPreviewUrls(prev => ({ ...prev, [name]: null }));

        const fileInput = document.querySelector(`input[name="file_${name}"]`);
        if (fileInput) fileInput.value = '';
    };

    const handleRequestReview = async () => {
        try {
            await requestReviewRoom(id);
            setStatus('in_review');
            showToast(true, 'Review requested successfully!');
        } catch (err) {
            console.error('Error requesting review:', err);
            showToast(false, 'Failed to request review. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const data = new FormData();
            data.append('room_name', formData.room_name);
            data.append('description', formData.description);
            data.append('meeting_url', formData.meeting_url);
            data.append('assistant', formData.assistant);
            // media fields same as EditCity
            ['thumbnail', 'flyin_graphic', 'loop_graphic', 'support_audio'].forEach(field => {
                if (formData[field] instanceof File) {
                    const uploadField = field === 'support_audio' ? field : `${field}_original`;
                    data.append(uploadField, formData[field]);
                } else if (previewUrls[field] === null && originalData && originalData[field]) {
                    // Instruct backend to remove the file if necessary? Depending on your API, 
                    // sometimes sending empty string or explicit null clears it. We'll leave as is.
                }
            });

            const res = await updateRoom(id, data);
            
            // Re-sync with backend response 
            const updated = res.data || res;
            setOriginalData(updated);
            setPreviewUrls({
                thumbnail: updated.thumbnail?.original || updated.thumbnail?.webp || updated.thumbnail?.avif || null,
                flyin_graphic: updated.flyin_graphic?.original || updated.flyin_graphic?.webp || updated.flyin_graphic?.avif || null,
                loop_graphic: updated.loop_graphic?.original || updated.loop_graphic?.webp || updated.loop_graphic?.avif || null,
                support_audio: updated.support_audio_url || null,
            });
            showToast(true, 'Room updated successfully!');
        } catch (err) {
            console.error(err);
            showToast(false, 'Error updating room. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you certain you want to delete this room forever?')) return;
        setDeleting(true);
        try {
            await deleteRoom(id);
            navigate('/manage-rooms');
        } catch (err) {
            console.error(err);
            showToast(false, 'Error deleting room.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                        <Motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full" style={{ background: isDark ? '#7ec8d8' : '#2d2d2d' }} />
                    ))}
                </div>
            </div>
        );
    }

    const FILE_FIELDS = [
        { label: 'Room Thumbnail', name: 'thumbnail', accept: 'image/*' },
        { label: 'Flyin Graphic', name: 'flyin_graphic', accept: 'image/*' },
        { label: 'Loop Graphic', name: 'loop_graphic', accept: 'image/*' },
        { label: 'Support Audio', name: 'support_audio', accept: 'audio/*' },
    ];

    const isDisabled = false;

    return (
        <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 relative animate-fade-up">
            {/* Header / Nav */}
            <div className="flex items-center justify-between xl:mb-2 mb-6">
                <button
                    onClick={() => navigate('/my-rooms')}
                    className="flex items-center gap-2 text-sm font-semibold transition-colors opacity-80 hover:opacity-100"
                    style={{ color: headingColor }}
                >
                    <ArrowLeft size={18} />
                    Back to My Rooms
                </button>

                {(status === 'draft' || status === 'published') && (
                    <button
                        onClick={handleRequestReview}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-md active:scale-95"
                        style={{
                            background: isDark ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                            color: '#fff',
                        }}
                    >
                        Request Review
                    </button>
                )}
            </div>

            {/* Banners */}
            {status === 'in_review' && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium" style={{ background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)', border: isDark ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(59,130,246,0.2)', color: isDark ? '#93c5fd' : '#1e40af' }}>
                    <Info size={20} />
                    This room is currently In Review.
                </div>
            )}
            {status === 'published' && (
                <div className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium" style={{ background: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)', border: isDark ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(34,197,94,0.2)', color: isDark ? '#86efac' : '#166534' }}>
                    <CheckCircle2 size={20} />
                    This room is published.
                </div>
            )}

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
                            className="ml-auto text-lg leading-none hover:opacity-70 transition-opacity cursor-pointer z-10"
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

            <div className="rounded-2xl p-6 sm:p-8" style={cardStyle}>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1" style={{ color: headingColor }}>Edit Room</h2>
                <p className="text-xs sm:text-sm mb-6" style={{ color: subColor }}>ID: {id}</p>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase mb-1.5" style={{ color: labelColor }}>Room Name</label>
                            <input type="text" name="room_name" required value={formData.room_name} onChange={handleInputChange} disabled={isDisabled} style={{ ...inputStyle, opacity: isDisabled ? 0.6 : 1 }} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase mb-1.5" style={{ color: labelColor }}>Meeting URL</label>
                            <input type="url" name="meeting_url" value={formData.meeting_url} onChange={handleInputChange} disabled={isDisabled} style={{ ...inputStyle, opacity: isDisabled ? 0.6 : 1 }} placeholder="https://" />
                        </div>
                        
                        <div>
                            <label className="block text-[11px] font-bold tracking-wider uppercase mb-1.5" style={{ color: labelColor }}>Assistant</label>
                            <div style={{ opacity: isDisabled ? 0.6 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}>
                                <CustomSelect
                                    name="assistant"
                                    value={formData.assistant}
                                    onChange={handleInputChange}
                                    options={ASSISTANT_OPTIONS}
                                    placeholder="Select Assistant"
                                    isDark={isDark}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold tracking-wider uppercase mb-1.5" style={{ color: labelColor }}>Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleInputChange}
                            disabled={isDisabled}
                            style={{ ...inputStyle, resize: 'none', opacity: isDisabled ? 0.6 : 1 }}
                            className="sm:col-span-2"
                        />
                    </div>

                    {/* Media Assets */}
                    <div className="pt-4" style={{ borderTop: `1px solid ${divider}` }}>
                        <p className="text-xs font-bold tracking-wider uppercase mb-4 flex items-center gap-2" style={{ color: labelColor }}>
                            <UploadCloud size={14} /> Media Assets
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {FILE_FIELDS.map(({ label, name, accept }) => {
                                const isAudio = accept.includes('audio');
                                const hasPreview = previewUrls[name];

                                return (
                                    <div
                                        key={name}
                                        className="p-3 rounded-xl transition-all relative overflow-hidden group flex flex-col"
                                        style={{
                                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.45)',
                                            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
                                            boxShadow: isDark ? 'inset 2px 2px 6px rgba(0,0,0,0.3)' : 'inset 3px 3px 8px rgba(0,0,0,0.07), inset -3px -3px 8px rgba(255,255,255,0.65)',
                                            opacity: isDisabled ? 0.6 : 1,
                                            pointerEvents: isDisabled ? 'none' : 'auto'
                                        }}
                                        onClick={() => { if (!isDisabled) document.querySelector(`input[name="file_${name}"]`).click() }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[11px] font-bold tracking-wider uppercase pointer-events-none" style={{ color: labelColor }}>
                                                {label}
                                            </label>
                                            {hasPreview && !isDisabled && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => removeFile(name, e)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 z-10"
                                                >
                                                    <X size={14} style={{ color: headingColor }} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center min-h-20 rounded-lg border border-dashed border-gray-400 dark:border-gray-600 relative overflow-hidden pointer-events-none transition-colors cursor-pointer">
                                            {hasPreview ? (
                                                isAudio ? (
                                                    <div className="flex flex-col items-center justify-center gap-1 w-full h-full p-2" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }}>
                                                        <Music size={24} style={{ color: fileText }} />
                                                        <span className="text-[10px] truncate max-w-30" style={{ color: fileText }}>
                                                            {formData[name]?.name || "Existing Audio File"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <img src={previewUrls[name]} alt="Preview" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                                )
                                            ) : (
                                                <div className="flex flex-col items-center py-2 gap-1 opacity-60">
                                                    <UploadCloud size={18} style={{ color: fileText }} />
                                                    <span className="text-[10px] text-center px-2" style={{ color: fileText }}>Click to Upload</span>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            name={`file_${name}`}
                                            accept={accept}
                                            onChange={(e) => handleFileChange(e, name)}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${divider}` }}>
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleDelete}
                            className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-500 disabled:opacity-50"
                        >
                            {deleting ? 'Deleting...' : 'Delete Room'}
                        </button>

                        <button
                            type="submit"
                            disabled={updating || isDisabled}
                            className="px-8 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md flex items-center gap-2"
                            style={{
                                background: (updating || isDisabled) ? (isDark ? '#0d2a36' : '#999') : btnBg,
                                color: '#fff',
                                opacity: (updating || isDisabled) ? 0.75 : 1,
                                boxShadow: (updating || isDisabled) ? 'none' : isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '4px 4px 10px rgba(0,0,0,0.18), -2px -2px 6px rgba(255,255,255,0.5)',
                            }}
                        >
                            {updating && <Loader2 size={16} className="animate-spin" />}
                            {updating ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
