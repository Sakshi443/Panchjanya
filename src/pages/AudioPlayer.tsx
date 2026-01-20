import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronDown,
    Share2,
    Shuffle,
    SkipBack,
    Play,
    Pause,
    SkipForward,
    Repeat,
    BookOpen,
    Heart,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AudioContent {
    id: string;
    title: string;
    category: string;
    duration: string;
    audioUrl: string;
    imageUrl: string;
    lyrics?: string[];
    location?: string;
}

export default function AudioPlayer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [audio, setAudio] = useState<AudioContent | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (!id) return;

        const fetchAudio = async () => {
            try {
                const audioDoc = await getDoc(doc(db, "audioContent", id));
                if (audioDoc.exists()) {
                    setAudio({ id: audioDoc.id, ...audioDoc.data() } as AudioContent);
                }
            } catch (error) {
                console.error("Error fetching audio:", error);
            }
        };

        fetchAudio();
    }, [id]);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        const updateTime = () => setCurrentTime(audioElement.currentTime);
        const updateDuration = () => setDuration(audioElement.duration);

        audioElement.addEventListener("timeupdate", updateTime);
        audioElement.addEventListener("loadedmetadata", updateDuration);

        return () => {
            audioElement.removeEventListener("timeupdate", updateTime);
            audioElement.removeEventListener("loadedmetadata", updateDuration);
        };
    }, [audio]);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    if (!audio) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F9F6F0] to-white flex flex-col">
            {/* Audio Element */}
            <audio ref={audioRef} src={audio.audioUrl} />

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                >
                    <ChevronDown className="w-6 h-6 text-blue-900" />
                </Button>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                    Panchajanya Heritage
                </p>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 className="w-5 h-5 text-blue-900" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                {/* Circular Image */}
                <div className="relative mb-8">
                    <div className="w-72 h-72 rounded-full overflow-hidden shadow-2xl border-8 border-blue-900 bg-white">
                        <img
                            src={audio.imageUrl}
                            alt={audio.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3C/svg%3E";
                            }}
                        />
                    </div>
                </div>

                {/* Title and Location */}
                <h1 className="font-heading font-bold text-2xl text-center text-amber-600 mb-2">
                    {audio.title}
                </h1>
                {audio.location && (
                    <div className="flex items-center gap-1 text-blue-900 mb-6">
                        <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {audio.location}
                        </span>
                    </div>
                )}

                {/* Lyrics/Verses */}
                {audio.lyrics && audio.lyrics.length > 0 && (
                    <div className="w-full max-w-md bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-6 max-h-48 overflow-y-auto">
                        <div className="text-center space-y-2">
                            {audio.lyrics.map((line, index) => (
                                <p
                                    key={index}
                                    className="text-blue-900 text-sm leading-relaxed font-serif"
                                >
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="w-full max-w-md mb-2">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-amber-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600"
                    />
                </div>

                {/* Time Display */}
                <div className="w-full max-w-md flex justify-between text-xs text-blue-900 font-bold mb-8">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-6 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsShuffled(!isShuffled)}
                        className={`rounded-full ${isShuffled ? "text-amber-600" : "text-blue-400"
                            }`}
                    >
                        <Shuffle className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-blue-900"
                    >
                        <SkipBack className="w-6 h-6" />
                    </Button>

                    <Button
                        size="icon"
                        onClick={togglePlayPause}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 shadow-xl"
                    >
                        {isPlaying ? (
                            <Pause className="w-7 h-7 text-white fill-white" />
                        ) : (
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-blue-900"
                    >
                        <SkipForward className="w-6 h-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            setRepeatMode(
                                repeatMode === "off"
                                    ? "one"
                                    : repeatMode === "one"
                                        ? "all"
                                        : "off"
                            )
                        }
                        className={`rounded-full ${repeatMode !== "off" ? "text-amber-600" : "text-blue-400"
                            }`}
                    >
                        <Repeat className="w-5 h-5" />
                    </Button>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center gap-8">
                    <button className="flex flex-col items-center gap-1 text-blue-900 hover:text-amber-600 transition-colors">
                        <BookOpen className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Library
                        </span>
                    </button>

                    <button className="flex flex-col items-center gap-1 text-blue-900 hover:text-amber-600 transition-colors">
                        <Heart className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Devotion
                        </span>
                    </button>

                    <button className="flex flex-col items-center gap-1 text-blue-900 hover:text-amber-600 transition-colors">
                        <FileText className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Verses
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
