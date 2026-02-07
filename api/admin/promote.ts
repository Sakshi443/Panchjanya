import { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from "../../src/lib/firebase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { email, adminCode } = req.body;
    const masterCode = process.env.ADMIN_BOOTSTRAP_CODE;

    if (!masterCode) {
        return res.status(500).json({ error: "ADMIN_BOOTSTRAP_CODE not configured on server" });
    }

    if (adminCode !== masterCode) {
        return res.status(403).json({ error: "Invalid admin bootstrap code" });
    }

    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }

    try {
        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.setCustomUserClaims(user.uid, { admin: true });

        console.log(`✅ Successfully promoted ${email} to Admin status.`);
        return res.status(200).json({
            success: true,
            message: `User ${email} has been promoted to Admin. Please sign out and sign back in on the client to refresh the token.`
        });
    } catch (error: any) {
        console.error("Promotion Error:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
