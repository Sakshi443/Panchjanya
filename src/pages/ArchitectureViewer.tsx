import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { X, ZoomIn, ZoomOut, RotateCcw, Info, ChevronLeft, BookOpen, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Temple } from "@/types";
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

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Touch state for pinch zoom
    const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
    const [initialZoom, setInitialZoom] = useState(1);
    const imageContainerRef = useRef<HTMLDivElement>(null);

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
        // Reset zoom and pan when switching images
        setZoom(1);
        setPan({ x: 0, y: 0 });
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
        <div className="min-h-screen bg-[#F9F6F0] flex flex-col relative pb-10">

            {/* Header: Back, Heading, 'i' */}
            <div className="bg-[#1e3a8a] text-white px-4 py-3 flex items-center justify-between shadow-md z-20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 -ml-2" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="font-heading font-bold text-lg leading-tight">{temple.name}</h1>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 rounded-full">
                            <span className="font-serif italic text-xl">i</span>
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

            {/* Image Type Slider/Tabs */}
            <div className="bg-gray-100 px-4 py-3 flex justify-center w-full">
                <div className="flex w-full max-w-sm rounded-lg bg-gray-200 p-1 gap-1">
                    <button
                        onClick={() => setImageType('architectural')}
                        className={`flex-1 px-2 md:px-6 py-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap transition-all ${imageType === 'architectural'
                            ? 'bg-blue-900 text-white shadow-md'
                            : 'bg-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Architectural View
                    </button>
                    <button
                        onClick={() => setImageType('present')}
                        className={`flex-1 px-2 md:px-6 py-2 rounded-lg font-medium text-xs md:text-sm whitespace-nowrap transition-all ${imageType === 'present'
                            ? 'bg-blue-900 text-white shadow-md'
                            : 'bg-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Present View
                    </button>
                </div>
            </div>

            {/* Image Viewer */}
            <div className="flex justify-center px-4 py-4">
                <div
                    ref={imageContainerRef}
                    className="relative aspect-[4/3] w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gray-200 group touch-none"
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
                            <img
                                src={imageUrl}
                                alt={`${temple.name} Architecture`}
                                className="w-full h-full object-cover select-none"
                                draggable={false}
                            />

                            {/* Hotspots - Only show on architectural image */}
                            {imageType === 'architectural' && showHotspots && hotspots.map((hotspot) => (
                                <button
                                    key={hotspot.id}
                                    className="absolute flex items-center justify-center transition-transform hover:scale-125 z-10"
                                    style={{
                                        left: `${hotspot.x}%`,
                                        top: `${hotspot.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNavigationToDetail(hotspot);
                                    }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg animate-pulse hover:animate-none">
                                        <span className="text-xs font-bold text-white">
                                            {hotspot.number}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggle Hotspots Button - Only visible on architectural image */}
                    {imageType === 'architectural' && (
                        <>
                            {/* Top right - Hide/Show button only */}
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

                            {/* Bottom right - Zoom and Reset buttons */}
                            <div className="absolute right-4 bottom-4 z-10 flex items-center gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleZoomIn}>
                                    <ZoomIn className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleZoomOut}>
                                    <ZoomOut className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg bg-blue-900 hover:bg-blue-800 text-white" onClick={handleResetOrientation}>
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 pt-4 pb-6 space-y-6">

                {/* Button - Sthan Pothi (Dropdown) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white h-12 rounded-xl flex items-center justify-between px-6 shadow-md border border-blue-800">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-amber-400" />
                                <span className="font-heading font-bold uppercase tracking-wider">स्थान पोथी</span>
                            </div>
                            <ChevronDown className="w-5 h-5 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" avoidCollisions={false} className="w-[calc(100vw-3rem)] max-w-md max-h-[50vh] overflow-y-auto rounded-xl p-2 bg-white/95 backdrop-blur-md shadow-xl border-blue-100">
                        {hotspots.map((h) => (
                            <DropdownMenuItem
                                key={h.id}
                                className="p-3 focus:bg-amber-50 rounded-lg cursor-pointer border-b border-gray-50 last:border-0"
                                onClick={() => handleNavigationToDetail(h)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold border border-amber-200">
                                        {h.number}
                                    </div>
                                    <span className="flex-1 font-medium text-blue-900 truncate">{h.title}</span>
                                    <span className="text-xs text-muted-foreground">Go to &rarr;</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        {hotspots.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">No sthana available.</div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu >

                {/* Description */}
                < div className="space-y-2" >
                    <h3 className="font-heading font-bold text-lg text-blue-900 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-600" />
                        Sthans Overview
                    </h3>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100/50 text-sm text-slate-600 leading-relaxed font-serif">
                        {temple.description_text || temple.description || "No description available for this architecture."}
                    </div>
                </div >

                {/* Sthana (Hotspot Buttons) */}
                < div className="space-y-3" >
                    {/* <h3 className="font-heading font-bold text-lg text-blue-900">Sthana</h3> */}
                    < div className="flex flex-col gap-3" >
                        {
                            hotspots.map((hotspot) => (
                                <button
                                    key={hotspot.id}
                                    onClick={() => handleNavigationToDetail(hotspot)}
                                    className="w-full flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all active:scale-[0.99] group text-left"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#F9F6F0] text-amber-600 font-bold flex items-center justify-center border border-amber-600 shrink-0 text-sm">
                                        {hotspot.number}
                                    </div>
                                    <span className="font-heading font-bold text-blue-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                                        {hotspot.title}
                                    </span>
                                </button>
                            ))
                        }
                    </div >
                    {
                        hotspots.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No sthana hotspots found.</p>
                        )
                    }
                </div >

            </div >
        </div >
    );
}
