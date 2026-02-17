import { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { verifyAdmin } from '../_lib/authMiddleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const decodedToken = await verifyAdmin(req, res);
    if (!decodedToken) return; // Response handled by verifyAdmin

    const { collection, id, subcollection, subId } = req.query;

    if (!collection || Array.isArray(collection)) {
        return res.status(400).json({ error: "Collection name required" });
    }

    try {
        let baseRef: any = adminDb.collection(collection);
        if (id && !Array.isArray(id)) {
            baseRef = baseRef.doc(id);
            if (subcollection && !Array.isArray(subcollection)) {
                baseRef = baseRef.collection(subcollection);
                if (subId && !Array.isArray(subId)) {
                    baseRef = baseRef.doc(subId);
                }
            }
        }

        if (req.method === 'GET') {
            const snap = await baseRef.get();
            if (snap.exists !== undefined) {
                // Doc reference
                if (!snap.exists) return res.status(404).json({ error: "Not found" });
                return res.status(200).json({ id: snap.id, ...snap.data() });
            } else {
                // Collection reference
                const data = snap.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }));
                return res.status(200).json(data);
            }
        }

        if (req.method === 'POST') {
            const data = req.body;
            console.log(`[API POST] Collection: ${collection}, ID: ${id || 'N/A'}, Sub: ${subcollection || 'N/A'}`);
            // baseRef must be a collection for POST
            if (typeof baseRef.add !== 'function') return res.status(400).json({ error: "Target must be a collection for POST" });
            const docRef = await baseRef.add(data);
            return res.status(201).json({ id: docRef.id, success: true });
        }

        if (req.method === 'PUT') {
            // baseRef must be a doc for PUT
            if (typeof baseRef.set !== 'function') return res.status(400).json({ error: "Target must be a document for PUT. Ensure ID (and subId if applicable) is provided." });
            const data = req.body;
            console.log(`[API PUT] Collection: ${collection}, ID: ${id}, Sub: ${subcollection || 'N/A'}, SubID: ${subId || 'N/A'}`);
            await baseRef.set(data, { merge: true });
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            // baseRef must be a doc for DELETE
            if (typeof baseRef.delete !== 'function') return res.status(400).json({ error: "Target must be a document for DELETE. Ensure ID (and subId if applicable) is provided." });
            await baseRef.delete();
            return res.status(200).json({ success: true });
        }

        return res.status(405).end();
    } catch (error: any) {
        console.error(`Admin API Error (${collection}${subcollection ? '/' + subcollection : ''}):`, error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
