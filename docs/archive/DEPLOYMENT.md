# 🚀 Deployment Guide

This guide will walk you through deploying the Panchjanya Temple Wander Guide to various platforms.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ All environment variables properly configured
- ✅ Firebase project set up with Firestore and Authentication enabled
- ✅ Google Maps API key with necessary APIs enabled
- ✅ Cloudinary account (optional, for image uploads)
- ✅ **NO sensitive credentials in your code** (they should only be in `.env` which is gitignored)

---

## 🌐 Deploying to Vercel (Recommended)

Vercel offers seamless deployment for Vite applications with automatic builds and HTTPS.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No (first deployment)
- **Project name**: panchjanya (or your preferred name)
- **Directory**: `./` (current directory)
- **Override settings**: No

### Step 4: Configure Environment Variables

Go to your Vercel dashboard:
1. Navigate to your project
2. Go to **Settings** → **Environment Variables**
3. Add all variables from your `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_MEASUREMENT_ID`
   - `VITE_GOOGLE_MAPS_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_CLOUDINARY_CLOUD_NAME` (if using Cloudinary)
   - `VITE_CLOUDINARY_API_KEY` (if using Cloudinary)
   - `VITE_CLOUDINARY_API_SECRET` (if using Cloudinary)

### Step 5: Redeploy

```bash
vercel --prod
```

Your app will be live at: `https://your-project-name.vercel.app`

---

## 🔥 Deploying to Firebase Hosting

Firebase Hosting is a great option since you're already using Firebase for backend services.

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Hosting

```bash
firebase init hosting
```

Select:
- **Project**: Choose your existing Firebase project
- **Public directory**: `dist`
- **Single-page app**: Yes
- **Automatic builds**: No (we'll build manually)

### Step 4: Build Your Application

```bash
npm run build
```

### Step 5: Deploy

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

---

## 📦 Deploying to Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Deploy

```bash
netlify deploy --prod
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Your team
- **Site name**: panchjanya (or your preferred name)
- **Publish directory**: `dist`

### Step 4: Set Environment Variables

Go to your Netlify dashboard:
1. Navigate to your site
2. Go to **Site settings** → **Environment variables**
3. Add all variables from your `.env` file

### Step 5: Rebuild

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Build and Run

```bash
docker build -t panchjanya .
docker run -p 8080:80 panchjanya
```

---

## 🔒 Post-Deployment Security Checklist

After deployment, verify:

- [ ] All environment variables are set correctly in your hosting platform
- [ ] Firebase security rules are applied and restrictive
- [ ] Google Maps API key is restricted to your domain
- [ ] HTTPS is enabled (most platforms do this automatically)
- [ ] Firebase App Check is enabled (recommended for production)
- [ ] No `.env` files are committed to your repository
- [ ] No Firebase service account keys are in your repository

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build fails during deployment

**Solutions**:
1. Check that all dependencies are in `package.json`
2. Ensure Node.js version compatibility (use v18+)
3. Run `npm run build` locally to identify issues

### Blank Page After Deployment

**Problem**: Deployment succeeds but shows blank page

**Solutions**:
1. Check browser console for errors
2. Verify all environment variables are set in hosting platform
3. Check that base path is correct in `vite.config.ts`
4. Ensure routing is configured for single-page apps

### Firebase Connection Errors

**Problem**: App can't connect to Firebase

**Solutions**:
1. Verify all Firebase environment variables are set
2. Check Firebase project security rules
3. Ensure Firebase project is on the Blaze (pay-as-you-go) plan if needed

### Map Not Loading

**Problem**: Google Maps not showing

**Solutions**:
1. Verify `VITE_GOOGLE_MAPS_KEY` is set
2. Check API key restrictions in Google Cloud Console
3. Ensure Maps JavaScript API is enabled
4. Check if billing is enabled on Google Cloud project

---

## 📊 Monitoring

### Vercel Analytics
Enable in your Vercel dashboard under **Analytics** tab

### Firebase Analytics
Already configured in your Firebase project

### Sentry (Optional)
For error tracking, consider adding Sentry:

```bash
npm install @sentry/react @sentry/vite-plugin
```

---

## 🔄 Continuous Deployment

### GitHub Actions for Vercel

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📞 Need Help?

- Visit the [Vercel Documentation](https://vercel.com/docs)
- Check [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- Open an issue on GitHub: https://github.com/Sakshi443/Panchjanya/issues

---

**Made with ❤️ for the Panchjanya Temple Wander Guide**
