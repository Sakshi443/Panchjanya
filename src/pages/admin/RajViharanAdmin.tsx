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
    Activity
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
    const [formData, setFormData] = useState<Partial<YatraPlace>>({
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
        image: ""
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
                {/* Responsive Context-Aware Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 leading-tight">
                            {isEditing ? (selectedPlace ? "Edit Yatra Place" : "New Yatra Place") : "Raj Viharan Management"}
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1 leading-relaxed max-w-2xl">
                            {isEditing
                                ? "Configure the historical and spiritual details of this location on Swami's journey."
                                : "Manage places, routes, and live status for Swami's Yatra"
                            }
                        </p>
                    </div>
                    {isEditing && (
                        <Button variant="outline" onClick={handleCancel} className="w-full md:w-auto mt-2 md:mt-0 font-bold border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                            <X className="w-4 h-4 mr-2 text-red-500" /> Exit Editor
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
                    /* Places List View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />
                            ))
                        ) : (
                            <>
                                {/* Add New Place Card */}
                                <Card
                                    onClick={handleAddNew}
                                    className="group flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer h-[360px] shadow-sm hover:shadow-xl">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm group-hover:bg-blue-100">
                                        <Plus className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mt-6">Add New Place</h3>
                                    <p className="text-sm text-slate-500 text-center mt-3 px-6 leading-relaxed">Start by adding the next location of Swami's spiritual journey to the database.</p>
                                </Card>

                                {places.map((place, index) => (
                                    <Card key={place.id} className="group overflow-hidden rounded-3xl border-slate-200 hover:shadow-2xl transition-all duration-500 shadow-md h-[360px] flex flex-col">
                                        <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                                            {place.image ? (
                                                <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <MapPin className="w-16 h-16 opacity-10" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/20 backdrop-blur-md ${place.status === 'current' ? 'bg-amber-500 text-white shadow-lg' : 'bg-black/50 text-white'
                                                    }`}>
                                                    {place.status}
                                                </span>
                                            </div>
                                            {place.isLive && (
                                                <div className="absolute top-4 right-4 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                            <div className="absolute bottom-4 left-4 text-white pr-4">
                                                <p className="text-[10px] font-black uppercase opacity-70 tracking-tighter">{place.time}</p>
                                                <h3 className="font-heading font-extrabold text-xl leading-tight group-hover:text-blue-300 transition-colors">{place.name}</h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-5 bg-white relative flex-1 flex flex-col justify-between">
                                            <div className="absolute -top-7 right-5 flex flex-col gap-2.5">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="w-10 h-10 rounded-2xl shadow-xl bg-white hover:bg-blue-50 text-slate-700 border border-slate-100 hover:text-blue-600 transition-all hover:-translate-y-1"
                                                    onClick={() => handleEdit(place)}
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="w-10 h-10 rounded-2xl shadow-xl bg-white hover:text-red-500 border border-slate-100 hover:bg-red-50 transition-all hover:-translate-y-1"
                                                    onClick={() => handleDelete(place.id)}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                                                    {place.description || "No historical description provided for this specific location."}
                                                </p>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-lg"
                                                            onClick={() => movePlace(index, 'up')}
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </Button>
                                                        <div className="flex flex-col items-center min-w-[24px]">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Seq</span>
                                                            <span className="text-sm font-black text-slate-900">{index + 1}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-lg"
                                                            onClick={() => movePlace(index, 'down')}
                                                            disabled={index === places.length - 1}
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 truncate max-w-[140px] border-l border-slate-100 pl-4">
                                                        {ROUTES.find(r => r.id === place.route)?.name || "Unknown Route"}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
