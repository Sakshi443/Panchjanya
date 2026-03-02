/**
 * Migration Script: Remove Obsolete Fields from Temple Documents
 *
 * Removes fields that were removed from the "Add Temple" form and
 * are no longer used by any part of the application:
 *   - city          → replaced by todaysName / todaysNameTitle
 *   - leela         → removed entirely
 *   - hasArchitecture → removed (always redirect to config page now)
 *
 * Fields that ARE preserved (still used by TempleArchitectureAdmin):
 *   - images, description_title, description_text, sthana_info_text,
 *     directions_text, hotspots, architectureImage, etc.
 *
 * Run with:
 *   node scripts/migrate-remove-obsolete-fields.mjs
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

// Fields to remove from all temple documents
const FIELDS_TO_REMOVE = ['city', 'leela', 'hasArchitecture'];

async function migrate() {
    console.log('🔄 Starting migration: Remove obsolete fields from temples...\n');
    console.log(`📋 Fields to remove: ${FIELDS_TO_REMOVE.join(', ')}\n`);

    const snap = await db.collection('temples').get();
    console.log(`📦 Found ${snap.size} temple documents.\n`);

    const batch = db.batch();
    let updatedCount = 0;
    let skippedCount = 0;

    const deletePayload = {};
    for (const field of FIELDS_TO_REMOVE) {
        deletePayload[field] = admin.firestore.FieldValue.delete();
    }

    snap.docs.forEach((doc) => {
        const data = doc.data();
        const hasObsoleteField = FIELDS_TO_REMOVE.some((f) => f in data);

        if (hasObsoleteField) {
            const found = FIELDS_TO_REMOVE.filter((f) => f in data);
            console.log(`  ✅ [${doc.id}] "${data.name}" — removing: ${found.join(', ')}`);
            batch.update(doc.ref, deletePayload);
            updatedCount++;
        } else {
            skippedCount++;
        }
    });

    if (updatedCount === 0) {
        console.log('\n✨ No documents needed updating. Database is already clean!');
        return;
    }

    console.log(`\n🚀 Committing batch update for ${updatedCount} documents...`);
    await batch.commit();

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated : ${updatedCount} documents`);
    console.log(`   Skipped : ${skippedCount} documents (already clean)`);
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
