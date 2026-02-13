import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Compass, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSthanTypes } from "@/utils/sthanTypes";
import { SthanType } from "@/types/sthanType";

interface TempleFormProps {
    templeId?: string;
}

export default function TempleForm({ templeId }: TempleFormProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!templeId);

    // Form State
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [taluka, setTaluka] = useState("");
    const [district, setDistrict] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // New Fields
    const [descriptionTitle, setDescriptionTitle] = useState("Sthan At Glance");
    const [descriptionText, setDescriptionText] = useState("");

    const [sthanaInfoTitle, setSthanaInfoTitle] = useState("Sthan Description");
    const [sthanaInfoText, setSthanaInfoText] = useState("");

    const [directionsTitle, setDirectionsTitle] = useState("Way to reach");
    const [directionsText, setDirectionsText] = useState("");

    const [leela, setLeela] = useState(""); // Keeping for legacy/compatibility
    const [images, setImages] = useState<string[]>([]);
    const [hasArchitecture, setHasArchitecture] = useState(false);
    const [sthanTypes, setSthanTypes] = useState<SthanType[]>([]);
    const [sthan, setSthan] = useState("");

    useEffect(() => {
        if (!templeId) return;

        const fetchTemple = async () => {
            try {
                setFetching(true);
                const res = await fetch(`/api/admin/data?collection=temples&id=${templeId}`);
                const contentType = res.headers.get("content-type");

                if (res.ok && contentType?.includes("application/json")) {
                    const data = await res.json();
                    setName(data.name || "");
                    setAddress(data.address || "");
                    setCity(data.city || "");
                    setTaluka(data.taluka || "");
                    setDistrict(data.district || "");
                    setLatitude(String(data.latitude ?? data.location?.lat ?? ""));
                    setLongitude(String(data.longitude ?? data.location?.lng ?? ""));

                    setDescriptionTitle(data.description_title || "Sthan At Glance");
                    setDescriptionText(data.description_text || data.description || "");

                    setSthanaInfoTitle(data.sthana_info_title || "Sthan Description");
                    setSthanaInfoText(data.sthana_info_text || data.sthana || "");

                    setDirectionsTitle(data.directions_title || "Way to reach");
                    setDirectionsText(data.directions_text || "");

                    setLeela(data.leela || "");
                    setImages(data.images || []);
                    setHasArchitecture(!!data.architectureImage || (data.hotspots && data.hotspots.length > 0));
                    setSthan(data.sthan || "");
                } else {
                    console.warn("Temple API not active locally. Using Client SDK.");
                    const docRef = doc(db, "temples", templeId);
                    const snap = await getDoc(docRef);

                    if (snap.exists()) {
                        const data = snap.data();
                        setName(data.name || "");
                        setAddress(data.address || "");
                        setCity(data.city || "");
                        setTaluka(data.taluka || "");
                        setDistrict(data.district || "");
                        setLatitude(String(data.latitude ?? data.location?.lat ?? ""));
                        setLongitude(String(data.longitude ?? data.location?.lng ?? ""));

                        setDescriptionTitle(data.description_title || "Sthan At Glance");
                        setDescriptionText(data.description_text || data.description || "");

                        setSthanaInfoTitle(data.sthana_info_title || "Sthan Description");
                        setSthanaInfoText(data.sthana_info_text || data.sthana || "");

                        setDirectionsTitle(data.directions_title || "Way to reach");
                        setDirectionsText(data.directions_text || "");

                        setLeela(data.leela || "");
                        setImages(data.images || []);
                        setHasArchitecture(!!data.architectureImage || (data.hotspots && data.hotspots.length > 0));
                        setSthan(data.sthan || "");
                    } else {
                        toast({ title: "Error", description: "Temple not found", variant: "destructive" });
                        navigate("/admin/dashboard");
                    }
                }
            } catch (error) {
                console.error("Error fetching temple:", error);
                toast({ title: "Error", description: "Failed to load temple data", variant: "destructive" });
            } finally {
                setFetching(false);
            }
        };

        fetchTemple();
    }, [templeId, navigate, toast]);

    useEffect(() => {
        const loadSthanTypes = async () => {
            const types = await getSthanTypes();
            setSthanTypes(types);
        };
        loadSthanTypes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        try {
            const latNum = parseFloat(latitude);
            const lngNum = parseFloat(longitude);

            if (isNaN(latNum) || isNaN(lngNum) || (latNum === 0 && lngNum === 0)) {
                toast({ title: "Invalid Coordinates", description: "Please enter valid Latitude and Longitude values.", variant: "destructive" });
                setLoading(false);
                return;
            }

            const templeData = {
                name,
                address,
                city,
                taluka,
                district,
                description_title: descriptionTitle,
                description_text: descriptionText,
                description: descriptionText,
                sthana_info_title: sthanaInfoTitle,
                sthana_info_text: sthanaInfoText,
                sthana: sthanaInfoText,
                directions_title: directionsTitle,
                directions_text: directionsText,
                leela,
                images,
                latitude: latNum,
                longitude: lngNum,
                location: { lat: latNum, lng: lngNum },
                sthan,
                updatedAt: new Date().toISOString(),
                updatedBy: user.uid,
            };

            const method = templeId ? 'PUT' : 'POST';
            const url = templeId ? `/api/admin/data?collection=temples&id=${templeId}` : `/api/admin/data?collection=temples`;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templeId ? templeData : { ...templeData, createdAt: new Date().toISOString(), createdBy: user.uid })
            });

            if (res.ok) {
                const responseData = await res.json();
                toast({ title: "Success", description: templeId ? "Temple updated successfully" : "Temple created successfully" });
                const finalId = templeId || responseData.id;
                if (hasArchitecture) {
                    navigate(`/admin/architecture/${finalId}`);
                } else {
                    navigate("/admin/dashboard");
                }
            } else {
                console.warn("API write failed, using fallback.");
                if (templeId) {
                    await updateDoc(doc(db, "temples", templeId), { ...templeData, updatedAt: Timestamp.now() });
                } else {
                    const newDoc = await addDoc(collection(db, "temples"), { ...templeData, createdAt: Timestamp.now(), createdBy: user.uid });
                    if (hasArchitecture) {
                        navigate(`/admin/architecture/${newDoc.id}`);
                        return;
                    }
                }
                toast({ title: "Success (Fallback)", description: "Saved via Client SDK" });
                navigate("/admin/dashboard");
            }
        } catch (error: any) {
            console.error("Error saving temple:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save temple data. Please check permissions.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (url: string) => {
        setImages((prev) => [...prev, url]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    if (fetching) {
        return <div className="p-8 text-center">Loading temple data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">{templeId ? "Edit Temple" : "Add New Temple"}</h1>
                </div>
                {templeId && (
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/architecture/${templeId}`)}
                        className="gap-2"
                    >
                        <Compass className="w-4 h-4" />
                        Manage Architecture
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Temple Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    placeholder="e.g. Brihadeeswarar Temple"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City/Town *</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    placeholder="e.g. Thanjavur"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taluka">Taluka</Label>
                                <Input
                                    id="taluka"
                                    value={taluka}
                                    onChange={(e) => setTaluka(e.target.value)}
                                    placeholder="e.g. Thanjavur"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Full address of the temple"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">District</Label>
                                <Input
                                    id="district"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    placeholder="e.g. Thanjavur"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sthan">Sthan Type *</Label>
                                <Select value={sthan} onValueChange={setSthan} required>
                                    <SelectTrigger id="sthan">
                                        <SelectValue placeholder="Select Sthan Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sthanTypes.map(st => (
                                            <SelectItem key={st.id} value={st.name}>{st.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 1. General Description Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sthan At Glance Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="descTitle">Section Title</Label>
                            <Input
                                id="descTitle"
                                value={descriptionTitle}
                                onChange={(e) => setDescriptionTitle(e.target.value)}
                                placeholder="e.g. Sthan At Glance"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Content</Label>
                            <Textarea
                                id="description"
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                                rows={4}
                                placeholder="General description of the temple..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Sthana Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sthan Description Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sthanaTitle">Section Title</Label>
                            <Input
                                id="sthanaTitle"
                                value={sthanaInfoTitle}
                                onChange={(e) => setSthanaInfoTitle(e.target.value)}
                                placeholder="e.g. Sthan Description"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sthanaInfo">Content</Label>
                            <Textarea
                                id="sthanaInfo"
                                value={sthanaInfoText}
                                onChange={(e) => setSthanaInfoText(e.target.value)}
                                rows={4}
                                placeholder="Details about the Sthana..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Directions Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Directions Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="dirTitle">Section Title</Label>
                            <Input
                                id="dirTitle"
                                value={directionsTitle}
                                onChange={(e) => setDirectionsTitle(e.target.value)}
                                placeholder="e.g. Way to reach"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dirText">Content</Label>
                            <Textarea
                                id="dirText"
                                value={directionsText}
                                onChange={(e) => setDirectionsText(e.target.value)}
                                rows={4}
                                placeholder="Instructions on how to reach..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Location Coordinates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude *</Label>
                                <Input
                                    id="latitude"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    required
                                    placeholder="e.g. 10.7828"
                                    type="number"
                                    step="any"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude *</Label>
                                <Input
                                    id="longitude"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    required
                                    placeholder="e.g. 79.1318"
                                    type="number"
                                    step="any"
                                />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You can get coordinates from Google Maps (Right click &gt; First option).
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square">
                                    <img
                                        src={url}
                                        alt={`Temple ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
                                <div className="text-center p-4">
                                    <ImageUpload
                                        folderPath={`temples/${templeId || 'new'}`}
                                        onUpload={handleImageUpload}
                                        label="Add Image"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Architecture & Sub-temples</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="architecture"
                                checked={hasArchitecture}
                                onCheckedChange={setHasArchitecture}
                            />
                            <Label htmlFor="architecture">Enable Architecture / Sub-temple View</Label>
                        </div>

                        {hasArchitecture && (
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Architecture view allows you to upload a floor plan or main image and mark interactive hotspots (sub-temples, shrines, etc.).
                                </p>
                                {templeId ? (
                                    <Button
                                        type="button"
                                        onClick={() => navigate(`/admin/architecture/${templeId}`)}
                                        className="w-full sm:w-auto"
                                    >
                                        <Compass className="w-4 h-4 mr-2" />
                                        Configure Architecture & Hotspots
                                    </Button>
                                ) : (
                                    <p className="text-sm text-yellow-600">
                                        Save the temple first to configure architecture details.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/admin/dashboard")}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="min-w-[120px]">
                        {loading ? "Saving..." : (
                            <span className="flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Save Temple
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
