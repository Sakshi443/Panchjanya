import admin from "firebase-admin";

const getFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
        const missing = [];
        if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");
        if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
        if (!projectId) missing.push("FIREBASE_PROJECT_ID");

        console.error("❌ Stats API Init Error: Missing Env Vars:", missing.join(", "));
        throw new Error(`Missing Firebase Admin SDK environment variables: ${missing.join(", ")}`);
    }

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n').replace(/"/g, ''), // Remove potential surrounding quotes from env var paste
        }),
    });
};

export const getAdminDb = () => getFirebaseAdmin().firestore();
export const getAdminAuth = () => getFirebaseAdmin().auth();
