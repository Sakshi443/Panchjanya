import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import MapWithMarkers from "@/components/features/MapWithMarkers";
import { TempleDetails } from "@/components/features/TempleDetails";
import { Temple } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Map as MapIcon, ChevronRight, Info, Navigation, ChevronLeft, Bell } from "lucide-react";


interface YatraPlace {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    sequence: number;
    status: "visited" | "stayed" | "revisited";
}

const SthanaVandan = () => {
    const [temples, setTemples] = useState<Temple[]>([]);
    const [filteredTemples, setFilteredTemples] = useState<Temple[]>([]);
    const [yatraPlaces, setYatraPlaces] = useState<YatraPlace[]>([]);
    const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
    const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedTaluka, setSelectedTaluka] = useState("");

    // 🔥 Load temples in real-time from Firestore (Migrated from Home.tsx)
    useEffect(() => {
        console.log("🏛️ Sthana Vandan: Setting up Firestore listener...");
        const unsub = onSnapshot(
            collection(db, "temples"),
            (snapshot) => {
                const list: Temple[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    images: [],
                    sections: [],
                    ...doc.data(),
                })) as Temple[];

                console.log("📍 Temples loaded:", list.length);
                setTemples(list);
            },
            (error) => {
                console.error("❌ Firestore Error:", error.code, error.message);
            }
        );

        return () => unsub();
    }, []);

    // 🕉️ Load Yatra Places
    useEffect(() => {
        const q = query(collection(db, "yatraPlaces"), orderBy("sequence", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const places = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as YatraPlace));
            setYatraPlaces(places);
        });
        return () => unsub();
    }, []);

    // 🛠️ TEMPORARY FIX: Correct coordinates for Nanded Temple (Migrated from Home.tsx)
    useEffect(() => {
        const fixCoordinates = async () => {
            const badTemple = temples.find(t => t.longitude && t.longitude < 60 && t.name.includes("Bhaveshwar"));
            if (badTemple) {
                console.log("🛠️ Found temple with bad coordinates:", badTemple);
                try {
                    const { doc, updateDoc } = await import("firebase/firestore");
                    const { db } = await import("@/firebase");
                    const templeRef = doc(db, "temples", badTemple.id);
                    await updateDoc(templeRef, { latitude: 19.1602, longitude: 77.3150 });
                    console.log("✅ Successfully updated coordinates for:", badTemple.name);
                } catch (error) {
                    console.error("❌ Failed to update coordinates:", error);
                }
            }
        };
        if (temples.length > 0) fixCoordinates();
    }, [temples]);

    // 🔍 Filter temples based on search and filters (Migrated from Home.tsx)
    useEffect(() => {
        let filtered = temples;

        if (searchQuery) {
            filtered = filtered.filter((temple) =>
                temple.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedDistrict) {
            filtered = filtered.filter(
                (temple) => temple.district?.toLowerCase() === selectedDistrict.toLowerCase()
            );
        }

        if (selectedTaluka) {
            filtered = filtered.filter(
                (temple) => temple.taluka?.toLowerCase() === selectedTaluka.toLowerCase()
            );
        }

        setFilteredTemples(filtered);
    }, [searchQuery, selectedDistrict, selectedTaluka, temples]);


    const handleTempleClick = (id: string) => {
        setSelectedTempleId(id);
        // setIsDetailsPanelOpen(true); // Disable auto-open, user can open from floating card
    };

    const selectedTemple = temples.find((t) => t.id === selectedTempleId) || null;

    // Filter temples with architectural data
    const architectureTemples = temples.filter(
        (t) => t.architectureImage || (t.hotspots && t.hotspots.length > 0)
    ).slice(0, 4); // Show up to 4 items

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F9F6F0] lg:bg-[#F9F6F0] pb-8 lg:pb-0 font-sans animate-in fade-in duration-500 space-y-10">
            {/* Header */}
            {/* Header */}
            <div className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-7 h-7 text-blue-900" />
                </Button>
                <h1 className="text-xl font-heading font-bold text-blue-900 font-serif">Sthaan Vandan</h1>
                <div className="w-10 h-10 bg-[#FDF6E3] rounded-full flex items-center justify-center border border-[#FDF6E3] shadow-sm">
                    <Bell className="w-5 h-5 text-amber-600 fill-amber-600" />
                </div>
            </div>

            <div className="px-6 space-y-12">
                {/* Swami Virahan Card */}
                <Card className="p-5 bg-white shadow-sm border-none rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full blur-2xl -translate-y-10 translate-x-10" />
                    <div className="relative z-10">
                        <h2 className="font-heading font-bold text-xl text-blue-900 mb-2">Swami Viharan</h2>
                        <p className="text-muted-foreground text-sm mb-6 max-w-[80%] leading-relaxed">
                            Map your spiritual journey across ancient heritage sites with personalized itineraries.
                        </p>
                        <Button
                            onClick={() => navigate('/yatra')}
                            className="w-full bg-[#0f3c6e] hover:bg-[#0a2a4d] text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                            <div className="p-0.5 bg-amber-500 rounded-full">
                                <Compass className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-base">See the viharan</span>
                        </Button>
                    </div>
                </Card>


            </div>


            <div className="space-y-6 pt-2 px-6">
                <div className="flex items-center justify-between border-l-4 border-amber-600 pl-3">
                    <h2 className="font-heading font-bold text-xl text-blue-900">Heritage Map</h2>
                    <Link to="/explore" className="text-xs font-bold text-amber-600 uppercase tracking-widest cursor-pointer hover:text-amber-700">
                        view all
                    </Link>
                </div>

                <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-inner border border-border/50 bg-amber-50 relative">
                    <MapWithMarkers
                        temples={filteredTemples}
                        onTempleClick={handleTempleClick}
                        selectedTempleId={selectedTempleId}
                    />

                    {/* Floating Card for Selected Temple */}
                    {selectedTemple && !isDetailsPanelOpen && (
                        <div className="absolute bottom-4 left-4 right-4 z-[400] lg:w-96 lg:left-auto lg:right-4">
                            <Card className="p-3 flex items-center gap-3 shadow-xl bg-white/95 backdrop-blur-sm border-none animate-in slide-in-from-bottom-4">
                                {/* Image */}
                                <div className="w-16 h-16 bg-amber-100 rounded-lg flex-shrink-0 flex items-center justify-center text-amber-700 overflow-hidden shadow-sm border border-amber-100/50">
                                    <img
                                        src={selectedTemple.images?.[0] || "/placeholder-temple.jpg"}
                                        alt={selectedTemple.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-bold text-sm lg:text-base text-blue-900 truncate leading-tight mb-0.5">
                                        {selectedTemple.name}
                                    </h3>
                                    <p className="text-[11px] lg:text-xs text-muted-foreground truncate flex items-center gap-1">
                                        <MapIcon className="w-3 h-3" />
                                        {(() => {
                                            const city = selectedTemple.city?.trim();
                                            const district = selectedTemple.district?.trim();
                                            if (city && district && city.toLowerCase() !== district.toLowerCase()) {
                                                return `${city}, ${district}`;
                                            }
                                            if (city || district) return city || district;
                                            return typeof selectedTemple.location === 'string' ? selectedTemple.location : "Ancient Heritage";
                                        })()}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    {/* Architecture View Button */}
                                    <Link to={`/temple/${selectedTemple.id}/architecture`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-amber-700 hover:bg-amber-50 hover:text-amber-800" title="Architecture View">
                                            <Compass className="w-4 h-4" />
                                        </Button>
                                    </Link>

                                    {/* Directions Button */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                        title="Get Directions"
                                        onClick={() => {
                                            if (selectedTemple.latitude && selectedTemple.longitude) {
                                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedTemple.latitude},${selectedTemple.longitude}`, "_blank");
                                            }
                                        }}
                                    >
                                        <Navigation className="w-4 h-4" />
                                    </Button>

                                    {/* View Details Button */}
                                    <Button size="icon" variant="ghost" onClick={() => setIsDetailsPanelOpen(true)} className="h-8 w-8 rounded-full hover:bg-gray-100" title="View Details">
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Architectural Archive Section */}
            <div className="space-y-6 pt-4 pb-10 px-6">
                <div className="flex items-center justify-between border-l-4 border-amber-600 pl-3">
                    <h2 className="font-heading font-bold text-xl text-blue-900">Architectural Archive</h2>
                    <Button variant="link" className="text-xs font-bold text-amber-600 uppercase tracking-widest p-0 h-auto">VIEW ALL</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {architectureTemples.length > 0 ? (
                        architectureTemples.map((temple) => (
                            <Link to={`/temple/${temple.id}/architecture`} key={temple.id}>
                                <Card className="overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all h-full flex flex-col">
                                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                                        {temple.architectureImage || temple.images?.[0] ? (
                                            <img
                                                src={temple.architectureImage || temple.images?.[0]}
                                                alt={temple.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center p-4">
                                                <div className="w-full h-full bg-black/5 rounded-lg mix-blend-overlay" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="p-4 space-y-2 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-blue-900 group-hover:text-amber-700 transition-colors">{temple.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {temple.description || `Detailed architectural study of the sacred ${temple.name}.`}
                                        </p>
                                        <div className="flex gap-2 pt-2 mt-auto">
                                            <Button className="flex-1 bg-[#0f3c6e] group-hover:bg-amber-600 transition-colors text-sm h-9">
                                                View Architecture
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-9 w-9 border-amber-200 bg-amber-50 text-amber-700">
                                                <Info className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/50">
                            <Info className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                            <p className="text-amber-800 font-medium">No architectural records found.</p>
                            <p className="text-sm text-amber-600/70">Check back later for detailed temple studies.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Temple Details Sidebar */}
            <TempleDetails
                isOpen={isDetailsPanelOpen}
                onClose={() => setIsDetailsPanelOpen(false)}
                temple={selectedTemple}
            />
        </div >
    );
};

export default SthanaVandan;
