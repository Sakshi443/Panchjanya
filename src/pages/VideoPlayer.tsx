import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Bookmark, Share2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

interface VideoContent {
    id: string;
    title: string;
    category: string;
    duration: string;
    views: number;
    videoUrl: string;
    thumbnailUrl: string;
    contextNotes?: {
        historicalContext?: string;
        scripturalInsights?: Array<{
            title: string;
            content: string;
        }>;
        geographicSignificance?: string;
    };
    relatedMedia?: string[];
}

export default function VideoPlayer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [video, setVideo] = useState<VideoContent | null>(null);
    const [activeTab, setActiveTab] = useState<"context" | "related">("context");

    useEffect(() => {
        if (!id) return;

        const fetchVideo = async () => {
            try {
                const videoDoc = await getDoc(doc(db, "videoContent", id));
                if (videoDoc.exists()) {
                    setVideo({ id: videoDoc.id, ...videoDoc.data() } as VideoContent);
                }
            } catch (error) {
                console.error("Error fetching video:", error);
            }
        };

        fetchVideo();
    }, [id]);

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F6F0]">
            {/* Video Player */}
            <div className="relative aspect-video bg-black">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Button
                        size="icon"
                        className="w-20 h-20 rounded-full bg-white/90 hover:bg-white shadow-2xl"
                    >
                        <Play className="w-10 h-10 text-blue-900 fill-blue-900 ml-2" />
                    </Button>
                </div>

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full text-white hover:bg-white/20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-white hover:bg-white/20"
                        >
                            <Bookmark className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-white hover:bg-white/20"
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 left-4 bg-black/80 text-white text-sm font-bold px-3 py-1.5 rounded">
                    {video.duration}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm font-bold px-3 py-1.5 rounded">
                    35:00
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-t-3xl -mt-6 relative z-10 pt-6 px-6 pb-8">
                {/* Title and Info */}
                <h1 className="font-heading font-bold text-xl text-blue-900 mb-2">
                    {video.title}
                </h1>
                <div className="flex items-center gap-3 text-sm mb-6">
                    <span className="text-amber-600 font-bold uppercase tracking-wider">
                        {video.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                        {video.views >= 1000000
                            ? `${(video.views / 1000000).toFixed(1)}M`
                            : `${Math.floor(video.views / 1000)}K`}{" "}
                        Views
                    </span>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab("context")}
                        className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === "context"
                            ? "text-blue-900"
                            : "text-gray-400 hover:text-blue-900"
                            }`}
                    >
                        Context Notes
                        {activeTab === "context" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("related")}
                        className={`pb-3 px-1 font-bold text-sm uppercase tracking-wider transition-colors relative ${activeTab === "related"
                            ? "text-blue-900"
                            : "text-gray-400 hover:text-blue-900"
                            }`}
                    >
                        Related Media
                        {activeTab === "related" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900" />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === "context" ? (
                    <div className="space-y-6">
                        {/* Historical Context */}
                        {video.contextNotes?.historicalContext && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg
                                        className="w-5 h-5 text-amber-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                    </svg>
                                    <h3 className="font-bold text-blue-900">Historical Context</h3>
                                </div>
                                <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 rounded-r-lg mb-3">
                                    <p className="text-sm text-gray-700 italic leading-relaxed">
                                        "The soul is eternal, immutable, and the path to liberation
                                        lies in the realization of the Divine presence in all living
                                        beings."
                                    </p>
                                </blockquote>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {video.contextNotes.historicalContext}
                                </p>
                            </div>
                        )}

                        {/* Scriptural Insights */}
                        {video.contextNotes?.scripturalInsights &&
                            video.contextNotes.scripturalInsights.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg
                                            className="w-5 h-5 text-amber-600"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <h3 className="font-bold text-blue-900">
                                            Scriptural Insights
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        {video.contextNotes.scripturalInsights.map(
                                            (insight, index) => (
                                                <div key={index} className="bg-blue-50 rounded-lg p-4">
                                                    <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wider mb-2">
                                                        {insight.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {insight.content}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Geographic Significance */}
                        {video.contextNotes?.geographicSignificance && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg
                                        className="w-5 h-5 text-amber-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <h3 className="font-bold text-blue-900">
                                        Geographic Significance
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {video.contextNotes.geographicSignificance}
                                </p>
                            </div>
                        )}

                        {/* Next Discourse Button */}
                        <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white h-12 rounded-xl font-bold uppercase tracking-wider mt-6">
                            Next Discourse
                            <svg
                                className="w-5 h-5 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Button>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Related media coming soon
                    </div>
                )}
            </div>
        </div>
    );
}
