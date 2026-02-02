// src/pages/admin/TempleArchitectureAdmin.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { X, Save, Trash2, Upload, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">{templeName}</h1>
            <p className="text-muted-foreground">Architecture Management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(zoom + 0.2, 3))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
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
        <Card className="overflow-hidden border-2 border-slate-200">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Unified Image & Hotspot Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse images, add new ones, and click anywhere to place hotspots on the active image.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ImageUpload
                  folderPath={`${viewType}/${id}/supplemental`}
                  onUpload={handleSupplementalImageUpload}
                  label="Add New Image"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Image Editor Area */}
              <div className="flex-1 bg-slate-900 flex items-center justify-center relative group min-h-[400px]">
                {/* Navigation Arrows */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setAdminImageIndex((p) => (p - 1 + displayImages.length) % displayImages.length)}
                      className="absolute left-4 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setAdminImageIndex((p) => (p + 1) % displayImages.length)}
                      className="absolute right-4 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Hotspot Interaction Plane */}
                <div
                  className="relative cursor-crosshair transition-transform duration-300"
                  style={{ transform: `scale(${zoom})` }}
                  onClick={handleImageClick}
                >
                  {displayImages[adminImageIndex] ? (
                    <>
                      <img
                        src={displayImages[adminImageIndex]}
                        alt="Active View"
                        className="max-h-[70vh] w-auto shadow-2xl rounded"
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
                          <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg group-hover:bg-red-500 group-hover:scale-125 transition-all flex items-center justify-center cursor-pointer">
                            <Plus className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-white text-center p-12 border-2 border-dashed border-white/20 rounded-xl">
                      <p>No images available. Please upload an image to begin.</p>
                    </div>
                  )}
                </div>

                {/* Badge for Image Type */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-md">
                  {adminImageIndex === 0 ? "Main Hotspot Image" : `Supplemental Image ${adminImageIndex}`}
                </div>

                {/* Delete Supplemental Button */}
                {adminImageIndex > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute bottom-4 right-4 shadow-lg"
                    onClick={() => removeSupplementalImage(adminImageIndex - 1)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Supplemental Image
                  </Button>
                )}

                {/* Update Main Image Button */}
                {adminImageIndex === 0 && (
                  <div className="absolute bottom-4 right-4">
                    <ImageUpload
                      folderPath={`${viewType}/${id}`}
                      onUpload={handleImageUpload}
                      label="Replace Main Image"
                      className="bg-white/90 text-slate-900 hover:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Sidebar: Image Thumbnails & Hotspot List */}
              <div className="w-full md:w-80 bg-white border-l flex flex-col">
                <div className="p-4 border-b bg-slate-50">
                  <h3 className="font-bold text-slate-900">Image Gallery ({displayImages.length})</h3>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex md:flex-col gap-2 p-2 overflow-auto max-h-[200px] md:max-h-none border-b">
                  {displayImages.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAdminImageIndex(idx)}
                      className={`relative shrink-0 rounded-md overflow-hidden border-2 transition-all aspect-video w-32 md:w-full ${adminImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-95' : 'border-transparent hover:border-slate-300'}`}
                    >
                      <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold">{idx === 0 ? 'Main' : `Supp ${idx}`}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Hotspot List for Current Image */}
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">Hotspots on this image</h3>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).map((hotspot, idx) => (
                      <div
                        key={hotspot.id}
                        className="group flex flex-col p-3 bg-white border rounded-lg hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all"
                        onClick={(e) => handleHotspotEdit(hotspot, e)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">
                            {idx + 1}. {hotspot.title || "Untitled"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHotspot(hotspot);
                              deleteHotspot();
                            }}
                            className="text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                          {hotspot.description || "No description provided"}
                        </p>
                      </div>
                    ))}

                    {currentHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex).length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs italic">
                        No hotspots on this image yet.<br />Click on the image to add one.
                      </div>
                    )}
                  </div>
                </div>
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
