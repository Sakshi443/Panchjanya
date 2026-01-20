import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Compass, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HotspotDetailProps {
    hotspot: {
        id: string;
        number?: number;
        title: string;
        description: string;
        images?: string[];
        significance?: string;
        historicalContext?: string;
    };
    onClose: () => void;
}

export default function HotspotDetail({ hotspot, onClose }: HotspotDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = hotspot.images || ["https://placehold.co/600x400/png?text=Architecture+Detail"]; // Fallback

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F9F6F0] animate-in fade-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="bg-[#0B1B38] text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-500 text-amber-500 font-bold flex items-center justify-center text-lg">
                        {hotspot.number || "01"}
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-300">HOTSPOT DETAIL</div>
                        <div className="font-heading font-medium text-lg leading-none">वास्तुशिल्प माहिती</div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-full"
                    onClick={onClose}
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full p-6 pb-20">

                    {/* Image Carousel */}
                    <div className="relative aspect-video w-full max-w-2xl mx-auto mb-8 rounded-full overflow-hidden shadow-2xl border-4 border-white/50 bg-gray-200 group">
                        {/* Circle mask wrapper - simulates the circular frame in design if needed, but standard rect is often better for details. 
                            The design shows a circular/rounded rect frame. Let's stick to a nice rounded rect or custom shape. 
                            Actually, the design shows a circular crop within a rect card or just a circle. Let's try to match the "Lens" look.
                         */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <img
                                src={images[currentImageIndex]}
                                alt={hotspot.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                {/* Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-amber-500 w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-center text-amber-500 mb-8 drop-shadow-sm">
                        {hotspot.title}
                    </h1>

                    {/* Architecture Significance */}
                    <div className="mb-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Compass className="w-6 h-6 text-[#0B1B38]" />
                            <h3 className="text-[#0B1B38] font-bold tracking-widest uppercase text-sm">Architectural Significance</h3>
                        </div>

                        <p className="text-gray-700 text-lg leading-relaxed font-medium">
                            {hotspot.significance || "पूर्वाभिमुख काश्याचा : खांबा सोळावरी. हे स्थान अत्यंत पवित्र मानले जाते, जिथे चक्रधर स्वामींचे वास्तव्य होते. येथील कोरीव काम आणि खांबांची रचना स्थापत्यशास्त्राचा उत्कृष्ट नमुना आहे."}
                        </p>

                        <div className="pl-4 border-l-4 border-gray-300 py-2 my-6 italic text-gray-600">
                            {hotspot.description}
                        </div>
                    </div>

                    {/* Historical Context Card */}
                    <div className="bg-[#FFFDF5] border border-amber-100 rounded-xl p-6 relative overflow-hidden shadow-sm">
                        <History className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-100/50 rotate-[-15deg]" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-[1px] bg-amber-400"></div>
                                <h3 className="text-[#0B1B38] font-bold tracking-widest uppercase text-xs">Historical Context</h3>
                            </div>

                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                                {hotspot.historicalContext || "या मठाची रचना १३ व्या शतकातील महानुभाव पंथाच्या तत्त्वज्ञानावर आधारित आहे. सोळा खांब हे सोळा कलांचे प्रतीक मानले जातात. श्री चक्रधर स्वामींच्या लीळा चरित्रात या स्थानाचा उल्लेख आढळतो."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
