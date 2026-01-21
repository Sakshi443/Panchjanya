import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Music, Video, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock Data for Audio
const audioData = [
    {
        id: "1",
        title: "Vishnu Sahasranamam",
        subtitle: "ANCIENT VEDIC",
        duration: "12:45",
        imageUrl: "https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=200", // Abstract Sound Wave or Placeholder
        isPlaying: false,
    },
    {
        id: "2",
        title: "Shiva Tandava Stotram",
        subtitle: "Rhythmic Devotion",
        duration: "08:20",
        imageUrl: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=200",
        isPlaying: false,
    },
    {
        id: "3",
        title: "Lalitha Sahasranamam",
        subtitle: "Divine Mother",
        duration: "24:12",
        imageUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384ebd?w=200",
        isPlaying: false,
    }
];

// Mock Data for Video
const videoData = [
    {
        id: "Bn7RDxdrSiA",
        title: "Bhagavad Geeta recitation Chapter-1",
        series: "By Astha Chhattani",
        duration: "05:32",
        thumbnailUrl: "https://img.youtube.com/vi/Bn7RDxdrSiA/maxresdefault.jpg",
        views: "1.2K"
    },
    {
        id: "dC0UvoytJ9A",
        title: "प्रसादसेवा - prasadseva",
        series: "Lyric Video",
        duration: "04:15",
        thumbnailUrl: "https://img.youtube.com/vi/dC0UvoytJ9A/maxresdefault.jpg",
        views: "850"
    },
    {
        id: "KHOfZ69p7mc",
        title: "शरण आलो मी स्वामी तुम्हाला",
        series: "श्री चक्रधर स्वामी भजन",
        duration: "06:20",
        thumbnailUrl: "https://img.youtube.com/vi/KHOfZ69p7mc/maxresdefault.jpg",
        views: "2.1K"
    },
    {
        id: "vs1GKt0uk-s",
        title: "हे स्वामी श्री चक्रधरा तव चरणी शरण आलो",
        series: "श्री चक्रधर स्वामी भजन",
        duration: "05:45",
        thumbnailUrl: "https://img.youtube.com/vi/vs1GKt0uk-s/maxresdefault.jpg",
        views: "1.5K"
    }
];

export default function Literature() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-[#F9F6F0] pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6 text-blue-900" />
                    </Button>
                    <h1 className="font-heading font-bold text-2xl text-blue-900">
                        Literature
                    </h1>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Search className="w-6 h-6 text-blue-900" />
                    </Button>
                </div>

                {/* Toggle Switch */}
                <div className="flex p-1 bg-gray-100 rounded-full mb-4">
                    <button
                        className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "audio"
                            ? "bg-blue-900 text-white shadow-md"
                            : "text-gray-500 hover:text-blue-900"
                            }`}
                        onClick={() => setActiveTab("audio")}
                    >
                        Audio
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${activeTab === "video"
                            ? "bg-blue-900 text-white shadow-md"
                            : "text-gray-500 hover:text-blue-900"
                            }`}
                        onClick={() => setActiveTab("video")}
                    >
                        Video
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
                {activeTab === "audio" ? (
                    <div>
                        <h2 className="font-heading font-bold text-2xl text-blue-900 mb-6">
                            Sacred Chants
                        </h2>

                        {/* Featured Audio Card - Example: Vishnu Sahasranamam */}
                        <div
                            onClick={() => navigate("/audio/1")}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex items-center gap-4 mb-6 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                        >
                            <div className="w-0.5 h-10 absolute left-0 top-1/2 -translate-y-1/2 bg-amber-500 rounded-r" />
                            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">॥</span> {/* Placeholder Icon */}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-blue-900 text-lg leading-tight mb-1">
                                    Vishnu Sahasranamam
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                                    <span>12:45</span>
                                    <span>•</span>
                                    <span>Ancient Vedic</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-amber-200 flex items-center justify-center text-amber-600">
                                <Pause className="w-4 h-4 fill-current" />
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-4">
                            {audioData.slice(1).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/audio/${item.id}`)}
                                    className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400">
                                        <Music className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-base mb-1">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{item.duration}</span>
                                            <span>•</span>
                                            <span>{item.subtitle}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-md">
                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-heading font-bold text-2xl text-blue-900">
                                Dharma Pravachan
                            </h2>
                            <button className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                View All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {videoData.map((video) => (
                                <div
                                    key={video.id}
                                    onClick={() => navigate(`/video/${video.id}`)}
                                    className="group cursor-pointer"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-lg transition-all">
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                                <Play className="w-4 h-4 text-blue-900 fill-current ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                            {video.duration}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 className="font-bold text-blue-900 text-base leading-tight mb-1 group-hover:text-blue-700">
                                            {video.title}
                                        </h3>
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                                            {video.series}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

