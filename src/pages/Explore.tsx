import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { Temple } from "@/types";
import { useNavigate } from "react-router-dom";
import { Search, Compass, MapPin, ChevronRight, Filter, X, Bookmark, CornerDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import DataTableFilter from "@/components/ui/data-table-filter";


// Custom styles for Leaflet popup close button
const popupStyles = `
  .custom-temple-popup .leaflet-popup-content-wrapper {
    padding: 0;
    overflow: hidden;
  }
  .custom-temple-popup .leaflet-popup-content {
    margin: 0px 0px 0px 0px;
  }
  .custom-temple-popup .leaflet-popup-close-button {
    top: 8px !important;
    right: 8px !important;
    font-size: 18px !important;
    color: #4b5563 !important; /* gray-600 */
    z-index: 10;
  }
  .custom-temple-popup .leaflet-popup-close-button:hover {
    color: #111827 !important; /* gray-900 */
  }
`;

// Custom Icon for 'Explore' Map (Golden Circle with Symbol)
const exploreIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzAzLm9yZy9yZ2IvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjE4IiBmaWxsPSIjRkNCOTAwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8cGF0aCBkPSJNMjAgMTJ2MTZNMTIgMjBoMTYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==', // Placeholder SVG base64
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
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const map = useMap();

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
                click: () => onSelect(temple),
                popupopen: () => setIsPopupOpen(true),
                popupclose: () => setIsPopupOpen(false)
            }}
        >
            {/* Tooltip - Shows on Hover only when popup is closed */}
            {!isPopupOpen && (
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
            )}

            {/* Popup - Shows on Click */}
            <Popup
                closeButton={false}
                className="custom-temple-popup"
                offset={[0, -5]}
                minWidth={230}
                maxWidth={250}
                autoPan={true}
                autoPanPaddingTopLeft={[20, 160]}
                autoPanPaddingBottomRight={[100, 100]}
                keepInView={true}
            >
                <div className="px-3 py-3 w-full space-y-2">
                    <style>{popupStyles}</style>

                    {/* Row 1: Title + Close Icon */}
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-heading font-bold text-xl md:text-2xl text-blue-900 leading-tight">
                            {temple.name}
                        </h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                map.closePopup();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 shrink-0"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Row 2: Subtitle */}
                    <div className="flex items-start gap-1.5 text-sm md:text-base text-muted-foreground leading-snug">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-amber-600 shrink-0 mt-1" />
                        <span>
                            {temple.city && temple.city !== temple.district ? `${temple.city}, ` : ""}
                            {temple.district || "Maharashtra"}
                        </span>
                    </div>

                    {/* Row 3: Action Buttons (Details + Direction + Saved) */}
                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white h-8 md:h-9 rounded-lg shadow-sm text-xs md:text-xs font-bold px-0"
                            onClick={() => navigate(`/temple/${temple.id}/architecture`)}
                        >
                            Details
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 md:h-9 md:w-9 rounded-lg border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex-shrink-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (temple.latitude && temple.longitude) {
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`, "_blank");
                                }
                            }}
                        >
                            <div className="w-4 h-4 md:w-5 md:h-5 bg-amber-600" style={{ WebkitMaskImage: "url(/direction_icon.png)", maskImage: "url(/direction_icon.png)", WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleSave}
                            disabled={isSaving || !user}
                            className={cn(
                                "h-8 w-8 md:h-9 md:w-9 rounded-lg border-slate-200 bg-white flex-shrink-0 transition-all shadow-sm",
                                isSaved && "bg-amber-50 border-amber-200 text-amber-600"
                            )}
                        >
                            <Bookmark className={cn("w-4 h-4 md:w-5 md:h-5", isSaved && "fill-current")} />
                        </Button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

const Explore = () => {
    const [temples, setTemples] = useState<Temple[]>([]);
    const [allTemplesForOptions, setAllTemplesForOptions] = useState<Temple[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Pending states (for UI dropdowns)
    const [pendingDistrict, setPendingDistrict] = useState<string>("");
    const [pendingTaluka, setPendingTaluka] = useState<string>("");
    const [pendingSthanaType, setPendingSthanaType] = useState<string>("");

    // Applied states (for Firestore query and results)
    const [appliedDistrict, setAppliedDistrict] = useState<string>("");
    const [appliedTaluka, setAppliedTaluka] = useState<string>("");
    const [appliedSthanaType, setAppliedSthanaType] = useState<string>("");

    const navigate = useNavigate();
    const { t } = useLanguage();
    const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);

    // 1. Fetch all temples ONCE to populate filter options (Districts/Talukas)
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "temples"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Temple[];
            setAllTemplesForOptions(data);
        });
        return () => unsubscribe();
    }, []);

    // 2. Main Temple Listener - Querying Firestore based on Applied Filters
    useEffect(() => {
        let templesRef = collection(db, "temples");
        let q = query(templesRef);

        const conditions = [];
        if (appliedDistrict) {
            conditions.push(where("district", "==", appliedDistrict));
        }
        if (appliedTaluka) {
            conditions.push(where("taluka", "==", appliedTaluka));
        }

        if (conditions.length > 0) {
            console.log("🔍 Fetching temples with database filters:", conditions.length);
            q = query(templesRef, ...conditions);
        } else {
            console.log("📜 Fetching all temples (no database filters)");
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Temple[];

            console.log(`✅ Loaded ${data.length} temples from database`);
            setTemples(data);

            if (data.length > 0 && !selectedTemple) {
                const hampi = data.find(t => t.name.toLowerCase().includes("hampi"));
                setSelectedTemple(hampi || data[0]);
            }
        }, (error) => {
            console.error("❌ Firestore query error:", error);
        });

        return () => unsubscribe();
    }, [appliedDistrict, appliedTaluka]);

    // 3. Derived Filter Options with Counts from Database
    const districts = Array.from(new Set(allTemplesForOptions.map(t => t.district).filter(Boolean)))
        .sort()
        .map(d => ({
            value: d,
            label: `${d} (${allTemplesForOptions.filter(t => t.district === d).length})`
        }));

    const talukas = Array.from(new Set(
        allTemplesForOptions
            .filter(t => !pendingDistrict || t.district === pendingDistrict)
            .map(t => t.taluka)
            .filter(Boolean)
    ))
        .sort()
        .map(t => ({
            value: t,
            label: `${t} (${allTemplesForOptions.filter(curr => curr.taluka === t && (!pendingDistrict || curr.district === pendingDistrict)).length})`
        }));

    // 4. Sthana Category Options with Counts from Database
    const sthanaOptions = [
        { value: "Avasthan Sthan", label: "Avasthan Sthan" },
        { value: "Aasan Sthan", label: "Aasan Sthan" },
        { value: "Vasti sthan", label: "Vasti sthan" },
        { value: "Mandlik Sthan", label: "Mandlik Sthan" },
    ].map(opt => {
        const count = allTemplesForOptions.filter(t =>
            (t.sthana && t.sthana.toLowerCase().includes(opt.value.toLowerCase())) ||
            (t.description_text && t.description_text.toLowerCase().includes(opt.value.toLowerCase())) ||
            (t.description && t.description.toLowerCase().includes(opt.value.toLowerCase()))
        ).length;
        return { ...opt, label: `${opt.label} (${count})` };
    });

    // Client-side filtering for Search and Sthana Category (Substring matches)
    const filteredTemples = temples.filter(temple => {
        const matchesSearch = !searchQuery ||
            temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            temple.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            temple.district?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSthana = !appliedSthanaType || (
            (temple.sthana && temple.sthana.toLowerCase().includes(appliedSthanaType.toLowerCase())) ||
            (temple.description_text && temple.description_text.toLowerCase().includes(appliedSthanaType.toLowerCase())) ||
            (temple.description && temple.description.toLowerCase().includes(appliedSthanaType.toLowerCase()))
        );

        return matchesSearch && matchesSthana;
    });

    const activeFiltersCount = (appliedDistrict ? 1 : 0) + (appliedTaluka ? 1 : 0) + (appliedSthanaType ? 1 : 0);

    const handleApplyFilters = () => {
        console.log("🎯 Applying Filters to Database:", { pendingDistrict, pendingTaluka, pendingSthanaType });
        setAppliedDistrict(pendingDistrict);
        setAppliedTaluka(pendingTaluka);
        setAppliedSthanaType(pendingSthanaType);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setPendingDistrict("");
        setPendingTaluka("");
        setPendingSthanaType("");
        setAppliedDistrict("");
        setAppliedTaluka("");
        setAppliedSthanaType("");
    };

    return (
        <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-background lg:bg-white animate-in fade-in duration-300">
            {/* Standard Header */}
            {/* Header Container */}
            <div className="absolute top-0 left-0 right-0 z-[400] flex flex-col pointer-events-none gap-1">

                {/* Top Row: Unified Glass Header */}
                <div className="px-4 pt-3 pb-1 flex items-center justify-center pointer-events-auto z-[410]">
                    <div className="relative w-full max-w-4xl flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm py-1.5 px-4">
                        {/* Logo - Absolute Left */}
                        <img src="/logo.jpg" alt="Logo" className="absolute left-2 w-12 h-12 object-contain" />

                        {/* Title - Center */}
                        <h1 className="w-full px-10 text-center text-xl md:text-2xl font-heading font-bold text-[#0f3c6e] font-serif whitespace-nowrap">
                            Panchajanya Heritage Map
                        </h1>
                    </div>
                </div>

                {/* Second Row: Search Bar - Responsive & Centered */}
                <div className="pointer-events-auto w-full max-w-xs mx-auto px-4">
                    <div className="relative rounded-full bg-white/95 backdrop-blur-md border border-white/40 flex items-center shadow-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <Input
                            placeholder="Explore Holy Legacy"
                            className="pl-9 pr-9 h-9 rounded-full border-none bg-transparent focus-visible:ring-0 text-xs placeholder:text-gray-400"
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
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="absolute top-36 left-4 right-4 z-[400] pointer-events-auto">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100/50 p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading font-bold text-lg text-blue-900">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* 1. Area wise */}
                            <div className="space-y-4">
                                {/* <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">1. Area wise</h4> */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* District Filter */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-blue-900/60 mb-1.5 uppercase tracking-wider">District</label>
                                        <DataTableFilter
                                            label="All Districts"
                                            options={districts}
                                            selectedValues={pendingDistrict ? [pendingDistrict] : []}
                                            onChange={(values) => {
                                                setPendingDistrict(values[0] || "");
                                                setPendingTaluka(""); // Reset taluka when district changes for cascading effect
                                            }}
                                            className="w-full bg-white border-gray-200"
                                        />
                                    </div>

                                    {/* Taluka Filter */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-blue-900/60 mb-1.5 uppercase tracking-wider">Taluka</label>
                                        <DataTableFilter
                                            label="All Talukas"
                                            options={talukas}
                                            selectedValues={pendingTaluka ? [pendingTaluka] : []}
                                            onChange={(values) => setPendingTaluka(values[0] || "")}
                                            className="w-full bg-white border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Sthana Wise */}
                            <div className="space-y-4 pt-2">
                                {/* <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest">2. Sthana Wise</h4> */}
                                <div>
                                    <label className="block text-[11px] font-bold text-blue-900/60 mb-1.5 uppercase tracking-wider">Sthana Category</label>
                                    <DataTableFilter
                                        label="All Sthana Types"
                                        options={sthanaOptions}
                                        selectedValues={pendingSthanaType ? [pendingSthanaType] : []}
                                        onChange={(values) => setPendingSthanaType(values[0] || "")}
                                        className="w-full bg-white border-gray-200"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6 border-t mt-4">
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-12 rounded-xl"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    onClick={handleApplyFilters}
                                    className="flex-1 bg-blue-900 hover:bg-blue-800 text-white h-12 rounded-xl shadow-md"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                            {/* Results Count */}
                            <div className="text-center text-[11px] font-bold text-amber-600 uppercase tracking-widest pt-4 border-t mt-4">
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
