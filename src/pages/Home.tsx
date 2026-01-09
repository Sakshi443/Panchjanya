// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/features/SearchBar";
import MapWithMarkers from "@/components/features/MapWithMarkers";
import { TempleDetails } from "@/components/features/TempleDetails";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

import { Temple } from "@/types";

const Home = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [filteredTemples, setFilteredTemples] = useState<Temple[]>([]);
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState("");

  // 🔥 Load temples in real-time from Firestore
  useEffect(() => {
    console.log("🏛️ Setting up Firestore listener for temples...");
    const unsub = onSnapshot(
      collection(db, "temples"),
      (snapshot) => {
        console.log("✅ Firestore snapshot received! Temples count:", snapshot.size);
        const list: Temple[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          images: [],
          sections: [],
          ...doc.data(),
        })) as Temple[];

        console.log("📍 Temples loaded:", list.map(t => ({ name: t.name, lat: t.latitude, lng: t.longitude })));
        setTemples(list);
        // Filtered temples will clearly update via the useEffect dependency on 'temples'
      },
      (error) => {
        console.error("❌ Firestore Error:", error.code, error.message);
        console.error("This is likely due to browser extension blocking. Try incognito mode.");
      }
    );

    return () => unsub();
  }, []);

  // 🛠️ TEMPORARY FIX: Correct coordinates for Nanded Temple
  useEffect(() => {
    const fixCoordinates = async () => {
      const badTemple = temples.find(t => t.longitude && t.longitude < 60 && t.name.includes("Bhaveshwar")); // Check for bad longitude (Ind ia is > 68)
      if (badTemple) {
        console.log("🛠️ Found temple with bad coordinates:", badTemple);
        try {
          const { doc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("@/firebase");
          const templeRef = doc(db, "temples", badTemple.id);
          await updateDoc(templeRef, {
            latitude: 19.1602,
            longitude: 77.3150
          });
          console.log("✅ Successfully updated coordinates for:", badTemple.name);
          // Force reload or update local state if needed (snapshot listener should handle it)
        } catch (error) {
          console.error("❌ Failed to update coordinates:", error);
        }
      }
    };
    if (temples.length > 0) {
      fixCoordinates();
    }
  }, [temples]);

  // 🔍 Filter temples based on search and filters
  useEffect(() => {
    let filtered = temples;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((temple) =>
        temple.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by district
    if (selectedDistrict) {
      filtered = filtered.filter(
        (temple) => temple.district?.toLowerCase() === selectedDistrict.toLowerCase()
      );
    }

    // Filter by taluka
    if (selectedTaluka) {
      filtered = filtered.filter(
        (temple) => temple.taluka?.toLowerCase() === selectedTaluka.toLowerCase()
      );
    }

    setFilteredTemples(filtered);
  }, [searchQuery, selectedDistrict, selectedTaluka, temples]);

  // 🔥 When user clicks a pin on the map
  const handleTempleClick = (id: string) => {
    setSelectedTempleId(id);
    setIsDetailsPanelOpen(true);
  };

  const selectedTemple = temples.find((t) => t.id === selectedTempleId) || null;

  return (
    <div className="relative h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] overflow-hidden rounded-3xl shadow-2xl border border-border/50">
      {/* FLOATING SEARCH & FILTERS */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] lg:w-auto z-20 transition-all duration-300">
        <SearchBar
          districts={Array.from(new Set(temples.map(t => t.district).filter(Boolean)))}
          talukas={Array.from(new Set(temples.map(t => t.taluka).filter(Boolean)))}
          onSearch={setSearchQuery}
          onDistrictChange={(val) => setSelectedDistrict(val === "all" ? "" : val)}
          onTalukaChange={(val) => setSelectedTaluka(val === "all" ? "" : val)}
        />
      </div>

      {/* MAP SECTION - FULL WIDTH HERO */}
      <div className="absolute inset-0 z-10">
        <MapWithMarkers
          temples={filteredTemples}
          onTempleClick={handleTempleClick}
          selectedTempleId={selectedTempleId}
        />
      </div>

      {/* TEMPLE DETAILS SIDEBAR / PANEL */}
      <TempleDetails
        isOpen={isDetailsPanelOpen}
        onClose={() => setIsDetailsPanelOpen(false)}
        temple={selectedTemple}
      />

      {/* QUICK STATS CHIP (Spiritual Touch) */}
      <div className="absolute bottom-6 left-6 z-20 hidden lg:block">
        <div className="px-5 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-border/50 flex items-center gap-3">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {filteredTemples.length} Sthanas discovered
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
