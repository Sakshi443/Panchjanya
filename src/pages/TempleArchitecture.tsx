import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { X, MapPin, Compass, Share2, Navigation, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Temple } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

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
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
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
    <div className="min-h-screen bg-[#F9F6F0] pb-8">
      {/* Header Section */}
      <div className="bg-white px-6 pt-6 pb-4 relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-12">
            <h1 className="font-heading font-bold text-xl text-blue-900 leading-tight mb-2">
              {temple.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-wider">
                {temple.city ? `${temple.city}, ` : ""}
                {temple.district || "MAHARASHTRA"}
              </span>
            </div>
          </div>

          {/* Top Right Icons */}
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-10 h-10 border-slate-200 bg-white shadow-sm"
            >
              <span className="font-serif italic text-lg text-slate-600">i</span>
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={toggleSave}
              disabled={isSaving || !user}
              className={cn(
                "rounded-full w-10 h-10 shadow-sm transition-all",
                isSaved
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                  : "border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-600 hover:border-amber-500"
              )}
            >
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-10 h-10 border-slate-200 bg-white shadow-sm hover:bg-slate-50"
              onClick={() => navigate(-1)}
            >
              <X className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Image with Verified Badge */}
      <div className="px-6 py-6">
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

      {/* Action Buttons Row */}
      <div className="px-6 mt-10 mb-8">
        <div className="flex items-center gap-3">
          <Button
            className="flex-1 bg-[#1e3a8a] hover:bg-[#172554] text-white h-12 rounded-xl shadow-lg shadow-blue-900/20 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            onClick={handleArchitectureView}
          >
            <Compass className="w-4 h-4" />
            Sthana Architecture
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

      {/* Information Sections */}
      <div className="px-6 space-y-6">
        {/* स्थानांची माहिती (Temple Information) */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-blue-900">स्थानांची माहिती</h3>
            <div className="h-[1px] flex-1 bg-amber-200/50"></div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="font-serif text-slate-700 leading-relaxed italic text-sm">
              {temple.sthana ||
                temple.description ||
                `${temple.name} हे महाराष्ट्रातील एक प्राचीन व पवित्र स्थान आहे. येथील वास्तुकला आणि ऐतिहासिक महत्त्व अद्वितीय आहे.`}
            </p>
          </div>
        </div>

        {/* जाण्याचा मार्ग (Directions) */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-blue-900">जाण्याचा मार्ग</h3>
            <div className="h-[1px] flex-1 bg-amber-200/50"></div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            {temple.latitude && temple.longitude ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  या स्थानापर्यंत पोहोचण्यासाठी खालील बटणावर क्लिक करा:
                </p>
                <Button
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white h-10 rounded-lg flex items-center justify-center gap-2"
                  onClick={handleNavigation}
                >
                  <Navigation className="w-4 h-4" />
                  Google Maps मध्ये उघडा
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center italic">
                दिशानिर्देश लवकरच उपलब्ध होतील
              </p>
            )}
          </div>
        </div>

        {/* Additional Info (if available) */}
        {temple.history && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-blue-900">इतिहास</h3>
              <div className="h-[1px] flex-1 bg-amber-200/50"></div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <p className="font-serif text-slate-700 leading-relaxed text-sm">
                {temple.history}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
