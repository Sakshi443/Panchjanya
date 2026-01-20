import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { X, ZoomIn, ZoomOut, RotateCcw, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Temple } from "@/types";
import HotspotDetail from "@/components/features/HotspotDetail";

interface Hotspot {
    id: string;
    x: number;
    y: number;
    title: string;
    description: string;
    number?: number;
    images?: string[];
    significance?: string;
    historicalContext?: string;
}

export default function ArchitectureViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [temple, setTemple] = useState<Temple | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!id) return;

        const fetchTempleData = async () => {
            try {
                setLoading(true);
                const snap = await getDoc(doc(db, "temples", id));

                if (!snap.exists()) {
                    console.error("Temple not found");
                    navigate(-1);
                    return;
                }

                const data = snap.data() as Temple;
                setTemple(data);

                // Get architecture image
                const archImg = data.architectureImage || data.images?.[0] || "";
                setImageUrl(archImg);

                // Add numbers to hotspots if they don't have them
                const hotspotsWithNumbers = (data.hotspots || []).map((h, index) => ({
                    ...h,
                    number: h.number || index + 1
                }));
                // Cast to Hotspot[] to satisfy the new interface (optional fields are fine)
                setHotspots(hotspotsWithNumbers as Hotspot[]);
            } catch (error) {
                console.error("Error fetching temple:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTempleData();
    }, [id, navigate]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleResetOrientation = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Handler for Map Pin Click: Selects AND Opens Detail
    const handlePinClick = (hotspot: Hotspot) => {
        setSelectedHotspot(hotspot);
        setShowDetail(true);
    };

    // Handler for List Item Click: Toggles Selection ONLY (Does not open detail)
    const handleListClick = (hotspot: Hotspot) => {
        if (selectedHotspot?.id === hotspot.id) {
            setSelectedHotspot(null);
        } else {
            setSelectedHotspot(hotspot);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!temple || !imageUrl) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground mb-4">Architecture image not available</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6F0] flex flex-col relative">
            {/* Detail View Overlay */}
            {showDetail && selectedHotspot && (
                <HotspotDetail
                    hotspot={selectedHotspot}
                    onClose={() => setShowDetail(false)}
                />
            )}

            {/* Header */}
            <div className="bg-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="font-heading font-bold text-lg leading-tight">{temple.name}</h1>
                    <p className="text-xs text-amber-300 uppercase tracking-wider mt-1">Architectural Guide</p>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => navigate(-1)}
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Architecture Image Viewer */}
            <div className="flex-1 relative overflow-hidden bg-gray-100">
                <div
                    className="w-full h-full flex items-center justify-center cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <div
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                        }}
                        className="relative"
                    >
                        <img
                            src={imageUrl}
                            alt={`${temple.name} Architecture`}
                            className="max-w-full max-h-[60vh] object-contain select-none"
                            draggable={false}
                        />

                        {/* Hotspots */}
                        {hotspots.map((hotspot) => {
                            const isActive = selectedHotspot?.id === hotspot.id;
                            return (
                                <button
                                    key={hotspot.id}
                                    className={`absolute flex flex-col items-center justify-center transition-all duration-300 group
                                        ${isActive ? 'z-20 scale-125 opacity-100' : 'z-10 scale-90 opacity-60 hover:opacity-90'}`}
                                    style={{
                                        left: `${hotspot.x}%`,
                                        top: `${hotspot.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop propagation to prevent drag
                                        handlePinClick(hotspot);
                                    }}
                                >
                                    {isActive ? (
                                        // Active State: Map Pin with Title
                                        <>
                                            <div className="mb-1 px-2 py-1 bg-black/80 text-white text-[10px] rounded backdrop-blur-sm whitespace-nowrap transition-all duration-300 flex items-center gap-1">
                                                {hotspot.title}
                                                <Info className="w-3 h-3 text-amber-400" />
                                            </div>
                                            <div className="relative flex items-center justify-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    fill="#d97706"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-8 h-8 drop-shadow-md text-amber-600 dark:text-amber-500"
                                                >
                                                    <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z" />
                                                    <circle cx="12" cy="10" r="4" fill="white" />
                                                </svg>
                                                <span className="absolute top-[6px] text-[10px] font-bold text-amber-700">
                                                    {hotspot.number}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        // Inactive State: Yellow Circle with Number (Matching reference image)
                                        <div className="w-6 h-6 rounded-full bg-[#E4C56B] border border-white/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative">
                                            {/* Outer subtle glow/ring effect */}
                                            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-[#3D2D1E] relative z-10">
                                                {hotspot.number}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white text-gray-900"
                        onClick={handleZoomIn}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white text-gray-900"
                        onClick={handleZoomOut}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-lg bg-white/90 hover:bg-white text-gray-900"
                        onClick={handleResetOrientation}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* स्थान निर्देशिका (Architecture Directory) */}
            <div className="bg-white px-6 py-6 max-h-[40vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-lg text-blue-900">स्थान निर्देशिका</h2>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Interactive</span>
                </div>

                <div className="space-y-3">
                    {hotspots.map((hotspot) => (
                        <button
                            key={hotspot.id}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedHotspot?.id === hotspot.id
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 hover:border-amber-300'
                                }`}
                            onClick={() => handleListClick(hotspot)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${selectedHotspot?.id === hotspot.id
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-blue-900 text-white'
                                    }`}>
                                    {hotspot.number}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-blue-900 mb-1">{hotspot.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                        {hotspot.description}
                                    </p>

                                    {/* Action Link */}
                                    <div
                                        role="button"
                                        className="flex items-center gap-1 text-amber-600 font-bold text-xs mt-2 group hover:underline inline-flex"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePinClick(hotspot);
                                        }}
                                    >
                                        VIEW DETAILS <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                                {selectedHotspot?.id === hotspot.id && (
                                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase">
                                        Active
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}

                    {hotspots.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No architectural features marked yet</p>
                        </div>
                    )}
                </div>

                {/* Reset Orientation Button */}
                <div className="mt-6">
                    <Button
                        className="w-full bg-[#1e3a8a] hover:bg-[#172554] text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        onClick={handleResetOrientation}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset Orientation
                    </Button>
                </div>
            </div>
        </div>
    );
}
