import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import SmartImage from "../components/SmartImage";
import { UploadCloud, User, Lock, Mail, Smartphone, Briefcase, X } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

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

export default function MyProfile() {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      throw { error: 'Unauthorized' };
    }

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    const body = options.body;
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      window.location.href = '/login';
      throw { error: 'Unauthorized' };
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw data;
    }
    return data;
  };

  const fetchProfile = async () => {
    try {
      const data = await apiFetch('/api/auth/user/profile/', { method: 'GET' });
      if (!data) return;
      setName(data.name || '');
      setEmail(data.email || '');
      setContactNo(data.contact_no || '');
      setRole(data.designation || '');
      // Handle new image format: {original, webp, avif}
      if (data.avatar && typeof data.avatar === 'object') {
        setAvatarUrl(data.avatar);
      } else {
        // Fallback for old format
        setAvatarUrl(data.avatar_url || data.avatarUrl || null);
      }
    } catch (error) {
      setSuccess(false);
      setMessage(error?.error || 'Unable to load profile.');
      setShowMessage(true);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiFetch('/api/auth/user/avatar/', {
        method: 'POST',
        body: formData,
      });
      // Handle new image format: {original, webp, avif}
      if (response.avatar && typeof response.avatar === 'object') {
        setAvatarUrl(response.avatar);
      } else {
        // Fallback for old format
        setAvatarUrl(response.avatarUrl || response.avatar_url || null);
      }
      setSuccess(true);
      setMessage(response.message || 'Avatar uploaded successfully.');
      setShowMessage(true);
    } catch (error) {
      setSuccess(false);
      setMessage(error?.error || 'Avatar upload failed.');
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      setSuccess(false);
      setMessage("Please enter your name before saving.");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => setMessage(""), 400);
      }, 5000);
      return false;
    }

    if (contactNo && !/^\+?[0-9\s()-]{7,20}$/.test(contactNo)) {
      setSuccess(false);
      setMessage("Please enter a valid contact number.");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        setTimeout(() => setMessage(""), 400);
      }, 5000);
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await apiFetch('/api/auth/user/profile/update/', {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim(), contact_no: contactNo }),
      });

      if (password) {
        if (password.length < 8) {
            setSuccess(false);
            setMessage('New password must be at least 8 characters.');
            setShowMessage(true);
            setLoading(false);
            return;
          }
          await apiFetch('/api/auth/user/password/', {
            method: 'PATCH',
            body: JSON.stringify({ newPassword: password }),
          });
      }

      await fetchProfile();
      setSuccess(true);
      setMessage('Profile updated successfully.');
      setShowMessage(true);
      setPassword('');
    } catch (error) {
      setSuccess(false);
      setMessage(error?.error || error?.message || 'Unable to save profile.');
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  /* ── Colour tokens ── */
  const headingColor = isDark ? '#d4e8ee' : '#1a1a1a';
  const subColor = isDark ? '#AFEEEE' : '#211f2f';
  const labelColor = isDark ? '#AFEEEE' : '#444';

  const cardStyle = isDark
    ? {
      background: 'rgba(15, 25, 35, 0.72)',
      border: '1px solid rgba(255,255,255,0.07)',
      backdropFilter: 'blur(14px)',
      boxShadow: '4px 4px 24px rgba(0,0,0,0.5), -2px -2px 10px rgba(255,255,255,0.02)',
    }
    : {
      background: '#e8e6e1',
      border: '1px solid rgba(255,255,255,0.75)',
      boxShadow: '5px 5px 12px rgba(0,0,0,0.10), -4px -4px 12px rgba(255,255,255,0.88)',
    };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    borderRadius: '0.625rem',
    border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.10)',
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
    color: isDark ? '#d4e8ee' : '#1a1a1a',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxShadow: isDark
      ? 'inset 2px 2px 6px rgba(0,0,0,0.35), inset -1px -1px 4px rgba(255,255,255,0.02)'
      : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.75)',
  };

  const divider = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const btnBg = isDark ? '#1a4a5a' : '#2d2d2d';
  const btnHover = isDark ? '#1e5a6e' : '#111';

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

  const disabledBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(243,244,246,0.95)';
  const disabledBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(148,163,184,0.3)';
  const disabledColor = isDark ? '#7b8c97' : '#6b7280';

  return (
    <>
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 lg:px-8">
        {/* Header */}
        <div className="mb-5 sm:mb-7 animate-fade-up">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: headingColor }}>
            My Profile
          </h2>
          <p className="text-xs sm:text-sm mt-1" style={{ color: subColor }}>
            Manage your account details and personal information.
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6 animate-fade-up">
          {/* LEFT SIDE: 30% Profile Card */}
          <section className="w-full lg:w-[30%] rounded-2xl p-5 sm:p-7" style={cardStyle}>
            <div className="mb-6">
              <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: labelColor }}>
                Account Overview
              </h3>
              <p className="text-xs mt-2" style={{ color: subColor }}>
                Profile photo and basic information.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5">
              {/* Profile Avatar */}
              <div className="relative group">
                <div
                  className="flex items-center justify-center rounded-full overflow-hidden border-2 transition-all duration-300"
                  style={{
                    width: 140,
                    height: 140,
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(248,248,250,1)',
                    boxShadow: isDark
                      ? 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -1px -1px 4px rgba(255,255,255,0.02)'
                      : 'inset 3px 3px 8px rgba(0,0,0,0.08), inset -3px -3px 8px rgba(255,255,255,0.75)',
                  }}
                >
                  {avatarUrl ? (
                    typeof avatarUrl === 'string' ? (
                      <img
                        src={avatarUrl}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <SmartImage
                        avif={avatarUrl.avif}
                        webp={avatarUrl.webp}
                        fallback={avatarUrl.original}
                        alt="Profile avatar"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                        priority={true}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(236,241,248,1)' }}>
                      <User size={56} style={{ color: isDark ? '#7aa8c1' : '#6b7280' }} />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="absolute bottom-0 right-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 opacity-0 group-hover:opacity-100"
                  style={{
                    background: isDark ? 'rgba(26,74,90,0.95)' : 'rgba(45,45,45,0.95)',
                    color: '#ffffff',
                    transform: 'translate(12px, 12px)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <UploadCloud size={14} />
                  Change
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />

              {/* User Name Display */}
              <div className="text-center">
                <p className="text-base font-semibold" style={{ color: headingColor }}>
                  {name || 'User'}
                </p>
                <p className="text-xs mt-1" style={{ color: subColor }}>
                  {role || '--'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${divider}` }}>
              <p className="text-xs font-medium mb-3" style={{ color: labelColor }}>Email</p>
              <p className="text-sm" style={{ color: subColor }}>{email}</p>
            </div>
          </section>

          {/* RIGHT SIDE: 70% Form Card */}
          <section className="w-full lg:w-[70%] rounded-2xl p-5 sm:p-7" style={cardStyle}>
            <div className="mb-6">
              <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: labelColor }}>
                Update Profile
              </h3>
              <p className="text-xs mt-2" style={{ color: subColor }}>
                Edit your account details and save changes.
              </p>
            </div>

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
                    {success ? <AnimatedCheckIcon size={20} /> : <AnimatedErrorIcon size={20} />}
                  </Motion.div>
                  <Motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.3 }} style={{ flex: 1 }}>
                    {message}
                  </Motion.span>
                  <Motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    onClick={() => { setShowMessage(false); setTimeout(() => setMessage(""), 400); }}
                    className="ml-auto text-lg leading-none hover:opacity-70 transition-opacity cursor-pointer"
                    style={{ padding: '2px 4px' }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </Motion.button>
                  <Motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 5, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: success ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)',
                      transformOrigin: 'left',
                    }}
                  />
                </Motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
              {/* Name and Email Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: subColor }}>
                    <User size={14} />
                    <span>Display name for your account</span>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    style={inputStyle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: subColor }}>
                    <Mail size={14} />
                    <span>Verified email address</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled
                    style={{
                      ...inputStyle,
                      background: disabledBg,
                      border: `1px solid ${disabledBorder}`,
                      color: disabledColor,
                      cursor: 'not-allowed',
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>

              {/* Password and Designation Row */}
              {/* Password Row */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>
                  Password
                </label>
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: subColor }}>
                  <Lock size={14} />
                  <span>Leave unchanged to keep current password, or type a new one</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password to change it"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>
                  Designation
                </label>
                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: subColor }}>
                    <Briefcase size={14} />
                    <span>Account role</span>
                  </div>
                  <input
                    type="text"
                    value={role}
                    disabled
                    style={{
                      ...inputStyle,
                      background: disabledBg,
                      border: `1px solid ${disabledBorder}`,
                      color: disabledColor,
                      cursor: 'not-allowed',
                      opacity: 0.7,
                    }}
                  />
              </div>

              {/* Contact Number */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: labelColor }}>
                  Contact Number
                </label>
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: subColor }}>
                  <Smartphone size={14} />
                  <span>Mobile phone number</span>
                </div>
                <input
                  type="tel"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  placeholder="E.g., +1 (555) 123-4567"
                  style={inputStyle}
                />
              </div>

              {/* Divider and Button */}
              <div className="pt-3" style={{ borderTop: `1px solid ${divider}` }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md w-full sm:w-auto"
                  style={{
                    background: loading ? (isDark ? '#0d2a36' : '#999') : btnBg,
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                    boxShadow: loading ? 'none' : isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '4px 4px 10px rgba(0,0,0,0.18), -2px -2px 6px rgba(255,255,255,0.5)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = btnHover; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = btnBg; }}
                >
                  {loading ? 'Saving…' : 'Update Profile'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
