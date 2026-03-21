# GBChat Deployment Guide

Complete guide for deploying GBChat to Render (or any cloud platform).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Render Configuration](#render-configuration)
3. [Environment Variables](#environment-variables)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **GitHub** - For code repository
2. **Render** - For hosting (https://render.com)
3. **MongoDB Atlas** - For database (https://cloud.mongodb.com)
4. **Cloudinary** - For media storage (https://cloudinary.com)
5. **Netlify** - For frontend hosting (optional, if not using Render static sites)

### Required Software

- Node.js 18+ 
- npm or yarn
- Git

---

## Render Configuration

### File: `render.yaml`

The `render.yaml` file in the root directory defines all Render services:

```yaml
services:
  # Backend API Server
  - type: web
    name: gbchat-server
    env: node
    region: oregon
    plan: starter
    branch: main
    rootDir: server
    buildCommand: npm install
    startCommand: node index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
    disk:
      name: uploads
      mountPath: /opt/render/project/src/uploads
      sizeGB: 1

  # Frontend Client
  - type: web
    name: gbchat-client
    env: static
    region: oregon
    plan: starter
    branch: main
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        sync: false
      - key: VITE_SOCKET_URL
        sync: false

  # Redis (optional, for sessions and caching)
  - type: redis
    name: gbchat-redis
    region: oregon
    plan: starter
    maxmemoryPolicy: noeviction
```

---

## Environment Variables

### Server Environment Variables

Create a `.env` file in the `server/` directory or add these in Render dashboard:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=production
PORT=5000

# ============================================
# DATABASE
# ============================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gbchat-enterprise

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# ============================================
# FILE STORAGE (Cloudinary)
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# CORS & CLIENT
# ============================================
CLIENT_URL=https://gbchat.netlify.app
CORS_ORIGIN=https://gbchat.netlify.app

# ============================================
# EMAIL SERVICE (for recovery & notifications)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client Environment Variables

Create a `.env` file in the `client/` directory:

```bash
# API URL (your Render backend URL)
VITE_API_URL=https://gbchat-server.onrender.com/api

# Socket URL (for real-time features)
VITE_SOCKET_URL=https://gbchat-server.onrender.com
```

---

## Deployment Steps

### Step 1: Prepare MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user
4. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gbchat-enterprise
   ```
5. Replace `<username>` and `<password>` with your credentials
6. Whitelist `0.0.0.0/0` (all IPs) for Render access

### Step 2: Setup Cloudinary

1. Go to https://cloudinary.com
2. Sign up for free account
3. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Setup Email (Gmail)

1. Enable 2FA on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security
   - App passwords → Generate
   - Copy the 16-character password
3. Use this password in `EMAIL_PASS`

### Step 4: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. In Render Dashboard:
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select `render.yaml` configuration file
   - Click "Apply"

3. Render will automatically create all services

#### Option B: Manual Setup

**Backend:**

1. Render Dashboard → New Web Service
2. Connect GitHub repository
3. Configure:
   - **Name:** `gbchat-server`
   - **Region:** Oregon (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance Type:** Free or Starter ($7/mo)

4. Add environment variables (copy from `.env` above)

5. Add persistent disk:
   - Name: `uploads`
   - Mount Path: `/opt/render/project/src/uploads`
   - Size: 1 GB

**Frontend:**

1. Render Dashboard → New Static Site
2. Connect GitHub repository
3. Configure:
   - **Name:** `gbchat-client`
   - **Branch:** `main`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add environment variables:
   - `VITE_API_URL`: Your backend URL
   - `VITE_SOCKET_URL`: Your backend URL

### Step 5: Configure CORS

In your backend environment variables, set:

```bash
CLIENT_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

Replace with your actual frontend URL (Netlify or Render static site).

### Step 6: Update Frontend API URLs

In client `.env` or environment variables:

```bash
VITE_API_URL=https://gbchat-server.onrender.com/api
VITE_SOCKET_URL=https://gbchat-server.onrender.com
```

---

## Post-Deployment

### 1. Verify Deployment

Check if services are running:

```bash
# Backend health check
curl https://gbchat-server.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. Test Authentication

1. Visit your frontend URL
2. Try to register a new account
3. Verify login works
4. Check browser console for errors

### 3. Test Real-time Features

1. Open app in two different browsers
2. Send a message
3. Verify it appears in real-time
4. Check Socket.IO connection in network tab

### 4. Test File Uploads

1. Try uploading a profile picture
2. Verify it appears in Cloudinary dashboard
3. Check image displays correctly

### 5. Setup Custom Domain (Optional)

**Render:**

1. Go to service dashboard
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Add your domain
5. Update DNS records as instructed

**Netlify:**

1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Check logs:**
```bash
# In Render dashboard → Logs
```

**Common fixes:**
- Verify `MONGODB_URI` is correct
- Check `PORT` is set to 5000
- Ensure all dependencies are installed
- Check Node.js version compatibility

#### 2. CORS Errors

**Symptoms:** Frontend can't connect to backend

**Fix:**
```bash
# In backend .env
CLIENT_URL=https://your-frontend-url.com
CORS_ORIGIN=https://your-frontend-url.com
```

#### 3. Database Connection Failed

**Symptoms:** "MongoDB connection error"

**Fixes:**
- Verify MongoDB Atlas credentials
- Check IP whitelist includes `0.0.0.0/0`
- Ensure cluster is not paused
- Check connection string format

#### 4. File Uploads Fail

**Symptoms:** Images don't upload

**Fixes:**
- Verify Cloudinary credentials
- Check disk space on Render
- Ensure uploads folder has write permissions
- Check file size limits

#### 5. Socket.IO Connection Fails

**Symptoms:** Real-time features don't work

**Fixes:**
- Verify `VITE_SOCKET_URL` is correct
- Check WebSocket support in Render
- Ensure CORS allows WebSocket connections
- Check firewall/proxy settings

#### 6. Email Not Sending

**Symptoms:** Recovery emails don't arrive

**Fixes:**
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled on Gmail
- Verify SMTP settings
- Check spam folder

### Render-Specific Issues

#### Free Tier Limitations

- **Web services sleep after 15 minutes** of inactivity
- First request after sleep takes 30-60 seconds to wake up
- **Solution:** Upgrade to Starter plan ($7/mo) or use uptime monitoring

#### Build Failures

**Check:**
- `rootDir` is set correctly in `render.yaml`
- Build command is correct
- All dependencies are in `package.json`
- No syntax errors in code

#### Disk Space Issues

**Monitor:**
- Dashboard shows disk usage
- Default is 1 GB for free tier
- Clean up old uploads if needed

### Performance Optimization

#### 1. Enable Caching

Use Redis for session storage and caching:

```bash
# In render.yaml
- type: redis
  name: gbchat-redis
  region: oregon
  plan: starter
```

#### 2. Database Indexing

Ensure proper indexes in MongoDB:

```javascript
// Example indexes
userSchema.index({ email: 1 });
chatSchema.index({ participants: 1 });
messageSchema.index({ chat: 1, createdAt: -1 });
```

#### 3. CDN for Static Assets

Use Cloudinary or Cloudflare CDN for:
- Profile pictures
- Chat media
- Static assets

---

## Monitoring

### Render Dashboard

- **Logs:** Real-time application logs
- **Metrics:** CPU, memory, disk usage
- **Requests:** HTTP request count and latency

### MongoDB Atlas

- **Performance:** Query performance metrics
- **Storage:** Database size
- **Connections:** Active connections

### Cloudinary

- **Usage:** Bandwidth and storage
- **Transformations:** Image optimization stats

---

## Cost Estimation

### Free Tier

- **Render Backend:** Free (with sleep)
- **Render Frontend:** Free
- **MongoDB Atlas:** Free (512 MB)
- **Cloudinary:** Free (25 GB storage, 25 GB bandwidth)
- **Total:** $0/month

### Starter Tier (Recommended)

- **Render Backend:** $7/month
- **Render Frontend:** Free
- **MongoDB Atlas:** Free
- **Cloudinary:** Free
- **Redis:** $7/month (optional)
- **Total:** $7-14/month

### Production Tier

- **Render Backend:** $25/month (2 GB RAM)
- **Render Frontend:** $19/month (Pro plan)
- **MongoDB Atlas:** $9/month (M10)
- **Cloudinary:** $89/month (Plus plan)
- **Redis:** $25/month
- **Total:** ~$167/month

---

## Security Checklist

- [ ] All environment variables set
- [ ] MongoDB IP whitelist configured
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Render)
- [ ] JWT secret is strong and unique
- [ ] Email 2FA enabled for admin accounts
- [ ] Regular backups enabled
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Monitoring setup

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Socket.IO Docs:** https://socket.io/docs

---

## Last Updated

March 2026
