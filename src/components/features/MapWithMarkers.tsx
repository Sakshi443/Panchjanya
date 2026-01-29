import { MapContainer, TileLayer, Marker, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { Temple } from "@/types";

// Spiritual Marker Generator
const createCustomMarker = (isActive: boolean) => {
  const color = isActive ? "#FF9933" : "#C04000"; // Saffron vs Deep Maroon-ish Red
  const size = isActive ? 40 : 32;

  return L.divIcon({
    className: "custom-temple-marker",
    html: `
      <div style="
        width: ${size}px; 
        height: ${size}px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        transition: all 0.3s ease;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Custom Temple Shikhara Icon -->
          <svg viewBox="0 0 24 24" width="${size / 1.8}" height="${size / 1.8}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22h16a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1z"></path>
            <path d="M18 18v-8a4 4 0 0 0-1-3l-4-7a2 2 0 0 0-2 0l-4 7a4 4 0 0 0-1 3v8"></path>
            <path d="M12 2v2"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

interface MapWithMarkersProps {
  temples: Temple[];
  onTempleClick: (id: string) => void;
  selectedTempleId?: string | null;
}

function MapBoundsFitter({ temples, selectedTempleId }: { temples: Temple[], selectedTempleId?: string | null }) {
  const map = useMap();
  const lastTempleIds = useRef<string>("");

  useEffect(() => {
    if (selectedTempleId) {
      const selected = temples.find(t => t.id === selectedTempleId);
      if (selected && selected.latitude && selected.longitude) {
        map.flyTo([selected.latitude, selected.longitude], 12, {
          duration: 1.5,
          easeLinearity: 0.25
        });
        return;
      }
    }

    if (temples.length > 0) {
      const currentIds = temples.map(t => t.id).sort().join(',');
      if (currentIds !== lastTempleIds.current) {
        const bounds = L.latLngBounds(temples.map(t => [t.latitude, t.longitude]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
          lastTempleIds.current = currentIds;
        }
      }
    }
  }, [temples, selectedTempleId, map]);

  return null;
}

export default function MapWithMarkers({ temples, onTempleClick, selectedTempleId }: MapWithMarkersProps) {
  const defaultCenter: [number, number] = [19.7515, 75.7139];

  return (
    <div className="w-full h-full z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false} // Hidden for a cleaner look
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        <MapBoundsFitter temples={temples} selectedTempleId={selectedTempleId} />

        {temples.map((temple) =>
          temple.latitude && temple.longitude ? (
            <Marker
              key={temple.id}
              position={[temple.latitude, temple.longitude]}
              icon={createCustomMarker(selectedTempleId === temple.id)}
              eventHandlers={{
                click: () => onTempleClick(temple.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -32]}
                className="rounded-lg shadow-xl border-none p-0 overflow-hidden"
              >
                <div className="px-3 py-2 bg-white/95 backdrop-blur-sm border-l-4 border-primary">
                  <p className="font-heading text-primary font-bold text-sm">{temple.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">
                    {temple.district} District
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
