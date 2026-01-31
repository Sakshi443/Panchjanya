import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Temple } from "@/types";
import { useNavigate } from "react-router-dom";
import { Search, Compass, MapPin, ChevronRight, Filter, X, Bookmark, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

// Custom Icon for 'Explore' Map (Golden Circle with Symbol)
const exploreIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI0ZDQjkwMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHBhdGggZD0iTTIwIDEydjE2TTEyIDIwaDE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=', // Placeholder SVG base64
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

// Inner Map Component to handle center/zoom updates
function MapEffect({ temples }: { temples: Temple[] }) {
    const map = useMap();
    useEffect(() => {
        if (temples.length > 0) {
            const bounds = L.latLngBounds(temples.map(t => [t.latitude || 0, t.longitude || 0]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [temples, map]);
    return null;
}

// Separate TempleMarker component to fix React closure issue
function TempleMarker({ temple, onSelect }: { temple: Temple; onSelect: (temple: Temple) => void }) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Check if temple is saved
    useEffect(() => {
        const checkIfSaved = async () => {
            if (!user || !temple) {
                setIsSaved(false);
                return;
            }

            try {
                const savedRef = doc(db, `users/${user.uid}/savedTemples/${temple.id}`);
                const savedDoc = await getDoc(savedRef);
                setIsSaved(savedDoc.exists());
            } catch (error) {
                console.error("Error checking saved status:", error);
                setIsSaved(false);
            }
        };

        checkIfSaved();
    }, [user, temple]);

    // Toggle save/unsave
    const toggleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !temple || isSaving) return;

        setIsSaving(true);
        try {
            const savedRef = doc(db, `users/${user.uid}/savedTemples/${temple.id}`);

            if (isSaved) {
                // Unsave
                await deleteDoc(savedRef);
                setIsSaved(false);
            } else {
                // Save
                await setDoc(savedRef, {
                    templeId: temple.id,
                    savedAt: new Date(),
                    templeName: temple.name,
                    templeCity: temple.city || temple.address || "",
                    templeImage: temple.images?.[0] || ""
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Marker
            position={[temple.latitude || 0, temple.longitude || 0]}
            icon={L.divIcon({
                className: "custom-explore-marker",
                html: `<div style="background-color: #d97706; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 6px rgba(217, 119, 6, 0.3), 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.2)'; this.style.boxShadow='0 0 0 8px rgba(217, 119, 6, 0.4), 0 4px 12px rgba(0,0,0,0.3)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 0 6px rgba(217, 119, 6, 0.3), 0 2px 8px rgba(0,0,0,0.2)';"></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })}
            eventHandlers={{
                click: () => onSelect(temple)
            }}
        >
            {/* Tooltip - Shows on Hover */}
            <Tooltip
                direction="top"
                offset={[0, -12]}
                className="rounded-lg shadow-xl border-none p-0 overflow-hidden"
            >
                <div className="px-3 py-2 bg-white/95 backdrop-blur-sm border-l-4 border-amber-600">
                    <p className="font-heading text-blue-900 font-bold text-sm whitespace-nowrap">{temple.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">
                        {temple.city || temple.district || "Maharashtra"}
                    </p>
                </div>
            </Tooltip>

            {/* Popup - Shows on Click */}
            <Popup
                closeButton={true}
                className="custom-temple-popup"
                offset={[0, -5]}
                minWidth={250}
                maxWidth={280}
                autoPan={true}
                autoPanPaddingTopLeft={[20, 100]}
                autoPanPaddingBottomRight={[20, 100]}
                keepInView={true}
            >
                <div className="p-2">
                    {/* Horizontal Layout: Left Content + Right Image */}
                    <div className="flex gap-2 items-stretch">
                        {/* Left Side: Content (60-70%) */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                            {/* Temple Name */}
                            <h3 className="font-heading font-bold text-sm text-blue-900 leading-tight line-clamp-2 mb-1">
                                {temple.name}
                            </h3>

                            {/* Location */}
                            <div className="flex items-start gap-1 text-[10px] text-muted-foreground mb-2">
                                <MapPin className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                                <span className="leading-tight line-clamp-1">
                                    {temple.city && temple.city !== temple.district ? `${temple.city}, ` : ""}
                                    {temple.district || "Maharashtra"}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5 mt-auto">
                                <Button
                                    className="flex-1 bg-blue-900 hover:bg-blue-800 text-white h-8 rounded-lg shadow-sm text-xs font-bold px-3"
                                    onClick={() => navigate(`/temple/${temple.id}/architecture`)}
                                >
                                    Details
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (temple.latitude && temple.longitude) {
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`, "_blank");
                                        }
                                    }}
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Right Side: Image (30-40%) - fills height of content */}
                        <div className="w-20 rounded-lg overflow-hidden bg-slate-100 relative flex-shrink-0">
                            <img
                                src={temple.images?.[0] || "/placeholder-temple.jpg"}
                                alt={temple.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                                }}
                            />
                            {/* Bookmark Button */}
                            <button
                                onClick={toggleSave}
                                disabled={isSaving || !user}
                                className={`absolute top-1 right-1 p-1 rounded-full shadow-md transition-all ${isSaved
                                    ? "bg-amber-500 text-white"
                                    : "bg-white/90 text-gray-700 hover:bg-amber-50"
                                    }`}
                            >
                                <Bookmark className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

const Explore = () => {
    const [temples, setTemples] = useState<Temple[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [selectedTaluka, setSelectedTaluka] = useState<string>("");
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Default Hampi/Selected Temple for the card
    const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "temples"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Temple[];

            console.log("Total temples loaded:", data.length);
            console.log("All temples:", data.map(t => ({
                name: t.name,
                hasCoords: !!(t.latitude && t.longitude),
                latitude: t.latitude,
                longitude: t.longitude
            })));

            // Check for temples without coordinates
            const templesWithoutCoords = data.filter(t => !t.latitude || !t.longitude);
            if (templesWithoutCoords.length > 0) {
                console.warn("Temples missing coordinates:", templesWithoutCoords.map(t => t.name));
            }

            setTemples(data);
            if (data.length > 0) {
                // Set a default selected temple (e.g., first one or Hampi if found)
                const hampi = data.find(t => t.name.toLowerCase().includes("hampi"));
                setSelectedTemple(hampi || data[0]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Get unique districts and talukas
    const districts = Array.from(new Set(temples.map(t => t.district).filter(Boolean))).sort();
    const talukas = Array.from(new Set(temples.map(t => t.taluka).filter(Boolean))).sort();

    // Filter temples based on search, district, and taluka
    const filteredTemples = temples.filter(temple => {
        const matchesSearch = !searchQuery ||
            temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            temple.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            temple.district?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDistrict = !selectedDistrict || temple.district === selectedDistrict;
        const matchesTaluka = !selectedTaluka || temple.taluka === selectedTaluka;

        return matchesSearch && matchesDistrict && matchesTaluka;
    });

    const activeFiltersCount = (selectedDistrict ? 1 : 0) + (selectedTaluka ? 1 : 0);

    const clearFilters = () => {
        setSelectedDistrict("");
        setSelectedTaluka("");
    };

    return (
        <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-background lg:bg-white animate-in fade-in duration-300">
            {/* Standard Header */}
            {/* Transparent Header Container */}
            <div className="absolute top-0 left-0 right-0 z-[400] px-4 py-4 flex items-center justify-between pointer-events-none">

                {/* Left: Back & Title */}
                <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
                    <Button variant="ghost" size="icon" className="-ml-1 md:-ml-2 hover:bg-white/20 bg-white/10 backdrop-blur-md rounded-full w-9 h-9 md:w-10 md:h-10" onClick={() => navigate('/')}>
                        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-[#0f3c6e]" />
                    </Button>
                    <h1 className="text-sm md:text-xl font-heading font-bold text-[#0f3c6e] font-serif drop-shadow-sm bg-white/10 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-full border border-white/20 whitespace-nowrap">
                        Explore
                    </h1>
                </div>

                {/* Center: Search Bar */}
                <div className="pointer-events-auto w-full max-w-sm mx-4">
                    <div className="relative rounded-full bg-white/95 backdrop-blur-md border border-white/40 flex items-center">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder={t("explore.searchPlaceholder")}
                            className="pl-10 pr-10 h-11 rounded-full border-none bg-transparent focus-visible:ring-0 text-sm placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0f3c6e] w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
                        >
                            <div className="relative">
                                <Filter className="w-4 h-4" />
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right: Logo */}
                <div className="bg-white/90 backdrop-blur-md p-2 md:p-2.5 rounded-full border border-white/20 flex-shrink-0 pointer-events-auto">
                    <Compass className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="absolute top-32 left-4 right-4 z-[400] pointer-events-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading font-bold text-lg text-blue-900">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* District Filter */}
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-2">District</label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                >
                                    <option value="">All Districts</option>
                                    {districts.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Taluka Filter */}
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-2">Taluka</label>
                                <select
                                    value={selectedTaluka}
                                    onChange={(e) => setSelectedTaluka(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                                >
                                    <option value="">All Talukas</option>
                                    {talukas.map(taluka => (
                                        <option key={taluka} value={taluka}>{taluka}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
                                >
                                    Apply Filters
                                </Button>
                            </div>

                            {/* Results Count */}
                            <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                                Showing {filteredTemples.length} of {temples.length} temples
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[19.7515, 75.7139]} // Maharashtra Center
                    zoom={7}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Cleaner, lighter map style
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    <MapEffect temples={filteredTemples} />

                    {/* Render each temple with its own TempleMarker component */}
                    {filteredTemples.map((temple) => (
                        temple.latitude && temple.longitude && (
                            <TempleMarker
                                key={temple.id}
                                temple={temple}
                                onSelect={setSelectedTemple}
                            />
                        )
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default Explore;

