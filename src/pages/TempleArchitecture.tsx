// src/pages/TempleArchitectureNew.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  X,
  ZoomIn,
  ZoomOut,
  Home,
  Info,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { Temple } from "@/types";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  images?: string[];
}

export default function TempleArchitecture() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [temple, setTemple] = useState<Temple | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef<number>(0);
  const isDragClick = useRef(false);

  useEffect(() => {
    if (!id) return;

    const fetchTempleData = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "temples", id));

        if (!snap.exists()) {
          console.error("Temple not found");
          return;
        }

        const data = snap.data() as Temple;
        setTemple(data);

        // Get architecture image logic
        let archImg = "";
        if (data.architectureImage) {
          archImg = data.architectureImage;
        } else if ((data as any).sub_temples) {
          const subTemples = (data as any).sub_temples;
          if (Array.isArray(subTemples)) {
            archImg = subTemples?.[0]?.images?.[0]?.url || "";
          } else if (typeof subTemples === "object") {
            const firstKey = Object.keys(subTemples)[0];
            archImg = subTemples?.[firstKey]?.images?.[0]?.url || "";
          }
        }

        setImageUrl(archImg);
        setHotspots(data.hotspots || []);
      } catch (error) {
        console.error("Error fetching temple:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTempleData();
  }, [id]);

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (isDragClick.current) return;
    setSelectedHotspot(hotspot);
    setDialogOpen(true);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse events for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    isDragClick.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setStartPan({ x: pan.x, y: pan.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    // Calculate distance moved
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragClick.current = true;
    }

    setPan({ x: startPan.x + dx, y: startPan.y + dy });
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  // Touch events for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      isDragClick.current = false;
      dragStart.current = { x: touch.clientX, y: touch.clientY };
      setStartPan({ x: pan.x, y: pan.y });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      lastTouchDistance.current = distance;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      e.preventDefault(); // Prevent page scroll
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDragClick.current = true;
      }

      setPan({ x: startPan.x + dx, y: startPan.y + dy });
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (lastTouchDistance.current > 0) {
        const delta = distance - lastTouchDistance.current;
        const zoomDelta = delta * 0.01;
        setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.5), 4));
      }

      lastTouchDistance.current = distance;
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground animate-pulse">Loading architecture...</p>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <Card className="max-w-md w-full border-dashed">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No Architecture View</h2>
            <p className="text-muted-foreground">
              We haven't mapped the architecture for this temple yet.
            </p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[60px] px-4 flex items-center justify-between bg-card text-card-foreground border-b shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-bold text-base lg:text-lg leading-none truncate">{temple?.name}</h1>
            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Architectural View - Interactive Exploration</p>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row pt-[60px] lg:h-screen lg:overflow-hidden">

        {/* Interactive Map Section */}
        <div className="relative bg-muted/30 w-full lg:flex-1 h-[50dvh] md:h-[55dvh] lg:h-full flex items-center justify-center overflow-hidden order-1">

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-background/95 backdrop-blur-md border rounded-lg p-1.5 md:p-2 lg:p-1.5 shadow-lg">
            <Button variant="ghost" size="icon" onClick={handleZoomIn} title="Zoom In" className="h-9 w-9 md:h-12 md:w-12 lg:h-9 lg:w-9">
              <ZoomIn className="w-4 h-4 md:w-6 md:h-6 lg:w-4 lg:h-4" />
            </Button>
            <div className="h-px bg-border" />
            <Button variant="ghost" size="icon" onClick={handleZoomOut} title="Zoom Out" className="h-9 w-9 md:h-12 md:w-12 lg:h-9 lg:w-9">
              <ZoomOut className="w-4 h-4 md:w-6 md:h-6 lg:w-4 lg:h-4" />
            </Button>
            <div className="h-px bg-border" />
            <Button variant="ghost" size="sm" onClick={resetZoom} className="text-[10px] md:text-xs lg:text-[10px] font-mono h-7 px-2 md:h-9 md:px-3 lg:h-7 lg:px-2" title="Current Zoom">
              {Math.round(zoom * 100)}%
            </Button>
          </div>

          {/* Reset View Button */}
          <div className="absolute bottom-4 left-4 z-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={resetZoom}
              className="shadow-lg bg-background/95 backdrop-blur-md hover:bg-background md:py-5 md:px-4 lg:py-0 lg:px-3 lg:h-9"
            >
              <Home className="w-4 h-4 mr-2 md:w-5 md:h-5 lg:w-4 lg:h-4" />
              <span className="md:text-sm lg:text-xs">Reset View</span>
            </Button>
          </div>

          {/* Draggable Container */}
          <div
            className={cn(
              "w-full h-full flex items-center justify-center select-none touch-none",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="relative transition-transform duration-75 ease-linear will-change-transform"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <img
                src={imageUrl}
                alt="Temple Architecture"
                className="rounded-lg shadow-2xl border border-border/50 object-contain pointer-events-none"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto'
                }}
              />

              {/* Hotspots */}
              {hotspots.map((hotspot, index) => (
                <button
                  key={hotspot.id}
                  className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center group/pin focus:outline-none touch-manipulation z-20"
                  style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%` }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Hotspot clicked", hotspot.id); // Debug
                    handleHotspotClick(hotspot);

                    // Desktop: Scroll sidebar list
                    // Mobile: Scroll window
                    setTimeout(() => {
                      const element = document.getElementById(`hotspot-${hotspot.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  aria-label={`View details for ${hotspot.title}`}
                >
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-0 group-hover/pin:opacity-20 group-hover/pin:animate-ping group-active/pin:opacity-20 group-active/pin:animate-ping transition-opacity" />
                  <div className={cn(
                    "relative w-5 h-5 bg-secondary backdrop-blur-sm rounded-full shadow-md ring-1 ring-accent/50 flex items-center justify-center transition-all duration-200 font-bold text-white text-[10px]",
                    "opacity-40 group-hover/pin:opacity-100",
                    "group-hover/pin:w-7 group-hover/pin:h-7 group-hover/pin:ring-2 group-hover/pin:ring-accent group-hover/pin:shadow-lg group-hover/pin:scale-110 group-hover/pin:bg-primary",
                    "group-active/pin:w-7 group-active/pin:h-7 group-active/pin:ring-2 group-active/pin:scale-110 group-active/pin:opacity-100 group-active/pin:bg-primary",
                    selectedHotspot?.id === hotspot.id && "w-7 h-7 bg-primary ring-2 ring-accent scale-110 opacity-100"
                  )}>
                    {index + 1}
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 hidden lg:block">
                    {hotspot.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Architectural Guide List - Responsive: Stacked (Mobile) / Sidebar (Desktop) */}
        <div className="w-full lg:w-[400px] bg-card border-t lg:border-t-0 lg:border-l flex flex-col min-h-0 order-2 lg:h-full z-20">
          {/* Section Header */}
          <div className="sticky top-[60px] lg:top-0 z-40 bg-card/95 backdrop-blur-sm border-b px-4 py-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Architectural Guide</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Explore the sacred geometry and architectural elements of{' '}
              <span className="font-medium text-foreground break-words">{temple?.name}</span>.
              Tap a marker above or select from the list below.
            </p>
          </div>

          {/* List Content - Scrollable window on mobile, scrollable container on desktop */}
          <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 space-y-3 pb-20 lg:pb-6">
            {hotspots.length === 0 ? (
              <div className="text-center py-16 border rounded-lg border-dashed">
                <Info className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No architectural points added yet.</p>
              </div>
            ) : (
              hotspots.map((item, idx) => (
                <div
                  key={item.id}
                  id={`hotspot-${item.id}`}
                  onClick={() => handleHotspotClick(item)}
                  className={cn(
                    "group flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    "hover:bg-accent hover:shadow-md active:scale-[0.99]",
                    selectedHotspot?.id === item.id
                      ? "bg-accent border-primary ring-2 ring-primary/20 shadow-md"
                      : "border-border/40 hover:border-border"
                  )}
                >
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-base text-foreground group-hover:text-accent-foreground truncate">
                        {item.title}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0 rounded-xl">
          {/* Header Image */}
          <div className="relative h-48 md:h-64 bg-muted w-full overflow-hidden shrink-0">
            {selectedHotspot?.images && selectedHotspot.images.length > 0 ? (
              <img
                src={selectedHotspot.images[0]}
                alt={selectedHotspot.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-secondary/30">
                <MapPin className="w-12 h-12 mb-2 opacity-20" />
                <span className="text-sm opacity-50">No Detail Image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <Badge variant="secondary" className="mb-2 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                Architectural Detail
              </Badge>
              <h2 className="text-2xl font-bold text-white tracking-wide">{selectedHotspot?.title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 bg-card overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none">
              <p className="leading-relaxed text-foreground/90 text-lg">
                {selectedHotspot?.description || "No description available."}
              </p>

              {/* Additional images if any (grid) */}
              {selectedHotspot?.images && selectedHotspot.images.length > 1 && (
                <div className="mt-8 grid grid-cols-2 gap-4 not-prose">
                  {selectedHotspot.images.slice(1).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="rounded-lg shadow-sm border h-32 w-full object-cover"
                      alt=""
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t bg-muted/10 shrink-0 flex justify-end">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
