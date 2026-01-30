import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { X, ZoomIn, ZoomOut, RotateCcw, Info, ChevronLeft, BookOpen, ChevronDown, Eye, EyeOff, Maximize, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Button1 } from "@/components/ui/button-1";
import { Temple } from "@/types";

// ... (rest of imports)

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

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

const abbreviations = [
    "👣 कोणत्या अवतारांची क्रीडा",
    "☀️ लीळाचरित्रातील काळ",
    "🏠 रहिवासाची जागा",
    "⏹️ स्थानाचा प्रकार",
    "⬇️ कोठून आले (1. - किती वेळा आले)",
    "⭐ मुक्काम किती दिवस (उ. - ली.च. काळ)",
    "⬆️ कोठे गेले (1. - जातानाची वेळ)",
    "➕ उपलब्ध स्थान संख्या",
    "➖ निर्देशित स्थान संख्या",
    "❌ अनुपलब्ध स्थान संख्या",
    "🟰 एकूण स्थान संख्या"
];

export default function ArchitectureViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [temple, setTemple] = useState<Temple | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showHotspots, setShowHotspots] = useState(true);
    const [imageType, setImageType] = useState<'architectural' | 'present'>('architectural');
    const [architecturalImage, setArchitecturalImage] = useState<string>("");
    const [presentImage, setPresentImage] = useState<string>("");
    const [imageRatio, setImageRatio] = useState<number | null>(null);
    const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
    const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
    const [showAllHotspotsList, setShowAllHotspotsList] = useState(false);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Touch state for pinch zoom
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [initialZoom, setInitialZoom] = useState(1);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

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

                // Get architectural and present images
                const archImg = data.architectureImage || data.images?.[0] || "";
                const presImg = data.images?.[0] || "";

                setArchitecturalImage(archImg);
                setPresentImage(presImg);
                setImageUrl(archImg); // Default to architectural image

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

    // Update image when type changes
    useEffect(() => {
        if (imageType === 'architectural') {
            setImageUrl(architecturalImage);
        } else {
            setImageUrl(presentImage);
        }
        // Reset zoom, pan and ratio when switching images
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setImageRatio(null);
    }, [imageType, architecturalImage, presentImage]);

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

    // Touch handlers for mobile pinch zoom
    const getTouchDistance = (touches: React.TouchList) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const distance = getTouchDistance(e.touches);
            setInitialPinchDistance(distance);
            setInitialZoom(zoom);
        } else if (e.touches.length === 1) {
            setIsDragging(true);
            dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDistance) {
            e.preventDefault();
            const distance = getTouchDistance(e.touches);
            const scale = distance / initialPinchDistance;
            setZoom(Math.min(Math.max(initialZoom * scale, 0.5), 3));
        } else if (e.touches.length === 1 && isDragging) {
            setPan({
                x: e.touches[0].clientX - dragStart.current.x,
                y: e.touches[0].clientY - dragStart.current.y
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setInitialPinchDistance(null);
    };

    const toggleFullScreen = () => {
        if (!isFullScreen && imageContainerRef.current) {
            if (imageContainerRef.current.requestFullscreen) {
                imageContainerRef.current.requestFullscreen();
            }
            setIsFullScreen(true);
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    // Navigate to Detail Page
    const handleNavigationToDetail = (hotspot: Hotspot) => {
        navigate(`/temple/${id}/architecture/sthana/${hotspot.id}`);
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
        <div className="min-h-screen bg-[#F9F6F0] lg:bg-white pb-8 overflow-x-hidden">

            {/* Header: Back, Heading, 'i' */}
            <div className="sticky top-0 z-30 px-4 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 py-3">
                <div className="flex items-center gap-3 max-w-6xl mx-auto">
                    <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5 shrink-0" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-7 h-7 text-[#0f3c6e]" />
                    </Button>
                    <h1 className="flex-1 font-heading font-bold text-lg md:text-xl text-[#0f3c6e] font-serif truncate transition-all duration-300">
                        {temple.name}
                    </h1>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-full w-9 h-9 hover:bg-black/5 transition-all shrink-0">
                                <span className="font-serif italic font-bold text-lg text-[#0f3c6e]">i</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90%] rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-blue-900 font-serif">Abbreviations</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 pt-4">
                                {abbreviations.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm text-slate-700 pb-2 border-b border-gray-100 last:border-0">
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="px-4 lg:px-6 space-y-4 md:space-y-4 mt-2 md:mt-4 max-w-6xl mx-auto pb-12">
                {/* Image Type Segmented Buttons */}
                <div className="flex justify-center w-full">
                    <div className="flex w-full max-w-sm rounded-full border border-slate-300 bg-white shadow-sm overflow-hidden">
                        <button
                            onClick={() => setImageType('architectural')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-r border-slate-200 last:border-r-0 ${imageType === 'architectural'
                                ? 'bg-blue-900 text-white'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {imageType === 'architectural' && <Check className="w-4 h-4 text-white" />}
                            Architectural View
                        </button>
                        <button
                            onClick={() => setImageType('present')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-r border-slate-200 last:border-r-0 ${imageType === 'present'
                                ? 'bg-blue-900 text-white'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {imageType === 'present' && <Check className="w-4 h-4 text-white" />}
                            Present View
                        </button>
                    </div>
                </div>

                {/* Image Viewer */}
                <div className="flex justify-center">
                    <div
                        ref={imageContainerRef}
                        className="relative aspect-square md:aspect-[4/3] w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-50 group touch-none"
                    >
                        <div
                            className="w-full h-full cursor-move"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                                }}
                                className="relative w-full h-full flex items-center justify-center"
                            >
                                <div
                                    className="relative"
                                    style={{
                                        aspectRatio: imageRatio || 'auto',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        width: imageRatio && imageRatio > (imageContainerRef.current?.clientWidth || 1) / (imageContainerRef.current?.clientHeight || 1) ? '100%' : 'auto',
                                        height: imageRatio && imageRatio <= (imageContainerRef.current?.clientWidth || 1) / (imageContainerRef.current?.clientHeight || 1) ? '100%' : 'auto'
                                    }}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`${temple.name} Architecture`}
                                        className="w-full h-full block select-none"
                                        draggable={false}
                                        onLoad={(e) => setImageRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
                                    />

                                    {imageType === 'architectural' && showHotspots && hotspots.map((hotspot) => {
                                        const isSelected = selectedHotspotId === hotspot.id;
                                        const isActive = hotspot.id === (hoveredHotspotId || selectedHotspotId);

                                        return (
                                            <div
                                                key={hotspot.id}
                                                className={`absolute pointer-events-none ${isActive ? 'z-50' : 'z-10'}`}
                                                style={{
                                                    left: `${hotspot.x}%`,
                                                    top: `${hotspot.y}%`,
                                                    transform: 'translate(-50%, -50%)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                <div
                                                    className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full z-[70] cursor-pointer pointer-events-auto"
                                                    style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
                                                    onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                                                    onMouseLeave={() => setHoveredHotspotId(null)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedHotspotId(isSelected ? null : hotspot.id);
                                                    }}
                                                />

                                                <div className="relative flex items-center justify-center">
                                                    {isActive ? (
                                                        <div
                                                            className="flex items-center bg-black/85 backdrop-blur-xl text-white rounded-full py-1.5 px-4 shadow-2xl whitespace-nowrap border border-white/30 animate-in zoom-in-95 duration-200 ring-2 ring-black/5 pointer-events-auto"
                                                            onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                                                            onMouseLeave={() => setHoveredHotspotId(null)}
                                                        >
                                                            <span className="text-[10px] md:text-sm font-bold mr-3 tracking-tight max-w-[150px] md:max-w-[250px] truncate">{hotspot.title}</span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleNavigationToDetail(hotspot);
                                                                }}
                                                                className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors group/info"
                                                                title="View Details"
                                                            >
                                                                <span className="text-[10px] md:text-xs font-serif italic font-bold group-hover:text-amber-400">i</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-md transition-all">
                                                            <span className="text-[10px] md:text-xs font-bold text-white">
                                                                {hotspot.number}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {imageType === 'architectural' && (
                            <>
                                {isFullScreen ? (
                                    <>
                                        <div className="absolute right-4 top-4 z-10 flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-9 w-9 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white backdrop-blur-sm"
                                                onClick={() => setShowHotspots(!showHotspots)}
                                                title={showHotspots ? "Hide Hotspots" : "Show Hotspots"}
                                            >
                                                {showHotspots ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-9 w-9 rounded-full shadow-lg"
                                                onClick={toggleFullScreen}
                                                title="Exit Full Screen"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-3">
                                            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleZoomIn}>
                                                <ZoomIn className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleZoomOut}>
                                                <ZoomOut className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleResetOrientation}>
                                                <RotateCcw className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute right-4 top-4 z-10">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-8 w-8 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white"
                                                onClick={() => setShowHotspots(!showHotspots)}
                                                title={showHotspots ? "Hide Hotspots" : "Show Hotspots"}
                                            >
                                                {showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        <div className="absolute right-4 bottom-4 z-10 flex items-center gap-2">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleResetOrientation}>
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={toggleFullScreen}>
                                                <Maximize className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    {/* Sthan Pothi Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-full h-12 md:h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl shadow-md flex items-center p-0 overflow-hidden border border-blue-800 group transition-colors">
                                <div className="flex-1 flex items-center justify-center gap-3 h-full px-4 md:px-6">
                                    <BookOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                                    <span className="font-heading font-bold uppercase tracking-wider text-sm md:text-base">स्थान पोथी</span>
                                </div>
                                <div className="w-12 md:w-14 h-full border-l border-blue-800/50 flex items-center justify-center transition-colors">
                                    <ChevronDown className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="center" className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[50vh] overflow-y-auto rounded-xl p-2 bg-white/95 backdrop-blur-md shadow-xl border-blue-100">
                            {hotspots.map((h) => (
                                <DropdownMenuItem key={h.id} className="p-2 md:p-3 focus:bg-amber-50 rounded-lg cursor-pointer border-b border-gray-50 last:border-0" onClick={() => handleNavigationToDetail(h)}>
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold border border-amber-200">{h.number}</div>
                                        <span className="flex-1 font-medium text-blue-900 truncate">{h.title}</span>
                                        <span className="text-xs text-amber-700 font-bold">Go to &rarr;</span>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                            {hotspots.length === 0 && (
                                <div className="p-4 text-center text-sm text-muted-foreground">No sthana available.</div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sthans Overview */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-amber-600"></div>
                            <h3 className="font-heading font-bold text-lg text-blue-900">Sthans Overview</h3>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100/50 text-sm text-slate-600 leading-relaxed font-serif">
                            {temple.description_text || temple.description || "No description available for this architecture."}
                        </div>
                    </div>

                    {/* Sthana List */}
                    <div className="space-y-3">
                        <div className="flex flex-col gap-2 md:gap-3">
                            {(showAllHotspotsList ? hotspots : hotspots.slice(0, 6)).map((hotspot) => {
                                const isSelected = selectedHotspotId === hotspot.id;
                                return (
                                    <div key={hotspot.id} className={`w-full h-12 md:h-14 flex items-center justify-between px-4 md:px-6 bg-white rounded-2xl shadow-sm border transition-all group ${isSelected ? 'border-amber-400/50 bg-amber-50/10' : 'border-gray-100 hover:border-amber-200'}`}>
                                        <div className="flex-1 h-full flex items-center gap-3 cursor-pointer" onClick={() => setSelectedHotspotId(isSelected ? null : hotspot.id)} onMouseEnter={() => setHoveredHotspotId(hotspot.id)} onMouseLeave={() => setHoveredHotspotId(null)}>
                                            <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center border shrink-0 text-sm transition-all duration-300 ${isSelected ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-4 ring-amber-600/20' : 'bg-[#F9F6F0] text-amber-600 border-amber-600'}`}>{hotspot.number}</div>
                                            <span className={`font-heading font-bold line-clamp-1 transition-colors ${isSelected ? 'text-amber-700' : 'text-blue-900 group-hover:text-amber-700'}`}>{hotspot.title}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleNavigationToDetail(hotspot); }} className="flex items-center gap-2 pl-4 h-full cursor-pointer transition-opacity">
                                            <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-tight transition-colors ${isSelected ? 'text-amber-700' : 'text-amber-700 lg:text-slate-400 lg:group-hover:text-amber-700'}`}>View Details</span>
                                            <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isSelected ? 'translate-x-1 text-amber-600' : 'text-amber-700 lg:text-slate-300 lg:group-hover:text-amber-500'}`} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {hotspots.length > 6 && (
                            <div className="pt-2 flex justify-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowAllHotspotsList(!showAllHotspotsList)}
                                    className="text-amber-700 hover:bg-amber-50 hover:text-amber-800 gap-2 h-10 px-6 font-bold transition-all"
                                >
                                    {showAllHotspotsList ? (
                                        <>Show Less <ChevronRight className="w-4 h-4 rotate-[-90deg]" /></>
                                    ) : (
                                        <>Show More <ChevronRight className="w-4 h-4 rotate-90" /></>
                                    )}
                                </Button>
                            </div>
                        )}
                        {
                            hotspots.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No sthana hotspots found.</p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
