# 🚀 Vercel Deployment Guide

Complete step-by-step guide to deploy Panchjanya on Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub repository pushed: https://github.com/Sakshi443/Panchjanya
- ✅ Vercel account (free): https://vercel.com/signup
- ✅ Your Firebase credentials ready (from `.env` file)

---

## 🎯 Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Sign Up / Log In to Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub repositories

### Step 2: Import Your Repository

1. After logging in, you'll be on the Vercel Dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. Find `Sakshi443/Panchjanya` and click **"Import"**

**Direct Link**: https://vercel.com/new

### Step 3: Configure Project Settings

On the import screen, you'll see:

#### Framework Preset
- ✅ Vercel should auto-detect: **"Vite"**
- If not, select **"Vite"** from the dropdown

#### Root Directory
- ✅ Leave as: `./` (root directory)

#### Build and Output Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

These should be auto-filled. Don't change them unless needed.

### Step 4: Add Environment Variables ⚠️ CRITICAL

Click **"Environment Variables"** and add ALL of these:

```plaintext
VITE_FIREBASE_API_KEY=AIzaSyBpZeoqbO5Tz-BVBGhCgc-MxQnQRtGSBuY
VITE_FIREBASE_AUTH_DOMAIN=panchjanya-4a344.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=panchjanya-4a344
VITE_FIREBASE_STORAGE_BUCKET=panchjanya-4a344.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1000112706432
VITE_FIREBASE_APP_ID=1:1000112706432:web:13911883dbcc88a0662765
VITE_MEASUREMENT_ID=G-81LF8JEP79
VITE_GOOGLE_MAPS_KEY=AIzaSyCcfx9bqWnozV6vGyH60mt5EKlAGCKWQaI
VITE_ADMIN_EMAIL=mmanoorkar9@gmail.com
VITE_CLOUDINARY_CLOUD_NAME=dsu1pjwyp
VITE_CLOUDINARY_API_KEY=732156688572294
VITE_CLOUDINARY_API_SECRET=rG_tdKSUcKrbkumDVrZgnXWPIW4
```

**How to add:**
1. Paste each variable name in the **"Name"** field
2. Paste the corresponding value in the **"Value"** field
3. Click **"Add"** for each one
4. Make sure all 12 variables are added!

### Step 5: Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - ✅ Clone your repository
   - ✅ Install dependencies
   - ✅ Run build
   - ✅ Deploy to production

**This takes about 2-3 minutes**

### Step 6: Get Your Live URL

Once deployed, you'll see:
- 🎉 **Congratulations!** page
- Your live URL: `https://panchjanya-xxxxx.vercel.app`
- Click **"Visit"** to see your live site!

---

## 🎯 Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to confirm login
3. Link your account to CLI

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No
- **Project name**: panchjanya
- **Directory**: `./ `(current directory)
- **Override settings**: No

### Step 4: Add Environment Variables

After first deployment, add environment variables:

```bash
# Add each variable
vercel env add VITE_FIREBASE_API_KEY
# Paste value when prompted
# Repeat for all 12 variables
```

Or add them via dashboard:
https://vercel.com/YOUR_USERNAME/panchjanya/settings/environment-variables

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your app will be live at: `https://panchjanya.vercel.app`

---

## 🔧 Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to your project on Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. Update Firebase Authorized Domains

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **panchjanya-4a344**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel URL: `panchjanya-xxxxx.vercel.app`
6. Click **"Add"**

### 3. Restrict API Keys (Security)

**Google Maps API Key**:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**:
   - Select **HTTP referrers**
   - Add: `https://panchjanya-xxxxx.vercel.app/*`
   - Add: `http://localhost:8080/*` (for local dev)

**Firebase API Key**:
- Firebase client API keys are safe to expose
- Protected by Firebase Security Rules
- No restriction needed

---

## 🔄 Automatic Deployments

Once configured, Vercel will automatically deploy:

- ✅ **Production**: Every push to `main` branch
- ✅ **Preview**: Every pull request
- ✅ **Branch**: Every push to other branches (optional)

You can customize this in:
**Project Settings** → **Git**

---

## 📊 Monitor Your Deployment

### Vercel Dashboard
- View deployments: https://vercel.com/YOUR_USERNAME/panchjanya
- Check logs: Click on any deployment → **"View Function Logs"**
- Analytics: **Analytics** tab

### Deployment Status
Every deployment will:
1. Show build logs
2. Display any errors
3. Provide preview URL
4. Show production URL when ready

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build fails on Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Try building locally: `npm run build`
4. Check for missing dependencies in `package.json`

### Blank Page After Deployment

**Problem**: Site loads but shows blank page

**Solutions**:
1. Open browser console (F12)
2. Check for Firebase/API errors
3. Verify environment variables are set correctly
4. Check Firebase authorized domains include Vercel URL

### Environment Variables Not Working

**Problem**: App can't connect to Firebase

**Solutions**:
1. Go to Vercel dashboard → Project → **Settings** → **Environment Variables**
2. Verify ALL 12 variables are present
3. Click **"Redeploy"** to apply changes
4. Make sure variable names start with `VITE_`

### 404 on Refresh

**Problem**: Refreshing a route shows 404

**Solutions**:
1. Vercel should auto-configure for SPAs
2. If not, add `vercel.json` to your project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🎯 Vercel Project IDs (For GitHub Actions)

After deployment, get your project IDs for GitHub Actions:

### Get Project ID

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **General**
3. Scroll to **Project ID**
4. Copy the project ID

### Get Organization ID

1. Go to Vercel Dashboard → **Settings** (account settings)
2. Go to **General**
3. Find **Your ID**
4. Copy the organization ID

### Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name it: `GitHub Actions`
4. Select scope: **Full Account**
5. Click **"Create"**
6. Copy the token (you won't see it again!)

**Save these values** - you'll need them for GitHub Secrets!

---

## 📝 Vercel Configuration File

You already have `vercel.json` in your project:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

This is already configured! ✅

---

## 🚀 Quick Start Checklist

- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Add all 12 environment variables
- [ ] Click Deploy
- [ ] Wait for build to complete
- [ ] Visit your live site
- [ ] Add Vercel URL to Firebase authorized domains
- [ ] Restrict Google Maps API key to Vercel domain
- [ ] Save Vercel IDs for GitHub Actions
- [ ] Test all features on live site

---

## 📞 Need Help?

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/Sakshi443/Panchjanya/issues

---

**Ready to deploy?** 🎉

Start here: https://vercel.com/new
