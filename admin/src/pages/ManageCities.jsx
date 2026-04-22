/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, publishCity } from '../api/cities';
import { getUsers } from '../api/users';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, MapPin, Eye, AlertCircle } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function ManageCities() {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [success, setSuccess] = useState(false);

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
        hotspots: isDark ? '#8b5cf6' : '#7c3aed',
        review: isDark ? '#3b82f6' : '#2563eb',
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            const [citiesRes, usersRes] = await Promise.all([
                getCities(),
                getUsers()
            ]);
            setCities(citiesRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load cities. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (cityId) => {
        try {
            setActionLoading(cityId);
            await publishCity(cityId);
            setCities(cities.map(city => 
                city.id === cityId ? { ...city, status: 'published' } : city
            ));
            setSuccess(true);
            setMessage('City published successfully!');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } catch (err) {
            console.error('Error publishing city:', err);
            setSuccess(false);
            setMessage('Error publishing city. Please try again.');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } finally {
            setActionLoading(null);
        }
    };

    const getUserName = (userId) => {
        if (!userId) return "No Manager";
        const user = users.find(u => u.id === userId || u.pk === userId); // Handle typical ID keys
        if (!user) return "No Manager";
        return user.name || user.username || user.email || "No Manager";
    };

    const getStatusPill = (status) => {
        switch (status) {
            case 'published':
                return {
                    bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)',
                    text: isDark ? '#86efac' : '#166534',
                    label: 'Published'
                };
            case 'in_review':
                return {
                    bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)',
                    text: isDark ? '#93c5fd' : '#1e40af',
                    label: 'In Review'
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

    return (
        <div className="max-w-7xl mx-auto py-6 sm:py-8 animate-fade-up">
            <div className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: headingColor }}>
                    Manage Cities
                </h1>
                <p className="text-sm sm:text-base" style={{ color: subColor }}>
                    Oversight and publishing management for all cities.
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

            {error && !loading && (
                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg flex items-center gap-3"
                    style={toastErrorStyle}
                >
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                    <button onClick={fetchData} className="ml-auto text-sm font-medium underline hover:no-underline">
                        Retry
                    </button>
                </Motion.div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <Motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full" style={{ background: isDark ? '#7ec8d8' : '#2d2d2d' }} />
                        ))}
                    </div>
                </div>
            )}

            {!loading && cities.length === 0 && !error && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12" style={cardStyle}>
                    <p style={{ color: labelColor }} className="text-sm font-medium">No cities available</p>
                </Motion.div>
            )}

            {!loading && cities.length > 0 && (
                <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle} className="rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${tableBorderColor}` }}>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>City Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>City Manager</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>City State</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {cities.map((city, index) => {
                                        const statusPill = getStatusPill(city.status);
                                        const publishDisabled = city.status === 'published';
 
                                        return (
                                            <Motion.tr
                                                key={city.id}
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
                                                    <span className="text-sm font-medium" style={{ color: textColor }}>{city.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm" style={{ color: subColor }}>{getUserName(city.content_creator_id)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statusPill.bg, color: statusPill.text }}>
                                                        {statusPill.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <ActionButton
                                                            icon={CheckCircle}
                                                            text="Publish"
                                                            color={buttonStyle.publish}
                                                            onClick={() => handlePublish(city.id)}
                                                            disabled={publishDisabled || actionLoading === city.id}
                                                            title={publishDisabled ? "Can only publish if In Review" : "Publish City"}
                                                        />
                                                        <ActionButton
                                                            icon={MapPin}
                                                            text="Review Hotspots"
                                                            color={buttonStyle.hotspots}
                                                            onClick={() => navigate('/dashboard')}
                                                            title="Review Hotspots"
                                                        />
                                                        <ActionButton
                                                            icon={Eye}
                                                            text="Review City"
                                                            color={buttonStyle.review}
                                                            onClick={() => navigate('/dashboard')}
                                                            title="Review City"
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
        </div>
    );
}