import { Home, Map as MapIcon, Compass, Footprints, User, Search, Bookmark, Settings, Feather } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
    const location = useLocation();
    const isSthanaVandan = location.pathname.includes("sthana-vandan") || location.pathname.includes("/yatra");

    return (
        <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center h-20 px-6">

                {isSthanaVandan ? (
                    <>
                        {/* Sthana Vandan Bottom Bar */}
                        {/* Home (Dashboard) */}
                        <NavLink to="/dashboard" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && location.pathname === "/dashboard" && "text-amber-600")}>
                            <Home className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                        </NavLink>

                        {/* Sthaan */}
                        <NavLink to="/dashboard/sthana-vandan" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <MapIcon className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Sthaan</span>
                        </NavLink>

                        {/* Central Floating Button (Explore Map) */}
                        <NavLink to="/explore" className="relative -top-6">
                            <div className="w-16 h-16 bg-[#0f3c6e] rounded-full flex items-center justify-center shadow-lg border-4 border-[#F9F6F0] hover:scale-105 transition-transform">
                                <img src="/icons/explore_safari.png" alt="Explore" className="w-8 h-8 object-contain brightness-0 invert" />
                            </div>
                        </NavLink>

                        {/* Viharan (Yatra) */}
                        <NavLink to="/yatra" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <Footprints className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Viharan</span>
                        </NavLink>

                        {/* Profile */}
                        <NavLink to="/profile" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <User className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                        </NavLink>
                    </>
                ) : (
                    <>
                        {/* Main Dashboard Bottom Bar */}
                        {/* Home */}
                        <NavLink to="/dashboard" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <Home className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                        </NavLink>

                        {/* Search */}
                        <NavLink to="/search" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <Search className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Search</span>
                        </NavLink>

                        {/* Central Floating Button (Explore Map) */}
                        <NavLink to="/explore" className="relative -top-6">
                            <div className="w-16 h-16 bg-[#0f3c6e] rounded-full flex items-center justify-center shadow-lg border-4 border-[#F9F6F0] hover:scale-105 transition-transform">
                                <img src="/icons/explore_safari.png" alt="Explore" className="w-8 h-8 object-contain brightness-0 invert" />
                            </div>
                        </NavLink>

                        {/* Saved */}
                        <NavLink to="/saved" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <Bookmark className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Saved</span>
                        </NavLink>

                        {/* More */}
                        <NavLink to="/settings" className={({ isActive }) => cn("flex flex-col items-center gap-1 text-gray-400 hover:text-amber-600 transition-colors", isActive && "text-amber-600")}>
                            <Settings className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
                        </NavLink>
                    </>
                )}

            </div>
        </nav>
    );
};
