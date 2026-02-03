import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share2, Compass, MapPin, GripHorizontal } from "lucide-react";
import YatraMap, { YatraLocation } from "@/components/features/YatraMap";
import { Card } from "@/components/ui/card";

import { YatraPlace } from "@/types";

const ROUTES = [
    {
        id: "swami-complete",
        name: "Swami's complete journey",
        subRoutes: [
            { id: "ekant", name: "Ekant" },
            { id: "purvardh", name: "Purvardh" },
            { id: "uttarardh", name: "Uttarardh" }
        ]
    },
    { id: "dattatray", name: "Shri Dattatray Prabhu Viharan" },
    { id: "govind", name: "Shri Govind Prabhu Viharan" },
    { id: "chakrapani", name: "Shri Chakrapani Prabhu Viharan" },
    { id: "krishna", name: "Shri Krishna Prabhu Viharan" }
];

const SwamiYatra = () => {
    const navigate = useNavigate();
    const [places, setPlaces] = useState<(YatraLocation & {
        time?: string;
        title?: string;
        description?: string;
        image?: string;
        isLive?: boolean;
        attendees?: string;
        route?: string;
        subRoute?: string;
    })[]>([]);

    const [selectedRoute, setSelectedRoute] = useState(ROUTES[0].id);
    const [selectedSubRoute, setSelectedSubRoute] = useState<string | null>(null);

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [panelHeight, setPanelHeight] = useState(40); // Percentage of viewport height
    const [previousPanelHeight, setPreviousPanelHeight] = useState(40); // Store height before fullscreen
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<HTMLDivElement>(null);

    const toggleFullScreen = () => {
        if (!isFullScreen) {
            // Going to fullscreen - save current height
            setPreviousPanelHeight(panelHeight);
            setIsFullScreen(true);
        } else {
            // Exiting fullscreen - restore previous height
            setPanelHeight(previousPanelHeight);
            setIsFullScreen(false);
        }
    };

    useEffect(() => {
        const q = query(collection(db, "yatraPlaces"), orderBy("sequence", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            console.log(`🕉️ Fetching ${snapshot.docs.length} yatra places from Firebase`);

            const fetchedPlaces = snapshot.docs.map((doc) => {
                const data = doc.data() as YatraPlace;

                return {
                    id: doc.id,
                    name: data.name,
                    latitude: data.latitude || 25.3176,
                    longitude: data.longitude || 83.0062,
                    sequence: data.sequence,
                    status: (data.status === "visited" ? "completed" :
                        data.status === "stayed" || data.status === "current" ? "current" : "upcoming") as YatraLocation["status"],
                    time: data.time || "TBD",
                    title: data.name,
                    description: data.description || "Sacred pilgrimage destination",
                    image: data.image || "/placeholder-temple.jpg",
                    isLive: data.isLive || false,
                    attendees: data.attendees || "",
                    route: data.route,
                    subRoute: data.subRoute
                };
            });

            console.log(`✅ Successfully loaded ${fetchedPlaces.length} yatra places`);
            setPlaces(fetchedPlaces);
        }, (error) => {
            console.error("❌ Error fetching yatra places:", error);
        });
        return () => unsub();
    }, []);


    // Handle drag to resize panel
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const windowHeight = window.innerHeight;
            const newHeight = ((windowHeight - e.clientY) / windowHeight) * 100;

            // Calculate max height to keep slider above bottom bar
            // Bottom bar is at 80px (bottom-20) on mobile, 16px (bottom-4) on desktop
            const bottomBarHeight = window.innerWidth >= 1024 ? 16 : 80;
            const sliderHandleHeight = 32;
            const buffer = 20;
            const minSpaceFromBottom = bottomBarHeight + sliderHandleHeight + buffer;
            const maxHeightPercent = ((windowHeight - minSpaceFromBottom) / windowHeight) * 100;

            // Constrain between 20% and calculated max
            const constrainedHeight = Math.min(Math.max(newHeight, 20), maxHeightPercent);
            setPanelHeight(constrainedHeight);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;

            const touch = e.touches[0];
            const windowHeight = window.innerHeight;
            const newHeight = ((windowHeight - touch.clientY) / windowHeight) * 100;

            // Calculate max height to keep slider above bottom bar
            const bottomBarHeight = window.innerWidth >= 1024 ? 16 : 80;
            const sliderHandleHeight = 32;
            const buffer = 20;
            const minSpaceFromBottom = bottomBarHeight + sliderHandleHeight + buffer;
            const maxHeightPercent = ((windowHeight - minSpaceFromBottom) / windowHeight) * 100;

            // Constrain between 20% and calculated max
            const constrainedHeight = Math.min(Math.max(newHeight, 20), maxHeightPercent);
            setPanelHeight(constrainedHeight);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div className="min-h-screen bg-[#F9F6F0] lg:bg-white font-sans flex flex-col pb-24 lg:pb-0 overflow-hidden">
            {/* Header - Hidden in Fullscreen */}
            {/* Header - Hidden in Fullscreen */}
            {!isFullScreen && (
                <div className="sticky top-0 z-40 px-4 py-4 flex items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-100">
                    <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-7 h-7 text-[#0f3c6e]" />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3c6e] font-serif">Raj Viharan</h1>
                    </div>
                    <Button variant="ghost" size="icon" className="-mr-2 hover:bg-black/5">
                        <Share2 className="w-6 h-6 text-[#0f3c6e]" />
                    </Button>
                </div>
            )}

            {/* Map Section - Dynamic Height */}
            <div
                className={`relative transition-all ${isDragging ? '' : 'duration-300 ease-in-out'} ${isFullScreen
                    ? "fixed inset-0 w-screen h-screen z-[99999] rounded-none bg-slate-100"
                    : "w-full"
                    } bg-slate-100`}
                style={!isFullScreen ? { height: `${100 - panelHeight}vh` } : {}}
            >
                <div className="w-full h-full">
                    <YatraMap locations={places.filter(p => {
                        if (selectedRoute === "swami-complete") {
                            if (selectedSubRoute) return p.subRoute === selectedSubRoute;
                            return !p.route || p.route === "swami-complete"; // Default to complete if no route
                        }
                        return p.route === selectedRoute;
                    })} />
                </div>

                {/* Floating "Confirmed" Badge */}
                {!isFullScreen && (
                    <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 z-[400]">
                        CONFIRMED
                    </div>
                )}

                {/* Back Button - Only in Fullscreen (Top Left) */}
                {isFullScreen && (
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-6 left-6 z-[400] rounded-full bg-white/90 hover:bg-white text-blue-900 h-12 w-12"
                        onClick={toggleFullScreen}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                )}

                {/* Maximize/Minimize Button - Bottom Right of Map */}
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-6 right-6 z-[400] rounded-full bg-white/90 hover:bg-white text-blue-900 h-12 w-12 border-2 border-amber-500/20"
                    onClick={toggleFullScreen}
                >
                    {isFullScreen ? (
                        // Minimize icon - arrows pointing inward to corners
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 14h6v6" />
                            <path d="M20 10h-6V4" />
                            <path d="M14 10l7-7" />
                            <path d="M3 21l7-7" />
                        </svg>
                    ) : (
                        // Maximize icon - arrows pointing outward from corners
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6" />
                            <path d="M9 21H3v-6" />
                            <path d="M21 3l-7 7" />
                            <path d="M3 21l7-7" />
                        </svg>
                    )}
                </Button>
            </div>

            {/* Draggable Handle */}
            {!isFullScreen && (
                <div
                    ref={dragRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    className={`relative z-30 bg-white/95 backdrop-blur-sm cursor-ns-resize select-none ${isDragging ? 'bg-amber-100' : 'hover:bg-gray-50'
                        } transition-colors`}
                    style={{ height: '32px' }}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                            <GripHorizontal className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline Section - Bottom Half (Scrollable) with Dynamic Height */}
            <div
                className="flex-1 bg-[#F9F6F0] relative z-10 space-y-0 overflow-y-auto"
                style={!isFullScreen ? { minHeight: `${panelHeight}vh`, height: `${panelHeight}vh` } : {}}
            >
                {/* Route Selector sticky top within timeline */}
                <div className="sticky top-0 z-20 bg-[#F9F6F0]/95 backdrop-blur-sm border-b border-gray-100 px-4 py-4 space-y-3">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {ROUTES.map((route) => (
                            <button
                                key={route.id}
                                onClick={() => {
                                    setSelectedRoute(route.id);
                                    setSelectedSubRoute(null);
                                }}
                                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border-2 ${selectedRoute === route.id
                                    ? "bg-[#0f3c6e] text-white border-[#0f3c6e]"
                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 shadow-sm"
                                    }`}
                            >
                                {route.name}
                            </button>
                        ))}
                    </div>

                    {/* Sub-route Selector */}
                    {selectedRoute === "swami-complete" && (
                        <div className="flex items-center gap-3 pl-2 animate-in slide-in-from-left-2 duration-300">
                            <div className="w-1 h-8 bg-amber-500/20 rounded-full" />
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setSelectedSubRoute(null)}
                                    className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all ${selectedSubRoute === null
                                        ? "text-amber-600 bg-amber-50"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    All Phases
                                </button>
                                {ROUTES.find(r => r.id === "swami-complete")?.subRoutes?.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubRoute(sub.id)}
                                        className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all ${selectedSubRoute === sub.id
                                            ? "text-amber-600 bg-amber-50"
                                            : "text-slate-400 hover:text-slate-600"
                                            }`}
                                    >
                                        {sub.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 pt-4 pb-6 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-heading font-bold text-xl text-blue-900">Yatra Itinerary</h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-full h-8 w-8"
                                onClick={() => setPanelHeight(panelHeight === 20 ? 40 : 20)}
                            >
                                {panelHeight === 20 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="18 15 12 9 6 15"></polyline>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                )}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-full h-8 w-8">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Timeline Container */}
                    <div className="relative pl-4 space-y-12">
                        {/* Timeline vertical line */}
                        <div className="absolute left-[-11px] top-0 bottom-0 w-0.5 bg-slate-200 z-0" />
                        {(() => {
                            const filtered = places.filter(p => {
                                if (selectedRoute === "swami-complete") {
                                    if (selectedSubRoute) return p.subRoute === selectedSubRoute;
                                    return !p.route || p.route === "swami-complete";
                                }
                                return p.route === selectedRoute;
                            });

                            return filtered.length > 0 ? (
                                filtered.map((place) => (
                                    <div key={place.id} className="relative pl-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {/* Sequence Marker */}
                                        <div className={`absolute -left-[27px] top-0 flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#F9F6F0] z-10 ${place.status === 'completed' ? 'bg-[#0f3c6e] text-white' :
                                            place.status === 'current' ? 'bg-[#0f3c6e] text-white' :
                                                'bg-white border-slate-200 text-slate-400'
                                            }`}>
                                            {place.status === 'completed' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            ) : place.status === 'current' ? (
                                                <MapPin className="w-4 h-4" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-3">
                                            <span className={`text-[10px] font-bold tracking-widest uppercase ${place.status === 'current' ? 'text-amber-600' : 'text-slate-400'
                                                }`}>
                                                {place.time}
                                            </span>

                                            <Card className={`p-4 rounded-2xl border-none overflow-hidden flex gap-4 ${place.status === 'current' ? 'bg-white ring-1 ring-amber-100' : 'bg-white shadow-sm'}`}>
                                                <div className="flex-1 space-y-2">
                                                    <h3 className="font-heading font-bold text-lg text-blue-900 leading-tight">
                                                        {place.title}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                                        {place.description}
                                                    </p>

                                                    {place.isLive && (
                                                        <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full mt-2">
                                                            <div className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                                                                Live Location
                                                            </span>
                                                            <span className="text-[10px] text-amber-600 italic border-l border-amber-200 pl-2">
                                                                {place.attendees}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Thumbnail Image */}
                                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                                                    <img
                                                        src={place.image}
                                                        alt={place.title}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                    />
                                                    <div className="hidden w-full h-full items-center justify-center bg-gray-200 text-gray-400">
                                                        <MapPin className="w-6 h-6 opacity-20" />
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-gray-100">
                                    <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                    <h3 className="text-slate-500 font-bold">No places found</h3>
                                    <p className="text-slate-400 text-xs mt-1">Information for this route segment will be added soon.</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Start Navigation sticky footer */}
                <div className="fixed bottom-20 lg:bottom-4 left-6 right-6 z-50">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-base font-bold py-6 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wide">
                        <Compass className="w-5 h-5 animate-pulse" />
                        Start Navigation
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SwamiYatra;

