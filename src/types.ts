// Centralized Temple interface
export interface Temple {
    id: string;
    name: string;
    address?: string; // New field
    city: string;
    taluka?: string; // New field
    district: string;
    location: string | { lat: number; lng: number; address?: string }; // Keep for backward compatibility if needed, but we'll try to standardize
    latitude: number;
    longitude: number;
    description?: string;
    sthana?: string; // Sthana Purana
    leela?: string; // Leela
    images?: string[];
    architectureImage?: string; // For architecture view
    hotspots?: any[]; // For architecture view
    sections?: { title: string; content: string }[]; // Backward compatibility for some existing structure
    createdAt?: any;
    updatedAt?: any;
}
