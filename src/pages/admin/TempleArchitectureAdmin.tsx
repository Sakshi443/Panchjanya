// src/pages/admin/TempleArchitectureAdmin.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { X, Save, Trash2, Upload, ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
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
  const [archHotspots, setArchHotspots] = useState<Hotspot[]>([]);
  const [presentHotspots, setPresentHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

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
      title: "",
      description: "",
      images: [],
    };

    setSelectedHotspot(newHotspot);
    setModalOpen(true);
  };

  const currentHotspots = viewType === 'architectural' ? archHotspots : presentHotspots;
  const currentImageUrl = viewType === 'architectural' ? archImageUrl : presentImageUrl;

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
        description: `${viewType === 'architectural' ? 'Architecture' : 'Present'} image updated`,
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
            onClick={() => setViewType('architectural')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${viewType === 'architectural'
                ? 'bg-white shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Architecture View
          </button>
          <button
            onClick={() => setViewType('present')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${viewType === 'present'
                ? 'bg-white shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Present View
          </button>
        </div>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>{viewType === 'architectural' ? 'Architecture' : 'Present'} Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentImageUrl ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No {viewType} image set. Upload one below.
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mb-2">
                Current {viewType} image set. Upload new one to replace.
              </div>
            )}

            <ImageUpload
              folderPath={`${viewType}/${id}`}
              onUpload={handleImageUpload}
              label={`Upload ${viewType === 'architectural' ? 'Architecture' : 'Present'} Image`}
            />
          </CardContent>
        </Card>

        {/* Interactive Map */}
        {currentImageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>
                Interactive Hotspots ({currentHotspots.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on the {viewType} image to add hotspots. Click existing hotspots to edit them.
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[600px] border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div
                  className="relative inline-block min-w-full cursor-crosshair"
                  onClick={handleImageClick}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <img
                    src={currentImageUrl}
                    alt={`${viewType} View`}
                    className="w-full rounded-lg shadow-md"
                  />

                  {/* Hotspot Markers */}
                  {currentHotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      className="absolute group"
                      style={{
                        top: `${hotspot.y}%`,
                        left: `${hotspot.x}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={(e) => handleHotspotEdit(hotspot, e)}
                    >
                      <div className="relative cursor-pointer">
                        <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        {hotspot.title && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                              {hotspot.title}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hotspot List */}
        {currentHotspots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Hotspot List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentHotspots.map((hotspot, index) => (
                  <div
                    key={hotspot.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={(e) => handleHotspotEdit(hotspot, e)}
                  >
                    <div>
                      <p className="font-medium">
                        {index + 1}. {hotspot.title || "Untitled Hotspot"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Position: ({hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%)
                        {hotspot.images.length > 0 && ` • ${hotspot.images.length} image(s)`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspot(hotspot);
                        deleteHotspot();
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
  );
}
