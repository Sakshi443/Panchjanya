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

                {/* Route Path made of Arrows (>>>>) */}
                {routeCoordinates.length > 1 && (
                    <>
                        {routeCoordinates.slice(0, -1).map((coord, idx) => {
                            const nextCoord = routeCoordinates[idx + 1];
                            const arrows: JSX.Element[] = [];

                            // Calculate distance between points
                            const latDiff = nextCoord[0] - coord[0];
                            const lngDiff = nextCoord[1] - coord[1];
                            const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

                            // Dense arrows to form the line (one arrow every ~0.05 degrees for continuity)
                            const numArrows = Math.max(5, Math.floor(distance / 0.05));

                            // Calculate angle for arrow direction
                            const angle = Math.atan2(latDiff, lngDiff) * (180 / Math.PI);

                            // Create dense arrows to form the path, but skip near endpoints to avoid overlap with markers
                            const skipRatio = 0.08; // Skip first and last 8% to avoid numbered circles
                            for (let i = 0; i <= numArrows; i++) {
                                const ratio = i / numArrows;

                                // Skip arrows too close to start or end points
                                if (ratio < skipRatio || ratio > (1 - skipRatio)) {
                                    continue;
                                }

                                const arrowLat = coord[0] + latDiff * ratio;
                                const arrowLng = coord[1] + lngDiff * ratio;

                                arrows.push(
                                    <Marker
                                        key={`arrow-${idx}-${i}`}
                                        position={[arrowLat, arrowLng]}
                                        icon={L.divIcon({
                                            className: 'arrow-marker',
                                            html: `
                                                <div style="
                                                    transform: rotate(${angle}deg);
                                                    font-size: 14px;
                                                    color: #F59E0B;
                                                    text-shadow: 1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white;
                                                    font-weight: bold;
                                                    line-height: 1;
                                                ">▶</div>
                                            `,
                                            iconSize: [14, 14],
                                            iconAnchor: [7, 7],
                                        })}
                                    />
                                );
                            }

                            return arrows;
                        })}
                    </>
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
