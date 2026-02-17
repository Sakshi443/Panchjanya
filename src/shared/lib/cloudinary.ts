import { sha1 } from 'crypto-hash';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

export const getCloudinaryImages = async (folder: string) => {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
        console.error("Cloudinary credentials missing");
        return [];
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    // Use Admin API to list resources by prefix (folder)
    // Endpoint: /resources/image/upload
    // Note: 'type' is in the path, so do NOT include it in the params/signature.

    const params = {
        max_results: 50,
        prefix: folder,
        timestamp: timestamp,
    };

    // Sort keys to generate signature
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys.map(key => `${key}=${params[key as keyof typeof params]}`).join('&') + API_SECRET;

    console.log("Cloudinary String to Sign:", stringToSign);

    const signature = await sha1(stringToSign);

    // Use local proxy to bypass CORS
    const url = `/api/cloudinary/${CLOUD_NAME}/resources/image/upload`;
    const queryParams = new URLSearchParams({
        ...params,
        api_key: API_KEY,
        signature: signature
    } as any).toString();

    try {
        const response = await fetch(`${url}?${queryParams}`);

        if (!response.ok) {
            console.error("Cloudinary API Error:", response.status, response.statusText);
            const errData = await response.json();
            console.error("Cloudinary Error Details:", JSON.stringify(errData, null, 2));
            return [];
        }

        const data = await response.json();

        if (data.resources) {
            return data.resources.map((res: any) => res.secure_url);
        }
        return [];
    } catch (error) {
        console.error("Error fetching Cloudinary images:", error);
        return [];
    }
};

export const uploadToCloudinary = async (file: File, folder: string) => {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
        throw new Error("Cloudinary credentials missing");
    }

    const timestamp = Math.round((new Date()).getTime() / 1000);
    const params = {
        timestamp: timestamp,
        folder: folder,
    };

    // Sort keys to generate signature
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys.map(key => `${key}=${params[key as keyof typeof params]}`).join('&') + API_SECRET;
    const signature = await sha1(stringToSign);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("folder", folder);
    formData.append("signature", signature);

    // Use local proxy for upload as well
    const url = `/api/cloudinary/${CLOUD_NAME}/image/upload`;

    const response = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
};
