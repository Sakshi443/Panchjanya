import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
            <div className="shrink-0 sticky top-0 z-50 bg-white shadow-sm">
                {/* Mobile: All in one row */}
                <div className="md:hidden flex items-center gap-2 w-full px-4 py-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-blue-900 hover:bg-blue-900/10 shrink-0">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex w-7 h-7 rounded-full bg-[#F9F6F0] text-amber-600 border border-amber-600 font-bold items-center justify-center text-sm shrink-0">
                        {hotspot.number}
                    </div>
                    <h1 className="text-lg font-heading font-bold text-blue-900 leading-tight truncate flex-1">
                        {hotspot.title}
                    </h1>
                </div>


                {/* Desktop: Existing layout */}
                <div className="hidden md:flex items-center justify-center px-6 py-4 relative">
                    <div className="absolute left-6 flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-blue-900 hover:bg-blue-900/10 -ml-2">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <div className="w-10 h-10 rounded-full bg-[#F9F6F0] text-amber-600 border border-amber-600 font-bold flex items-center justify-center text-lg">
                            {hotspot.number}
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-amber-600 text-center px-16 leading-tight max-w-2xl truncate">
                        {hotspot.title}
                    </h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
                <div className="max-w-3xl mx-auto w-full px-0 md:px-4 pb-4 py-1 space-y-2 md:space-y-3">

                    {/* Top Slider: Present vs Old Images */}
                    <div className="flex justify-center px-2 md:px-0">
                        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full max-w-sm">
                            <TabsList className="flex w-full bg-gray-100 p-1 rounded-xl gap-1">
                                <TabsTrigger value="present" className="flex-1 rounded-lg py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/50">Present Images</TabsTrigger>
                                <TabsTrigger value="old" className="flex-1 rounded-lg py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/50">Old Images</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Image Viewer */}
                    <div className="px-2 md:px-0">
                        <div className="relative aspect-[4/3] w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-200 group">
                            <img
                                src={displayImages[currentImageIndex]}
                                alt={hotspot.title}
                                className="w-full h-full object-contain cursor-pointer"
                                onClick={() => setIsImageModalOpen(true)}
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
                    </div>



                    {/* Bottom Slider: Details vs Leela */}
                    <div className="flex justify-center px-2 md:px-0">
                        <Tabs value={contentMode} onValueChange={setContentMode} className="w-full max-w-sm">
                            <TabsList className="flex w-full bg-gray-100 p-1 rounded-xl gap-1">
                                <TabsTrigger value="details" className="flex-1 rounded-lg py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/50">Details</TabsTrigger>
                                <TabsTrigger value="leela" className="flex-1 rounded-lg py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-200/50">Leela</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content Display */}
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 px-2 md:px-0">
                        {contentMode === 'details' ? (
                            <div className="space-y-3">
                                {/* Significance */}
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                                            <h3 className="text-amber-800 font-bold tracking-widest uppercase text-sm">Description</h3>
                                        </div>
                                        <p className="font-serif text-lg text-slate-800 leading-relaxed">
                                            {hotspot.significance || hotspot.description || "No info available"}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Leela Section */}
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                                            <h3 className="text-amber-800 font-bold tracking-widest uppercase text-sm">...</h3>
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
            {/* Full-Screen Image Modal */}
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={displayImages[currentImageIndex]}
                            alt={`${hotspot.title} - Full view`}
                            className="max-w-full max-h-[95vh] object-contain"
                        />
                        <button
                            onClick={() => setIsImageModalOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-2xl backdrop-blur-sm transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
