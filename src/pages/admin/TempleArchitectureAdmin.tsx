// src/pages/admin/TempleArchitectureAdmin.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Hotspot, Leela } from "@/types";
import { X, Save, Trash2, Upload, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Plus, ChevronDown, Image as ImageIcon, Info, MousePointer2, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";

// Local UI state interfaces - The robust interfaces are in @/types

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
  const [templeImages, setTempleImages] = useState<string[]>([]);
  const [archHotspots, setArchHotspots] = useState<Hotspot[]>([]);
  const [presentHotspots, setPresentHotspots] = useState<Hotspot[]>([]);

  // New Temple Metadata & Sections
  const [todaysName, setTodaysName] = useState("");
  const [address, setAddress] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("");
  const [wayToReach, setWayToReach] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description_title, setDescriptionTitle] = useState("Sthan At Glance");
  const [description_text, setDescriptionText] = useState("");
  const [sthana_info_title, setSthanaInfoTitle] = useState("Sthan Description");
  const [sthana_info_text, setSthanaInfoText] = useState("");
  const [descriptionSections, setDescriptionSections] = useState<{ id: string, title: string, content: string }[]>([]);
  const [architectureDescription, setArchitectureDescription] = useState("");

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adminImageIndex, setAdminImageIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<'sthan-info' | 'architecture-view' | 'sthana-details'>('sthan-info');
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [pendingClickPosition, setPendingClickPosition] = useState<{ x: number, y: number } | null>(null);
  const [hotspotPage, setHotspotPage] = useState(1);
  const HOTSPOTS_PER_PAGE = 6;

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
        setTempleImages(data.images || []);
        setArchHotspots(data.hotspots || []);
        setPresentHotspots(data.presentHotspots || []);

        setTodaysName(data.todaysName || "");
        setAddress(data.address || "");
        setTaluka(data.taluka || "");
        setDistrict(data.district || "");
        setWayToReach(data.wayToReach || "");
        setLocationLink(data.locationLink || "");
        setLatitude(data.latitude || "");
        setLongitude(data.longitude || "");
        setDescriptionTitle(data.description_title || "Sthan At Glance");
        setDescriptionText(data.description_text || data.description || "");
        setSthanaInfoTitle(data.sthana_info_title || "Sthan Description");
        setSthanaInfoText(data.sthana_info_text || data.sthana || "");
        setDescriptionSections(data.descriptionSections || []);
        setArchitectureDescription(data.architectureDescription || "");
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

    if (viewType === 'present') {
      // For present view, we don't create new hotspots, we map existing ones from arch view
      setPendingClickPosition({ x, y });
      return;
    }

    const newHotspot: Hotspot = {
      id: uuidv4(),
      x,
      y,
      imageIndex: adminImageIndex,
      title: "",
      description: "",
      significance: "",
      number: (archHotspots.length) + 1,
      images: [],
      oldImages: [],
      leelas: [],
      sthanPothiDescription: "",
      sthanPothiTitle: "",
      generalDescriptionTitle: "",
    };

    setSelectedHotspot(newHotspot);
    setCurrentStep('sthana-details');
  };

  const displayImages = viewType === 'architectural'
    ? [archImageUrl, ...archImages].filter(Boolean)
    : [presentImageUrl, ...presentImages].filter(Boolean);

  const currentHotspots = viewType === 'architectural' ? archHotspots : presentHotspots;
  const currentImageUrl = displayImages[adminImageIndex];

  const handleHotspotEdit = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHotspot(hotspot);
    setCurrentStep('sthana-details');
  };

  const saveHotspot = async () => {
    if (!selectedHotspot || !id) return;

    // 1. Update the current array
    const currentHotspotsToUpdate = viewType === 'architectural' ? archHotspots : presentHotspots;
    const updatedCurrent = currentHotspotsToUpdate.some((h) => h.id === selectedHotspot.id)
      ? currentHotspotsToUpdate.map((h) => (h.id === selectedHotspot.id ? selectedHotspot : h))
      : [...currentHotspotsToUpdate, selectedHotspot];

    // 2. Sync with the other array
    const otherHotspotsToSync = viewType === 'architectural' ? presentHotspots : archHotspots;
    const updatedOther = otherHotspotsToSync.map((h) => {
      if (h.id === selectedHotspot.id) {
        // Sync common fields but keep other coordinates/imageIndex
        return {
          ...selectedHotspot,
          x: h.x,
          y: h.y,
          imageIndex: h.imageIndex
        };
      }
      return h;
    });

    const newArch = viewType === 'architectural' ? updatedCurrent : updatedOther;
    const newPresent = viewType === 'architectural' ? updatedOther : updatedCurrent;

    setArchHotspots(newArch);
    setPresentHotspots(newPresent);

    try {
      await updateDoc(doc(db, "temples", id), {
        hotspots: newArch,
        presentHotspots: newPresent,
      });

      toast({
        title: "Success",
        description: "Hotspot saved and synced successfully",
      });

      setCurrentStep('architecture-view');
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

  const saveTempleDetails = async () => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "temples", id), {
        name: templeName,
        todaysName,
        address,
        taluka,
        district,
        wayToReach,
        locationLink,
        latitude,
        longitude,
        images: templeImages,
        description_title,
        description_text,
        sthana_info_title,
        sthana_info_text,
        descriptionSections,
        architectureDescription,
      });
      toast({ title: "Success", description: "Temple details updated." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save temple details.", variant: "destructive" });
    }
  };

  const saveMainImageOnly = async (type: 'arch' | 'present') => {
    if (!id) return;
    try {
      const field = type === 'arch' ? "architectureImage" : "presentImage";
      const url = type === 'arch' ? archImageUrl : presentImageUrl;
      await updateDoc(doc(db, "temples", id), { [field]: url });
      toast({ title: "Success", description: `${type === 'arch' ? 'Architecture' : 'Present'} image saved.` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save image.", variant: "destructive" });
    }
  };

  const addDescriptionSection = () => {
    const newSection = { id: uuidv4(), title: "", content: "" };
    setDescriptionSections([...descriptionSections, newSection]);
  };

  const updateDescriptionSection = (sId: string, field: 'title' | 'content', value: string) => {
    setDescriptionSections(descriptionSections.map(s => s.id === sId ? { ...s, [field]: value } : s));
  };

  const removeDescriptionSection = (sId: string) => {
    setDescriptionSections(descriptionSections.filter(s => s.id !== sId));
  };

  const deleteHotspot = async () => {
    if (!selectedHotspot || !id) return;

    if (!confirm(`Are you sure you want to delete ${selectedHotspot.title || `Hotspot #${selectedHotspot.number}`}? This will remove it from all views.`)) return;

    const newArch = archHotspots.filter((h) => h.id !== selectedHotspot.id);
    const newPresent = presentHotspots.filter((h) => h.id !== selectedHotspot.id);

    setArchHotspots(newArch);
    setPresentHotspots(newPresent);

    try {
      await updateDoc(doc(db, "temples", id), {
        hotspots: newArch,
        presentHotspots: newPresent,
      });

      toast({
        title: "Deleted",
        description: "Hotspot removed successfully from all views.",
      });

      setCurrentStep('architecture-view');
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

  const unmapHotspot = async (hotspotId: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to remove this hotspot from this specific photo? (It will still exist in the master list)")) return;
    try {
      const updatedPresent = presentHotspots.filter(h => !(h.id === hotspotId && (h.imageIndex || 0) === adminImageIndex));
      setPresentHotspots(updatedPresent);
      await updateDoc(doc(db, "temples", id), { presentHotspots: updatedPresent });
      toast({ title: "Unmapped", description: "Hotspot removed from this photo." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to unmap hotspot." });
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

  const removeImageFromHotspot = (index: number, type: 'present' | 'old' = 'present') => {
    if (!selectedHotspot) return;

    if (type === 'present') {
      setSelectedHotspot({
        ...selectedHotspot,
        images: selectedHotspot.images.filter((_, i) => i !== index),
      });
    } else {
      setSelectedHotspot({
        ...selectedHotspot,
        oldImages: (selectedHotspot.oldImages || []).filter((_, i) => i !== index),
      });
    }
  };

  const addLeela = () => {
    if (!selectedHotspot) return;
    const newLeela: Leela = { id: uuidv4(), description: "" };
    setSelectedHotspot({
      ...selectedHotspot,
      leelas: (Array.isArray(selectedHotspot.leelas)
        ? [...selectedHotspot.leelas, newLeela]
        : [newLeela]) as Leela[]
    });
  };

  const updateLeela = (id: string, description: string) => {
    if (!selectedHotspot || !Array.isArray(selectedHotspot.leelas)) return;
    setSelectedHotspot({
      ...selectedHotspot,
      leelas: (selectedHotspot.leelas as any[]).map((l: any) =>
        typeof l === 'string' ? l : (l.id === id ? { ...l, description } : l)
      ) as Leela[]
    });
  };

  const removeLeela = (id: string) => {
    if (!selectedHotspot || !Array.isArray(selectedHotspot.leelas)) return;
    setSelectedHotspot({
      ...selectedHotspot,
      leelas: (selectedHotspot.leelas as any[]).filter((l: any) =>
        typeof l === 'string' ? l !== id : l.id !== id
      ) as Leela[]
    });
  };

  const filteredListHotspots = viewType === 'architectural'
    ? archHotspots.filter(h => (h.imageIndex || 0) === adminImageIndex)
    : archHotspots;

  const totalPages = Math.ceil(filteredListHotspots.length / HOTSPOTS_PER_PAGE);
  const paginatedHotspots = filteredListHotspots.slice((hotspotPage - 1) * HOTSPOTS_PER_PAGE, hotspotPage * HOTSPOTS_PER_PAGE);

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

        {/* Step Navigation Header */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between sticky top-4 z-50 overflow-x-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/sthana-directory")}
              className="rounded-xl hover:bg-slate-50 text-slate-500 font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Directory
            </Button>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex items-center gap-1">
              {[
                { id: 'sthan-info', label: '1. Sthan Info', icon: ImageIcon },
                { id: 'architecture-view', label: '2. Architecture View', icon: ZoomIn },
                { id: 'sthana-details', label: '3. Sthana Details', icon: Plus },
              ].map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${currentStep === step.id
                    ? 'bg-blue-900 text-white shadow-lg scale-105'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <step.icon className="w-4 h-4" />
                  {step.label}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 pr-2">
            <div className="w-1.5 h-6 bg-slate-200 rounded-full" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              {currentStep.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Step 1: Sthan Info */}
        {currentStep === 'sthan-info' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Temple Configuration</h1>
                <p className="text-sm text-slate-500 font-medium">Configure primary metadata and descriptive content blocks.</p>
              </div>
              <Button onClick={saveTempleDetails} className="bg-blue-900 text-white hover:bg-blue-800 rounded-xl px-8 h-12 shadow-lg shadow-blue-900/20">
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>

            <div className="space-y-12">
              {/* 1. Primary Identity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Primary Identity</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
                    This information appears in the main header and site-wide navigation.
                  </p>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Sthan Name</Label>
                      <Input
                        value={templeName}
                        onChange={(e) => setTempleName(e.target.value)}
                        placeholder="e.g. Shri Panchasara Parshvanath"
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Todays Name <span className="text-slate-400 font-normal">(Optional)</span></Label>
                      <Input
                        value={todaysName}
                        onChange={(e) => setTodaysName(e.target.value)}
                        placeholder="e.g. Patan, Gujarat"
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Address</Label>
                    <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter the complete address..."
                      rows={3}
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Taluka</Label>
                      <Input
                        value={taluka}
                        onChange={(e) => setTaluka(e.target.value)}
                        placeholder="e.g. Sidhpur"
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">District</Label>
                      <Input
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Patan"
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200/60" />

              {/* 2. Navigation & Access */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Navigation & Access</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
                    Help pilgrims find their way to this sacred site.
                  </p>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">How to reach</Label>
                    <Textarea
                      value={wayToReach}
                      onChange={(e) => setWayToReach(e.target.value)}
                      placeholder="Provide detailed instructions for trains, buses, or flights..."
                      rows={4}
                      className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Latitude</Label>
                      <Input
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g. 23.8506"
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Longitude</Label>
                      <Input
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g. 72.1154"
                        className="h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Google Maps Integration (URL)</Label>
                    <div className="relative group">
                      <Input
                        value={locationLink}
                        onChange={(e) => setLocationLink(e.target.value)}
                        placeholder="https://goo.gl/maps/..."
                        className="h-12 pl-10 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <ExternalLink className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200/60" />

              {/* Temple Gallery */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Sthan Gallery</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
                    Upload beautiful photos of the temple entrance, surroundings, and general views.
                  </p>
                </div>
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templeImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square group rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                        <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => {
                            if (confirm("Remove this image from gallery?")) {
                              setTempleImages(templeImages.filter((_, i) => i !== idx));
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all shadow-xl hover:bg-red-700 z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex items-center justify-center p-2 group/upload overflow-hidden">
                      <ImageUpload
                        folderPath={`temples/${id}/gallery`}
                        onUpload={(url) => setTempleImages([...templeImages, url])}
                        label="Upload Photo"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200/60" />

              {/* 3. Descriptive Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-slate-900">
                <div>
                  <div className="flex items-center justify-between lg:block">
                    <h2 className="text-xl font-bold">Descriptive Content</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addDescriptionSection}
                      className="lg:mt-4 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 h-10 px-4 font-bold gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Block
                    </Button>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
                    Add custom sections like "History", "Significance", or "Unique Features".
                  </p>
                </div>
                <div className="lg:col-span-2 space-y-8">
                  {/* Standard Mandatory Blocks */}
                  <div className="space-y-6">
                    {/* Sthan At Glance */}
                    <div className="p-6 bg-amber-50/30 rounded-3xl border border-amber-100 shadow-sm space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Block Title</span>
                          <div className="h-px flex-1 bg-amber-100/50" />
                        </div>
                        <Input
                          value={description_title}
                          onChange={(e) => setDescriptionTitle(e.target.value)}
                          placeholder="Sthan At Glance"
                          className="h-12 border-none bg-white rounded-xl font-bold text-lg focus:ring-2 focus:ring-amber-200 transition-all px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Detailed Narrative</span>
                          <div className="h-px flex-1 bg-amber-100/50" />
                        </div>
                        <Textarea
                          value={description_text}
                          onChange={(e) => setDescriptionText(e.target.value)}
                          placeholder="Summarize the sthan at a glance..."
                          rows={4}
                          className="border-none bg-white rounded-xl focus:ring-2 focus:ring-amber-200 transition-all p-4 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Sthan Description */}
                    <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100 shadow-sm space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Block Title</span>
                          <div className="h-px flex-1 bg-blue-100/50" />
                        </div>
                        <Input
                          value={sthana_info_title}
                          onChange={(e) => setSthanaInfoTitle(e.target.value)}
                          placeholder="Sthan Description"
                          className="h-12 border-none bg-white rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-200 transition-all px-4"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Detailed Narrative</span>
                          <div className="h-px flex-1 bg-blue-100/50" />
                        </div>
                        <Textarea
                          value={sthana_info_text}
                          onChange={(e) => setSthanaInfoText(e.target.value)}
                          placeholder="Detailed sthan description..."
                          rows={6}
                          className="border-none bg-white rounded-xl focus:ring-2 focus:ring-blue-200 transition-all p-4 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-4">
                    <Separator className="flex-1 opacity-50" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Additional Custom Blocks</span>
                    <Separator className="flex-1 opacity-50" />
                  </div>

                  {descriptionSections.length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                      <p className="text-slate-400 font-medium">No additional descriptive blocks added yet.</p>
                      <Button variant="link" onClick={addDescriptionSection} className="text-blue-600 font-black mt-2">
                        Click here to add one
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {descriptionSections.map((s, idx) => (
                        <div key={s.id} className="group relative p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <button
                            onClick={() => removeDescriptionSection(s.id)}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove this block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Block Title</span>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <Input
                                value={s.title}
                                onChange={(e) => updateDescriptionSection(s.id, 'title', e.target.value)}
                                placeholder="e.g. History"
                                className="h-12 border-none bg-slate-50/80 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-100 transition-all px-4"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Narrative</span>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>
                              <Textarea
                                value={s.content}
                                onChange={(e) => updateDescriptionSection(s.id, 'content', e.target.value)}
                                placeholder="Add custom content here..."
                                rows={6}
                                className="border-none bg-slate-50/80 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all p-4 leading-relaxed"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-20">
              <Button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setCurrentStep('architecture-view');
                }}
                className="bg-blue-900 px-10 h-16 rounded-2xl font-black shadow-2xl shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all text-white gap-3"
              >
                Next Step: Architecture Mapping <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Architecture View */}
        {currentStep === 'architecture-view' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Quick Tips Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <MousePointer2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-blue-900">How to add hotspots</h4>
                  <p className="text-xs text-blue-700/70 leading-relaxed font-medium">
                    {viewType === 'architectural'
                      ? "Click anywhere on the large image below to place a new architectural pinpoint."
                      : "Click on the photo then select an existing hotspot from the master list to map it."}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900">Gallery Management</h4>
                  <p className="text-xs text-amber-700/70 leading-relaxed font-medium">
                    Add supplemental views using the "Add Photo" card in the gallery strip below.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Any unsaved changes will be lost. Return to dashboard?")) {
                      navigate("/admin");
                    }
                  }}
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

              <div className="flex items-center gap-4">
                <Button onClick={saveTempleDetails} className="bg-blue-900 text-white hover:bg-blue-800 rounded-xl px-8 h-12 shadow-lg shadow-blue-900/20">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
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
                              <div className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${viewType === 'architectural' ? 'bg-red-600/30' : 'bg-blue-600/30'}`}></div>
                              <div className={`w-7 h-7 rounded-full border-2 border-white shadow-xl group-hover:scale-125 transition-all flex items-center justify-center cursor-pointer relative z-10 font-black text-[10px] text-white ${viewType === 'architectural' ? 'bg-red-600 group-hover:bg-red-500' : 'bg-blue-600 group-hover:bg-blue-500'}`}>
                                {hotspot.number}
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
                    <Button
                      onClick={() => saveMainImageOnly(adminImageIndex === 0 ? (viewType === 'architectural' ? 'arch' : 'present') : 'arch' /* fallback */)}
                      variant="outline"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl border border-white/10"
                    >
                      <Save className="w-4 h-4 mr-2" /> Save Image URL
                    </Button>
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
                        {idx > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Remove this supplemental image and all its hotspots?")) {
                                removeSupplementalImage(idx - 1);
                              }
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </button>
                    ))}

                    {/* Add Image Card */}
                    <div className="shrink-0 snap-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="relative rounded-xl overflow-hidden border-4 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all w-48 aspect-video flex flex-col items-center justify-center gap-2 group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                              <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-primary uppercase tracking-tighter">Add Photo</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 overflow-hidden border-2 shadow-xl" align="end">
                          <ImageUpload
                            folderPath={viewType === 'architectural' ? `architecture/${id}` : `present/${id}`}
                            onUpload={handleSupplementalImageUpload}
                            label="Add Photo to Gallery"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        {viewType === 'architectural' ? 'Hotspots on Selected Image' : 'All Architectural Hotspots'}
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
                          {filteredListHotspots.length}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium italic">
                        {viewType === 'architectural'
                          ? "ℹ️ Click anywhere on the image above to add a new hotspot, or use the sticky button."
                          : "ℹ️ Click on the photo above then select a hotspot to map it."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {totalPages > 1 && (
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={hotspotPage === 1}
                            onClick={() => setHotspotPage(p => p - 1)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-50"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                          </Button>
                          <span className="text-[10px] font-black w-10 text-center text-slate-400">
                            {hotspotPage} / {totalPages}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={hotspotPage === totalPages}
                            onClick={() => setHotspotPage(p => p + 1)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-50"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedHotspots.map((hotspot) => {
                      const isPlaced = viewType === 'present' && presentHotspots.some(ph => ph.id === hotspot.id && (ph.imageIndex || 0) === adminImageIndex);

                      return (
                        <Card
                          key={hotspot.id}
                          className={`group transition-all cursor-pointer overflow-hidden border-2 ${hoveredHotspotId === hotspot.id
                            ? 'border-primary shadow-lg bg-primary/5 ring-4 ring-primary/10'
                            : isPlaced ? 'border-blue-100 bg-blue-50/30' : 'hover:border-primary/50 hover:shadow-lg'
                            }`}
                          onClick={(e) => {
                            if (viewType === 'present' && !isPlaced && pendingClickPosition) {
                              const newPresentHotspot = {
                                ...hotspot,
                                x: pendingClickPosition.x,
                                y: pendingClickPosition.y,
                                imageIndex: adminImageIndex
                              };
                              setPresentHotspots([...presentHotspots, newPresentHotspot]);
                              setPendingClickPosition(null);
                              toast({ title: "Mapped", description: `Hotspot #${hotspot.number} mapped to photo.` });
                            } else {
                              handleHotspotEdit(hotspot, e);
                            }
                          }}
                          onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                          onMouseLeave={() => setHoveredHotspotId(null)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${viewType === 'architectural' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                    {hotspot.number}
                                  </span>
                                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                    {hotspot.title || "Untitled Hotspot"}
                                  </h4>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                  {hotspot.description || "No description provided."}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {isPlaced && (
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    Mapped
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (viewType === 'present' && isPlaced) {
                                      unmapHotspot(hotspot.id);
                                    } else {
                                      setSelectedHotspot(hotspot);
                                      deleteHotspot();
                                    }
                                  }}
                                  title={viewType === 'present' && isPlaced ? "Unmap from this photo" : "Delete forever"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Position: {hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%</span>
                              <span className="flex items-center gap-1 group-hover:text-primary">
                                Edit Details <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {filteredListHotspots.length === 0 && (
                      <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <Plus className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">No hotspots found</p>
                        <p className="text-slate-400 text-sm mt-1">
                          {viewType === 'architectural'
                            ? "Click anywhere on the image above to add a new hotspot."
                            : "Add hotspots in the Architectural View first, then map them here."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sthan's Description Block */}
            <Card className="border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  <CardTitle className="text-lg font-bold text-slate-900">Sthan's Description</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  placeholder="Provide a detailed architectural description of the temple complex..."
                  value={architectureDescription}
                  onChange={(e) => setArchitectureDescription(e.target.value)}
                  className="min-h-[150px] resize-y"
                />
                <p className="mt-2 text-xs text-slate-500">
                  This description will appear in the Architecture View section of the public site.
                </p>
              </CardContent>
            </Card>

            {/* Hotspot Edit Dialog */}
          </div>
        )}

        {/* Step 3: Sthana Details */}
        {currentStep === 'sthana-details' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">Sthana Information Management</h1>
                <p className="text-sm text-slate-500 font-medium">Manage details, history, and photos for every sacred spot.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    const newSthana: Hotspot = {
                      id: uuidv4(),
                      number: archHotspots.length + 1,
                      title: "",
                      description: "",
                      x: 0,
                      y: 0,
                      images: [],
                      oldImages: [],
                      leelas: [],
                      sthanPothiTitle: "",
                      sthanPothiDescription: "",
                      generalDescriptionTitle: "",
                    };
                    setArchHotspots([...archHotspots, newSthana]);
                    setSelectedHotspot(newSthana);
                  }}
                  className="bg-amber-600 text-white hover:bg-amber-700 rounded-xl px-6 h-12 shadow-lg shadow-amber-600/20 gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Sthana (No Hotspot)
                </Button>
                <Button onClick={saveTempleDetails} className="bg-blue-900 text-white hover:bg-blue-800 rounded-xl px-8 h-12 shadow-lg shadow-blue-900/20">
                  <Save className="w-4 h-4 mr-2" /> Save All Changes
                </Button>
              </div>
            </div>

            {!selectedHotspot ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archHotspots.map((h) => (
                  <Card
                    key={h.id}
                    className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden border-2"
                    onClick={() => setSelectedHotspot(h)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                          {h.number}
                        </div>
                        <Badge variant="outline" className="bg-white text-slate-400 capitalize">
                          {h.images?.length || 0} Photos
                        </Badge>
                      </div>
                      <CardTitle className="mt-4 text-xl">{h.title || "Untitled Sthana"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                        {h.description || "No description provided."}
                      </p>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {h.x === 0 && h.y === 0 ? (
                            <span className="text-amber-500">Unmapped (No Hotspot)</span>
                          ) : (
                            <span>Mapped to Arch View</span>
                          )}
                        </div>
                        <span className="text-primary font-bold text-sm flex items-center gap-1">
                          Edit Details <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {archHotspots.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No Sthanas Defined</h3>
                    <p className="text-sm text-slate-500 mt-1">Add hotspots in Step 2 or create a stand-alone sthana here.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedHotspot(null)} className="rounded-full hover:bg-slate-100">
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                      <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">
                        {selectedHotspot.title || "New Hotspot"}
                      </h1>
                      <p className="text-sm text-slate-500 mt-1">Refine descriptions, images, and leelas for this specific spot</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={saveHotspot} className="bg-blue-900 text-white hover:bg-blue-800 rounded-xl px-8 h-12 shadow-lg shadow-blue-900/20">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Basic Info & Content */}
                  <div className="space-y-6">

                    {/* Sthan Pothi Card */}
                    <Card className="border-slate-200">
                      <CardHeader className="pb-3 border-b border-slate-100 mb-4">
                        <CardTitle className="text-lg font-bold">Sthan Pothi</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Hotspot Name</Label>
                          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-bold">
                            {selectedHotspot.title || "Untitled Hotspot"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Sthan Pothi</Label>
                          <Textarea
                            value={selectedHotspot.sthanPothiDescription || ""}
                            onChange={(e) => setSelectedHotspot({ ...selectedHotspot, sthanPothiDescription: e.target.value })}
                            placeholder="Specific scriptural details..."
                            rows={5}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Details Card (formerly Deep Details) */}
                    <Card className="border-slate-200">
                      <CardHeader className="pb-3 border-b border-slate-100 mb-4">
                        <CardTitle className="text-lg font-bold">Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={selectedHotspot.generalDescriptionTitle || "General Description"}
                            onChange={(e) => setSelectedHotspot({ ...selectedHotspot, generalDescriptionTitle: e.target.value })}
                            placeholder="Heading for this section"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            value={selectedHotspot.description}
                            onChange={(e) => setSelectedHotspot({ ...selectedHotspot, description: e.target.value })}
                            placeholder="Brief architectural overview..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                      <CardHeader className="pb-3 border-b border-slate-100 mb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Leelas (Stories)</CardTitle>
                        <Button variant="outline" size="sm" onClick={addLeela} className="rounded-lg h-8">
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Leela
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(Array.isArray(selectedHotspot.leelas) ? selectedHotspot.leelas : []).map((leela: any, idx: number) => (
                          <div key={typeof leela === 'string' ? idx : leela.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3 relative group">
                            <button
                              onClick={() => removeLeela(typeof leela === 'string' ? leela : leela.id)}
                              className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <Input
                                placeholder="Title"
                                value={typeof leela === 'string' ? '' : leela.title}
                                className="bg-white h-8"
                                onChange={(e) => {
                                  const updatedLeelas = (selectedHotspot.leelas as any[]).map((l: any) =>
                                    typeof l === 'string' ? l : (l.id === leela.id ? { ...l, title: e.target.value } : l)
                                  );
                                  setSelectedHotspot({ ...selectedHotspot, leelas: updatedLeelas as Leela[] });
                                }}
                              />
                            </div>
                            <Textarea
                              placeholder="Describe the story..."
                              rows={3}
                              className="bg-white"
                              value={typeof leela === 'string' ? leela : leela.description}
                              onChange={(e) => updateLeela(typeof leela === 'string' ? leela : leela.id, e.target.value)}
                            />
                          </div>
                        ))}
                        {(!selectedHotspot.leelas || selectedHotspot.leelas.length === 0) && (
                          <p className="text-sm text-slate-400 italic text-center py-6">No leelas added yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Image Management */}
                  <div className="space-y-6">
                    {/* Present Day Images */}
                    <Card className="border-slate-200 overflow-hidden group/card shadow-sm hover:shadow-md transition-all">
                      <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <h3 className="font-bold text-slate-900">Sthan Photo</h3>
                        </div>
                        <Badge variant="outline" className="bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          {selectedHotspot.images.length} Photos
                        </Badge>
                      </div>
                      <CardContent className="p-6 space-y-4">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                          ℹ️ Photos added here will be displayed in the primary gallery for this sthana.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedHotspot.images.map((url, idx) => (
                            <div key={idx} className="relative aspect-[4/3] group rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                              <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <button
                                onClick={() => {
                                  if (confirm("Remove this image?")) {
                                    removeImageFromHotspot(idx, 'present');
                                  }
                                }}
                                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all shadow-xl hover:bg-red-700 z-10"
                                title="Remove image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all flex items-center justify-center p-2 group/upload overflow-hidden">
                            <ImageUpload
                              folderPath={`hotspots/${id}/${selectedHotspot.id}/present`}
                              onUpload={(url) => setSelectedHotspot({
                                ...selectedHotspot,
                                images: [...selectedHotspot.images, url]
                              })}
                              label="Upload"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pick Hotspot Mapping Dialog */}
        <Dialog open={!!pendingClickPosition} onOpenChange={(open) => !open && setPendingClickPosition(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Map Architectural Hotspot</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-500 font-medium">
                Choose which hotspot from the architectural view you want to map to this location:
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-2">
                {archHotspots
                  .filter(ah => !presentHotspots.some(ph => ph.id === ah.id && (ph.imageIndex || 0) === adminImageIndex))
                  .map(ah => (
                    <button
                      key={ah.id}
                      onClick={() => {
                        const newPresentHotspot = {
                          ...ah,
                          x: pendingClickPosition!.x,
                          y: pendingClickPosition!.y,
                          imageIndex: adminImageIndex
                        };
                        setPresentHotspots([...presentHotspots, newPresentHotspot]);
                        setPendingClickPosition(null);
                        toast({ title: "Mapped", description: `Hotspot #${ah.number} mapped to photo.` });
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs">
                        {ah.number}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{ah.title || `Hotspot #${ah.number}`}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{ah.description}</p>
                      </div>
                    </button>
                  ))}
                {archHotspots.filter(ah => !presentHotspots.some(ph => ph.id === ah.id && (ph.imageIndex || 0) === adminImageIndex)).length === 0 && (
                  <p className="text-center py-8 text-slate-400 italic">No unmapped hotspots available.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPendingClickPosition(null)} className="rounded-xl">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Floating Sticky Button for Adding Hotspots (Step 2 Only) */}
        {
          currentStep === 'architecture-view' && viewType === 'architectural' && (
            <div className="fixed bottom-10 right-10 z-[60] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
              <Button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  toast({
                    title: "Ready to Add",
                    description: "Click anywhere on the large architectural image at the top to place a new hotspot pinpoint.",
                  });
                }}
                className="h-16 px-8 rounded-full shadow-[0_20px_50px_rgba(37,99,235,0.4)] bg-blue-600 text-white border-2 border-white/20 hover:scale-110 active:scale-95 transition-all text-lg font-black gap-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Add New Hotspot
              </Button>
            </div>
          )}
      </div>
    </div >
  );
}
