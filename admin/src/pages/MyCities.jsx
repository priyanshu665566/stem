/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities, getMyCities, deleteCity } from '../api/cities';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SmartImage from '../components/SmartImage';
import { Trash2, Edit, AlertCircle, Component, CodeXml } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function MyCities() {

    const navigate = useNavigate();
    const BASE_URL = "http://localhost:8000/";
    const { isContentCreator } = useAuth();
    const token = localStorage.getItem('accessToken');
    const { isDark } = useTheme();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [success, setSuccess] = useState(false);

    /* ── Colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const subColor = isDark ? '#5a8a96' : '#211f2f';
    const labelColor = isDark ? '#8ab4be' : '#444';
    const textColor = isDark ? '#d4e8ee' : '#1a1a1a';
    const tableHeaderBg = isDark
        ? 'rgba(126, 200, 216, 0.08)'
        : 'rgba(0, 0, 0, 0.04)';
    const tableBorderColor = isDark
        ? 'rgba(255, 255, 255, 0.07)'
        : 'rgba(0, 0, 0, 0.08)';
    const rowHoverBg = isDark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.02)';
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

    const buttonStyle = {
        edit: isDark ? '#3b82f6' : '#2563eb',
        mapper: isDark ? '#8b5cf6' : '#7c3aed',
        components: isDark ? '#ec4899' : '#be185d',
        delete: isDark ? '#ef4444' : '#dc2626',
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

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            setLoading(true);
            setError('');
            const res = isContentCreator ? await getMyCities() : await getCities();
            setCities(res.data);
        } catch (err) {
            console.error('Error fetching cities:', err);
            setError('Failed to load cities. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cityId) => {
        if (!window.confirm('Are you sure you want to delete this city?')) {
            return;
        }

        try {
            setDeleteLoading(cityId);
            await deleteCity(cityId);
            setCities(cities.filter(city => city.id !== cityId));
            setSuccess(true);
            setMessage('City deleted successfully!');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } catch (err) {
            console.error('Error deleting city:', err);
            setSuccess(false);
            setMessage('Error deleting city. Please try again.');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => setMessage(''), 400);
            }, 4000);
        } finally {
            setDeleteLoading(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
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

    const ActionButton = ({ icon: Icon, color, onClick, disabled, title }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: isDark ? `${color}15` : `${color}20`,
                color: color,
                border: `1px solid ${color}40`,
            }}
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto py-6 sm:py-8 animate-fade-up">
            {/* Header */}
            <div className="mb-8 sm:mb-10">
                <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                    style={{ color: headingColor }}
                >
                    My Cities
                </h1>
                <p
                    className="text-sm sm:text-base"
                    style={{ color: subColor }}
                >
                    Manage all your created cities in one place.
                </p>
            </div>

            {/* Toast Notification */}
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
                            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <AlertCircle size={20} className="shrink-0" />
                        )}
                        <span className="text-sm font-medium">{message}</span>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Error State */}
            {error && !loading && (
                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg flex items-center gap-3"
                    style={toastErrorStyle}
                >
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                    <button
                        onClick={fetchCities}
                        className="ml-auto text-sm font-medium underline hover:no-underline"
                    >
                        Retry
                    </button>
                </Motion.div>
            )}

            {/* Loading State */}
            {loading && (
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

            {/* Empty State */}
            {!loading && cities.length === 0 && !error && (
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                    style={cardStyle}
                >
                    <div style={{ color: subColor }} className="mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <p style={{ color: labelColor }} className="text-sm font-medium">
                        No cities created yet
                    </p>
                    <p style={{ color: subColor }} className="text-xs mt-1">
                        Start by creating your first city
                    </p>
                </Motion.div>
            )}

            {/* Table */}
            {!loading && cities.length > 0 && (
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={cardStyle}
                    className="rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Table Header */}
                            <thead>
                                <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${tableBorderColor}` }}>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                        Thumbnail
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                        City Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                        Created At
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                        State
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                <AnimatePresence>
                                    {cities.map((city, index) => {
                                        const statusPill = getStatusPill(city.status);
                                        return (
                                        <Motion.tr
                                            key={city.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-t transition-colors duration-200 hover:transition-none"
                                            style={{
                                                borderTopColor: tableBorderColor,
                                                backgroundColor: 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = rowHoverBg;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            {/* Thumbnail */}
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border" style={{ borderColor: tableBorderColor }}>
                                                    {city.thumbnail ? (
                                                        <SmartImage
                                                            avif={city.thumbnail.avif}
                                                            webp={city.thumbnail.webp}
                                                            fallback={city.thumbnail.original}
                                                            alt={city.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-full h-full object-cover"
                                                            priority={false}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="w-full h-full flex items-center justify-center"
                                                            style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                                        >
                                                            <span style={{ color: subColor }} className="text-xs">N/A</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* City Name */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium" style={{ color: textColor }}>
                                                    {city.name}
                                                </span>
                                            </td>

                                            {/* Created At */}
                                            <td className="px-6 py-4">
                                                <span className="text-xs" style={{ color: subColor }}>
                                                    {formatDate(city.created_at)}
                                                </span>
                                            </td>

                                            {/* State */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                                    style={{
                                                        background: statusPill.bg,
                                                        color: statusPill.text
                                                    }}
                                                >
                                                    {statusPill.label}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ActionButton
                                                        icon={Edit}
                                                        color={buttonStyle.edit}
                                                        onClick={() => navigate(`/edit-city/${city.id}`)}
                                                        title="Edit City"
                                                    />
                                                    <ActionButton
                                                        icon={CodeXml}
                                                        color={buttonStyle.mapper}
                                                        onClick={() => 
                                                            window.open(`http://localhost:5174/city-mapper/${city.id}?token=${token}`, '_blank')
                                                        }
                                                        title="City Mapper"
                                                    />
                                                    <ActionButton
                                                        icon={Component}
                                                        color={buttonStyle.components}
                                                        onClick={() => navigate('/city-components')}
                                                        title="City Components"
                                                    />
                                                    {!isContentCreator && (
                                                        <ActionButton
                                                            icon={Trash2}
                                                            color={buttonStyle.delete}
                                                            onClick={() => handleDelete(city.id)}
                                                            disabled={deleteLoading === city.id}
                                                            title="Delete City"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </Motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Footer info */}
                    <div
                        className="px-6 py-3 text-xs"
                        style={{
                            borderTop: `1px solid ${tableBorderColor}`,
                            color: subColor,
                            background: tableHeaderBg
                        }}
                    >
                        Total Cities: <span className="font-semibold">{cities.length}</span>
                    </div>
                </Motion.div>
            )}
        </div>
    );
}
