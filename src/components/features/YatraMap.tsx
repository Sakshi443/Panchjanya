import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

export interface YatraLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    sequence: number;
    status: "completed" | "current" | "upcoming";
}

const createNumberedMarker = (sequence: number, status: string) => {
    // Colors based on status
    const bgColor = status === "current" ? "#F59E0B" : // Amber-500
        status === "completed" ? "#4F46E5" : // Indigo-600
            "#10B981"; // Emerald-500 (Upcoming) inside white

    const borderColor = status === "upcoming" ? "#10B981" : "white";
    const textColor = status === "upcoming" ? "#10B981" : "white";
    const mainBg = status === "upcoming" ? "white" : bgColor;

    return L.divIcon({
        className: "custom-number-marker",
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background-color: ${mainBg};
                border: 2px solid ${borderColor};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${textColor};
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            ">
                ${sequence}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

function MapBounds({ locations }: { locations: YatraLocation[] }) {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.latitude, l.longitude]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [locations, map]);

    return null;
}

interface YatraMapProps {
    locations: YatraLocation[];
}

export default function YatraMap({ locations }: YatraMapProps) {
    // Route line coordinates
    const routeCoordinates = locations
        .sort((a, b) => a.sequence - b.sequence)
        .map(l => [l.latitude, l.longitude] as [number, number]);

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={[20.5937, 78.9629]} // Center of India (fallback)
                zoom={5}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBounds locations={locations} />

                {/* Route Line */}
                {routeCoordinates.length > 1 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{ color: '#F59E0B', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
                    />
                )}

                {/* Markers */}
                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        icon={createNumberedMarker(loc.sequence, loc.status)}
                    >
                        <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                            <span className="font-bold text-xs">{loc.name}</span>
                        </Tooltip>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
