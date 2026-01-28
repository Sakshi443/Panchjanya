// Centralized Temple interface
export interface Temple {
    id: string;
    name: string;
    todaysName?: string; // For "Todays name" subtitle
    address?: string; // New field
    contactName?: string; // For contact details
    contactNumber?: string; // For contact details
    city: string;
    taluka?: string; // New field
    district: string;
    location: string | { lat: number; lng: number; address?: string }; // Keep for backward compatibility if needed, but we'll try to standardize
    latitude: number;
    longitude: number;
    description?: string;
    description_title?: string;
    description_text?: string;
    sthana?: string; // Sthana Purana (Legacy)
    sthana_info_title?: string;
    sthana_info_text?: string;
    directions_title?: string;
    directions_text?: string;
    leela?: string; // Leela
    history?: string; // Temple history
    images?: string[];
    architectureImage?: string; // For architecture view
    hotspots?: any[]; // For architecture view
    sections?: { title: string; content: string }[]; // Backward compatibility for some existing structure
    createdAt?: any;
    updatedAt?: any;
}
