/**
 * Cloud Function: processUploadedMedia
 *
 * Trigger: Firebase Storage onObjectFinalized
 * Purpose: Generate thumbnail (200px) and medium (800px) WebP variants
 *          using Sharp, then store variant download URLs back in Firestore.
 *
 * Security:
 * - Runs with Admin SDK (bypasses Security Rules intentionally — this is a trusted server process)
 * - Will not reprocess files that already have variants (idempotent)
 * - Skips files not in monitored paths (posts/, temples/, users/profile/)
 * - Skips already-generated variant files (prevents infinite loop)
 *
 * Cost:
 * - Only triggers on new object finalization — not on metadata updates
 * - Skips non-image / already-processed paths immediately to minimize compute time
 */
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import sharp from 'sharp';

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Variant sizes to generate
const VARIANTS: Array<{ name: 'thumb' | 'medium'; width: number }> = [
    { name: 'thumb', width: 200 },
    { name: 'medium', width: 800 },
];

// Only process files under these paths
const MONITORED_PREFIXES = ['posts/', 'temples/', 'users/'];

// Skip files that are themselves generated variants (prevents infinite loops)
const VARIANT_SUFFIXES = ['_thumb.webp', '_medium.webp'];

export const processUploadedMedia = functions.storage.onObjectFinalized(
    {
        region: 'asia-south1',  // Change to your region
        memory: '512MiB',
        timeoutSeconds: 120,
    },
    async (event) => {
        const object = event.data;
        const filePath = object.name;
        const contentType = object.contentType;

        if (!filePath || !contentType) return;

        // 1. Skip non-images
        if (!contentType.startsWith('image/')) {
            console.log(`Skipping non-image: ${filePath}`);
            return;
        }

        // 2. Skip paths we don't manage
        const isMonitored = MONITORED_PREFIXES.some((p) => filePath.startsWith(p));
        if (!isMonitored) {
            console.log(`Skipping unmonitored path: ${filePath}`);
            return;
        }

        // 3. Skip variant files (avoid infinite trigger loop)
        const isVariant = VARIANT_SUFFIXES.some((s) => filePath.endsWith(s));
        if (isVariant) {
            console.log(`Skipping variant file: ${filePath}`);
            return;
        }

        // 4. Find the Firestore media document matching this storagePath
        const mediaSnap = await db
            .collection('media')
            .where('storagePath', '==', filePath)
            .limit(1)
            .get();

        if (mediaSnap.empty) {
            console.warn(`No media document found for storagePath: ${filePath}`);
            return;
        }

        const mediaDoc = mediaSnap.docs[0];

        // 5. Check idempotency — skip if variants already exist
        const existing = mediaDoc.data()?.variants ?? {};
        if (existing.thumb && existing.medium) {
            console.log(`Variants already exist for: ${filePath}. Skipping.`);
            return;
        }

        // 6. Download the original file to /tmp
        const fileName = path.basename(filePath);
        const tmpOriginal = path.join(os.tmpdir(), `original-${fileName}`);

        try {
            await bucket.file(filePath).download({ destination: tmpOriginal });

            const variantUrls: Partial<Record<'thumb' | 'medium', string>> = {};

            // 7. Generate each variant with Sharp
            for (const variant of VARIANTS) {
                const variantFileName = fileName.replace(/(\.[^.]+)?$/, `_${variant.name}.webp`);
                const variantPath = path.join(path.dirname(filePath), variantFileName);
                const tmpVariant = path.join(os.tmpdir(), variantFileName);

                await sharp(tmpOriginal)
                    .resize(variant.width, null, { withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(tmpVariant);

                // Upload variant back to same folder
                await bucket.upload(tmpVariant, {
                    destination: variantPath,
                    metadata: {
                        contentType: 'image/webp',
                        cacheControl: 'public, max-age=31536000, immutable',
                    },
                });

                // Get CDN URL for the variant
                const [url] = await bucket.file(variantPath).getSignedUrl({
                    action: 'read',
                    expires: '01-01-2100',
                });

                // For public files: use getDownloadURL pattern via makePublic
                await bucket.file(variantPath).makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${variantPath}`;
                variantUrls[variant.name] = publicUrl;

                // Clean up tmp variant
                await fs.unlink(tmpVariant).catch(() => null);
            }

            // 8. Update Firestore media document with variant URLs and 'ready' status
            await mediaDoc.ref.update({
                variants: variantUrls,
                status: 'ready',
            });

            console.log(`✅ Processed variants for ${filePath}:`, variantUrls);

        } catch (err) {
            console.error(`❌ Failed to process ${filePath}:`, err);

            // Mark as failed so the frontend can surface an error state
            await mediaDoc.ref.update({ status: 'failed' }).catch(() => null);

        } finally {
            // Always clean up the original tmp file
            await fs.unlink(tmpOriginal).catch(() => null);
        }
    }
);
