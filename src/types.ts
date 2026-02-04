// Centralized interfaces for Temple Architecture
export interface Leela {
    id: string;
    title?: string; // New: Title for the leela
    description: string;
    number?: number;
}

export interface Hotspot {
    id: string;
    x: number;
    y: number;
    title: string;
    description: string;
    significance?: string; // Detailed architectural/spiritual info
    sthanPothiTitle?: string; // New: Title for Sthan Pothi section
    sthanPothiDescription?: string; // New: Specific description for sthan pothi
    generalDescriptionTitle?: string; // New: Title for General Description section
    number?: number; // Sequence number
    imageIndex?: number; // Map to main (0) or supplemental (1+) images
    images: string[]; // Present day images
    oldImages?: string[]; // Historical images
    leelas?: Leela[]; // Stories associated with this location
}

export interface DescriptionSection {
    id: string;
    title: string;
    content: string;
}

export interface GlanceItem {
    id: string;
    icon: string;
    description: string;
}

export interface AbbreviationItem {
    id: string;
    icon: string;
    description: string;
}

export interface CustomBlock {
    id: string;
    title: string;
    content: string;
}

export interface Temple {
    id: string;
    name: string;
    todaysName?: string; // New: Today's name subtitle
    address?: string;
    locationLink?: string; // New: Direction link or coordinates
    contactName?: string;
    contactNumber?: string;
    contactDetails?: string; // New: Additional contact info for Navigation
    city: string;
    taluka?: string;
    district: string;
    location: string | { lat: number; lng: number; address?: string };
    latitude: number;
    longitude: number;
    description?: string;
    description_title?: string;
    description_text?: string;
    glanceItems?: GlanceItem[];
    customBlocks?: CustomBlock[];
    architectureDescription?: string; // New: Overall architectural description
    descriptionSections?: DescriptionSection[]; // New: Dynamic content blocks
    sthana?: string;
    sthana_info_title?: string;
    sthana_info_text?: string;
    directions_title?: string;
    directions_text?: string;
    leela?: string;
    history?: string;
    images?: string[];
    architectureImage?: string;
    architectureImages?: string[];
    presentImage?: string;
    presentImages?: string[];
    hotspots?: Hotspot[];
    presentHotspots?: Hotspot[];
    createdAt?: any;
    updatedAt?: any;
}

export interface YatraPlace {
    id: string;
    name: string;
    description: string;
    sequence: number;
    status: "visited" | "stayed" | "revisited" | "current" | "upcoming";
    latitude?: number;
    longitude?: number;
    image?: string;
    time?: string;
    isLive?: boolean;
    attendees?: string;
    route?: string;
    subRoute?: string;
}
