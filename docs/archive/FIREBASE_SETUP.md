# Firebase Storage Setup Guide

If your images are not loading, it is likely due to **Security Rules** or **CORS** configuration.

## 1. Update Storage Security Rules (Recommended)
By default, Firebase Storage blocks public read access. To allow users to see temple images:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Storage** > **Rules**.
3. Replace the rules with the following to allow public reads:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // 🟢 Allow public read access
      allow write: if request.auth != null; // 🔒 Only allow authenticated uploads
    }
  }
}
```
4. Click **Publish**.

## 2. Fix CORS Issues (For Localhost)
If images still don't load on `localhost`, you need to configure CORS for your Firebase Storage bucket.

1. Download `gsutil` or use the [Google Cloud Shell](https://shell.cloud.google.com/).
2. Create a file named `cors.json` with this content:
```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```
3. Run this command in the terminal (replace `YOUR_BUCKET_NAME` with your actual bucket name, e.g., `dharma-disha.firebasestorage.app`):
```bash
gsutil cors set cors.json gs://YOUR_BUCKET_NAME
```

## 3. Verify Image URLs
Ensure your database contains valid image URLs.
- A valid Firebase Storage URL looks like: 
  `https://firebasestorage.googleapis.com/.../o/folder%2Fimage.jpg?alt=media&token=...`
- If the `token` parameter is missing, the Security Rules (Step 1) MUST be set to public read.
