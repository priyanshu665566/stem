import { useEffect, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import CustomSelect from '../components/CustomSelect'
import { getAllUsers, createUser, updateUser, deleteUser } from '../api/users'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const ROLE_OPTIONS = [
    { value: 'user', label: 'User' },
    { value: 'content-creator', label: 'Content Creator' },
    { value: 'ccg-admin', label: 'CCG Admin' },
]

const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.(com|in)$/
const MAX_LENGTH = 30

const initialForm = {
    name: '',
    email: '',
    contact_no: '',
    role: '',
    password: '',
}

export default function Users() {
    const { isDark } = useTheme()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState(initialForm)
    const [avatarFile, setAvatarFile] = useState(null)
    const [formError, setFormError] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(true)
    const [showMessage, setShowMessage] = useState(false)

    /* ── Colour tokens (mirrored from Events) ── */
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

    /* ── Button colours (mirrored from Events) ── */
    const buttonStyle = {
        add:    isDark ? '#10b981' : '#228B22',
        edit:   isDark ? '#3b82f6' : '#2563eb',
        delete: isDark ? '#ef4444' : '#dc2626',
    }

    /* ── Shared ActionButton (identical to Events) ── */
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
    )

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

    const resetForm = () => {
        setFormData(initialForm)
        setAvatarFile(null)
        setFormError('')
    }

    const openAddModal = () => {
        resetForm()
        setEditingUser(null)
        setShowModal(true)
    }

    const openEditModal = (user) => {
        setEditingUser(user)
        setFormData({
            name: user.name || '',
            email: user.email || '',
            contact_no: user.contact_no
                ? parsePhoneNumberFromString(user.contact_no)?.formatInternational()
                : '',
            role: user.role || '',
            password: '',
        })
        setAvatarFile(null)
        setFormError('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingUser(null)
        resetForm()
    }

    const validateForm = () => {
        const name = formData.name.trim()
        const email = formData.email.trim()
        const phone = formData.contact_no.trim()
        const password = formData.password.trim()

        // Name
        if (!name) return 'Name is required.'
        if (name.length > MAX_LENGTH) return 'Name must not exceed 30 characters.'

        // Email
        if (!email) return 'Email is required.'
        if (email.length > MAX_LENGTH) return 'Email must not exceed 30 characters.'
        if (!emailRegex.test(email)) return 'Enter a valid email (supports subdomains, .com/.in only).'

        // Phone
        if (phone) {
            const phoneNumber = parsePhoneNumberFromString(phone)

            if (!phoneNumber || !phoneNumber.isValid()) {
                return 'Enter a valid phone number with country code (e.g. +91 9876543210)'
            }
        }

        // Role
        if (!formData.role) return 'Please select a role.'

        // Password (only validate if entered)
        if (password) {
            if (password.length > MAX_LENGTH) return 'Password must not exceed 30 characters.'
            if (password.length < 6) return 'Password must be at least 6 characters.'
        }

        return ''
    }

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) { setAvatarFile(null); return }
        if (!file.type.startsWith('image/')) {
            setFormError('Profile photo must be an image file.')
            return
        }
        setFormError('')
        setAvatarFile(file)
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target
        setFormData(prev => ({ ...prev, [name]: value }))
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationError = validateForm()
        if (validationError) { setFormError(validationError); return }

        const payload = new FormData()
        payload.append('name', formData.name.trim())
        payload.append('email', formData.email.trim())

        let formattedPhone = formData.contact_no.trim()

        if (formattedPhone) {
            const phoneNumber = parsePhoneNumberFromString(formattedPhone)
            if (phoneNumber) {
                formattedPhone = phoneNumber.number // E.164 format
            }
        }

        payload.append('contact_no', formattedPhone)
        payload.append('role', formData.role)
        if (formData.password.trim()) payload.append('password', formData.password.trim())
        if (avatarFile) payload.append('avatar', avatarFile)

        setActionLoading(true)
        try {
            if (editingUser) {
                const response = await updateUser(editingUser.id, payload)
                setUsers(prev => prev.map(u => u.id === editingUser.id ? response.data : u))
                showToast(true, 'User updated successfully.')
            } else {
                const response = await createUser(payload)
                setUsers(prev => [response.data, ...prev])
                showToast(true, 'User created and password sent via email.')
            }
            closeModal()
        } catch (err) {
            console.error('User save failed:', err)
            setFormError(err.response?.data?.error || 'Failed to save user. Please try again.')
            showToast(false, 'Failed to save user. Please check the form.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return
        try {
            setActionLoading(userId)
            await deleteUser(userId)
            setUsers(prev => prev.filter(u => u.id !== userId))
            showToast(true, 'User deleted successfully.')
        } catch (err) {
            console.error('Delete failed:', err)
            showToast(false, 'Failed to delete user.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleStatus = async (user) => {
        const nextState = !user.is_active
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: nextState } : u))
        try {
            await updateUser(user.id, { is_active: nextState })
            showToast(true, `User marked ${nextState ? 'active' : 'inactive'}.`)
        } catch (err) {
            console.error('Status update failed:', err)
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: user.is_active } : u))
            showToast(false, 'Failed to update user status.')
        }
    }

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: headingColor }}>
                            User List
                        </h1>
                        <p className="text-sm sm:text-base" style={{ color: subColor }}>
                            Manage user accounts, roles, and activation status.
                        </p>
                    </div>
                    <ActionButton
                        icon={Plus}
                        text="Add User"
                        color={buttonStyle.add}
                        onClick={openAddModal}
                        title="Add New User"
                    />
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
                        <table className="w-full min-w-[780px]">
                            <thead>
                                <tr style={{ background: tableHeaderBg, borderBottom: `1px solid ${tableBorderColor}` }}>
                                    {['Name', 'Email', 'Phone Number', 'User Type', 'Status', 'Actions'].map(h => (
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
                                                <span className="text-sm" style={{ color: subColor }}>{user.contact_no
                                                    ? parsePhoneNumberFromString(user.contact_no)?.formatInternational()
                                                    : '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm" style={{ color: subColor }}>{user.role_display || user.role}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer"
                                                        style={{
                                                            background: user.is_active
                                                                ? (isDark ? '#059669' : '#10b981')
                                                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                                            boxShadow: isDark
                                                                ? 'inset 1px 1px 3px rgba(0,0,0,0.4)'
                                                                : 'inset 1px 1px 3px rgba(0,0,0,0.2)',
                                                        }}
                                                        onClick={() => handleToggleStatus(user)}
                                                    >
                                                        <Motion.div
                                                            animate={{ x: user.is_active ? 24 : 0 }}
                                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                            className="w-4 h-4 rounded-full bg-white shadow-md"
                                                        />
                                                    </div>
                                                    <span className="text-sm" style={{ color: subColor }}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <ActionButton
                                                        icon={Edit}
                                                        text="Edit"
                                                        color={buttonStyle.edit}
                                                        onClick={() => openEditModal(user)}
                                                        title="Edit User"
                                                    />
                                                    <ActionButton
                                                        icon={Trash2}
                                                        text="Delete"
                                                        color={buttonStyle.delete}
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        title="Delete User"
                                                    />
                                                </div>
                                            </td>
                                        </Motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Motion.div>
            )}

            {/* ── Add / Edit Modal (AnimatePresence + Motion.div, identical structure to Events) ── */}
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
                            className="w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 p-6"
                            style={cardStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: headingColor }}>
                                        {editingUser ? 'Edit User' : 'Add User'}
                                    </h2>
                                    <p className="text-xs opacity-70 mt-1" style={{ color: textColor }}>
                                        {editingUser
                                            ? 'Update user details and reset password if needed.'
                                            : 'Create a new user account and send login details immediately.'}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition"
                                >
                                    <X size={18} style={{ color: headingColor }} />
                                </button>
                            </div>

                            {/* Form Error */}
                            {formError && (
                                <div className="mb-4 rounded-lg p-3 text-sm font-medium" style={toastErrorStyle}>
                                    {formError}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>Name</label>
                                        <input name="name" maxLength={30} value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>Email</label>
                                        <input type="email" name="email" maxLength={40} value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="name@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>Phone Number</label>
                                        <input name="contact_no" maxLength={20} value={formData.contact_no} onChange={(e) => {
                                                // allow only digits
                                                let value = e.target.value

                                                // allow only valid characters
                                                value = value.replace(/[^0-9+\-\s]/g, '')

                                                setFormData(prev => ({ ...prev, contact_no: value }))
                                                setFormError('')
                                            }} style={inputStyle} placeholder="+1 555 123 4567" 
                                        />
                                    </div> 
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>User Type</label>
                                        <CustomSelect
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            options={ROLE_OPTIONS}
                                            placeholder="Select Role"
                                            isDark={isDark}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>Password</label>
                                        <input type="password" name="password" maxLength={30} value={formData.password} onChange={handleInputChange} style={inputStyle} placeholder={editingUser ? 'Leave blank to keep current' : 'Generated automatically'} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: labelColor }}>Profile Photo</label>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm" style={{ color: subColor }} />
                                        {avatarFile && (
                                            <p className="mt-1 text-xs" style={{ color: subColor }}>Selected: {avatarFile.name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer — identical button style to Events */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
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
                                        type="submit"
                                        disabled={actionLoading === true}
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
                                        {actionLoading === true
                                            ? (editingUser ? 'Saving...' : 'Creating...')
                                            : (editingUser ? 'Save User' : 'Create User')}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </>
    )
}