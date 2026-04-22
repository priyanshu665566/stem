import { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

function OptionItem({ opt, isSelected, isDark, getOptionStyle, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={getOptionStyle(isSelected, hovered)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            <span>{opt.label}</span>
            {isSelected && (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                        d="M2 6.5l3.5 3.5 6-6"
                        stroke={isDark ? '#7ec8d8' : '#2d2d2d'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    );
}

export default function CustomSelect({
    name,
    value,
    onChange,
    options,
    placeholder,
    isDark,
    required = false,
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const triggerStyle = {
        width: '100%',
        padding: '0.55rem 2.25rem 0.55rem 0.875rem',
        borderRadius: '0.625rem',
        border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
        color: selected ? (isDark ? '#d4e8ee' : '#1a1a1a') : (isDark ? '#5a8a96' : '#999'),
        fontSize: '0.875rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxShadow: isDark
            ? 'inset 1px 1px 4px rgba(0,0,0,0.3)'
            : 'inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.6)',
    };

    const menuStyle = {
        position: 'absolute',
        top: 'calc(100% + 5px)',
        left: 0,
        right: 0,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        zIndex: 9999,
        background: isDark ? '#0d1e2b' : '#eceae5',
        border: isDark
            ? '1px solid rgba(255,255,255,0.09)'
            : '1px solid rgba(255,255,255,0.8)',
        boxShadow: isDark
            ? '0 8px 28px rgba(0,0,0,0.55)'
            : '4px 4px 14px rgba(0,0,0,0.10), -3px -3px 10px rgba(255,255,255,0.75)',
    };

    const getOptionStyle = (isSelected, isHovered) => ({
        padding: '0.5rem 0.875rem',
        fontSize: '0.875rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: isSelected
            ? (isDark ? '#7ec8d8' : '#1a1a1a')
            : (isDark ? '#AFEEEE' : '#333'),
        background: isSelected
            ? (isDark ? 'rgba(26,74,90,0.55)' : 'rgba(0,0,0,0.06)')
            : isHovered
                ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')
                : 'transparent',
        fontWeight: isSelected && !isDark ? 500 : 400,
        transition: 'background 0.1s',
    });

    return (
        <div style={{ position: 'relative' }} ref={ref}>

            {/* Hidden native select for form validation */}
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                aria-hidden="true"
                tabIndex={-1}
                style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                }}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Visible custom trigger */}
            <div
                style={triggerStyle}
                onClick={() => setOpen(o => !o)}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = isDark
                        ? 'rgba(255,255,255,0.20)'
                        : 'rgba(0,0,0,0.18)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isDark
                        ? 'rgba(255,255,255,0.10)'
                        : 'rgba(0,0,0,0.10)';
                }}
            >
                <span>{selected ? selected.label : placeholder}</span>
                <Motion.svg
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    style={{ flexShrink: 0 }}
                >
                    <path
                        d="M3 5l4 4 4-4"
                        stroke={isDark ? '#5a8a96' : '#999'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Motion.svg>
            </div>

            {/* Dropdown menu */}
            <AnimatePresence>
                {open && (
                    <Motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={menuStyle}
                    >
                        {/* Placeholder row */}
                        {placeholder && (
                            <>
                                <div style={{
                                    padding: '0.5rem 0.875rem',
                                    fontSize: '0.875rem',
                                    color: isDark ? '#3a6070' : '#60696b',
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                }}>
                                    {placeholder}
                                </div>
                                <div style={{
                                    height: '1px',
                                    margin: '0 0.75rem',
                                    background: isDark
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'rgba(0,0,0,0.07)',
                                }} />
                            </>
                        )}

                        {/* Options */}
                        {options.map(opt => {
                            const isSelected = String(opt.value) === String(value);
                            return (
                                <OptionItem
                                    key={opt.value}
                                    opt={opt}
                                    isSelected={isSelected}
                                    isDark={isDark}
                                    getOptionStyle={getOptionStyle}
                                    onClick={() => {
                                        onChange({ target: { name, value: opt.value } });
                                        setOpen(false);
                                    }}
                                />
                            );
                        })}
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}