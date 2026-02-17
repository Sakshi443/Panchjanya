# Production Deployment Guide 🚀

## 1. Environment Variables (Vercel)

Go to **Vercel Dashboard → Project → Settings → Environment Variables**.
Add these for both **Production** and **Preview** environments.

### Frontend (Firebase Client)
These allow the React app to connect to Firebase Authentication.
- `VITE_FIREBASE_API_KEY`: (From Firebase Console)
- `VITE_FIREBASE_AUTH_DOMAIN`: (From Firebase Console)
- `VITE_FIREBASE_PROJECT_ID`: (From Firebase Console)
- `VITE_FIREBASE_STORAGE_BUCKET`: (From Firebase Console)
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: (Optional)
- `VITE_FIREBASE_APP_ID`: (Optional)

### Backend (Firebase Admin)
These allow the Serverless Functions (`/api/*`) to manage users and data securely.
- `FIREBASE_PROJECT_ID`: (Same as above)
- `FIREBASE_CLIENT_EMAIL`: (From Service Account JSON)
- `FIREBASE_PRIVATE_KEY`: (From Service Account JSON)

> **⚠️ IMPORTANT:** For `FIREBASE_PRIVATE_KEY`, if you are copying from a `.json` file, ensure you handle newlines correctly. Vercel usually handles standard PEM format, but if you paste it into the UI, it should look like:
> `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----`

## 2. Deployment

The project is configured to deploy automatically when you push to `main`.

### Manual Deployment
If needed, you can deploy from the CLI:
```bash
vercel --prod
```

## 3. Post-Deployment Verification

1.  **Public Site**: Visit `https://your-app.vercel.app`.
2.  **Admin Login**: Go to `/admin`. Login should work.
3.  **API Check**: 
    - Log in as admin.
    - Visit `/api/admin/stats`.
    - You should see a JSON response (e.g., `{"users": 10}`).
