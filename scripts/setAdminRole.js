import admin from 'firebase-admin';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Check if service account exists before trying to require it
import fs from 'fs';
const serviceAccountPath = new URL('../serviceaccountkey.json', import.meta.url);

if (!fs.existsSync(serviceAccountPath)) {
    console.error("Error: serviceaccountkey.json not found in project root.");
    console.error("Please download it from Firebase Console > Project Settings > Service Accounts.");
    process.exit(1);
}

const serviceAccount = require("../serviceaccountkey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];

if (!uid) {
    console.error("Please provide a User ID (UID).");
    console.error("Usage: npm run set-admin <UID>");
    process.exit(1);
}

const setAdmin = async (uid) => {
    try {
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`Successfully set admin claim for user: ${uid}`);
        console.log("NOTE: The user may need to sign out and sign back in for changes to take effect.");
        process.exit(0);
    } catch (error) {
        console.error("Error setting admin claim:", error);
        process.exit(1);
    }
};

setAdmin(uid);
