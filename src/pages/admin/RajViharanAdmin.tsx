import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    Edit,
    Trash2,
    MapPin,
    Loader2,
    ArrowUp,
    ArrowDown,
    Save,
    X,
    Compass,
    Clock,
    Users,
    Activity,
    GripVertical,
    Search,
    Edit3,
    Trash,
    ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { YatraPlace } from "@/types";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ROUTES = [
    {
        id: "swami-complete",
        name: "Swami's complete journey",
        subRoutes: [
            { id: "ekant", name: "Ekant" },
            { id: "purvardh", name: "Purvardh" },
            { id: "uttarardh", name: "Uttarardh" }
        ]
    },
    { id: "dattatray", name: "Shri Dattatray Prabhu Viharan" },
    { id: "govind", name: "Shri Govind Prabhu Viharan" },
    { id: "chakrapani", name: "Shri Chakrapani Prabhu Viharan" },
    { id: "krishna", name: "Shri Krishna Prabhu Viharan" }
];

function LocationPicker({ lat, lng, onSelect }: { lat?: number, lng?: number, onSelect: (lat: number, lng: number) => void }) {
    function MapEvents() {
        useMapEvents({
            click(e) {
                onSelect(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    }

    const center: [number, number] = lat && lng ? [lat, lng] : [19.1602, 77.3150]; // Default to Nanded area

    return (
        <MapContainer
            center={center}
            zoom={lat && lng ? 13 : 6}
            style={{ height: "300px", width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEvents />
            {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
    );
}

export default function RajViharanAdmin() {
    const [places, setPlaces] = useState<YatraPlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlace, setSelectedPlace] = useState<YatraPlace | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState<Partial<YatraPlace & { pinColor: string }>>({
        name: "",
        description: "",
        latitude: 0,
        longitude: 0,
        sequence: 1,
        status: "upcoming",
        route: "swami-complete",
        subRoute: "",
        time: "",
        attendees: "",
        isLive: false,
        image: "",
        pinColor: "#D4AF37" // Default regal gold
    });

    useEffect(() => {
        const q = query(collection(db, "yatraPlaces"), orderBy("sequence", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as YatraPlace[];
            setPlaces(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching yatra places:", error);
            toast({
                title: "Error",
                description: "Failed to fetch yatra places",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleEdit = (place: YatraPlace) => {
        setSelectedPlace(place);
        setFormData(place);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddNew = () => {
        setSelectedPlace(null);
        setFormData({
            name: "",
            description: "",
            latitude: 19.8647, // Default coordinates
            longitude: 75.7714,
            sequence: places.length > 0 ? Math.max(...places.map(p => p.sequence)) + 1 : 1,
            status: "upcoming",
            route: "swami-complete",
            subRoute: "",
            time: "",
            attendees: "",
            isLive: false,
            image: ""
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedPlace(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.latitude || !formData.longitude) {
            toast({
                title: "Error",
                description: "Please fill in all required fields (Name, Latitude, Longitude)",
                variant: "destructive"
            });
            return;
        }

        try {
            if (selectedPlace) {
                // Update
                const placeRef = doc(db, "yatraPlaces", selectedPlace.id);
                await updateDoc(placeRef, formData);
                toast({ title: "Success", description: "Yatra place updated" });
            } else {
                // Create
                await addDoc(collection(db, "yatraPlaces"), formData);
                toast({ title: "Success", description: "Yatra place created" });
            }
            setIsEditing(false);
            setSelectedPlace(null);
        } catch (error) {
            console.error("Error saving yatra place:", error);
            toast({
                title: "Error",
                description: "Failed to save yatra place",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this yatra place?")) return;

        try {
            await deleteDoc(doc(db, "yatraPlaces", id));
            toast({ title: "Success", description: "Yatra place deleted" });
            if (selectedPlace?.id === id) {
                setIsEditing(false);
                setSelectedPlace(null);
            }
        } catch (error) {
            console.error("Error deleting yatra place:", error);
            toast({
                title: "Error",
                description: "Failed to delete yatra place",
                variant: "destructive"
            });
        }
    };

    const movePlace = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= places.length) return;

        const currentPlace = places[index];
        const targetPlace = places[targetIndex];

        try {
            // Swap sequences
            await updateDoc(doc(db, "yatraPlaces", currentPlace.id), { sequence: targetPlace.sequence });
            await updateDoc(doc(db, "yatraPlaces", targetPlace.id), { sequence: currentPlace.sequence });
            toast({ title: "Reordered", description: "Sequence updated successfully" });
        } catch (error) {
            console.error("Error reordering:", error);
            toast({ title: "Error", description: "Failed to reorder items" });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-20">
                {/* Content Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <MapPin className="w-8 h-8" />
                            </span>
                            {isEditing ? (selectedPlace ? "Edit Viharan Place" : "New Viharan Place") : "Raj Viharan Management"}
                        </h1>
                        <p className="text-slate-500 font-medium pl-14">
                            {isEditing
                                ? "Configure the details and spiritual journey checkpoints."
                                : "Design and manage the sacred pilgrimage routes and sequences."}
                        </p>
                    </div>
                    {!isEditing && (
                        <div className="flex gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input className="pl-9 w-64 rounded-full border-slate-200 focus:ring-blue-500 shadow-sm" placeholder="Search routes..." />
                            </div>
                            <Button onClick={handleAddNew} className="bg-[#D4AF37] hover:bg-[#B8962D] text-white rounded-full font-bold px-6 shadow-md hover:shadow-lg transition-all duration-300">
                                <Plus className="w-5 h-5 mr-2" /> CREATE NEW ROUTE
                            </Button>
                        </div>
                    )}
                    {isEditing && (
                        <Button variant="outline" onClick={handleCancel} className="md:w-auto font-bold border-slate-200 hover:bg-slate-50 transition-all rounded-full px-6">
                            <X className="w-4 h-4 mr-2" /> EXIT EDITOR
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Editor Card */}
                        <Card className="border-slate-200 lg:sticky lg:top-8 h-fit shadow-md">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold text-slate-900">
                                    {selectedPlace ? "Edit Place Details" : "New Yatra Place"}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Place Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter place name..."
                                            required
                                            className="h-11 shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (History/Significance)</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Describe the historical or spiritual significance..."
                                            rows={4}
                                            className="resize-none shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Route</Label>
                                            <Select
                                                value={formData.route}
                                                onValueChange={v => setFormData({ ...formData, route: v, subRoute: "" })}
                                            >
                                                <SelectTrigger className="h-11 shadow-sm">
                                                    <SelectValue placeholder="Select Route" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROUTES.map(r => (
                                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Sub-Route</Label>
                                            <Select
                                                value={formData.subRoute || "none"}
                                                onValueChange={v => setFormData({ ...formData, subRoute: v === "none" ? "" : v })}
                                                disabled={formData.route !== 'swami-complete'}
                                            >
                                                <SelectTrigger className="h-11 shadow-sm">
                                                    <SelectValue placeholder="Select Sub-Route" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {ROUTES.find(r => r.id === 'swami-complete')?.subRoutes?.map(sr => (
                                                        <SelectItem key={sr.id} value={sr.id}>{sr.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={v => setFormData({ ...formData, status: v as any })}
                                            >
                                                <SelectTrigger className="h-11 shadow-sm">
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="visited">Visited</SelectItem>
                                                    <SelectItem value="stayed">Stayed</SelectItem>
                                                    <SelectItem value="revisited">Re-visited</SelectItem>
                                                    <SelectItem value="current">Current Location</SelectItem>
                                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="time">Time/Day Label</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    id="time"
                                                    className="pl-9 h-11 shadow-sm"
                                                    value={formData.time}
                                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                    placeholder="e.g., Day 1, 10:00 AM"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-4 rounded-2xl border border-amber-100 bg-amber-50/10 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Activity className="w-5 h-5 text-amber-600" />
                                            <Label htmlFor="isLive" className="font-bold text-amber-900 cursor-pointer text-sm">Live Now</Label>
                                            <input
                                                type="checkbox"
                                                id="isLive"
                                                checked={formData.isLive}
                                                onChange={e => setFormData({ ...formData, isLive: e.target.checked })}
                                                className="w-5 h-5 accent-amber-600 cursor-pointer"
                                            />
                                        </div>
                                        <div className="w-full md:flex-1 space-y-2">
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    id="attendees"
                                                    className="pl-9 h-10 text-sm shadow-sm"
                                                    disabled={!formData.isLive}
                                                    value={formData.attendees}
                                                    onChange={e => setFormData({ ...formData, attendees: e.target.value })}
                                                    placeholder="Attendees count..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 rounded-2xl border border-blue-100 bg-blue-50/10 shadow-sm">
                                        <Label className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.pinColor || '#D4AF37' }} />
                                            Map Pin Color
                                        </Label>
                                        <div className="flex flex-wrap gap-3">
                                            {['#D4AF37', '#0038A8', '#E11D48', '#16A34A', '#7C3AED', '#EA580C'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, pinColor: color })}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.pinColor === color ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <Input
                                                type="color"
                                                value={formData.pinColor || '#D4AF37'}
                                                onChange={e => setFormData({ ...formData, pinColor: e.target.value })}
                                                className="w-12 h-8 p-0 border-none bg-transparent cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" /> Location Map (Click to set coordinates)
                                        </Label>
                                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                            <LocationPicker
                                                lat={formData.latitude}
                                                lng={formData.longitude}
                                                onSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latitude</Label>
                                                <Input
                                                    type="number" step="any"
                                                    className="h-9 text-xs shadow-sm"
                                                    value={formData.latitude}
                                                    onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Longitude</Label>
                                                <Input
                                                    type="number" step="any"
                                                    className="h-9 text-xs shadow-sm"
                                                    value={formData.longitude}
                                                    onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-slate-100">
                                        <Button type="submit" className="flex-1 h-12 bg-blue-900 hover:bg-blue-800 shadow-md font-bold text-base">
                                            <Save className="w-5 h-5 mr-2" /> {selectedPlace ? "Update Place" : "Save New Place"}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleCancel} className="h-12 border-slate-200 font-bold px-8">
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Media Card */}
                        <div className="space-y-8">
                            <Card className="border-slate-200 shadow-md overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-900">Place Image</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ImageUpload
                                        folderPath={`yatra/${formData.id || 'new'}`}
                                        onUpload={(url) => setFormData({ ...formData, image: url })}
                                        label="Upload Image"
                                    />
                                    {formData.image && (
                                        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-lg">
                                            <img src={formData.image} alt="Preview" className="w-full h-56 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setFormData({ ...formData, image: "" })}
                                                    className="rounded-full animate-in zoom-in-50"
                                                >
                                                    Remove Image
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-blue-100 bg-blue-50/20 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                        <Compass className="w-4 h-4" /> Tip
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-blue-700 leading-relaxed">
                                    Setting a place as <strong>Current Location</strong> with the <strong>Live Now</strong> toggle enabled will show the pulsing live marker on the Raj Viharan map for all users.
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {loading ? (
                            <div className="flex items-center justify-center p-20">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Route List & Timeline */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            Active Pilgrimage Routes
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full uppercase tracking-widest font-bold">{places.length} Total</span>
                                        </h2>
                                    </div>

                                    {/* Major Route Card (e.g., Mahanubhav Darshan Path) */}
                                    <Card className="rounded-3xl shadow-lg border-2 border-[#D4AF37]/30 overflow-hidden bg-white">
                                        <div className="p-6 border-b border-slate-100 bg-[#0038A8]/5 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#0038A8]">Swami's Complete Journey</h3>
                                                <p className="text-sm text-slate-500 font-medium">Managing Sequence for {places.length} Places</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                                                <ChevronDown className="w-6 h-6" />
                                            </Button>
                                        </div>

                                        <div className="p-8 relative">
                                            {/* Timeline Line */}
                                            <div className="absolute left-[43px] top-10 bottom-10 w-0.5 bg-slate-100 z-0" />

                                            <div className="space-y-6 relative z-10">
                                                {places.map((place, index) => (
                                                    <div key={place.id} className="flex items-start gap-6 group">
                                                        {/* Step Dot & Pin Color */}
                                                        <div
                                                            className="w-8 h-8 rounded-full border-4 border-white shadow-md ring-1 flex-shrink-0 z-10 mt-2 transition-transform group-hover:scale-110"
                                                            style={{
                                                                backgroundColor: (place as any).pinColor || '#D4AF37',
                                                                boxShadow: `0 0 0 1px ${(place as any).pinColor || '#D4AF37'}`
                                                            }}
                                                        />

                                                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 transition-all hover:bg-white hover:shadow-md hover:border-blue-200">
                                                            <div className="flex items-center gap-4">
                                                                <GripVertical className="w-5 h-5 text-slate-300 cursor-move" />
                                                                <div className="w-20 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                                                                    {place.image ? (
                                                                        <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                                                            <MapPin className="w-6 h-6 opacity-30" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-base font-bold text-slate-900">{place.name}</p>
                                                                        {place.isLive && (
                                                                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 uppercase tracking-tighter">
                                                                        <Clock className="w-3 h-3" /> {place.time || "No time set"} • {place.status}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <div className="flex flex-col gap-1">
                                                                    <Button
                                                                        variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                        onClick={() => movePlace(index, 'up')}
                                                                        disabled={index === 0}
                                                                    >
                                                                        <ArrowUp className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                                        onClick={() => movePlace(index, 'down')}
                                                                        disabled={index === places.length - 1}
                                                                    >
                                                                        <ArrowDown className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                <div className="h-10 w-px bg-slate-100 mx-2" />
                                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(place)} className="w-9 h-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                                                    <Edit3 className="w-5 h-5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(place.id)} className="w-9 h-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                                    <Trash className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Placeholder at end */}
                                                <div className="flex items-start gap-6 pt-4 group cursor-pointer" onClick={handleAddNew}>
                                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-slate-300 flex-shrink-0 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors">
                                                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                                    </div>
                                                    <div className="flex-1 bg-white border-2 border-dashed border-slate-200 p-4 rounded-2xl flex items-center gap-3 text-slate-400 font-medium group-hover:border-blue-200 group-hover:text-blue-500 transition-colors">
                                                        <Search className="w-5 h-5" />
                                                        <span>Add new pilgrimage point to the sequence...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                                            <Button className="flex-1 bg-[#0038A8] hover:bg-[#002B82] text-white py-6 rounded-2xl text-base font-bold shadow-lg shadow-blue-900/20 shadow-lg">
                                                SAVE SEQUENCE CHANGES
                                            </Button>
                                            <Button variant="outline" className="px-8 py-6 rounded-2xl border-slate-200 font-bold text-slate-500 bg-white">
                                                CANCEL
                                            </Button>
                                        </div>
                                    </Card>
                                </div>

                                {/* Quick Stats / Secondary Lists */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
                                        <div className="relative z-10 flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-slate-900">Live Status</h4>
                                        </div>
                                        <div className="space-y-4">
                                            {places.filter(p => p.isLive).length > 0 ? (
                                                places.filter(p => p.isLive).map(p => (
                                                    <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                                                        <span className="text-sm font-bold text-red-700">{p.name}</span>
                                                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">No locations are currently live.</p>
                                            )}
                                        </div>
                                    </div>

                                    <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden h-[300px] flex flex-col items-center justify-center p-8 bg-slate-50/50">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4">
                                            <Compass className="w-8 h-8 text-blue-300" />
                                        </div>
                                        <h4 className="font-bold text-slate-400 text-center px-4">Secondary Routes Management coming soon</h4>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
