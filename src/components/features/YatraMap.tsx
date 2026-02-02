import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";
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

function RouteArrows({ locations }: { locations: YatraLocation[] }) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useEffect(() => {
        const syncZoom = () => setZoom(map.getZoom());
        syncZoom();
        map.on('zoomend moveend load resize', syncZoom);
        return () => {
            map.off('zoomend moveend load resize', syncZoom);
        };
    }, [map, locations]);

    useMapEvents({
        zoomend: () => setZoom(map.getZoom()),
        moveend: () => setZoom(map.getZoom()),
    });

    // Desired visual gap between arrows in pixels for a continuous look
    const desiredPixelGap = 12;

    const routeCoordinates = locations
        .sort((a, b) => a.sequence - b.sequence)
        .map(l => ({ lat: l.latitude, lng: l.longitude, id: l.id }));

    if (routeCoordinates.length < 2) return null;

    const arrows: JSX.Element[] = [];

    routeCoordinates.slice(0, -1).forEach((coord, idx) => {
        const nextCoord = routeCoordinates[idx + 1];

        // Project to pixel coordinates at current zoom level
        const p1 = map.project(L.latLng(coord.lat, coord.lng), zoom);
        const p2 = map.project(L.latLng(nextCoord.lat, nextCoord.lng), zoom);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate how many arrows fit with the desired pixel gap
        const numArrows = Math.floor(pixelDistance / desiredPixelGap);

        // Use pixel-based angle for rotation (Leaflet Y increases downwards)
        // Add 180 because left-arrow.png points Left by default
        const angle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 180;

        // Skip near endpoints to avoid marker overlap
        const skipPixels = 10; // Pixels to skip from each end

        for (let i = 1; i <= numArrows; i++) {
            const currentPixelDist = i * desiredPixelGap;

            // Boundary checks in pixels
            if (currentPixelDist < skipPixels || currentPixelDist > pixelDistance - skipPixels) {
                continue;
            }

            const ratio = currentPixelDist / pixelDistance;
            const arrowLat = coord.lat + (nextCoord.lat - coord.lat) * ratio;
            const arrowLng = coord.lng + (nextCoord.lng - coord.lng) * ratio;

            arrows.push(
                <Marker
                    key={`arrow-${coord.id}-${nextCoord.id}-${i}`}
                    position={[arrowLat, arrowLng]}
                    icon={L.divIcon({
                        className: 'arrow-marker',
                        html: `
                            <div style="
                                transform: rotate(${angle}deg);
                                width: 20px;
                                height: 20px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <img src="/icons/left-arrow.png" style="width: 100%; height: auto; opacity: 1;" />
                            </div>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                    })}
                />
            );
        }
    });

    return <>{arrows}</>;
}

export default function YatraMap({ locations }: YatraMapProps) {
    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={[25.3176, 82.9739]} // Initial fallback
                zoom={5}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    maxZoom={20}
                />

                <MapBounds locations={locations} />
                <RouteArrows locations={locations} />

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
