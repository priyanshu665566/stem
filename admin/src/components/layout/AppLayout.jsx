import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isDark } = useTheme();

    return (
        <div
            className="noise-bg flex h-screen w-screen overflow-hidden"
            style={{
                background: isDark
                    ? "linear-gradient(160deg, #152331 0%, #0a1018 60%, #000000 100%)"
                    : "linear-gradient(160deg, #8399a2 10%, #ebf4f5 100%)",
                transition: "background 0.5s ease",
            }}
        >
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-20 md:hidden"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    h-full fixed md:static inset-y-0 left-0 z-30
                    transform transition-transform duration-300 ease-in-out md:transform-none
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <Sidebar setMobileOpen={setMobileOpen} />
            </div>

            {/* Main area: Navbar on top, content below */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

                {/* Page content — transparent, scrollable */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}