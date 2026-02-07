import { MapContainer, TileLayer, Marker, useMap, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useRef, useMemo, useState } from "react";
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
        const validCoords = temples
          .filter(t => t.latitude && t.longitude)
          .map(t => [t.latitude, t.longitude] as [number, number]);

        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
            lastTempleIds.current = currentIds;
          }
        }
      }
    }
  }, [temples, selectedTempleId, map]);

  return null;
}
// Helper to detect overlapping coordinates and apply jitter feature

function MapZoomListener({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

export default function MapWithMarkers({ temples, onTempleClick, selectedTempleId }: MapWithMarkersProps) {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India Center
  const [currentZoom, setCurrentZoom] = useState(5);

  // Smart Marker layout that prevents overlap
  const markersToRender = useMemo(() => {
    // 1. Define visual threshold in degrees (approx 40px visual overlap)
    // 360 degrees / 2^zoom * (pixels / 256 tile size)
    const threshold = (360 / Math.pow(2, currentZoom)) * (40 / 256);

    const processed: (Temple & { renderLat: number, renderLng: number })[] = [];
    const unprocessed = temples.filter(t => t.latitude && t.longitude);

    // 2. Simple greedy grouping
    const usedIndices = new Set<number>();

    unprocessed.forEach((base, i) => {
      if (usedIndices.has(i)) return; // Already grouped
      usedIndices.add(i);

      const group = [base];

      // Find neighbors
      unprocessed.forEach((other, j) => {
        if (i === j || usedIndices.has(j)) return;

        const dLat = Math.abs(base.latitude - other.latitude);
        const dLng = Math.abs(base.longitude - other.longitude);

        // Simple box check is sufficient and faster than Euclidian for this
        if (dLat < threshold && dLng < threshold) {
          group.push(other);
          usedIndices.add(j);
        }
      });

      // 3. Process Group
      if (group.length === 1) {
        processed.push({ ...group[0], renderLat: group[0].latitude, renderLng: group[0].longitude });
      } else {
        // Calculate Centroid
        const centerLat = group.reduce((sum, t) => sum + t.latitude, 0) / group.length;
        const centerLng = group.reduce((sum, t) => sum + t.longitude, 0) / group.length;

        // Distribute in circle
        // Radius scales with threshold to ensure separation
        const radius = threshold * 0.6;
        const step = (2 * Math.PI) / group.length;

        group.forEach((t, idx) => {
          const angle = idx * step;
          // Add spiral effect for larger groups to avoid perfect circles overlap? 
          // Simple circle is fine for < 10 items usually.
          processed.push({
            ...t,
            renderLat: centerLat + radius * Math.cos(angle),
            renderLng: centerLng + radius * Math.sin(angle)
          });
        });
      }
    });

    return processed;
  }, [temples, currentZoom]);

  return (
    <div className="w-full h-full z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        <MapBoundsFitter temples={temples} selectedTempleId={selectedTempleId} />
        <MapZoomListener onZoomChange={setCurrentZoom} />

        {markersToRender.map((temple) => (
          <Marker
            key={temple.id}
            position={[temple.renderLat, temple.renderLng]}
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
        ))}
      </MapContainer>
    </div>
  );
}
