// src/pages/admin/TempleArchitectureAdmin.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { X, Save, Trash2, Upload, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Plus, ChevronDown, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  imageIndex: number; // Index within the displayImages array (0 = main, 1+ = supplemental)
  title: string;
  description: string;
  images: string[];
}

export default function TempleArchitectureAdmin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [templeName, setTempleName] = useState("");
  const [viewType, setViewType] = useState<'architectural' | 'present'>('architectural');
  const [archImageUrl, setArchImageUrl] = useState("");
  const [presentImageUrl, setPresentImageUrl] = useState("");
  const [archImages, setArchImages] = useState<string[]>([]);
  const [presentImages, setPresentImages] = useState<string[]>([]);
  const [archHotspots, setArchHotspots] = useState<Hotspot[]>([]);
  const [presentHotspots, setPresentHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adminImageIndex, setAdminImageIndex] = useState(0);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "temples", id));

        if (!snap.exists()) {
          toast({
            title: "Error",
            description: "Temple not found",
            variant: "destructive",
          });
          return;
        }

        const data = snap.data();
        setTempleName(data.name || "Unknown Temple");
        setArchImageUrl(data.architectureImage || "");
        setPresentImageUrl(data.presentImage || data.images?.[0] || "");
        setArchImages(data.architectureImages || []);
        setPresentImages(data.presentImages || []);
        setArchHotspots(data.hotspots || []);
        setPresentHotspots(data.presentHotspots || []);
      } catch (error) {
        console.error("Error fetching temple:", error);
        toast({
          title: "Error",
          description: "Failed to load temple data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "IMG") return;

    const rect = target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: uuidv4(),
      x,
      y,
      imageIndex: adminImageIndex,
      title: "",
      description: "",
      images: [],
    };

    setSelectedHotspot(newHotspot);
    setModalOpen(true);
  };

  const displayImages = viewType === 'architectural'
    ? [archImageUrl, ...archImages].filter(Boolean)
    : [presentImageUrl, ...presentImages].filter(Boolean);

  const currentHotspots = viewType === 'architectural' ? archHotspots : presentHotspots;
  const currentImageUrl = displayImages[adminImageIndex];

  const handleHotspotEdit = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHotspot(hotspot);
    setModalOpen(true);
  };

  const saveHotspot = async () => {
    if (!selectedHotspot || !id) return;

    const hotspotsToUpdate = viewType === 'architectural' ? archHotspots : presentHotspots;
    const updatedHotspots = hotspotsToUpdate.some((h) => h.id === selectedHotspot.id)
      ? hotspotsToUpdate.map((h) => (h.id === selectedHotspot.id ? selectedHotspot : h))
      : [...hotspotsToUpdate, selectedHotspot];

    if (viewType === 'architectural') {
      setArchHotspots(updatedHotspots);
    } else {
      setPresentHotspots(updatedHotspots);
    }

    try {
      const fieldToUpdate = viewType === 'architectural' ? "hotspots" : "presentHotspots";
      await updateDoc(doc(db, "temples", id), {
        [fieldToUpdate]: updatedHotspots,
      });

      toast({
        title: "Success",
        description: "Hotspot saved successfully",
      });

      setModalOpen(false);
      setSelectedHotspot(null);
    } catch (error) {
      console.error("Error saving hotspot:", error);
      toast({
        title: "Error",
        description: "Failed to save hotspot",
        variant: "destructive",
      });
    }
  };

  const deleteHotspot = async () => {
    if (!selectedHotspot || !id) return;

    const hotspotsToUpdate = viewType === 'architectural' ? archHotspots : presentHotspots;
    const updatedHotspots = hotspotsToUpdate.filter((h) => h.id !== selectedHotspot.id);

    if (viewType === 'architectural') {
      setArchHotspots(updatedHotspots);
    } else {
      setPresentHotspots(updatedHotspots);
    }

    try {
      const fieldToUpdate = viewType === 'architectural' ? "hotspots" : "presentHotspots";
      await updateDoc(doc(db, "temples", id), {
        [fieldToUpdate]: updatedHotspots,
      });

      toast({
        title: "Success",
        description: "Hotspot deleted successfully",
      });

      setModalOpen(false);
      setSelectedHotspot(null);
    } catch (error) {
      console.error("Error deleting hotspot:", error);
      toast({
        title: "Error",
        description: "Failed to delete hotspot",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (url: string) => {
    if (!id) return;
    try {
      const fieldToUpdate = viewType === 'architectural' ? "architectureImage" : "presentImage";
      await updateDoc(doc(db, "temples", id), {
        [fieldToUpdate]: url,
      });

      if (viewType === 'architectural') {
        setArchImageUrl(url);
      } else {
        setPresentImageUrl(url);
      }

      toast({
        title: "Success",
        description: `${viewType === 'architectural' ? 'Architecture' : 'Present'} main image updated`,
      });
    } catch (error: any) {
      console.error("Error updating image:", error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    }
  };

  const handleSupplementalImageUpload = async (url: string) => {
    if (!id) return;
    try {
      const fieldToUpdate = viewType === 'architectural' ? "architectureImages" : "presentImages";
      const currentImages = viewType === 'architectural' ? archImages : presentImages;
      const updatedImages = [...currentImages, url];

      await updateDoc(doc(db, "temples", id), {
        [fieldToUpdate]: updatedImages,
      });

      if (viewType === 'architectural') {
        setArchImages(updatedImages);
      } else {
        setPresentImages(updatedImages);
      }

      toast({
        title: "Success",
        description: "Supplemental image added successfully",
      });
    } catch (error: any) {
      console.error("Error adding supplemental image:", error);
      toast({
        title: "Error",
        description: "Failed to add supplemental image",
        variant: "destructive",
      });
    }
  };

  const removeSupplementalImage = async (index: number) => {
    if (!id) return;
    try {
      const fieldToUpdate = viewType === 'architectural' ? "architectureImages" : "presentImages";
      const hotspotField = viewType === 'architectural' ? "hotspots" : "presentHotspots";
      const currentImages = viewType === 'architectural' ? archImages : presentImages;
      const currentHotspotsList = viewType === 'architectural' ? archHotspots : presentHotspots;

      const actualIndex = index + 1; // Since index 0 in supplemental array is index 1 in display list

      const updatedImages = currentImages.filter((_, i) => i !== index);

      // Remove hotspots on this image and decrement imageIndex for hotspots on later images
      const updatedHotspots = currentHotspotsList
        .filter(h => (h.imageIndex || 0) !== actualIndex)
        .map(h => {
          if ((h.imageIndex || 0) > actualIndex) {
            return { ...h, imageIndex: h.imageIndex - 1 };
          }
          return h;
        });

      await updateDoc(doc(db, "temples", id), {
        [fieldToUpdate]: updatedImages,
        [hotspotField]: updatedHotspots,
      });

      if (viewType === 'architectural') {
        setArchImages(updatedImages);
        setArchHotspots(updatedHotspots);
      } else {
        setPresentImages(updatedImages);
        setPresentHotspots(updatedHotspots);
      }

      // Reset index to ensure we're not on a deleted or shifted index we don't understand
      if (adminImageIndex === actualIndex) {
        setAdminImageIndex(0);
      } else if (adminImageIndex > actualIndex) {
        setAdminImageIndex(adminImageIndex - 1);
      }

      toast({
        title: "Success",
        description: "Supplemental image and its hotspots removed successfully",
      });
    } catch (error: any) {
      console.error("Error removing supplemental image:", error);
      toast({
        title: "Error",
        description: "Failed to remove supplemental image",
        variant: "destructive",
      });
    }
  };

  const removeImageFromHotspot = (index: number) => {
    if (!selectedHotspot) return;

    setSelectedHotspot({
      ...selectedHotspot,
      images: selectedHotspot.images.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Brand Heading - Styled like Heritage Map */}
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#ab8b39] rounded-full shadow-sm" />
          <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Raj Viharan</h1>
        </div>

        {/* Navigation & Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="w-fit p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-800">{templeName}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/80 mt-1">Architecture Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4 bg-muted p-1 rounded-lg">
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(zoom + 0.2, 3))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Image
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 overflow-hidden border-2 shadow-xl" align="end">
                <ImageUpload
                  folderPath={`${viewType}/${id}/supplemental`}
                  onUpload={handleSupplementalImageUpload}
                  label="Add New Image"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex justify-center bg-muted p-1 rounded-xl w-fit mx-auto">
          <button
            onClick={() => {
              setViewType('architectural');
              setAdminImageIndex(0);
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${viewType === 'architectural'
              ? 'bg-white shadow-sm text-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Architecture View
          </button>
          <button
            onClick={() => {
              setViewType('present');
              setAdminImageIndex(0);
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${viewType === 'present'
              ? 'bg-white shadow-sm text-primary'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Present View
          </button>
        </div>

        {/* Unified Multi-Image Management Slider */}
        <Card className="overflow-hidden border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0 pb-4">
            <div>
              <CardTitle className="text-xl">Interactive Image Editor</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Click anywhere on the image to place or edit hotspots. Use the gallery below to switch between images.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {/* 1. Large Image Editor Area */}
            <div className="bg-slate-950 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl relative group min-h-[400px] md:min-h-[600px] flex items-center justify-center">
              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={() => setAdminImageIndex((p) => (p - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-4 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-xl transition-all border border-white/10 hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={() => setAdminImageIndex((p) => (p + 1) % displayImages.length)}
                    className="absolute right-4 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-xl transition-all border border-white/10 hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Hotspot Interaction Plane */}
              <div
                className="relative cursor-crosshair transition-all duration-500 ease-out"
                style={{
                  transform: `scale(${zoom})`,
                  filter: loading ? 'blur(10px)' : 'none'
                }}
                onClick={handleImageClick}
              >
                {displayImages[adminImageIndex] ? (
                  <>
                    <img
                      src={displayImages[adminImageIndex]}
                      alt="Active View"
                      className="max-h-[80vh] w-auto shadow-2xl transition-transform duration-700 select-none"
                      draggable={false}
                    />

                    {/* Active Image Hotspots */}
                    {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="absolute group z-30"
                        style={{
                          top: `${hotspot.y}%`,
                          left: `${hotspot.x}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={(e) => handleHotspotEdit(hotspot, e)}
                      >
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                          onMouseLeave={() => setHoveredHotspotId(null)}
                        >
                          <div className="absolute -inset-2 bg-red-600/30 rounded-full animate-ping opacity-75"></div>
                          <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-xl group-hover:bg-red-500 group-hover:scale-125 transition-all flex items-center justify-center cursor-pointer relative z-10">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-white text-center p-20 border-4 border-dashed border-white/10 rounded-3xl backdrop-blur-sm">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-xl font-medium text-slate-300">No images available</p>
                    <p className="text-slate-500 mt-2">Upload a main or supplemental image to begin</p>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/10 shadow-2xl flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${adminImageIndex === 0 ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                  {adminImageIndex === 0 ? "PRIMARY IMAGE" : `SUPPLEMENTAL PHOTO ${adminImageIndex}`}
                </div>
              </div>

              {/* Image Controls Overlay */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                {adminImageIndex > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600/20 hover:bg-red-600 text-red-100 backdrop-blur-xl border border-red-600/30 shadow-2xl"
                    onClick={() => removeSupplementalImage(adminImageIndex - 1)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                )}
                {adminImageIndex === 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/10 shadow-2xl"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Change Main Image
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 overflow-hidden border-2 shadow-xl" align="end">
                      <ImageUpload
                        folderPath={`${viewType}/${id}`}
                        onUpload={handleImageUpload}
                        label="Change Main Image"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* 2. Thumbnail Strip (Middle Section) */}
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <ChevronDown className="w-4 h-4" />
                  Photo Gallery ({displayImages.length})
                </h3>
                <p className="text-xs text-slate-500">Pick an image to manage its hotspots</p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {displayImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAdminImageIndex(idx)}
                    className={`relative shrink-0 rounded-xl overflow-hidden border-4 transition-all w-48 aspect-video snap-center group ${adminImageIndex === idx
                      ? 'border-primary shadow-xl scale-105 z-10'
                      : 'border-white hover:border-slate-200'
                      }`}
                  >
                    <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 transition-opacity ${adminImageIndex === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <span className="text-xs text-white font-bold">{idx === 0 ? 'PRIMARY' : `GALLERY ${idx}`}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Hotspot List (Bottom Section) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Hotspots on Selected Image
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                    {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).map((hotspot, idx) => (
                  <Card
                    key={hotspot.id}
                    className={`group transition-all cursor-pointer overflow-hidden border-2 ${hoveredHotspotId === hotspot.id
                      ? 'border-primary shadow-lg bg-primary/5 ring-4 ring-primary/10'
                      : 'hover:border-primary/50 hover:shadow-lg'
                      }`}
                    onClick={(e) => handleHotspotEdit(hotspot, e)}
                    onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                            {idx + 1}. {hotspot.title || "Untitled Hotspot"}
                          </h4>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {hotspot.description || "No description provided for this architectural element."}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotspot(hotspot);
                            deleteHotspot();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Position: {hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%</span>
                        <span className="flex items-center gap-1 group-hover:text-primary">
                          Edit Details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).length === 0 && (
                  <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Plus className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No hotspots mapped to this image yet</p>
                    <p className="text-slate-400 text-sm mt-1">Click anywhere on the large editor at the top to add one</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotspot Edit Dialog */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedHotspot?.title ? `Edit: ${selectedHotspot.title}` : "New Hotspot"}
              </DialogTitle>
            </DialogHeader>

            {selectedHotspot && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Main Sanctum, Gopuram, Mandapa"
                    value={selectedHotspot.title}
                    onChange={(e) =>
                      setSelectedHotspot({ ...selectedHotspot, title: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of this architectural element..."
                    rows={4}
                    value={selectedHotspot.description}
                    onChange={(e) =>
                      setSelectedHotspot({ ...selectedHotspot, description: e.target.value })
                    }
                  />
                </div>

                {/* Images */}
                <div>
                  <Label className="mb-2 block">Images ({selectedHotspot.images.length})</Label>

                  <div className="mb-4">
                    <ImageUpload
                      folderPath={`hotspots/${id}/${selectedHotspot.id}`}
                      onUpload={(url) => {
                        setSelectedHotspot({
                          ...selectedHotspot,
                          images: [...selectedHotspot.images, url],
                        });
                      }}
                      label="Add Hotspot Image"
                    />
                  </div>

                  {selectedHotspot.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedHotspot.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Hotspot image ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImageFromHotspot(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Position Info */}
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <strong>Position:</strong> X: {selectedHotspot.x.toFixed(2)}%, Y:{" "}
                  {selectedHotspot.y.toFixed(2)}%
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              {selectedHotspot && currentHotspots.some((h) => h.id === selectedHotspot.id) && (
                <Button variant="destructive" onClick={deleteHotspot}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveHotspot} disabled={!selectedHotspot?.title}>
                <Save className="w-4 h-4 mr-2" />
                Save Hotspot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
