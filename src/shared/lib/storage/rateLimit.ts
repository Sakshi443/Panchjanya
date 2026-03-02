import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/auth/firebase';

const HOURLY_UPLOAD_LIMIT = 20;

/**
 * Checks upload rate limit for a given user.
 * Throws if the user has exceeded HOURLY_UPLOAD_LIMIT uploads in the past hour.
 *
 * This is a client-side guard — Firebase Security Rules are the real enforcement layer.
 * Together they provide defence-in-depth.
 */
export async function assertUploadRateLimit(uid: string): Promise<void> {
    const oneHourAgo = Timestamp.fromMillis(Date.now() - 3_600_000);

    const snap = await getDocs(
        query(
            collection(db, 'media'),
            where('owner', '==', uid),
            where('createdAt', '>=', oneHourAgo),
        )
    );

    if (snap.size >= HOURLY_UPLOAD_LIMIT) {
        throw new Error(
            `Upload limit reached. You may upload up to ${HOURLY_UPLOAD_LIMIT} files per hour.`
        );
    }
}
