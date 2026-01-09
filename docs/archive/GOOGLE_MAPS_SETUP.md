# 🗺️ Google Maps API Key Setup Guide

## Current Issue
**Error**: "This page can't load Google Maps correctly. Do you own this website?"

This error occurs when:
1. The API key is invalid or expired
2. The required Google Maps APIs are not enabled
3. Billing is not set up on the Google Cloud project
4. The API key has domain restrictions that don't match localhost

---

## ✅ Solution: Fix Google Maps API Key

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Enable Required APIs

Enable these APIs in your project:

1. Go to **APIs & Services** → **Library**
2. Search for and enable the following:
   - ✅ **Maps JavaScript API** (Required)
   - ✅ **Geocoding API** (Optional but recommended)
   - ✅ **Places API** (Optional)
   - ✅ **Directions API** (Optional)

**Direct link**: https://console.cloud.google.com/apis/library

### Step 3: Create/Update API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the generated API key
4. Click **Edit API key** to configure restrictions

**Direct link**: https://console.cloud.google.com/apis/credentials

### Step 4: Configure API Key Restrictions

#### Application Restrictions
- Select **HTTP referrers (web sites)**
- Add these referrers:
  ```
  http://localhost:*
  http://127.0.0.1:*
  http://localhost:8080/*
  http://localhost:5173/*
  https://yourdomain.com/*  (add your production domain)
  ```

#### API Restrictions
- Select **Restrict key**
- Choose:
  - Maps JavaScript API
  - Geocoding API
  - Places API
  - Directions API

### Step 5: Enable Billing

⚠️ **Important**: Google Maps requires billing to be enabled (even for free tier)

1. Go to **Billing** in Google Cloud Console
2. Link a billing account (you get $200 free credit monthly)
3. Google Maps offers:
   - 28,000 map loads per month FREE
   - $200 monthly credit
   - You won't be charged unless you exceed free tier

**Direct link**: https://console.cloud.google.com/billing

### Step 6: Update Your .env File

Replace the API key in your `.env` file:

```env
VITE_GOOGLE_MAPS_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 7: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

---

## 🔄 Alternative Solution: Use Leaflet (No API Key Required)

If you want to avoid Google Maps API setup, you can use Leaflet with OpenStreetMap (free, no API key needed).

### Benefits of Leaflet:
- ✅ No API key required
- ✅ No billing setup needed
- ✅ Free and open-source
- ✅ Already installed in your project

I can create a Leaflet version of the map component if you prefer this option.

---

## 🧪 Test Your API Key

After setting up, test if your API key works:

1. Visit: `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY`
2. You should see JavaScript code (not an error)

Or use this test page:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Google Maps Test</title>
    <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
</head>
<body>
    <div id="map" style="height: 400px; width: 100%;"></div>
    <script>
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 19.076, lng: 72.8777 },
            zoom: 10
        });
    </script>
</body>
</html>
```

---

## 📋 Troubleshooting Checklist

- [ ] Google Cloud project created
- [ ] Maps JavaScript API enabled
- [ ] Billing account linked (required!)
- [ ] API key created
- [ ] API key restrictions configured for localhost
- [ ] API key copied to `.env` file
- [ ] Development server restarted
- [ ] Browser cache cleared

---

## 🆘 Common Errors & Solutions

### Error: "This page can't load Google Maps correctly"
**Solution**: Enable billing on your Google Cloud project

### Error: "ApiNotActivatedMapError"
**Solution**: Enable Maps JavaScript API in Google Cloud Console

### Error: "RefererNotAllowedMapError"
**Solution**: Add `http://localhost:*` to API key restrictions

### Error: "InvalidKeyMapError"
**Solution**: Check if API key is copied correctly to `.env` file

---

## 💰 Pricing Information

**Google Maps Free Tier** (Monthly):
- 28,000 map loads: **FREE**
- $200 credit: **FREE**
- Pay only if you exceed free tier

**Typical Usage for Small Apps**:
- Development: Well within free tier
- Small production apps: Usually free
- You'll get email alerts before any charges

---

## 🔗 Helpful Links

- [Google Maps Platform](https://developers.google.com/maps)
- [Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

---

## Next Steps

**Choose one option:**

### Option A: Fix Google Maps (Recommended for production)
1. Follow the steps above to set up Google Maps API
2. Update your `.env` file with the new API key
3. Restart the dev server

### Option B: Switch to Leaflet (Quick fix, no API key)
1. Let me know and I'll create a Leaflet version
2. No API key or billing setup needed
3. Works immediately

---

**Which option would you like to proceed with?**
