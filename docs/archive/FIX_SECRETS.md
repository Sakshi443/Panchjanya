# 🚨 Fixing Secret Mismatch Error

You are seeing this error:
> `Environment Variable "VITE_FIREBASE_API_KEY" references Secret "firebase_api_key", which does not exist.`

This allows us to identify the exact problem: **Name Mismatch**.

Your code expects the secret to be named **`VITE_FIREBASE_API_KEY`** (Uppercase), but somewhere it is looking for **`firebase_api_key`** (Lowercase).

---

## ✅ Solution 1: Check GitHub Actions Secrets

1. Go to your repository **Settings**.
2. Click **Secrets and variables** > **Actions**.
3. Look at your list of "Repository secrets".
4. **Do you see `VITE_FIREBASE_API_KEY`?** (Must be exact uppercase).
   - ❌ If you see `firebase_api_key` (lowercase): **Delete it** and create a new one named `VITE_FIREBASE_API_KEY`.
   - ❌ If you see nothing: Create `VITE_FIREBASE_API_KEY`.

---

## ✅ Solution 2: Check Environment Variables (The likely culprit)

This specific error message often comes from **Environment-level variables** in GitHub.

1. Go to your repository **Settings**.
2. Click **Environments** (in the left sidebar).
3. Click on **production** (or `github-pages`, etc).
4. Scroll down to **"Environment variables"**.
5. **Delete any variables here** that map `VITE_FIREBASE_API_KEY` to `firebase_api_key`.
   - We are using *Secrets*, not *Environment Variables*, for sensitive keys.

---

## ✅ Solution 3: Re-Deploy

1. Go to the **Actions** tab.
2. Click on the failed workflow run (e.g., "Deploy to Vercel").
3. Click **"Re-run jobs"** > **"Re-run all jobs"**.

---

## 🔍 Verification Checklist

Your **Secrets** list should look exactly like this (all UPPERCASE):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_MEASUREMENT_ID`
- `VITE_GOOGLE_MAPS_KEY`
- `VITE_ADMIN_EMAIL`

If any are lowercase, **delete and re-add them as uppercase**.
