/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import { FolderCog, DoorClosedLocked, MicVocal, Users } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function ActionCard({ title, description, icon: Icon, to, isDark, delay = 0, desktopImage }) {
    const cardStyle = isDark
        ? {
            background: "rgba(21, 35, 49, 0.65)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
            boxShadow: "4px 4px 18px rgba(0,0,0,0.55), -2px -2px 8px rgba(255,255,255,0.025)",
        }
        : {
            background: "#e8e6e1",
            border: "1px solid rgba(255,255,255,0.70)",
            boxShadow: "4px 4px 9px rgba(0,0,0,0.11), -4px -4px 12px rgba(255,255,255,0.8)",
        };

    const iconBg = isDark ? "rgba(126,200,216,0.10)" : "rgba(0,0,0,0.06)";
    const iconColor = isDark ? "#7ec8d8" : "#374151";
    const titleColor = isDark ? "#99FFFF" : "#1a1a1a";
    const descColor = isDark ? "#AFEEEE" : "#777";

    return (
        <Link to={to} className="block h-full group animate-fade-up" style={{ animationDelay: `${delay}ms` }}>

            {/* ── Desktop card (xl+) with full image + overlay ── */}
            {desktopImage && (
                <div
                    className="hidden xl:flex rounded-2xl overflow-hidden cursor-pointer relative transition-transform duration-300 group-hover:-translate-y-2"
                    style={{
                        height: '220px',
                        ...( isDark
                            ? { border: "1px solid rgba(255,255,255,0.07)", boxShadow: "4px 4px 18px rgba(0,0,0,0.55)" }
                            : { border: "1px solid rgba(255,255,255,0.70)", boxShadow: "4px 4px 9px rgba(0,0,0,0.11)" }
                        )
                    }}
                >
                    {/* Background image */}
                    <img
                        src={desktopImage}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)",
                        }}
                    />

                    {/* Text pinned to bottom */}
                    <div className="relative z-10 mt-auto p-5 w-full">
                        <h3 className="text-sm font-semibold leading-snug mb-1" style={{ color: "#fff" }}>
                            {title}
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                            {description}
                        </p>
                        <div
                            className="mt-2 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1"
                            style={{ color: "#7ec8d8" }}
                        >
                            <span>Open</span>
                            <span>→</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mobile/tablet card (below xl) — original icon layout ── */}
            <div
                className={`action-card p-6 rounded-2xl h-full flex flex-col cursor-pointer ${desktopImage ? 'xl:hidden' : ''}`}
                style={cardStyle}
            >
                <div
                    className="p-3 rounded-xl w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: iconBg, color: iconColor }}
                >
                    <Icon size={22} />
                </div>
                <h3 className="text-base font-semibold mb-2 leading-snug" style={{ color: titleColor }}>
                    {title}
                </h3>
                <p className="text-xs leading-relaxed mt-auto" style={{ color: descColor }}>
                    {description}
                </p>
                <div
                    className="mt-4 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1"
                    style={{ color: isDark ? "#7ec8d8" : "#555" }}
                >
                    <span>Open</span>
                    <span>→</span>
                </div>
            </div>

        </Link>
    );
}

export default function Dashboard() {
    const { isDark } = useTheme();
    const { isAdmin, userName } = useAuth();

    const headingColor = isDark ? "#d4e8ee" : "#1a1a1a";
    const subColor = isDark ? "#AFEEEE" : "#211f2f";

    // Non-admin Welcome Screen (for content-creator and user roles)
    if (!isAdmin) {
        return (
            <div className="max-w-5xl mx-auto py-6 sm:py-8 flex items-center justify-center min-h-[600px]">
                <div className="text-center animate-fade-up">
                    <div className="mb-6">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{
                                background: isDark ? "rgba(126,200,216,0.15)" : "rgba(0,0,0,0.08)",
                                color: isDark ? "#7ec8d8" : "#374151"
                            }}
                        >
                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: headingColor }}>
                        Welcome, {userName}! 👋
                    </h1>
                    <p className="text-sm sm:text-base max-w-md mx-auto mb-8" style={{ color: subColor }}>
                        Use the sidebar to navigate and manage your content, cities, rooms, and events.
                    </p>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="max-w-5xl mx-auto py-6 sm:py-8">
            {/* Header */}
            <div className="mb-8 sm:mb-10 animate-fade-up">
                <h1
                    className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
                    style={{ color: headingColor }}
                >
                    Welcome back, Admin 👋
                </h1>
                <p
                    className="text-sm sm:text-base max-w-xl"
                    style={{ color: subColor }}
                >
                    Here's your workspace. Choose an action below to get started.
                </p>
            </div>

            {/* Section label */}
            <p
                className="text-[11px] font-semibold tracking-widest uppercase mb-4 animate-fade-up"
                style={{ color: subColor, opacity: 0.7, animationDelay: "60ms" }}
            >
                Quick Actions
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                <ActionCard
                    title="Manage Cities"
                    description="View and manage city permissions."
                    icon={FolderCog}
                    to="/manage-cities"
                    isDark={isDark}
                    delay={80}
                    desktopImage={import.meta.env.VITE_1_URL}
                />
                <ActionCard
                    title="Manage Rooms"
                    description="View and manage room permissions."
                    icon={DoorClosedLocked}
                    to="/manage-rooms"
                    isDark={isDark}
                    delay={140}
                    desktopImage={import.meta.env.VITE_2_URL}
                />
                <ActionCard
                    title="Manage Events"
                    description="Publish and manage your events."
                    icon={MicVocal}
                    to="/manage-events"
                    isDark={isDark}
                    delay={200}
                    desktopImage={import.meta.env.VITE_3_URL}
                />
                <ActionCard
                    title="Manage Users"
                    description="View and manage user accounts."
                    icon={Users}
                    to="/manage-users"
                    isDark={isDark}
                    delay={260}
                    desktopImage={import.meta.env.VITE_4_URL}
                />
            </div>
        </div>
    );
}