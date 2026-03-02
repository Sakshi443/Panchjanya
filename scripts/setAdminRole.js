/**
 * Admin Custom Claims Script
 *
 * Usage:
 *   node scripts/setAdminRole.js <uid>
 *   node scripts/setAdminRole.js <uid> --revoke
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS environment variable must point to
 *     a service account JSON key with Firebase Admin SDK permissions.
 *   - OR run under `firebase functions:shell` where credentials are implicit.
 *
 * Security:
 *   - Never expose this script to users. Run from a trusted CI/CD environment
 *     or developer machine with restricted service account access.
 *   - The `role: 'admin'` claim is validated in Storage Rules and Firestore Rules
 *     server-side via request.auth.token.role — it CANNOT be forged by clients.
 *
 * After running:
 *   - The user must sign out and sign back in (or force token refresh)
 *     for the new claim to appear in their ID token.
 */

const admin = require('firebase-admin');

// Initialise with Application Default Credentials
admin.initializeApp();

async function setAdminRole(uid, revoke = false) {
    if (!uid) {
        console.error('❌ Usage: node scripts/setAdminRole.js <uid> [--revoke]');
        process.exit(1);
    }

    try {
        // Verify user exists before setting claims
        const user = await admin.auth().getUser(uid);
        console.log(`👤 Found user: ${user.email ?? uid}`);

        const currentClaims = user.customClaims ?? {};

        if (revoke) {
            const { role: _removed, ...remaining } = currentClaims;
            await admin.auth().setCustomUserClaims(uid, remaining);
            console.log(`✅ Admin role REVOKED for ${user.email ?? uid}`);
        } else {
            await admin.auth().setCustomUserClaims(uid, {
                ...currentClaims,
                role: 'admin',
            });
            console.log(`✅ Admin role GRANTED to ${user.email ?? uid}`);
        }

        // Log the result for audit trail
        const updated = await admin.auth().getUser(uid);
        console.log('🔑 Current claims:', JSON.stringify(updated.customClaims, null, 2));
        console.log('⚠️  User must sign out and back in for claims to take effect.');

    } catch (err) {
        console.error('❌ Failed to update claims:', err.message);
        process.exit(1);
    }
}

const uid = process.argv[2];
const revoke = process.argv.includes('--revoke');
setAdminRole(uid, revoke).then(() => process.exit(0));
