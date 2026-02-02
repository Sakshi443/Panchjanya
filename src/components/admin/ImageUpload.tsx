import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2, CheckCircle, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
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
        <div className={`p-4 bg-white ${className}`}>
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-100 rounded-xl h-11">
                    <TabsTrigger
                        value="upload"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="font-medium">Upload</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="url"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                    >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        <span className="font-medium">URL</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                    <div className="relative">
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
                            className={`flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-all ${uploading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <span className="text-sm font-semibold tracking-wide">
                                    {uploading ? "Uploading..." : "Click to select image"}
                                </span>
                            </div>
                        </label>
                    </div>

                    {uploading && (
                        <div className="mt-4 space-y-2">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">
                                {Math.round(progress)}% Complete
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="url" className="mt-4 space-y-3">
                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Paste Image Address</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://example.com/image.jpg"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="bg-slate-50 border-slate-200"
                            />
                            <Button onClick={handleUrlSubmit} type="button" size="sm" className="shrink-0">
                                Add
                            </Button>
                        </div>
                    </div>
                    <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                        <p className="text-[10px] text-blue-600/70 leading-relaxed italic">
                            Tip: Use direct links from Google Drive, Unsplash, or Pexels for better results.
                        </p>
                    </div>
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
