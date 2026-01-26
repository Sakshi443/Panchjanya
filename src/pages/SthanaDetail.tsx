import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { X, ChevronLeft, ChevronRight, Compass, History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Temple } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SthanaDetail() {
    const { id, sthanaId } = useParams<{ id: string; sthanaId: string }>();
    const navigate = useNavigate();
    const [hotspot, setHotspot] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [viewMode, setViewMode] = useState("present"); // 'present' | 'old'
    const [contentMode, setContentMode] = useState("details"); // 'details' | 'leela'

    useEffect(() => {
        const fetchTemple = async () => {
            if (!id || !sthanaId) return;
            try {
                const snap = await getDoc(doc(db, "temples", id));
                if (snap.exists()) {
                    const data = snap.data() as Temple;
                    const found = (data.hotspots || []).find((h: any) => h.id === sthanaId);
                    if (found) {
                        setHotspot({
                            ...found,
                            number: found.number || (data.hotspots?.indexOf(found) || 0) + 1
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching sthana:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemple();
    }, [id, sthanaId]);

    // Derived State for Images
    const presentImages = hotspot?.images || (hotspot?.image ? [hotspot.image] : []) || [];
    const oldImages = hotspot?.oldImages || [];

    // Fallback if no images found for the selected mode
    const displayImages = viewMode === 'present'
        ? (presentImages.length > 0 ? presentImages : ["https://placehold.co/600x400/png?text=No+Present+Image"])
        : (oldImages.length > 0 ? oldImages : ["https://placehold.co/600x400/png?text=No+Old+Image"]);

    // Reset image index when swiching modes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [viewMode]);

    const nextImage = () => setCurrentImageIndex((p) => (p + 1) % displayImages.length);
    const prevImage = () => setCurrentImageIndex((p) => (p - 1 + displayImages.length) % displayImages.length);

    if (loading) return <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" /></div>;

    if (!hotspot) return <div className="min-h-screen flex items-center justify-center">Sthana not found</div>;

    return (
        <div className="min-h-screen bg-[#F9F6F0] flex flex-col">
            {/* Header */}
            <div className="bg-[#0B1B38] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white hover:bg-white/10 -ml-2">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="w-10 h-10 rounded-full border-2 border-amber-500 text-amber-500 font-bold flex items-center justify-center text-lg">
                        {hotspot.number}
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-300">STHANA DETAIL</div>
                        <div className="font-heading font-medium text-lg leading-none">{hotspot.title}</div>
                    </div>
                </div>
                <div className="w-6" />
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                <div className="max-w-3xl mx-auto w-full p-6 space-y-6">

                    {/* Top Slider: Present vs Old Images */}
                    <div className="flex justify-center">
                        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full max-w-sm">
                            <TabsList className="grid w-full grid-cols-2 bg-blue-900/10 p-1 rounded-xl">
                                <TabsTrigger value="present" className="rounded-lg data-[state=active]:bg-blue-900 data-[state=active]:text-white">Present Sthan & Details</TabsTrigger>
                                <TabsTrigger value="old" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">Old Images</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Image Viewer */}
                    <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-200 group">
                        <img
                            src={displayImages[currentImageIndex]}
                            alt={hotspot.title}
                            className="w-full h-full object-cover"
                        />
                        {displayImages.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                {/* Indicator Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {displayImages.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-amber-500 w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Label for Old Images Mode */}
                        {viewMode === 'old' && (
                            <div className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                                Old Image
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-heading font-bold text-center text-amber-600">{hotspot.title}</h1>

                    {/* Bottom Slider: Details vs Leela */}
                    <div className="flex justify-center">
                        <Tabs value={contentMode} onValueChange={setContentMode} className="w-full max-w-sm">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 rounded-xl">
                                <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Details</TabsTrigger>
                                <TabsTrigger value="leela" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Leela</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content Display */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {contentMode === 'details' ? (
                            <div className="space-y-6">
                                {/* Significance */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Compass className="w-6 h-6 text-[#0B1B38]" />
                                        <h3 className="text-[#0B1B38] font-bold tracking-widest uppercase text-sm">Architectural Significance</h3>
                                    </div>
                                    <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                        {hotspot.significance || hotspot.description || "No info available"}
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <History className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-[#0B1B38] font-bold tracking-widest uppercase text-xs">Description</h3>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                        {hotspot.description}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Leela Section */}
                                <div className="bg-[#FFFDF5] border border-amber-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                                    <BookOpen className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-100/50 rotate-[-15deg]" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                                            <h3 className="text-amber-800 font-bold tracking-widest uppercase text-sm">Leela Charitra</h3>
                                        </div>
                                        <p className="font-serif text-lg text-slate-800 leading-relaxed">
                                            {hotspot.leela || "या स्थानाशी संबंधित लीळाचरित्र लवकरच उपलब्ध होईल."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
