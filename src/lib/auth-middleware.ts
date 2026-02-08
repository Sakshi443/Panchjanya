import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminAuth } from './firebase-admin.js';

export async function verifyAdmin(req: VercelRequest, res: VercelResponse) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error("🚫 Missing or invalid Authorization header");
        res.status(401).json({ error: "Unauthorized: Missing token" });
        return null;
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(token);

        // Check for admin claim OR email match from environment variable
        const isAdmin = !!decodedToken.admin;
        const adminEmail = process.env.VITE_ADMIN_EMAIL;

        if (!isAdmin && adminEmail && decodedToken.email === adminEmail) {
            console.log(`✅ User ${decodedToken.email} authenticated via VITE_ADMIN_EMAIL fallback.`);
            return decodedToken;
        }

        if (!isAdmin) {
            console.error(`🚫 User ${decodedToken.email} is not an admin`);
            res.status(403).json({ error: "Forbidden: Admin access required" });
            return null;
        }

        return decodedToken;
    } catch (error) {
        console.error("🚫 Token verification failed:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return null;
    }
}
