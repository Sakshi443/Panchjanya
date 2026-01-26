import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { X, MapPin, Compass, Share2, Navigation, Bookmark, ChevronLeft, Info } from "lucide-react";
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
      <div className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between bg-background/95 lg:bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5 shrink-0" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-7 h-7 text-blue-900" />
          </Button>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-lg font-heading font-bold text-blue-900 font-serif truncate leading-tight">
              {temple.name}
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider truncate">
              <MapPin className="w-3 h-3" />
              <span>
                {temple.city ? `${temple.city}, ` : ""}
                {temple.district || "MAHARASHTRA"}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Icons */}
        <div className="flex gap-1 shrink-0 ml-2">
          {/* Abbreviations Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full w-9 h-9 hover:bg-black/5"
              >
                <span className="font-serif italic text-lg text-blue-900">i</span>
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

          <Button
            size="icon"
            variant="ghost"
            onClick={toggleSave}
            disabled={isSaving || !user}
            className={cn(
              "rounded-full w-9 h-9 hover:bg-black/5 transition-all"
            )}
          >
            <Bookmark className={cn("w-5 h-5 text-blue-900", isSaved && "fill-amber-500 text-amber-500")} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full w-9 h-9 hover:bg-black/5"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 text-blue-900" />
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-4">

        {/* 1. Directions (Accordion) - MOVED TO TOP */}
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 px-5">
            <AccordionItem value="directions" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧭</span>
                  <h3 className="font-heading text-lg font-bold text-blue-900">
                    {temple.directions_title || "जाण्याचा मार्ग"}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="relative overflow-hidden pt-2">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500/10"></div>
                  {temple.directions_text ? (
                    <p className="font-serif text-slate-700 leading-relaxed text-sm whitespace-pre-wrap mb-4 pl-3">
                      {temple.directions_text}
                    </p>
                  ) : null}

                  {temple.latitude && temple.longitude ? (
                    <div className="space-y-3 pl-3">
                      <p className="text-sm text-slate-600">
                        या स्थानापर्यंत पोहोचण्यासाठी खालील बटणावर क्लिक करा:
                      </p>
                    </div>
                  ) : (
                    !temple.directions_text && (
                      <p className="text-sm text-slate-500 text-center italic pl-3">
                        दिशानिर्देश लवकरच उपलब्ध होतील
                      </p>
                    )
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* 2. Hero Image with Verified Badge - MOVED BELOW DIRECTIONS */}
        <div>
          <div className="relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden shadow-lg bg-slate-100">
            <img
              src={temple.images?.[0] || temple.architectureImage || "/placeholder-temple.jpg"}
              alt={temple.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
              }}
            />

            {/* Verified Badge */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-slate-100 min-w-max">
              <div className="bg-amber-400 text-white rounded-full p-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-widest leading-none">
                PANCHAJANYA <br /> VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* 3. Action Buttons Row - MOVED BELOW IMAGE */}
        <div>
          <div className="flex items-center gap-3">
            <Button
              className="flex-1 bg-[#1e3a8a] hover:bg-[#172554] text-white h-12 rounded-xl shadow-lg shadow-blue-900/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              onClick={handleArchitectureView}
            >
              <Compass className="w-4 h-4" />
              STHANA ARCHITECTURE
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="w-12 h-12 rounded-full border-slate-200 shadow-sm bg-white shrink-0"
              onClick={handleNavigation}
              title="Get Directions"
            >
              <Navigation className="w-5 h-5 text-blue-900 fill-blue-900/20" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="w-12 h-12 rounded-full border-slate-200 shadow-sm bg-white shrink-0"
              onClick={handleShare}
              title="Share"
            >
              <Share2 className="w-5 h-5 text-blue-900" />
            </Button>
          </div>
        </div>

        {/* 4. General Description (Archive Overview) */}
        <div className="space-y-4 group">
          <div className="flex items-center gap-3">
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-500">📜</span>
            <h3 className="font-heading text-xl font-bold text-blue-900">
              {temple.description_title || "General Description"}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-900/10"></div>
            <p className="font-serif text-slate-700 leading-relaxed text-sm whitespace-pre-wrap pl-2">
              {temple.description_text || temple.description || "No description available."}
            </p>
          </div>
        </div>

        {/* 5. Sthana Info - MOVED TO BOTTOM */}
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

        {/* Additional Info (History) - Keep it last or near bottom */}
        {temple.history && (
          <div className="space-y-4 group">
            <div className="flex items-center gap-3">
              <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-500">⏳</span>
              <h3 className="font-heading text-xl font-bold text-blue-900">इतिहास</h3>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/10"></div>
              <p className="font-serif text-slate-700 leading-relaxed text-sm pl-2">
                {temple.history}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
