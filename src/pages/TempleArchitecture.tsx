import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { X, MapPin, Compass, Share2, Navigation, Bookmark, ChevronLeft, Info, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Temple } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const abbreviations = [
  "👣 कोणत्या अवतारांची क्रीडा",
  "☀️ लीळाचरित्रातील काळ",
  "🏠 रहिवासाची जागा",
  "⏹️ स्थानाचा प्रकार",
  "⬇️ कोठून आले (1. - किती वेळा आले)",
  "⭐ मुक्काम किती दिवस (उ. - ली.च. काळ)",
  "⬆️ कोठे गेले (1. - जातानाची वेळ)",
  "➕ उपलब्ध स्थान संख्या",
  "➖ निर्देशित स्थान संख्या",
  "❌ अनुपलब्ध स्थान संख्या",
  "🟰 एकूण स्थान संख्या"
];

export default function TempleArchitecture() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!id) return;

    const fetchTempleData = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "temples", id));

        if (!snap.exists()) {
          console.error("Temple not found");
          navigate(-1);
          return;
        }

        const data = snap.data() as Temple;
        setTemple(data);
      } catch (error) {
        console.error("Error fetching temple:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTempleData();
  }, [id, navigate]);

  // Check if temple is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !id) {
        setIsSaved(false);
        return;
      }

      try {
        const savedRef = doc(db, `users/${user.uid}/savedTemples/${id}`);
        const savedDoc = await getDoc(savedRef);
        setIsSaved(savedDoc.exists());
      } catch (error) {
        console.error("Error checking saved status:", error);
        setIsSaved(false);
      }
    };

    checkIfSaved();
  }, [user, id]);

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, id]);

  // Toggle save/unsave
  const toggleSave = async () => {
    if (!user || !temple || !id || isSaving) return;

    setIsSaving(true);
    try {
      const savedRef = doc(db, `users/${user.uid}/savedTemples/${id}`);

      if (isSaved) {
        // Unsave
        await deleteDoc(savedRef);
        setIsSaved(false);
      } else {
        // Save
        await setDoc(savedRef, {
          templeId: id,
          savedAt: new Date(),
          templeName: temple.name,
          templeCity: temple.city || temple.address || "",
          templeImage: temple.images?.[0] || ""
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!temple) return;

    const shareData = {
      title: temple.name,
      text: `Check out ${temple.name} on Panchajanya`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleNavigation = () => {
    if (temple?.latitude && temple?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`,
        "_blank"
      );
    }
  };

  const handleArchitectureView = () => {
    navigate(`/temple/${id}/architecture-view`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F0]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Temple not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] lg:bg-white pb-8">
      {/* Header Section */}
      <div className={cn(
        "sticky top-0 z-30 pr-4 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 transition-all duration-300",
        isScrolled ? "py-2" : "py-4"
      )}>
        {/* Top Row: Back button, Title, Save button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5 shrink-0" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-7 h-7 text-blue-900" />
            </Button>
            <h1 className={cn(
              "font-heading font-bold text-[#0f3c6e] font-serif truncate transition-all duration-300",
              isScrolled ? "text-lg lg:text-xl leading-tight" : "text-2xl lg:text-3xl leading-tight"
            )}>
              Domegram
            </h1>
          </div>

          {/* Saved Icon - aligned with h1 */}
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleSave}
            disabled={isSaving || !user}
            className={cn(
              "rounded-full w-9 h-9 hover:bg-black/5 transition-all shrink-0"
            )}
          >
            <Bookmark className={cn("w-6 h-6 text-blue-900", isSaved && "fill-amber-500 text-amber-500")} />
          </Button>
        </div>

        {/* Subtitle and Address Row */}
        {!isScrolled && (
          <div className="ml-12 mt-1">
            <h2 className="text-base text-[#0f3c6e] font-serif">
              <span className="font-bold">{temple.todaysName || "Kamalpur"}</span> (Today's name)
            </h2>
            <p className="text-sm font-bold mt-1">
              <span className="text-amber-600">Shri Chakradhar Mandir, Domegram, Shrirampur, Ahilyanagar</span>
            </p>
          </div>
        )}
      </div>

      <div className="px-4 lg:px-6 space-y-8 mt-6 max-w-6xl mx-auto pb-12">

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3">
          {/* Directions Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="flex-1 bg-white text-blue-900 h-14 rounded-2xl shadow-sm border border-slate-100 hover:bg-blue-50 flex items-center justify-center gap-2 font-bold"
              >
                <span className="text-xl">🧭</span>
                <span className="text-sm md:text-base">{temple.directions_title || "जाण्याचा मार्ग"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-blue-900 font-serif text-center flex items-center justify-center gap-2">
                  <span className="text-xl">🧭</span>
                  {temple.directions_title || "जाण्याचा मार्ग"}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="text-sm text-slate-700 font-serif leading-relaxed">
                  {temple.directions_text || "Shri Chakradhar Swami Mandir, Domegram. Road map details will be shown here."}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Map/Navigation Button */}
          <Button
            size="icon"
            className="w-14 h-14 rounded-2xl bg-white text-blue-900 shadow-sm border border-slate-100 hover:bg-blue-50 shrink-0"
            onClick={handleNavigation}
            title="Navigate"
          >
            <Navigation className="w-6 h-6" />
          </Button>

          {/* Share Button */}
          <Button
            size="icon"
            className="w-14 h-14 rounded-2xl bg-white text-blue-900 shadow-sm border border-slate-100 hover:bg-blue-50 shrink-0"
            onClick={handleShare}
            title="Share"
          >
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Image Slider */}
        <div className="relative w-full rounded-[2rem] overflow-hidden shadow-lg bg-slate-100 h-[280px] sm:h-auto sm:aspect-video md:aspect-[21/9]">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {(temple.images && temple.images.length > 0 ? temple.images : [temple.architectureImage || "/placeholder-temple.jpg"]).map((img, index) => (
                <CarouselItem key={index} className="w-full h-full">
                  <img
                    src={img}
                    alt={`${temple.name} - ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsImageModalOpen(true);
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-temple.jpg';
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <button
              onClick={(e) => { e.preventDefault(); const prev = e.currentTarget.parentElement?.querySelector('[data-carousel-prev]') as HTMLButtonElement; prev?.click(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-blue-900 border-none flex items-center justify-center font-bold text-xl shadow-md transition-all"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.preventDefault(); const next = e.currentTarget.parentElement?.querySelector('[data-carousel-next]') as HTMLButtonElement; next?.click(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-blue-900 border-none flex items-center justify-center font-bold text-xl shadow-md transition-all"
            >
              ›
            </button>
            <CarouselPrevious className="hidden" data-carousel-prev />
            <CarouselNext className="hidden" data-carousel-next />
          </Carousel>
        </div>

        {/* Full Width Sthana Architecture View Button */}
        <Button
          className="w-full bg-[#1e3a8a] hover:bg-[#172554] text-white h-16 rounded-2xl shadow-lg text-base md:text-lg font-bold uppercase tracking-wider flex items-center justify-center gap-3"
          onClick={handleArchitectureView}
        >
          <Compass className="w-6 h-6 shrink-0" />
          <span>Sthana Architecture View</span>
        </Button>


        {/* General Description */}
        <div className="space-y-4 group relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-500">📜</span>
              <h3 className="font-heading text-xl font-bold text-blue-900">
                {temple.description_title || "General Description"}
              </h3>
            </div>

            {/* Info Button for Abbreviations - Moved to Header */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900">
                  <Info className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90%] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-blue-900 font-serif">Abbreviations</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                  {abbreviations.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm text-slate-700 pb-2 border-b border-gray-100 last:border-0">
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-900/10"></div>
            <p className="font-serif text-slate-700 leading-relaxed text-sm whitespace-pre-wrap pl-2 pr-4 text-justify columns-2 gap-6">
              {temple.description_text || temple.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Sthana Info */}
        <div className="space-y-4 group">
          <div className="flex items-center gap-3">
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-500">🕉️</span>
            <h3 className="font-heading text-xl font-bold text-blue-900">
              {temple.sthana_info_title || "स्थानांची माहिती"}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500/10"></div>
            <p className="font-serif text-slate-700 leading-relaxed italic text-sm whitespace-pre-wrap pl-2">
              {temple.sthana_info_text ||
                temple.sthana ||
                `${temple.name} हे महाराष्ट्रातील एक प्राचीन व पवित्र स्थान आहे. येथील वास्तुकला आणि ऐतिहासिक महत्त्व अद्वितीय आहे.`}
            </p>
          </div>
        </div>

      </div>

      {/* Full-Screen Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={(temple?.images && temple.images.length > 0 ? temple.images : [temple?.architectureImage || "/placeholder-temple.jpg"])[selectedImageIndex]}
              alt={`${temple?.name} - Full view`}
              className="max-w-full max-h-[95vh] object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-temple.jpg';
              }}
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-2xl backdrop-blur-sm transition-all"
            >
              ×
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
