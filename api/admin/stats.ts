import { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../_lib/firebaseAdmin';
import { verifyAdmin } from '../_lib/authMiddleware';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        const decodedToken = await verifyAdmin(req, res);
        if (!decodedToken) return; // Response handled by verifyAdmin

        try {
            // 1. Get User Count (Admin SDK allows listUsers which is better, but this is simple for now)
            const userSnapshot = await adminDb.collection("users").get();
            const userCount = userSnapshot.size;

            // 2. Get Recent Activity from Temples
            const templeSnapshot = await adminDb.collection("temples")
                .orderBy("createdAt", "desc")
                .limit(5)
                .get();

            const recentActivity = templeSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    type: "New Sthana",
                    message: `Added '${data.name}' to ${data.district || "Directory"}`,
                    time: data.createdAt ? new Date(data.createdAt._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
                    color: "bg-emerald-500"
                };
            });

            return res.status(200).json({
                userCount,
                recentActivity
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
}
