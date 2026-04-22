/* eslint-disable no-unused-vars */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Users,
    PanelLeftOpen,
    PanelLeftClose,
    Layers,
    DoorOpen,
    LayoutGrid,
    Calendar,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const ADMIN_NAV = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Create City", icon: Building2, to: "/create-city" },
    { label: "Create Room", icon: DoorOpen, to: "/create-room" },
    { label: "My Cities", icon: Layers, to: "/my-cities" },
    { label: "My Rooms", icon: LayoutGrid, to: "/my-rooms" },
    { label: "Users", icon: Users, to: "/users" },
    { label: "Event Details", icon: Calendar, to: "/event-details" },
];

const CONTENT_CREATOR_NAV = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "Create Room", icon: DoorOpen, to: "/create-room" },
    { label: "My Cities", icon: Layers, to: "/my-cities" },
    { label: "My Rooms", icon: LayoutGrid, to: "/my-rooms" },
    { label: "Event Details", icon: Calendar, to: "/event-details" },
];

const USER_NAV = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { label: "My Cities", icon: Layers, to: "/my-cities" },
    { label: "My Rooms", icon: LayoutGrid, to: "/my-rooms" },
    { label: "Create Room", icon: DoorOpen, to: "/create-room" },
    { label: "Event Details", icon: Calendar, to: "/event-details" },
];

export default function Sidebar({ setMobileOpen }) {
    const [collapsed, setCollapsed] = useState(false);
    const { isDark } = useTheme();
    const { isContentCreator, isUser } = useAuth();

    /* ── colour tokens ── */
    const sidebarBg = isDark
        ? "rgba(8, 12, 18, 0.82)"
        : "rgba(240, 238, 234, 0.72)";
    const border = isDark
        ? "rgba(255,255,255,0.065)"
        : "rgba(0,0,0,0.09)";
    const textPrimary = isDark ? "#99FFFF" : "#1e1e1e";
    const textSecondary = isDark ? "#AFEEEE" : "#666";
    const activeColor = isDark ? "#99FFFF" : "#2d2d2d";
    const activeBg = isDark
        ? "rgba(126,200,216,0.10)"
        : "rgba(0,0,0,0.08)";
    const hoverBg = isDark
        ? "rgba(255,255,255,0.055)"
        : "rgba(0,0,0,0.05)";
    const tooltipBg = isDark ? "#0d1f2b" : "#1a1a1a";

    /* ── neumorphic sidebar shadow ── */
    const sidebarShadow = isDark
        ? "2px 0 20px rgba(0,0,0,0.55), inset -1px 0 0 rgba(255,255,255,0.04)"
        : "2px 0 16px rgba(0,0,0,0.10), inset -1px 0 0 rgba(255,255,255,0.60)";

    return (
        <aside
            className={`
                h-full flex flex-col shrink-0
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-17" : "w-60"}
            `}
            style={{
                position: "relative",
                overflow: "hidden",
                background: sidebarBg,
                backdropFilter: "blur(18px) saturate(160%)",
                WebkitBackdropFilter: "blur(18px) saturate(160%)",
                boxShadow: sidebarShadow,
                borderRight: `1px solid ${border}`,
            }}
        >
            {/* ── Grainy noise texture overlay ── */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 0,
                    opacity: isDark ? 0.12 : 0.08,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "180px 180px",
                    mixBlendMode: isDark ? "overlay" : "multiply",
                }}
            />
            {/* ── Wrapper to keep content above noise ── */}
            <div className="flex flex-col h-full flex-1" style={{ position: "relative", zIndex: 1 }}>
                {/* ── Header ── */}
                <div
                    className={`flex items-center h-14 shrink-0 ${collapsed ? "px-3 justify-center" : "px-4 justify-between"
                        }`}
                    style={{ borderBottom: `1px solid ${border}` }}
                >
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 animate-slide-left">
                            <img
                                src={import.meta.env.VITE_LOGO_URL}
                                alt="Logo"
                                className="w-7 h-7 shrink-0 object-contain"
                                loading="lazy"
                            />
                            <div>
                                <span
                                    className="font-semibold text-sm tracking-tight leading-none block"
                                    style={{ color: textPrimary }}
                                >
                                    StemCity
                                </span>
                                <span
                                    className="text-[10px] tracking-widest uppercase leading-none"
                                    style={{ color: textSecondary }}
                                >
                                    CMS
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg transition-all duration-200 shrink-0 cursor-pointer icon-hover-spin"
                        style={{ color: textSecondary }}
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed
                            ? <PanelLeftOpen size={18} />
                            : <PanelLeftClose size={18} />
                        }
                    </button>
                </div>

                {/* ── Navigation section label ── */}
                {!collapsed && (
                    <div className="px-4 pt-5 pb-2">
                        <span
                            className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                            style={{ color: textSecondary, opacity: 0.7 }}
                        >
                            Navigation
                        </span>
                    </div>
                )}

                {/* ── Nav Items ── */}
                <nav className={`flex-1 py-2 overflow-hidden ${collapsed ? "px-2" : "px-3"}`}>
                    {(() => {
                        const navItems = isContentCreator ? CONTENT_CREATOR_NAV : isUser ? USER_NAV : ADMIN_NAV;
                        return navItems.map(({ label, icon: Icon, to }, i) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen && setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5
                                 ${isActive ? "active" : ""}`
                                }
                                style={({ isActive }) => ({
                                    animationDelay: `${i * 60}ms`,
                                    background: isActive ? activeBg : "transparent",
                                    color: isActive ? activeColor : textSecondary,
                                })}
                                onMouseEnter={e => {
                                    if (!e.currentTarget.classList.contains("active")) {
                                        e.currentTarget.style.background = hoverBg;
                                        e.currentTarget.style.color = textPrimary;
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!e.currentTarget.classList.contains("active")) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = textSecondary;
                                    }
                                }}
                            >
                                <Icon
                                    size={17}
                                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                                />
                                {!collapsed && (
                                    <span className="whitespace-nowrap">{label}</span>
                                )}

                                {/* Collapsed tooltip */}
                                {collapsed && (
                                    <span
                                        className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium rounded-lg shadow-lg
                                               opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                                               transition-all duration-200 z-50"
                                        style={{
                                            background: tooltipBg,
                                            color: "#fff",
                                            border: `1px solid ${border}`,
                                        }}
                                    >
                                        {label}
                                    </span>
                                )}
                            </NavLink>
                        ));
                    })()}
                </nav>

                {/* ── Footer spacer (version tag) ── */}
                <div
                    className="p-3 text-center"
                    style={{ borderTop: `1px solid ${border}` }}
                >
                    {!collapsed && (
                        <span
                            className="text-[10px]"
                            style={{ color: textSecondary, opacity: 0.5 }}
                        >
                            v1.0
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
}