/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { createEvent, updateEvent as updateEventAPI, deleteEvent, getEvents, getMyEvents } from '../api/events';
import { getRooms, getAllowedRooms } from '../api/rooms';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventsContext';
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

export default function EventDetails() {
    const { isDark } = useTheme();
    const { isContentCreator, isUser } = useAuth();
    const { events, loading, addEvent, updateEvent, removeEvent } = useEvents();
    const [rooms, setRooms] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        event_name: '',
        description: '',
        room: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: ''
    });

    /* ── Colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const subColor = isDark ? '#5a8a96' : '#211f2f';
    const labelColor = isDark ? '#8ab4be' : '#211f2f';
    const textColor = isDark ? '#d4e8ee' : '#211f2f';
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
        add: isDark ? '#10b981' : '#228B22',
        edit: isDark ? '#3b82f6' : '#2563eb',
        delete: isDark ? '#ef4444' : '#dc2626',
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

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsRes = isContentCreator ? await getAllowedRooms() : await getRooms();
                setRooms(roomsRes.data);
            } catch (err) {
                console.error('Error fetching rooms:', err);
            }
        };
        fetchRooms();
    }, [isContentCreator]);

    const handleAddEvent = () => {
        setEditingEvent(null);
        setFormData({
            event_name: '',
            description: '',
            room: '',
            start_date: '',
            start_time: '',
            end_date: '',
            end_time: ''
        });
        setShowModal(true);
    };

    const handleEditEvent = (event) => {
        console.log('event.room_id:', event.room_id, typeof event.room_id);
        console.log('rooms:', rooms.map(r => ({ id: r.id, type: typeof r.id })));
        setEditingEvent(event);
        setFormData({
            event_name: event.event_name,
            description: event.description || '',
            room: String(event.room ?? ''),
            start_date: event.start_date,
            start_time: event.start_time,
            end_date: event.end_date,
            end_time: event.end_time
        });
        setShowModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        
        try {
            setActionLoading(eventId);
            await deleteEvent(eventId);
            removeEvent(eventId);
            setSuccess(true);
            setMessage('Event deleted successfully!');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } catch (err) {
            console.error('Error deleting event:', err);
            setSuccess(false);
            setMessage('Error deleting event. Please try again.');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } finally {
            setActionLoading(null);
        }
    };

    const validateDateTimeRange = () => {
        const start = new Date(`${formData.start_date}T${formData.start_time}`);
        const end = new Date(`${formData.end_date}T${formData.end_time}`);

        if (end <= start) {
            setSuccess(false);
            setMessage(
                formData.end_date === formData.start_date
                    ? 'End time must be after start time on the same day.'
                    : 'End date & time must be after start date & time.'
            );
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateDateTimeRange()) return;

        try {
            setActionLoading('submit');
            if (editingEvent) {
                const response = await updateEventAPI(editingEvent.id, formData);
                updateEvent(editingEvent.id, response.data);
                setMessage('Event updated successfully!');
            } else {
                const response = await createEvent(formData);
                addEvent(response.data);
                setMessage('Event created successfully!');
            }
            setSuccess(true);
            setShowMessage(true);
            setShowModal(false);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } catch (err) {
            console.error('Error saving event:', err);
            setSuccess(false);
            setMessage('Error saving event. Please try again.');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } finally {
            setActionLoading(null);
        }
    };

    const ActionButton = ({ icon: Icon, color, onClick, disabled, title, text }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold"
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

    const closeModal = () => {
        setShowModal(false);
        setEditingEvent(null);
    };

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
            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.75)',
    };

    const selectBoxStyle = {
        ...inputBoxStyle,
        cursor: 'pointer',
    };

    return (
        <>
            <div className="mb-8 sm:mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: headingColor }}>
                            Event Details
                        </h1>
                        <p className="text-sm sm:text-base" style={{ color: subColor }}>
                            Manage and oversee all events in the system.
                        </p>
                    </div>
                    <ActionButton
                        icon={Plus}
                        text="Add an Event"
                        color={buttonStyle.add}
                        onClick={handleAddEvent}
                        title="Add New Event"
                    />
                </div>
            </div>

            <AnimatePresence>
                {showMessage && (
                    <Motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-6 right-6 z-100 p-4 rounded-lg flex items-center gap-3 max-w-sm"
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Room</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Start Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Start Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>End Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>End Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Event State</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {events.map((event, index) => {
                                        const statusPill = getStatusPill(event.event_state);
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
                                                    <span className="text-sm" style={{ color: subColor }}>{event.description || 'No description'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.room_name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.start_date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.start_time}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.end_date}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{event.end_time}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statusPill.bg, color: statusPill.text }}>
                                                        {statusPill.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <ActionButton
                                                            icon={Edit}
                                                            text="Edit"
                                                            color={buttonStyle.edit}
                                                            onClick={() => handleEditEvent(event)}
                                                            title="Edit Event"
                                                        />
                                                        <ActionButton
                                                            icon={Trash2}
                                                            text="Delete"
                                                            color={buttonStyle.delete}
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                            disabled={actionLoading === event.id}
                                                            title="Delete Event"
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

            {/* Add/Edit Event Modal */}
            <AnimatePresence>
                {showModal && (
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
                                        {editingEvent ? 'Edit Event' : 'Add Event'}
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        {editingEvent ? 'Update event details' : 'Create a new event'}
                                    </p>
                                </div>

                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Event Name */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Event Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.event_name}
                                        onChange={(e) => setFormData({...formData, event_name: e.target.value})}
                                        style={inputBoxStyle}
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        style={inputBoxStyle}
                                        rows={3}
                                    />
                                </div>

                                {/* Room Name */}
                                <div>
                                    <label
                                        className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: labelColor }}
                                    >
                                        Room Name
                                    </label>
                                    <CustomSelect
                                        name="room"
                                        value={formData.room}
                                        onChange={(e) => setFormData({...formData, room: e.target.value})}
                                        options={rooms.map(room => ({
                                            value: String(room.id),
                                            label: room.room_name
                                        }))}
                                        placeholder="Select a Room"
                                        isDark={isDark}
                                        required
                                    />
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
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                            style={inputBoxStyle}
                                            required
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                            style={inputBoxStyle}
                                            required
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                            style={inputBoxStyle}
                                            required
                                        />
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <label
                                            className="block text-xs font-semibold uppercase tracking-wider mb-2"
                                            style={{ color: labelColor }}
                                        >
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                            style={inputBoxStyle}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                        style={{
                                            border: isDark
                                                ? '1px solid rgba(255,0,0,0.35)'
                                                : '1px solid rgba(255,0,0,0.20)',
                                            background: isDark
                                                ? 'rgba(255,0,0,0.19)'
                                                : 'rgba(255,0,0,0.29)',
                                            color: isDark ? '#d4e8ee' : '#1a1a1a',
                                            boxShadow: isDark
                                                ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
                                                : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
                                            backdropFilter: 'blur(6px)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = isDark
                                                ? 'rgba(255,0,0,0.29)'
                                                : 'rgba(255,0,0,0.36)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = isDark
                                                ? 'rgba(255,0,0,0.19)'
                                                : 'rgba(255,0,0,0.29)';
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading === 'submit'}
                                        className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                                        style={{
                                            border: isDark
                                                ? '1px solid rgba(16,185,129,0.35)'
                                                : '1px solid rgba(5,150,105,0.20)',
                                            background: isDark
                                                ? 'rgba(16,185,129,0.19)'
                                                : 'rgba(5,150,105,0.29)',
                                            color: isDark ? '#d4e8ee' : '#1a1a1a',
                                            boxShadow: isDark
                                                ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
                                                : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
                                            backdropFilter: 'blur(6px)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = isDark
                                                ? 'rgba(16,185,129,0.29)'
                                                : 'rgba(5,150,105,0.36)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = isDark
                                                ? 'rgba(16,185,129,0.19)'
                                                : 'rgba(5,150,105,0.29)';
                                        }}
                                    >
                                        {actionLoading === 'submit' ? 'Saving...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    );
}