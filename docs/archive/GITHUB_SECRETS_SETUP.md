# 🔐 GitHub Secrets Configuration Guide

Step-by-step guide to configure GitHub Secrets for CI/CD automation.

---

## 📋 What Are GitHub Secrets?

GitHub Secrets are encrypted environment variables that:
- ✅ Store sensitive data securely
- ✅ Are used in GitHub Actions workflows
- ✅ Never appear in logs or code
- ✅ Enable automated deployments

---

## 🎯 Step 1: Navigate to Secrets Settings

1. Go to your repository: https://github.com/Sakshi443/Panchjanya
2. Click **"Settings"** (top menu)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. You'll see the **"Repository secrets"** page

**Direct Link**: https://github.com/Sakshi443/Panchjanya/settings/secrets/actions

---

## ➕ Step 2: Add Secrets

Click **"New repository secret"** button for each of these:

---

### 🔥 Firebase Configuration Secrets (All Required)

| Secret Name | Where to Get It | Example Value |
|------------|----------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings | `AIzaSyBpZeoq...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings | `panchjanya-4a344.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings | `panchjanya-4a344` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project Settings | `panchjanya-4a344.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings | `1000112706432` |
| `VITE_FIREBASE_APP_ID` | Firebase Console → Project Settings | `1:1000112706432:web:...` |
| `VITE_MEASUREMENT_ID` | Firebase Console → Project Settings | `G-81LF8JEP79` |

**Your Actual Values**:
```
VITE_FIREBASE_API_KEY=AIzaSyBpZeoqbO5Tz-BVBGhCgc-MxQnQRtGSBuY
VITE_FIREBASE_AUTH_DOMAIN=panchjanya-4a344.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=panchjanya-4a344
VITE_FIREBASE_STORAGE_BUCKET=panchjanya-4a344.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1000112706432
VITE_FIREBASE_APP_ID=1:1000112706432:web:13911883dbcc88a0662765
VITE_MEASUREMENT_ID=G-81LF8JEP79
```

---

### 🗺️ Google Maps API Secret (Required)

| Secret Name | Where to Get It | Your Value |
|------------|----------------|------------|
| `VITE_GOOGLE_MAPS_KEY` | Google Cloud Console → Credentials | `AIzaSyCcfx9bqWnozV6vGyH60mt5EKlAGCKWQaI` |

---

### 👤 Admin Configuration Secret (Required)

| Secret Name | Value |
|------------|-------|
| `VITE_ADMIN_EMAIL` | `mmanoorkar9@gmail.com` |

---

### 🖼️ Cloudinary Secrets (Optional)

| Secret Name | Your Value |
|------------|-----------|
| `VITE_CLOUDINARY_CLOUD_NAME` | `dsu1pjwyp` |
| `VITE_CLOUDINARY_API_KEY` | `732156688572294` |
| `VITE_CLOUDINARY_API_SECRET` | `rG_tdKSUcKrbkumDVrZgnXWPIW4` |

---

### 🚀 Vercel Deployment Secrets (For Automated Deployment)

These are needed for GitHub Actions to auto-deploy to Vercel.

#### Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **"Create Token"**
3. Name: `GitHub Actions`
4. Scope: **Full Account**
5. Click **"Create"**
6. **Copy the token immediately** (you won't see it again!)

| Secret Name | Value |
|------------|-------|
| `VERCEL_TOKEN` | `vercel_token_xxxxxxxxxxxxx` |

#### Get Vercel Organization ID

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click **Settings** (in your account, not project)
3. Go to **General** tab
4. Find **"Your ID"** section
5. Copy the Organization ID

| Secret Name | Example Value |
|------------|---------------|
| `VERCEL_ORG_ID` | `team_xxxxxxxxxxxxxxx` |

#### Get Vercel Project ID

1. Go to your Vercel project dashboard
2. Click **"Settings"**
3. Scroll to **"Project ID"**
4. Copy the ID

| Secret Name | Example Value |
|------------|---------------|
| `VERCEL_PROJECT_ID` | `prj_xxxxxxxxxxxxxxx` |

**Note**: You'll only get these after deploying to Vercel once!

---

### 🔥 Firebase Service Account (For Firebase Hosting Deployment)

This is only needed if you want to deploy to Firebase Hosting via GitHub Actions.

#### Get Firebase Service Account JSON

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: **panchjanya-4a344**
3. Click the gear icon ⚙️ → **"Project settings"**
4. Go to **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"**
7. A JSON file will download

#### Add to GitHub Secrets

1. Open the downloaded JSON file
2. Copy the **entire contents**
3. Add as secret: `FIREBASE_SERVICE_ACCOUNT`
4. Paste the entire JSON as the value

---

## 📝 How to Add Each Secret

For **each** secret above:

1. Click **"New repository secret"**
2. **Name**: Enter the secret name exactly as shown (e.g., `VITE_FIREBASE_API_KEY`)
3. **Secret**: Paste the corresponding value
4. Click **"Add secret"**
5. Repeat for all secrets

---

## ✅ Verification Checklist

After adding all secrets, verify you have:

### Required Secrets (12 total)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_MEASUREMENT_ID`
- [ ] `VITE_GOOGLE_MAPS_KEY`
- [ ] `VITE_ADMIN_EMAIL`
- [ ] `VITE_CLOUDINARY_CLOUD_NAME`
- [ ] `VITE_CLOUDINARY_API_KEY`
- [ ] `VITE_CLOUDINARY_API_SECRET`

### Vercel Deployment Secrets (3 total)
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

### Firebase Deployment Secret (1 total - optional)
- [ ] `FIREBASE_SERVICE_ACCOUNT`

---

## 🧪 Test Your Secrets

After adding secrets, test them:

### Method 1: Trigger GitHub Actions

1. Make a small change to your code:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: trigger CI/CD"
   git push origin main
   ```

2. Go to Actions tab: https://github.com/Sakshi443/Panchjanya/actions
3. Watch the workflow run
4. If secrets are correct, build will succeed ✅

### Method 2: Check Workflow Logs

1. Go to **Actions** tab
2. Click on the latest workflow run
3. Click on a job (e.g., "Build and Test")
4. Expand the steps
5. Look for errors related to missing environment variables

---

## 🔧 Update Existing Secrets

To update a secret:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Find the secret you want to update
3. Click the **pencil icon** ✏️
4. Enter the new value
5. Click **"Update secret"**

---

## 🗑️ Remove Secrets

To remove a secret:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Find the secret
3. Click the **trash icon** 🗑️
4. Confirm deletion

---

## 🔒 Security Best Practices

### ✅ DO:
- Use GitHub Secrets for all sensitive data
- Rotate secrets periodically
- Use different secrets for different environments (staging/production)
- Review secrets access regularly

### ❌ DON'T:
- Never hardcode secrets in your code
- Never commit secrets to Git
- Never share secrets in issues or pull requests
- Never log secrets in GitHub Actions

---

## 🚀 What Happens After Setup?

Once secrets are configured:

1. **Every push to `main`**:
   - ✅ CI workflow runs (builds, tests, lints)
   - ✅ Vercel deployment workflow runs
   - ✅ Your app auto-deploys to production

2. **Every pull request**:
   - ✅ CI workflow runs
   - ✅ Preview deployment is created
   - ✅ Status checks appear on PR

3. **Manual deployment**:
   - ✅ You can trigger Firebase deployment
   - ✅ You can re-run any workflow

---

## 📊 Quick Reference: All Secrets

Copy this checklist and paste values from your `.env` file:

```plaintext
# Firebase (Required)
VITE_FIREBASE_API_KEY=AIzaSyBpZeoqbO5Tz-BVBGhCgc-MxQnQRtGSBuY
VITE_FIREBASE_AUTH_DOMAIN=panchjanya-4a344.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=panchjanya-4a344
VITE_FIREBASE_STORAGE_BUCKET=panchjanya-4a344.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1000112706432
VITE_FIREBASE_APP_ID=1:1000112706432:web:13911883dbcc88a0662765
VITE_MEASUREMENT_ID=G-81LF8JEP79

# Google Maps (Required)
VITE_GOOGLE_MAPS_KEY=AIzaSyCcfx9bqWnozV6vGyH60mt5EKlAGCKWQaI

# Admin (Required)
VITE_ADMIN_EMAIL=mmanoorkar9@gmail.com

# Cloudinary (Optional)
VITE_CLOUDINARY_CLOUD_NAME=dsu1pjwyp
VITE_CLOUDINARY_API_KEY=732156688572294
VITE_CLOUDINARY_API_SECRET=rG_tdKSUcKrbkumDVrZgnXWPIW4

# Vercel (Get after deploying to Vercel)
VERCEL_TOKEN=[Get from https://vercel.com/account/tokens]
VERCEL_ORG_ID=[Get from Vercel Settings]
VERCEL_PROJECT_ID=[Get from Vercel Project Settings]

# Firebase Hosting (Optional - for Firebase deployment)
FIREBASE_SERVICE_ACCOUNT=[JSON from Firebase Console]
```

---

## 🆘 Troubleshooting

### "Required secret not found"

**Problem**: Workflow fails with missing secret error

**Solution**:
1. Check secret name matches exactly (case-sensitive)
2. Verify secret was saved (check Secrets page)
3. Secret names should match what's in workflow files

### Build fails after adding secrets

**Problem**: Build works locally but fails on GitHub

**Solution**:
1. Check if all required secrets are added
2. Verify secret values are correct (no extra spaces)
3. Check workflow logs for specific error messages

### Secrets not updating

**Problem**: Changed a secret but workflow still uses old value

**Solution**:
1. GitHub caches secrets - may take a minute to update
2. Re-run the workflow
3. Try a new commit to trigger fresh build

---

## 📞 Need Help?

- **GitHub Secrets Documentation**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Your Repository Secrets**: https://github.com/Sakshi443/Panchjanya/settings/secrets/actions
- **GitHub Support**: https://support.github.com/

---

**Start adding secrets**: https://github.com/Sakshi443/Panchjanya/settings/secrets/actions/new
