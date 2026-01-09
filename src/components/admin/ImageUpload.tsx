import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2, CheckCircle, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    folderPath: string;
    label?: string;
    className?: string;
}

export function ImageUpload({ onUpload, folderPath, label = "Upload Image", className }: ImageUploadProps) {
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const { toast } = useToast();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Start upload
        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Use the "unsigned" upload preset if available, or signed upload via backend.
            // Since we don't have a backend, we'll use the unsigned upload preset 'unsigned_preset' 
            // OR we can try to use the signed upload with the signature generation we have in `cloudinary.ts`
            // BUT `cloudinary.ts` is for *fetching* images (Admin/Search API). Uploading is different.

            // The user wants to upload to Cloudinary.
            // Let's assume there is an unsigned upload preset named 'ml_default' (common default) or we need to ask the user.
            // However, the user provided API Key/Secret, so we can do a signed upload!

            // We need to generate a signature for upload.
            // Let's import the signature generation logic or move it to a shared utility.
            // For now, let's duplicate the logic here or create a new helper in `cloudinary.ts` for uploading.

            // Actually, let's use the `uploadToCloudinary` function we will create in `src/lib/cloudinary.ts`.

            const url = await uploadToCloudinary(file, folderPath);

            onUpload(url);
            setUploading(false);
            toast({
                title: "Success",
                description: "Image uploaded successfully",
            });

        } catch (error: any) {
            console.error("Error uploading:", error);
            setUploading(false);
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload image",
                variant: "destructive",
            });
        }
    };

    const handleUrlSubmit = () => {
        if (!urlInput.trim()) return;
        onUpload(urlInput);
        setPreview(urlInput);
        toast({ title: "Success", description: "Image URL added" });
    };

    const clearImage = () => {
        setPreview(null);
        setProgress(0);
        setUrlInput("");
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                        <Upload className="w-4 h-4 mr-2" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="url">
                        <LinkIcon className="w-4 h-4 mr-2" /> URL
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-full">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                                id={`image-upload-${label.replace(/\s+/g, "-")}`}
                            />
                            <label
                                htmlFor={`image-upload-${label.replace(/\s+/g, "-")}`}
                                className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/50 hover:bg-muted rounded-lg cursor-pointer transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <ImageIcon className="w-8 h-8" />
                                    <span className="text-sm font-medium">{uploading ? "Uploading..." : "Click to select image"}</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {uploading && (
                        <div className="space-y-1">
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Paste image URL here..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                        />
                        <Button onClick={handleUrlSubmit} type="button" size="sm">
                            Add
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Paste a direct link to an image (e.g., from Google Drive, Unsplash, or another website).
                    </p>
                </TabsContent>
            </Tabs>

            {preview && !uploading && (
                <div className="relative inline-block mt-2">
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-24 w-24 object-cover rounded-md border"
                    />
                    <button
                        onClick={clearImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90"
                        type="button"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-green-500 text-white rounded-full p-0.5">
                        <CheckCircle className="w-3 h-3" />
                    </div>
                </div>
            )}
        </div>
    );
}
