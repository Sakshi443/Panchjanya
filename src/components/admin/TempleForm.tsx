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
    const [descriptionTitle, setDescriptionTitle] = useState("Description");
    const [descriptionText, setDescriptionText] = useState("");

    const [sthanaInfoTitle, setSthanaInfoTitle] = useState("स्थानांची माहिती");
    const [sthanaInfoText, setSthanaInfoText] = useState("");

    const [directionsTitle, setDirectionsTitle] = useState("जाण्याचा मार्ग");
    const [directionsText, setDirectionsText] = useState("");

    const [leela, setLeela] = useState(""); // Keeping for legacy/compatibility
    const [images, setImages] = useState<string[]>([]);
    const [hasArchitecture, setHasArchitecture] = useState(false);

    useEffect(() => {
        if (!templeId) return;

        const fetchTemple = async () => {
            try {
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

                    // Populate new fields with fallbacks to old fields if they exist
                    setDescriptionTitle(data.description_title || "Description");
                    setDescriptionText(data.description_text || data.description || "");

                    setSthanaInfoTitle(data.sthana_info_title || "स्थानांची माहिती");
                    setSthanaInfoText(data.sthana_info_text || data.sthana || "");

                    setDirectionsTitle(data.directions_title || "जाण्याचा मार्ग");
                    setDirectionsText(data.directions_text || "");

                    setLeela(data.leela || "");
                    setImages(data.images || []);
                    setHasArchitecture(!!data.architectureImage || (data.hotspots && data.hotspots.length > 0));
                } else {
                    toast({
                        title: "Error",
                        description: "Temple not found",
                        variant: "destructive",
                    });
                    navigate("/admin/dashboard");
                }
            } catch (error) {
                console.error("Error fetching temple:", error);
                toast({
                    title: "Error",
                    description: "Failed to load temple data",
                    variant: "destructive",
                });
            } finally {
                setFetching(false);
            }
        };

        fetchTemple();
    }, [templeId, navigate, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        try {
            const latNum = parseFloat(latitude);
            const lngNum = parseFloat(longitude);

            if (isNaN(latNum) || isNaN(lngNum) || (latNum === 0 && lngNum === 0)) {
                toast({
                    title: "Invalid Coordinates",
                    description: "Please enter valid Latitude and Longitude values.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
                toast({
                    title: "Invalid Coordinates",
                    description: "Latitude must be between -90 and 90. Longitude between -180 and 180.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const templeData = {
                name,
                address,
                city,
                taluka,
                district,

                // New Fields
                description_title: descriptionTitle,
                description_text: descriptionText,
                description: descriptionText, // Backward comp.

                sthana_info_title: sthanaInfoTitle,
                sthana_info_text: sthanaInfoText,
                sthana: sthanaInfoText, // Backward comp.

                directions_title: directionsTitle,
                directions_text: directionsText,

                leela,
                images,
                latitude: latNum,
                longitude: lngNum,
                location: { lat: latNum, lng: lngNum },
                updatedAt: Timestamp.now(),
                updatedBy: user.uid,
            };

            if (templeId) {
                await updateDoc(doc(db, "temples", templeId), templeData);
                toast({ title: "Success", description: "Temple updated successfully" });
            } else {
                const newDoc = await addDoc(collection(db, "temples"), {
                    ...templeData,
                    createdAt: Timestamp.now(),
                    createdBy: user.uid,
                });
                toast({ title: "Success", description: "Temple created successfully" });
                if (hasArchitecture) {
                    navigate(`/admin/architecture/${newDoc.id}`);
                    return;
                }
                navigate("/admin/dashboard");
            }
        } catch (error: any) {
            console.error("Error saving temple:", error);

            let errorMessage = error.message;
            if (error.code === 'permission-denied') {
                errorMessage = "Permission denied! You must update your Firestore Database Rules in the Firebase Console to allow writes.";
            }

            toast({
                title: "Error",
                description: errorMessage,
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
                        </div>
                    </CardContent>
                </Card>

                {/* 1. General Description Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Description Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="descTitle">Section Title</Label>
                            <Input
                                id="descTitle"
                                value={descriptionTitle}
                                onChange={(e) => setDescriptionTitle(e.target.value)}
                                placeholder="e.g. Description"
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
                        <CardTitle>Sthana Info Section</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sthanaTitle">Section Title</Label>
                            <Input
                                id="sthanaTitle"
                                value={sthanaInfoTitle}
                                onChange={(e) => setSthanaInfoTitle(e.target.value)}
                                placeholder="e.g. स्थानांची माहिती"
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
                                placeholder="e.g. जाण्याचा मार्ग"
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
