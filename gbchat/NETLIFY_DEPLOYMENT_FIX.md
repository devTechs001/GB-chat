# 🚀 Netlify Deployment Troubleshooting Guide

## Issue: 404 Error on gbchat.netlify.app

This means Netlify couldn't find the built files. Follow these steps to fix:

---

## ✅ Step-by-Step Fix

### 1. Check Netlify Site Settings

Go to: **Netlify Dashboard** → **Site Settings** → **Build & deploy**

#### Build Settings
```
Base directory: (leave EMPTY or set to ".")
Build command: cd client && npm install && npm run build
Publish directory: client/dist
```

#### Important: Clear Cached Settings
1. Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
2. Click **Edit settings**
3. **Clear** the "Base directory" field (make sure it's NOT `/opt/build`)
4. Save

---

### 2. Add Environment Variables in Netlify Dashboard

Go to: **Site Settings** → **Environment variables** → **Add a variable**

**REQUIRED:**
```
Key: VITE_API_URL
Value: https://gbchat-enterprise.onrender.com/api
```

```
Key: VITE_SOCKET_URL
Value: https://gbchat-enterprise.onrender.com
```

**Optional:**
```
Key: VITE_ENABLE_DEV_TOOLS
Value: false
```

⚠️ **IMPORTANT:** Environment variables MUST be added in Netlify dashboard, NOT just in netlify.toml

---

### 3. Trigger New Deploy

After making changes:

1. Go to **Deploys** tab
2. Click **Trigger deploy**
3. Select **Clear cache and deploy site**

---

## 🔍 Debug Build Failures

### Check Build Logs

1. Go to **Deploys** tab
2. Click on the latest deploy
3. Review the build log for errors

### Common Build Errors

#### Error: `VITE_API_URL is not defined`
**Fix:** Add environment variables in Netlify dashboard (see Step 2)

#### Error: `Cannot find module`
**Fix:** 
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Error: `Build failed because directory doesn't exist`
**Fix:** Ensure publish directory is `client/dist` (not just `dist`)

---

## 🧪 Test Build Locally

Before deploying, test the build locally:

```bash
cd gbchat/client
npm install
npm run build
ls -la dist/
```

You should see:
```
dist/
├── index.html
├── assets/
├── manifest.json
└── ...
```

If this fails, the Netlify build will also fail.

---

## 📋 Complete Netlify Configuration Checklist

### Repository Settings
- [ ] Repository connected to Netlify
- [ ] Main branch set to `main`
- [ ] Auto-publish enabled

### Build Settings
- [ ] Base directory: EMPTY or "."
- [ ] Build command: `cd client && npm install && npm run build`
- [ ] Publish directory: `client/dist`

### Environment Variables (in Dashboard)
- [ ] `VITE_API_URL` = `https://gbchat-enterprise.onrender.com/api`
- [ ] `VITE_SOCKET_URL` = `https://gbchat-enterprise.onrender.com`

### netlify.toml
- [ ] File exists at repo root
- [ ] No absolute paths (like `/opt/build`)
- [ ] Correct publish directory

---

## 🔧 Alternative: Simplified netlify.toml

If you're still having issues, try this minimal config:

```toml
[build]
  command = "cd client && npm run build"
  publish = "client/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Then set ALL environment variables in Netlify dashboard.

---

## 🆘 Still Not Working?

### Option 1: Manual Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Deploy
netlify deploy --prod
```

### Option 2: Check Render Backend

Make sure your Render backend is running:
1. Go to [render.com](https://render.com)
2. Check if `gbchat-server` is **Running**
3. Test the API: `https://gbchat-enterprise.onrender.com/api/health`

### Option 3: Create New Netlify Site

Sometimes it's easier to start fresh:
1. Disconnect current site
2. Create new site from GitHub
3. Add environment variables
3. Deploy

---

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Netlify Support Forum**: https://answers.netlify.com
- **Build Logs**: Check in Netlify Dashboard → Deploys → Latest deploy

---

## ✅ Verification After Deploy

Once deployed successfully:

1. Visit: https://gbchat.netlify.app
2. Should see login/register page
3. Open browser console (F12)
4. No 404 errors
5. API calls should go to Render backend

---

**Last Updated:** March 2026
**Netlify Site:** gbchat
**Build Command:** `cd client && npm install && npm run build`
**Publish Directory:** `client/dist`
