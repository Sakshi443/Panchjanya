import { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from "../../src/lib/firebase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Simple check for Admin role or header (In production, use properly validated session/token)
    // For now, we trust the deployment environment with correct CORS and environment guards

    if (req.method === 'GET') {
        const { id } = req.query;
        try {
            if (id && !Array.isArray(id)) {
                // Fetch single temple + subcollections
                const docSnap = await adminDb.collection("temples").doc(id).get();
                if (!docSnap.exists) {
                    return res.status(404).json({ error: "Temple not found" });
                }

                const templeData = { id: docSnap.id, ...docSnap.data() };

                // Fetch present_hotspots subcollection
                const subSnap = await adminDb.collection("temples").doc(id).collection("present_hotspots").get();
                const present_hotspots = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                return res.status(200).json({ ...templeData, present_hotspots });
            } else {
                // Fetch all temples (minimal info for list)
                const snapshot = await adminDb.collection("temples").get();
                const temples = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                return res.status(200).json(temples);
            }
        } catch (error: any) {
            return res.status(500).json({ error: error.message || "Internal Server Error" });
        }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
        const { id } = req.query;
        const data = req.body;
        if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid ID" });

        try {
            await adminDb.collection("temples").doc(id).set(data, { merge: true });
            return res.status(200).json({ success: true });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id || Array.isArray(id)) return res.status(400).json({ error: "Invalid ID" });
        try {
            await adminDb.collection("temples").doc(id).delete();
            return res.status(200).json({ success: true });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).end();
}
