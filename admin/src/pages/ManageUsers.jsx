import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import CustomSelect from '../components/CustomSelect'
import { getAllUsers, updateUser, getActivityLogs } from '../api/users'

const ROLE_OPTIONS = [
    { value: 'user', label: 'User' },
    { value: 'content-creator', label: 'Content Creator' },
    { value: 'ccg-admin', label: 'CCG Admin' },
]

export default function ManageUsers() {
    const { isDark } = useTheme()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(true)
    const [showMessage, setShowMessage] = useState(false)

    // Change Role Modal
    const [showChangeRoleModal, setShowChangeRoleModal] = useState(false)
    const [selectedUserForRole, setSelectedUserForRole] = useState(null)
    const [selectedRole, setSelectedRole] = useState('')
    const [rolesaveLoading, setRoleSaveLoading] = useState(false)

    // Activity Log Modal
    const [showActivityModal, setShowActivityModal] = useState(false)
    const [selectedUserForActivity, setSelectedUserForActivity] = useState(null)
    const [activityLogs, setActivityLogs] = useState([])
    const [activityLoading, setActivityLoading] = useState(false)

    /* ── Colour tokens ── */
    const headingColor = isDark ? '#d4e8ee' : '#1a1a1a'
    const subColor = isDark ? '#5a8a96' : '#211f2f'
    const labelColor = isDark ? '#8ab4be' : '#211f2f'
    const textColor = isDark ? '#d4e8ee' : '#211f2f'
    const tableHeaderBg = isDark ? 'rgba(126, 200, 216, 0.08)' : 'rgba(0, 0, 0, 0.04)'
    const tableBorderColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.08)'
    const rowHoverBg = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)'

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

    const toastSuccessStyle = {
        background: isDark
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(16,185,129,0.06) 100%)',
        color: isDark ? '#86efac' : '#166534',
        border: isDark ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(34,197,94,0.3)',
        backdropFilter: 'blur(12px)',
    }

    const toastErrorStyle = {
        background: isDark
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(220,38,38,0.05) 100%)',
        color: isDark ? '#fca5a5' : '#991b1b',
        border: isDark ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(239,68,68,0.3)',
        backdropFilter: 'blur(12px)',
    }

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
    }

    useEffect(() => { loadUsers() }, [])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await getAllUsers()
            setUsers(response.data)
        } catch (err) {
            console.error('Error loading users:', err)
            setError('Unable to load users. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const showToast = (isSuccess, msg) => {
        setSuccess(isSuccess)
        setMessage(msg)
        setShowMessage(true)
        setTimeout(() => {
            setShowMessage(false)
            setTimeout(() => setMessage(''), 400)
        }, 4000)
    }

    /* ── Change Role Modal Functions ── */
    const openChangeRoleModal = (user) => {
        setSelectedUserForRole(user)
        setSelectedRole(user.role || '')
        setShowChangeRoleModal(true)
    }

    const closeChangeRoleModal = () => {
        setShowChangeRoleModal(false)
        setSelectedUserForRole(null)
        setSelectedRole('')
    }

    const handleSaveRole = async () => {
        if (!selectedRole) {
            showToast(false, 'Please select a role.')
            return
        }

        setRoleSaveLoading(true)
        try {
            const response = await updateUser(selectedUserForRole.id, { role: selectedRole })
            setUsers(prev => prev.map(u => u.id === selectedUserForRole.id ? response.data : u))
            showToast(true, 'User role updated successfully.')
            closeChangeRoleModal()
        } catch (err) {
            console.error('Role update failed:', err)
            showToast(false, 'Failed to update user role.')
        } finally {
            setRoleSaveLoading(false)
        }
    }

    /* ── Activity Log Modal Functions ── */
    const openActivityModal = async (user) => {
        setSelectedUserForActivity(user)
        setActivityLoading(true)
        try {
            const response = await getActivityLogs(user.id)
            setActivityLogs(response.data)
            setShowActivityModal(true)
        } catch (err) {
            console.error('Error loading activity logs:', err)
            showToast(false, 'Failed to load activity logs.')
        } finally {
            setActivityLoading(false)
        }
    }

    const closeActivityModal = () => {
        setShowActivityModal(false)
        setSelectedUserForActivity(null)
        setActivityLogs([])
    }

    const ActionButton = ({ text, color, onClick, disabled, title }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className="px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-xs font-bold"
            style={{
                background: isDark ? `${color}15` : `${color}10`,
                color: color,
                border: `1px solid ${color}40`,
            }}
        >
            {text}
        </button>
    )

    return (
        <>
            {/* ── Toast ── */}
            <AnimatePresence>
                {showMessage && (
                    <Motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-6 right-6 z-[100] p-4 rounded-lg flex items-center gap-3 max-w-sm"
                        style={success ? toastSuccessStyle : toastErrorStyle}
                    >
                        {success ? <CheckCircle className="shrink-0" size={20} /> : <AlertCircle size={20} className="shrink-0" />}
                        <span className="text-sm font-medium">{message}</span>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* ── Header ── */}
            <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                        title="Go back"
                    >
                        <ArrowLeft size={20} style={{ color: headingColor }} />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: headingColor }}>
                            Manage Users
                        </h1>
                        <p className="text-sm sm:text-base" style={{ color: subColor }}>
                            View and manage user roles and activities.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && !loading && (
                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl flex items-center gap-3"
                    style={toastErrorStyle}
                >
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </Motion.div>
            )}

            {/* ── Loading dots ── */}
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

            {/* ── Empty state ── */}
            {!loading && users.length === 0 && (
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                    style={cardStyle}
                >
                    <p style={{ color: labelColor }} className="text-sm font-medium">No users available</p>
                </Motion.div>
            )}

            {/* ── Table ── */}
            {!loading && users.length > 0 && (
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
                                    {['Name', 'Email', 'Role', 'Actions', 'User Activity'].map(h => (
                                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {users.map((user, index) => (
                                        <Motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-t transition-colors duration-200 hover:transition-none"
                                            style={{ borderTopColor: tableBorderColor, backgroundColor: 'transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHoverBg }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium" style={{ color: textColor }}>{user.name || user.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm" style={{ color: subColor }}>{user.email}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm" style={{ color: subColor }}>{user.role_display || user.role}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ActionButton
                                                    text="Change Role"
                                                    color={isDark ? '#3b82f6' : '#2563eb'}
                                                    onClick={() => openChangeRoleModal(user)}
                                                    title="Change User Role"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <ActionButton
                                                    text="View Activity"
                                                    color={isDark ? '#f59e0b' : '#d97706'}
                                                    onClick={() => openActivityModal(user)}
                                                    title="View User Activity Log"
                                                />
                                            </td>
                                        </Motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Motion.div>
            )}

            {/* ── Change Role Modal ── */}
            <AnimatePresence>
                {showChangeRoleModal && selectedUserForRole && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
                        onClick={closeChangeRoleModal}
                    >
                        <Motion.div
                            initial={{ scale: 0.95, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 40 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6"
                            style={cardStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: headingColor }}>
                                        Change User Type
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        Select a new role for {selectedUserForRole.name || selectedUserForRole.email}
                                    </p>
                                </div>
                                <button
                                    onClick={closeChangeRoleModal}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>Select Role</label>
                                <CustomSelect
                                    name="role"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    options={ROLE_OPTIONS}
                                    placeholder="Select Role"
                                    isDark={isDark}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeChangeRoleModal}
                                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                    style={{
                                        border: isDark ? '1px solid rgba(255,0,0,0.35)' : '1px solid rgba(255,0,0,0.20)',
                                        background: isDark ? 'rgba(255,0,0,0.19)' : 'rgba(255,0,0,0.29)',
                                        color: isDark ? '#d4e8ee' : '#1a1a1a',
                                        boxShadow: isDark
                                            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
                                            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.29)' : 'rgba(255,0,0,0.36)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(255,0,0,0.19)' : 'rgba(255,0,0,0.29)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveRole}
                                    disabled={rolesaveLoading}
                                    className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        border: isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(5,150,105,0.20)',
                                        background: isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)',
                                        color: isDark ? '#d4e8ee' : '#1a1a1a',
                                        boxShadow: isDark
                                            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
                                            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.29)' : 'rgba(5,150,105,0.36)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)' }}
                                >
                                    {rolesaveLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* ── Activity Log Modal ── */}
            <AnimatePresence>
                {showActivityModal && selectedUserForActivity && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
                        onClick={closeActivityModal}
                    >
                        <Motion.div
                            initial={{ scale: 0.95, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 40 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-3xl rounded-2xl shadow-2xl border border-white/10 p-6 max-h-[80vh] flex flex-col"
                            style={cardStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: headingColor }}>
                                        User Activity Log
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        Activity history for {selectedUserForActivity.name || selectedUserForActivity.email}
                                    </p>
                                </div>
                                <button
                                    onClick={closeActivityModal}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            {/* Activity Table */}
                            {activityLoading ? (
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
                            ) : activityLogs.length === 0 ? (
                                <div className="text-center py-8">
                                    <p style={{ color: labelColor }} className="text-sm font-medium">No activity logs available</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                            <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${tableBorderColor}` }}>
                                                {['Email', 'Action', 'Detail', 'Timestamp'].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: labelColor }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence>
                                                {activityLogs.map((log, index) => (
                                                    <Motion.tr
                                                        key={log.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-t transition-colors duration-200 hover:transition-none"
                                                        style={{ borderTopColor: tableBorderColor, backgroundColor: 'transparent' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = rowHoverBg }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs" style={{ color: textColor }}>{log.email}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs" style={{ color: subColor }}>{log.action}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs" style={{ color: subColor }}>User Logged in Successfully</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs" style={{ color: subColor }}>
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </span>
                                                        </td>
                                                    </Motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={closeActivityModal}
                                    className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                    style={{
                                        border: isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(5,150,105,0.20)',
                                        background: isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)',
                                        color: isDark ? '#d4e8ee' : '#1a1a1a',
                                        boxShadow: isDark
                                            ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
                                            : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.29)' : 'rgba(5,150,105,0.36)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.19)' : 'rgba(5,150,105,0.29)' }}
                                >
                                    Close
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
