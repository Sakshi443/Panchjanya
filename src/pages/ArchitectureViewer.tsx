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
    const [selectionSource, setSelectionSource] = useState<'image' | 'list' | 'dropdown' | null>(null);
    const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
    const [showAllHotspotsList, setShowAllHotspotsList] = useState(false);
    const [expandedHotspots, setExpandedHotspots] = useState<Record<string, boolean>>({});
    const [isPothiOpen, setIsPothiOpen] = useState(false);

    const handleSelectHotspot = (id: string | null, source: 'image' | 'list' | 'dropdown' | null) => {
        setSelectedHotspotId(id);
        setSelectionSource(source);
    };

    const toggleHotspot = (id: string) => {
        setExpandedHotspots(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Touch state for pinch zoom
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [initialZoom, setInitialZoom] = useState(1);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to hotspot info when selected from image
    useEffect(() => {
        if (selectedHotspotId && selectionSource === 'image') {
            setTimeout(() => {
                const infoSection = document.getElementById('active-hotspot-info');
                if (infoSection) {
                    infoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [selectedHotspotId]);

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
        <div
            className="min-h-screen bg-[#F9F6F0] lg:bg-white pb-8 overflow-x-hidden"
            onClick={() => handleSelectHotspot(null, null)}
        >

            {/* Header: Back, Heading, 'i' */}
            <div
                className="sticky top-0 z-30 px-4 bg-white/95 backdrop-blur-sm shadow-md border-b-2 border-gray-400 py-3"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 max-w-6xl mx-auto">
                    <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5 shrink-0" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-7 h-7 text-[#0f3c6e]" />
                    </Button>
                    <h1 className="flex-1 font-heading font-bold text-2xl md:text-3xl text-[#0f3c6e] font-serif truncate transition-all duration-300">
                        {temple.name}
                    </h1>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-transparent hover:bg-blue-200 text-blue-900 shadow-md border border-blue-100/50 shrink-0">
                                <span className="font-serif italic font-bold text-lg leading-none">i</span>
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

            <div
                className="px-4 lg:px-6 space-y-4 md:space-y-4 mt-2 md:mt-4 max-w-6xl mx-auto pb-12"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Type Segmented Buttons */}
                <div id="segmented-buttons-section" className="flex justify-center w-full">
                    <div className="flex w-full max-w-sm rounded-full border border-slate-300 bg-white shadow-sm overflow-hidden text-sm md:text-base">
                        <button
                            onClick={() => setImageType('architectural')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-bold transition-all border-r border-slate-200 last:border-r-0 ${imageType === 'architectural'
                                ? 'bg-blue-900 text-white'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            Architectural View
                        </button>
                        <button
                            onClick={() => setImageType('present')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-bold transition-all border-r border-slate-200 last:border-r-0 ${imageType === 'present'
                                ? 'bg-blue-900 text-white'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                                }`}
                        >
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
                            onClick={() => handleSelectHotspot(null, null)}
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
                                                        handleSelectHotspot(isSelected ? null : hotspot.id, isSelected ? null : 'image');
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
                    <DropdownMenu modal={false} onOpenChange={(open) => {
                        setIsPothiOpen(open);
                        if (!open) {
                            // Clear expanded states when closing dropdown, but keep selection
                            setExpandedHotspots({});
                        }
                        if (open) {
                            setTimeout(() => {
                                const section = document.getElementById('segmented-buttons-section');
                                if (section) {
                                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }, 100);
                        }
                    }}>
                        <DropdownMenuTrigger asChild>
                            <button id="sthan-pothi-trigger" className="w-full h-12 md:h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-2xl shadow-md flex items-center justify-between px-6 border border-blue-800 group transition-all focus:outline-none">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                    <span className="font-heading font-bold tracking-wider text-base md:text-lg">Sthan Pothi</span>
                                </div>
                                <ChevronDown className={`w-6 h-6 text-white opacity-80 group-hover:opacity-100 transition-all duration-300 ${isPothiOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="center"
                            avoidCollisions={false}
                            sideOffset={8}
                            className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[60vh] overflow-y-auto rounded-2xl p-3 bg-white shadow-2xl border-blue-50 z-50 px-4"
                        >
                            <div className="py-2 mb-2 border-b border-slate-100">
                                <h3 className="text-blue-900 font-heading font-extrabold text-sm uppercase tracking-widest">Sthan Descriptions</h3>
                            </div>
                            {hotspots.map((h) => {
                                const isExpanded = expandedHotspots[h.id];
                                return (
                                    <div
                                        key={h.id}
                                        className="py-4 border-b border-slate-50 last:border-0 group cursor-pointer transition-all"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            // Minimal selection for map sync, without triggering pop-up/scroll
                                            handleSelectHotspot(h.id, 'dropdown');
                                            // Toggle detail description
                                            toggleHotspot(h.id);
                                        }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                                    <h4 className="font-heading font-bold text-blue-900 uppercase text-xs tracking-wider transition-colors">{h.title}</h4>
                                                </div>
                                                {isExpanded && (
                                                    <p className="text-sm text-slate-600 font-serif leading-relaxed pl-3.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        {h.description || "Historical records of this sacred site are being updated."}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`w-8 h-8 rounded-full bg-[#fcfaf5] text-blue-900 flex items-center justify-center shrink-0 border border-slate-200 transition-all ${isExpanded ? 'bg-amber-50 border-amber-200' : 'group-hover:bg-amber-50 group-hover:border-amber-200'}`}>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {hotspots.length === 0 && (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <BookOpen className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-400 italic font-serif">Historical data not yet cataloged.</p>
                                </div>
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

                    {/* Active Selection - Appears UNDER overview ONLY when a hotspot is selected from the IMAGE */}
                    {selectedHotspotId && selectionSource === 'image' && (
                        <div id="active-hotspot-info" className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            {(() => {
                                const activeHotspot = hotspots.find(h => h.id === selectedHotspotId);
                                if (!activeHotspot) return null;
                                return (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNavigationToDetail(activeHotspot);
                                        }}
                                        className="w-full h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white rounded-2xl shadow-sm border border-amber-400/50 transition-all group ring-4 ring-amber-600/10 cursor-pointer"
                                    >
                                        <div className="flex-1 h-full flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full font-bold flex items-center justify-center border shrink-0 text-base transition-all duration-300 bg-amber-600 text-white border-amber-600 shadow-md ring-4 ring-amber-600/20">{activeHotspot.number}</div>
                                            <span className="font-heading font-bold text-base md:text-lg line-clamp-1 transition-colors text-amber-700">{activeHotspot.title}</span>
                                        </div>
                                        <div className="flex items-center pl-4 h-full">
                                            <ChevronRight className="w-5 h-5 transition-all duration-300 translate-x-1 text-amber-600" />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Sthana List */}
                    <div className="space-y-3">
                        <div className="flex flex-col gap-2 md:gap-3">
                            {(() => {
                                // Only filter out the active hotspot if selected from IMAGE
                                const filteredHotspots = selectionSource === 'image'
                                    ? hotspots.filter(h => h.id !== selectedHotspotId)
                                    : hotspots;

                                const listItems = showAllHotspotsList ? filteredHotspots : filteredHotspots.slice(0, 6);
                                return listItems.map((hotspot) => {
                                    return (
                                        <div
                                            key={hotspot.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNavigationToDetail(hotspot);
                                            }}
                                            className="w-full h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all group cursor-pointer"
                                        >
                                            <div className="flex-1 h-full flex items-center gap-4" onMouseEnter={() => setHoveredHotspotId(hotspot.id)} onMouseLeave={() => setHoveredHotspotId(null)}>
                                                <div className="w-8 h-8 rounded-full font-bold flex items-center justify-center border shrink-0 text-base transition-all duration-300 bg-[#F9F6F0] text-amber-600 border-amber-600 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600">
                                                    {hotspot.number}
                                                </div>
                                                <span className="font-heading font-bold text-base md:text-lg line-clamp-1 transition-colors text-blue-900 group-hover:text-amber-700">
                                                    {hotspot.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center pl-4 h-full">
                                                <ChevronRight className="w-4 h-4 transition-all duration-300 text-amber-700 lg:text-slate-300 lg:group-hover:text-amber-500 group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
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
