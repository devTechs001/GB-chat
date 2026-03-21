# PWA Installation Setup Guide

## 📱 Install GBChat as a Native App

GBChat now supports **Progressive Web App (PWA)** installation, allowing you to install it on your device like a native app.

---

## ✅ What's Been Added

### Files Created:
1. **`src/hooks/useInstallPWA.js`** - Hook for PWA installation logic
2. **`src/components/common/InstallPrompt.jsx`** - Beautiful install prompt UI
3. **`src/components/common/ServiceWorkerRegistration.jsx`** - Service worker registration
4. **`public/sw.js`** - Service worker for offline support
5. **`public/icons/`** - App icons directory

### Files Updated:
1. **`App.jsx`** - Added PWA components
2. **`index.html`** - Added iOS PWA meta tags
3. **`public/manifest.json`** - Enhanced with more icon sizes

---

## 🚀 How to Install

### **Android / Chrome:**
1. Open GBChat in Chrome
2. When you see the install prompt, tap **"Install Now"**
3. Or tap the **menu (⋮)** → **"Install app"**
4. GBChat will be installed to your home screen

### **iOS / Safari:**
1. Open GBChat in Safari
2. Tap the **Share** button (📤)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right corner
5. GBChat icon will appear on your home screen

### **Desktop (Chrome/Edge):**
1. Look for the install icon in the address bar
2. Click **"Install"**
3. GBChat will open in its own window

---

## 🎨 Generating App Icons

You need PNG icons in multiple sizes. Here's how to generate them:

### Option 1: Use an Online Generator
1. Go to [PWA Icon Generator](https://www.pwa-icon.com/)
2. Upload your logo (512x512 recommended)
3. Download all sizes
4. Place in `client/public/icons/`

### Option 2: Use Node Script
```bash
npm install -g sharp
```

Create `generate-icons.js`:
```javascript
import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const input = 'public/icons/icon.svg';

await mkdir('public/icons', { recursive: true });

for (const size of sizes) {
  await sharp(input)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}
```

Run: `node generate-icons.js`

### Option 3: Temporary Placeholder
For testing, the app will work with just the SVG favicon.

---

## 🔧 Service Worker Features

The service worker (`public/sw.js`) provides:

- ✅ **Offline caching** - App works without internet
- ✅ **Background sync** - Messages sync when back online
- ✅ **Push notifications** - Real-time message alerts
- ✅ **Auto-update** - New versions install automatically

---

## 🧪 Testing PWA

### Chrome DevTools:
1. Open DevTools → **Application** tab
2. Check **Manifest** - Should show app info
3. Check **Service Workers** - Should be registered
4. Use **Lighthouse** for PWA audit

### Test Offline Mode:
1. Open app
2. Go offline (DevTools → Network → Offline)
3. App should still load cached pages

---

## 📊 Installation Events

The app tracks:
- `beforeinstallprompt` - Fired when install is available
- `appinstalled` - Fired after successful installation
- `ios-install-prompt-seen` - localStorage flag for iOS

---

## 🔒 Security Notes

- Service worker only works on **HTTPS** (or localhost)
- Ensure your production server serves over HTTPS
- The manifest requires same-origin icons

---

## 🐛 Troubleshooting

### Install prompt not showing?
- Make sure you're on **HTTPS** (or localhost)
- Check browser console for errors
- Ensure manifest.json is valid
- Verify service worker is registered

### iOS not showing add button?
- iOS requires **HTTPS**
- Make sure all meta tags are present
- Test on actual device (simulator may differ)

### Offline not working?
- Check service worker registration
- Verify cache in DevTools → Application
- Ensure resources are cached properly

---

## 📈 Next Steps

1. **Generate proper icons** for all sizes
2. **Test on real devices** (Android & iOS)
3. **Configure push notifications** backend
4. **Add screenshot** to manifest
5. **Submit to stores** (optional - PWA can be distributed directly)

---

## 🎯 Benefits of PWA

- ✅ No app store required
- ✅ Automatic updates
- ✅ Works offline
- ✅ Small size (< 1MB vs 50MB+)
- ✅ Cross-platform
- ✅ Link sharing (just share URL)
- ✅ SEO friendly

---

**GBChat PWA v1.0.0** - Install today! 📱✨
