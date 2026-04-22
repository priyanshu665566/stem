import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function RoomComponents() {
    const { isDark } = useTheme()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    /* ── Colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a'
    const subColor = isDark ? '#5a8a96' : '#211f2f'
    const labelColor = isDark ? '#8ab4be' : '#211f2f'
    const textColor = isDark ? '#d4e8ee' : '#211f2f'
    const tableHeaderBg = isDark ? 'rgba(126, 200, 216, 0.08)' : 'rgba(0, 0, 0, 0.04)'
    const tableBorderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)'

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
        }

    return (
        <>
            {/* ── Header ── */}
            <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/my-rooms')}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                        title="Go back"
                    >
                        <ArrowLeft size={20} style={{ color: headingColor }} />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: headingColor }}>
                            Room Components
                        </h1>
                        <p className="text-sm sm:text-base" style={{ color: subColor }}>
                            Manage components for your room.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Table (always show, empty body for now) ── */}
            {!loading && (
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={cardStyle}
                    className="rounded-2xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${tableBorderColor}` }}>
                                    {['Name', 'Created At', 'Type', 'Status'].map(h => (
                                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <p style={{ color: labelColor }} className="text-sm font-medium">No components available</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Motion.div>
            )}
        </>
    )
}
