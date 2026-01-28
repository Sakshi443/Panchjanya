import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Utility to fetch and log all yatra places from Firebase
 * This helps verify what data is currently in the database
 */
export async function fetchYatraPlaces() {
    try {
        const q = query(collection(db, "yatraPlaces"), orderBy("sequence", "asc"));
        const snapshot = await getDocs(q);

        const places = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        console.log("=== YATRA PLACES IN FIREBASE ===");
        console.log(`Total places: ${places.length}`);
        console.log("\nDetailed data:");
        places.forEach((place: any, index: number) => {
            console.log(`\n${index + 1}. ${place.name || 'Unnamed'}`);
            console.log(`   ID: ${place.id}`);
            console.log(`   Sequence: ${place.sequence}`);
            console.log(`   Status: ${place.status}`);
            console.log(`   Coordinates: ${place.latitude}, ${place.longitude}`);
            console.log(`   Description: ${place.description || 'No description'}`);
            console.log(`   Image: ${place.image || 'No image'}`);
            console.log(`   Time: ${place.time || 'No time'}`);
            console.log(`   Is Live: ${place.isLive || false}`);
            console.log(`   Attendees: ${place.attendees || 'N/A'}`);
        });

        return places;
    } catch (error) {
        console.error("Error fetching yatra places:", error);
        return [];
    }
}

/**
 * Call this function from browser console or component to see data:
 * import { fetchYatraPlaces } from '@/utils/fetchYatraData';
 * fetchYatraPlaces();
 */
