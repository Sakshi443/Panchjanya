// src/utils/sthanTypes.ts
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/auth/firebase';
import { SthanType, CreateSthanTypeInput, UpdateSthanTypeInput } from '@/shared/types/sthanType';

const STHAN_TYPES_COLLECTION = 'sthan_types';



/**
 * Fetch all sthan types from Firestore
 */
export const getSthanTypes = async (): Promise<SthanType[]> => {
    try {
        const q = query(collection(db, STHAN_TYPES_COLLECTION), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as SthanType));
    } catch (error) {
        console.error('Error fetching sthan types:', error);
        return [];
    }
};

/**
 * Create a new sthan type
 */
export const createSthanType = async (data: CreateSthanTypeInput): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, STHAN_TYPES_COLLECTION), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating sthan type:', error);
        throw error;
    }
};

/**
 * Update an existing sthan type
 */
export const updateSthanType = async (id: string, data: UpdateSthanTypeInput): Promise<void> => {
    try {
        const docRef = doc(db, STHAN_TYPES_COLLECTION, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating sthan type:', error);
        throw error;
    }
};

/**
 * Delete a sthan type
 */
export const deleteSthanType = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, STHAN_TYPES_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting sthan type:', error);
        throw error;
    }
};

/**
 * Update the order of all sthan types
 */
export const updateSthanTypesOrder = async (reorderedTypes: SthanType[]): Promise<void> => {
    try {
        const batch = reorderedTypes.map((type, index) => {
            const docRef = doc(db, STHAN_TYPES_COLLECTION, type.id);
            return updateDoc(docRef, {
                order: index + 1,
                updatedAt: new Date().toISOString(),
            });
        });
        await Promise.all(batch);
    } catch (error) {
        console.error('Error updating sthan types order:', error);
        throw error;
    }
};

/**
 * The 5 new icon-based pins from /icons/pins/. Each has a different
 * interior icon but the same map-pin shape. Color is applied via CSS filter.
 */
const PIN_ICON_MAP: Record<string, string> = {
    pin_empty: '/icons/pins/4.svg',
    pin_temple1: '/icons/pins/4.1.svg',
    pin_shikhara: '/icons/pins/4.2.svg',
    pin_mandir: '/icons/pins/4.3.svg',
    pin_aasan: '/icons/pins/4.4.svg',
    pin_dot: '/icons/pins/4.5.svg',
    pin_mahasthan: '/icons/mahasthan pin.svg',
    pin_1_1: '/icons/pins/1.1.svg',
    pin_1_2: '/icons/pins/1.2.svg',
    pin_1_3: '/icons/pins/1.3.svg',
    pin_1_4: '/icons/pins/1.4.svg',
    pin_1_5: '/icons/pins/1.5.svg',
    pin_empty_gold: '/icons/pins/1.svg',
};

/**
 * Convert hex color string to HSL.
 */
function hexToHsl(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    let r = parseInt(h.substring(0, 2), 16) / 255;
    let g = parseInt(h.substring(2, 4), 16) / 255;
    let b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let hue = 0, sat = 0;
    const lum = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        sat = lum > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: hue = ((b - r) / d + 2) / 6; break;
            case b: hue = ((r - g) / d + 4) / 6; break;
        }
    }
    return [Math.round(hue * 360), Math.round(sat * 100), Math.round(lum * 100)];
}

/**
 * Build a CSS filter string that transforms a navy-blue image into the target color.
 *
 * Pipeline: invert(1) sepia(1) saturate(X) hue-rotate(Hdeg) brightness(B)
 *   - invert turns dark navy to a light color
 *   - sepia gives a warm reference tone (~hsl 37, 43%)
 *   - saturate boosts to target saturation
 *   - hue-rotate shifts to target hue
 *   - brightness adjusts final lightness
 */
export const hexToFilter = (hex: string): string => {
    const [hue, sat, lum] = hexToHsl(hex);
    const hueDeg = ((hue - 37) + 360) % 360;
    const satScale = Math.max(0.1, (sat / 43) * 3).toFixed(2);
    const brightScale = Math.max(0.2, (lum / 50) * 1.1).toFixed(2);
    return `invert(1) sepia(1) saturate(${satScale}) hue-rotate(${hueDeg}deg) brightness(${brightScale})`;
};

/**
 * Returns the src and CSS filter for rendering a colored pin icon.
 * Usage: <img src={src} style={{ filter }} />
 */
export const generateColoredPinSVG = (imagePath: string, color: string): { src: string; filter: string } => ({
    src: imagePath,
    filter: hexToFilter(color),
});

/**
 * Full pin render info: src URL + optional CSS filter.
 */
export interface PinRenderInfo {
    src: string;
    filter: string;
    needsFilter: boolean;
}

/**
 * Get full pin render info for any pinType + color.
 * Preferred API for new code.
 */
export const getSthanPinInfo = (color: string, pinType?: string): PinRenderInfo => {
    const isOriginal = color === 'original' || color === '' || !color || color === '#0e3c6f' || color === '#d4af37';

    if (pinType && pinType in PIN_ICON_MAP) {
        return {
            src: PIN_ICON_MAP[pinType],
            filter: isOriginal ? '' : hexToFilter(color),
            needsFilter: !isOriginal
        };
    }

    // Fallback for custom geometric pins (legacy)
    return { src: generateSthanPinSVG(color, pinType), filter: '', needsFilter: false };
};

/**
 * Generate an HTML <img> string for use inside Leaflet L.divIcon({ html }).
 */
export const getPinImageHtml = (color: string, pinType: string | undefined, size = 40): string => {
    const info = getSthanPinInfo(color, pinType);
    const filterStyle = info.needsFilter ? `filter:${info.filter};` : '';

    // Create a container with a white circular background positioned behind the pin head
    return `
        <div style="position:relative; width:${size}px; height:${size}px;">
            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:white; clip-path:circle(40% at 50% 40%); z-index:0;"></div>
            <img src="${info.src}" style="position:relative; width:100%; height:100%; object-fit:contain; ${filterStyle} z-index:1;" />
        </div>
    `;
};

/**
 * Generate pin image path with custom color — dispatches by pinType.
 * For icon-based pins, returns the PNG src path directly.
 * Use getSthanPinInfo() for full info including CSS color filter.
 */
export const generateSthanPinSVG = (color: string, pinType?: string): string => {
    if (pinType && pinType in PIN_ICON_MAP) return PIN_ICON_MAP[pinType];
    return PIN_ICON_MAP['pin_empty']; // Default fallback
};






/**
 * Adjust color brightness (helper function)
 */


/**
 * Initialize default sthan types (run once)
 */
export const seedSthanTypes = async (): Promise<void> => {
    const defaultTypes: CreateSthanTypeInput[] = [
        { name: 'Avasthan', color: '#D4AF37', order: 1, pinType: 'pin_mandir' },
        { name: 'Asan', color: '#0E3C6F', order: 2, pinType: 'pin_aasan' },
        { name: 'Vasti', color: '#228B22', order: 3, pinType: 'pin_empty' },
        { name: 'Mandalik', color: '#6A0DAD', order: 4, pinType: 'pin_shikhara' },
    ];

    try {
        const existing = await getSthanTypes();
        if (existing.length === 0) {
            for (const type of defaultTypes) {
                await createSthanType(type);
            }
            console.log('Seeded default sthan types');
        }
    } catch (error) {
        console.error('Error seeding sthan types:', error);
    }
};
