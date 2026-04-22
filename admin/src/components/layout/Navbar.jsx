/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, Menu, X, User } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar({ mobileOpen, setMobileOpen }) {
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ── colour tokens ── */
    const navBg = isDark
        ? "rgba(10, 15, 20, 0.72)"
        : "rgba(240, 238, 234, 0.72)";
    const border = isDark
        ? "#AFEEEE"
        : "#696969";
    const textColor = isDark ? "#99FFFF" : "#2d2d2d";
    const subColor = isDark ? "#AFEEEE" : "#141313";
    const toggleBg = isDark ? "#87CEFA" : "#c8c5be";
    const signOutHover = isDark
        ? "rgba(239,68,68,0.18)"
        : "rgba(239,68,68,0.10)";
    const dropdownBg = isDark
        ? "rgba(10, 18, 25, 0.96)"
        : "rgba(248, 246, 242, 0.98)";
    const dropdownBorder = isDark
        ? "rgba(175,238,238,0.12)"
        : "rgba(0,0,0,0.09)";

    return (
        <header
            className="navbar-glass shrink-0 flex items-center justify-between px-4 md:px-6 h-14 z-20"
            style={{
                background: navBg,
                borderBottom: `1px solid ${border}`,
                transition: "background 0.4s ease, border-color 0.4s ease",
            }}
        >
            {/* ── Left: hamburger (mobile) + brand ── */}
            <div className="flex items-center gap-3">
                {/* hamburger — visible on mobile */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-1.5 rounded-lg transition-colors"
                    style={{ color: subColor }}
                    aria-label="Toggle sidebar"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <img
                        src={import.meta.env.VITE_LOGO_URL}
                        alt="StemCity Logo"
                        className="w-7 h-7 object-contain"
                        loading="lazy"
                    />
                    <div className="hidden sm:block">
                        <span
                            className="text-lg font-bold tracking-tight leading-none"
                            style={{ color: textColor }}
                        >
                            StemCity CMS
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Right: theme toggle + user menu ── */}
            <div className="flex items-center gap-2 sm:gap-3">

                {/* Visit Site button */}
            <a
                href="http://localhost:5174"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                    color: subColor,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    width: '200px',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = `${subColor}30`;
                    e.currentTarget.style.borderColor = subColor;
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = border;
                }}
            >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                Visit Site
            </a>

                {/* Theme label (desktop) */}
                <span
                    className="hidden sm:block text-xs font-medium"
                    style={{ color: subColor }}
                >
                    {isDark ? "Light" : "Dark"}
                </span>

                {/* Toggle pill */}
                <button
                    onClick={toggleTheme}
                    className={`theme-toggle ${isDark ? "dark" : ""}`}
                    style={{ 
                        background: isDark ? "#2a6070" : "#b0aca3",
                        border: `1px solid ${isDark ? "#AFEEEE" : "#141313"}` 
                    }}
                    aria-label="Toggle theme"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <div className="theme-toggle-thumb">
                        {isDark
                            ? <Moon size={10} strokeWidth={2.5} style={{ color: "#294861" }} />
                            : <Sun size={10} strokeWidth={2.5} style={{ color: "#c0a060" }} />
                        }
                    </div>
                </button>

                {/* Divider */}
                <div
                    className="hidden sm:block w-px h-5 mx-1"
                    style={{ background: border }}
                />

                {/* ── User avatar + dropdown ── */}
                <div ref={dropdownRef} className="relative">
                    {/* Avatar button */}
                    <button
                        onClick={() => setDropdownOpen((o) => !o)}
                        className="flex items-center justify-center w-8 h-8 rounded-full
                                   transition-all duration-200 cursor-pointer"
                        style={{
                            background: dropdownOpen
                                ? `${subColor}30`
                                : `${subColor}18`,
                            color: subColor,
                            border: `1.5px solid ${dropdownOpen ? subColor : `${subColor}60`}`,
                        }}
                        title="Account"
                    >
                        <User size={15} strokeWidth={2} />
                    </button>

                    {/* Dropdown panel */}
                    {dropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-44 rounded-xl overflow-hidden z-50 shadow-xl"
                            style={{
                                background: dropdownBg,
                                border: `1px solid ${dropdownBorder}`,
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                            }}
                        >
                            {/* My Profile */}
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    navigate("/my-profile");
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5
                                           text-xs font-medium transition-colors duration-150 cursor-pointer"
                                style={{ color: subColor }}
                                onMouseEnter={e => (e.currentTarget.style.background = `${subColor}18`)}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <User size={13} />
                                My Profile
                            </button>

                            {/* Divider */}
                            <div style={{ borderTop: `1px solid ${dropdownBorder}` }} />

                            {/* Sign Out */}
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    handleLogout();
                                }}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5
                                           text-xs font-medium transition-colors duration-150 cursor-pointer"
                                style={{ color: subColor }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = signOutHover;
                                    e.currentTarget.style.color = "#ef4444";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = subColor;
                                }}
                            >
                                <LogOut size={13} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}