/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishEvent } from '../api/events';
import { useTheme } from '../context/ThemeContext';
import { useEvents } from '../context/EventsContext';
import { CheckCircle, Eye, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function ManageEvents() {
    const { isDark } = useTheme();
    const { events, loading, updateEventState } = useEvents();
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    /* ── Colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const subColor = isDark ? '#5a8a96' : '#211f2f';
    const labelColor = isDark ? '#8ab4be' : '#211f2f';
    const textColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const tableHeaderBg = isDark ? 'rgba(126, 200, 216, 0.08)' : 'rgba(0, 0, 0, 0.04)';
    const tableBorderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)';
    const rowHoverBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)';
    
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

    const buttonStyle = {
        publish: isDark ? '#10b981' : '#059669',
        details: isDark ? '#94a3b8' : '#475569',
    };

    const handlePublish = async (eventId) => {
        try {
            setActionLoading(eventId);
            await publishEvent(eventId);
            updateEventState(eventId, 'published');
            setSuccess(true);
            setMessage('Event published successfully!');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } catch (err) {
            console.error('Error publishing event:', err);
            setSuccess(false);
            setMessage('Error publishing event. Please try again.');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEventDetails = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedEvent(null);
    };

    const getStatusPill = (status) => {
        switch (status) {
            case 'published':
                return {
                    bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                    text: isDark ? '#86efac' : '#166534',
                    label: 'Published'
                };
            default: // draft
                return {
                    bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                    text: isDark ? '#fcd34d' : '#b45309',
                    label: 'Draft'
                };
        }
    };

    const ActionButton = ({ icon: Icon, color, onClick, disabled, title, text }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-semibold"
            style={{
                background: isDark ? `${color}15` : `${color}10`,
                color: color,
                border: `1px solid ${color}40`,
            }}
        >
            <Icon size={14} />
            {text}
        </button>
    );

    const inputBoxStyle = {
        width: '100%',
        padding: '0.55rem 0.875rem',
        borderRadius: '0.625rem',
        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
        color: isDark ? '#d4e8ee' : '#1a1a1a',
        fontSize: '0.875rem',
        boxShadow: isDark
            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
    };

    const selectBoxStyle = {
        ...inputBoxStyle,
        cursor: 'pointer',
    };

    return (
        <>
            {/* Header */}
            <div className="mb-8 sm:mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: headingColor }}>
                        Review Events
                    </h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={{ color: subColor }}
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>

            {/* Subheading */}
            <div className="mb-6">
                <p className="text-sm sm:text-base" style={{ color: subColor }}>
                    Here are the events:
                </p>
            </div>

            <AnimatePresence>
                {showMessage && (
                    <Motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-6 right-6 z-50 p-4 rounded-lg flex items-center gap-3 max-w-sm"
                        style={success ? toastSuccessStyle : toastErrorStyle}
                    >
                        {success ? (
                            <CheckCircle className="shrink-0" size={20} />
                        ) : (
                            <AlertCircle size={20} className="shrink-0" />
                        )}
                        <span className="text-sm font-medium">{message}</span>
                    </Motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <Motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full" style={{ background: isDark ? '#7ec8d8' : '#2d2d2d' }} />
                        ))}
                    </div>
                </div>
            )}

            {!loading && events.length === 0 && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12" style={cardStyle}>
                    <p style={{ color: labelColor }} className="text-sm font-medium">No events available</p>
                </Motion.div>
            )}

            {!loading && events.length > 0 && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle} className="rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${tableBorderColor}` }}>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Event Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Event Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Event Owner</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Event State</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {events.map((event, index) => {
                                        const statusPill = getStatusPill(event.event_state);
                                        const publishDisabled = event.event_state === 'published';

                                        return (
                                            <Motion.tr
                                                key={event.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-t transition-colors duration-200 hover:transition-none"
                                                style={{ borderTopColor: tableBorderColor, backgroundColor: 'transparent' }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = rowHoverBg; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium" style={{ color: textColor }}>{event.event_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.room_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.room_owner}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statusPill.bg, color: statusPill.text }}>
                                                        {statusPill.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <ActionButton
                                                            icon={Eye}
                                                            text="Event Details"
                                                            color={buttonStyle.details}
                                                            onClick={() => handleEventDetails(event)}
                                                            title="View Event Details"
                                                        />
                                                        <ActionButton
                                                            icon={CheckCircle}
                                                            text="Publish Event"
                                                            color={buttonStyle.publish}
                                                            onClick={() => handlePublish(event.id)}
                                                            disabled={publishDisabled || actionLoading === event.id}
                                                            title={publishDisabled ? "Already published" : "Publish Event"}
                                                        />
                                                    </div>
                                                </td>
                                            </Motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Motion.div>
            )}

            {/* Event Details Modal */}
            <AnimatePresence>
                {showModal && selectedEvent && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{
                            background: "rgba(0,0,0,0.3)",
                            backdropFilter: "blur(10px)",
                        }}
                        onClick={closeModal}
                    >
                        <Motion.div
                            initial={{ scale: 0.95, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 40 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 p-6"
                            style={cardStyle}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2
                                        className="text-xl font-bold"
                                        style={{ color: headingColor }}
                                    >
                                        Event Details
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        View complete information about this event
                                    </p>
                                </div>

                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            {/* Form-like Content */}
                            <div className="space-y-5">
                                {/* Event Name */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Event Name
                                    </label>
                                    <div
                                        className="text-sm"
                                        style={inputBoxStyle}
                                    >
                                        {selectedEvent.event_name}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Description
                                    </label>
                                    <div
                                        className="text-sm min-h-17.5"
                                        style={inputBoxStyle}
                                    >
                                        {selectedEvent.description || "No description provided"}
                                    </div>
                                </div>

                                {/* Room Name */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Room Name
                                    </label>
                                    <div
                                        className="text-sm"
                                        style={inputBoxStyle}
                                    >
                                        {selectedEvent.room_name}
                                    </div>
                                </div>

                                {/* Added By */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Added By
                                    </label>
                                    <div
                                        className="text-sm"
                                        style={inputBoxStyle}
                                    >
                                        {selectedEvent.room_owner}
                                    </div>
                                </div>

                                {/* Date and Time Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Start Date */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            Start Date
                                        </label>
                                        <div
                                            className="text-sm"
                                            style={inputBoxStyle}
                                        >
                                            {selectedEvent.start_date}
                                        </div>
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            Start Time
                                        </label>
                                        <div
                                            className="text-sm"
                                            style={inputBoxStyle}
                                        >
                                            {selectedEvent.start_time}
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            End Date
                                        </label>
                                        <div
                                            className="text-sm"
                                            style={inputBoxStyle}
                                        >
                                            {selectedEvent.end_date}
                                        </div>
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            End Time
                                        </label>
                                        <div
                                            className="text-sm"
                                            style={inputBoxStyle}
                                        >
                                            {selectedEvent.end_time}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                    style={{
                                        border: isDark
                                            ? '1px solid rgba(239,68,68,0.35)'
                                            : '1px solid rgba(239,68,68,0.20)',
                                        background: isDark
                                            ? 'rgba(239,68,68,0.19)'
                                            : 'rgba(239,68,68,0.29)',
                                        color: isDark ? '#d4e8ee' : '#1a1a1a',
                                        boxShadow: isDark
                                            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
                                            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark
                                            ? 'rgba(239,68,68,0.29)'
                                            : 'rgba(239,68,68,0.36)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark
                                            ? 'rgba(239,68,68,0.19)'
                                            : 'rgba(239,68,68,0.29)';
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
}