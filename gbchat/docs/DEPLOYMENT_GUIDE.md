# 🚀 GBChat Deployment Guide

## Overview
This guide walks you through deploying GBChat to Netlify (frontend) and Render (backend).

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Netlify account (free at netlify.com)
- [ ] Render account (free at render.com)
- [ ] MongoDB Atlas account (free at mongodb.com/cloud/atlas)
- [ ] Cloudinary account (free at cloudinary.com)

---

## 🗄️ Step 1: MongoDB Atlas Setup

1. **Create Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster (M0)
   - Choose region closest to you

2. **Create Database User:**
   - Database Access → Add New Database User
   - Username: `gbchat_admin`
   - Password: (generate strong password, save it!)
   - Role: Read and write to any database

3. **Whitelist IP:**
   - Network Access → Add IP Address
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to Render's IP later

4. **Get Connection String:**
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your actual password
   - Save for Render deployment

---

## ☁️ Step 2: Cloudinary Setup

1. **Create Account:**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for free account

2. **Get Credentials:**
   - Dashboard → Settings
   - Copy these values:
     - Cloud Name
     - API Key
     - API Secret (save securely!)

---

## 🔧 Step 3: Render Deployment (Backend)

### 3.1 Create Web Service

1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - New → Web Service
   - Connect your GitHub repository
   - Select repository: `wastapp-clone`

2. **Configure Service:**
   ```
   Name: gbchat-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: gbchat
   Runtime: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   Instance Type: Free
   ```

3. **Add Environment Variables:**
   - Go to Environment tab
   - Copy values from `.env.render` file
   - **CRITICAL VARIABLES:**
     ```
     MONGODB_URI=your_actual_mongodb_connection_string
     JWT_SECRET=generate_random_32_char_string
     CLIENT_URL=https://your-site-name.netlify.app
     CORS_ORIGIN=https://your-site-name.netlify.app
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your Render URL (e.g., `gbchat-backend-xyz.onrender.com`)

---

## 🎨 Step 4: Netlify Deployment (Frontend)

### 4.1 Connect Repository

1. **Add to Netlify:**
   - Go to [Netlify](https://app.netlify.com)
   - Add new site → Import an existing project
   - Connect to GitHub
   - Select repository: `wastapp-clone`

2. **Configure Build:**
   ```
   Base directory: gbchat
   Build command: cd client && npm install && npm run build
   Publish directory: gbchat/client/dist
   ```

3. **Add Environment Variables:**
   - Go to Site settings → Environment variables
   - Copy values from `.env.netlify` file
   - **CRITICAL VARIABLES:**
     ```
     VITE_API_URL=https://your-render-backend-url.onrender.com
     VITE_WS_URL=wss://your-render-backend-url.onrender.com
     VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
     VITE_CLOUDINARY_API_KEY=your_api_key
     ```

4. **Deploy:**
   - Click "Deploy site"
   - Wait for deployment (3-5 minutes)
   - Your site is live! (e.g., `https://your-site-name.netlify.app`)

---

## 🔗 Step 5: Connect Frontend & Backend

1. **Update CORS on Render:**
   - Go to Render dashboard
   - Update `CLIENT_URL` and `CORS_ORIGIN` with your Netlify URL
   - Manual deploy to apply changes

2. **Test Connection:**
   - Visit your Netlify URL
   - Try to register/login
   - Check browser console for errors

---

## 🔒 Step 6: Security Hardening

### Update MongoDB IP Whitelist

1. Get Render's IP from Render dashboard
2. Update MongoDB Network Access:
   - Remove 0.0.0.0/0
   - Add Render's specific IP

### Enable Secret Scanning

1. GitHub → Settings → Security & analysis
2. Enable secret scanning
3. Enable push protection

### Rotate Secrets

After initial deployment, rotate these:
- JWT_SECRET
- MongoDB password
- Cloudinary API secret

---

## ✅ Step 7: Testing Checklist

### Frontend (Netlify)
- [ ] Site loads without errors
- [ ] Registration works
- [ ] Login works
- [ ] Can send messages
- [ ] Can upload images
- [ ] Stories page loads
- [ ] Groups page loads
- [ ] Channels page loads

### Backend (Render)
- [ ] API responds (check logs)
- [ ] WebSocket connections work
- [ ] File uploads work
- [ ] Database queries work
- [ ] No error logs

### Integration
- [ ] Real-time messaging works
- [ ] Images upload to Cloudinary
- [ ] User authentication works
- [ ] Protected routes work

---

## 🔧 Troubleshooting

### Frontend Issues

**Problem:** Site shows blank page
```
Solution: Check browser console for errors
- Missing environment variables?
- Wrong API URL?
```

**Problem:** "Cannot GET /" error
```
Solution: Check publish directory
- Should be: gbchat/client/dist
- Verify build completed successfully
```

### Backend Issues

**Problem:** Connection timeout
```
Solution: Check MongoDB connection
- Verify connection string
- Check IP whitelist
- Ensure cluster is running
```

**Problem:** CORS errors
```
Solution: Update CORS settings
- CLIENT_URL must match Netlify domain exactly
- Include https://
- Redeploy to apply changes
```

**Problem:** File upload fails
```
Solution: Check Cloudinary credentials
- Verify all 3 Cloudinary values
- Check Cloudinary dashboard for errors
```

---

## 📊 Monitoring

### Netlify
- Dashboard → Site overview
- Check deploy logs
- Monitor bandwidth usage

### Render
- Dashboard → Your service
- Check logs tab
- Monitor CPU/RAM usage
- Set up alerts

### MongoDB Atlas
- Clusters → Metrics
- Monitor connections
- Check storage usage

---

## 🔄 Updates & Maintenance

### Deploying Updates

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Auto-Deploy:**
   - Netlify automatically deploys on push
   - Render automatically deploys on push
   - Check deploy logs for errors

### Regular Maintenance

- **Weekly:** Check error logs
- **Monthly:** Update dependencies
- **Quarterly:** Rotate secrets
- **As needed:** Monitor usage limits

---

## 💰 Cost Management

### Free Tier Limits

**Netlify Free:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**Render Free:**
- 750 hours/month (one instance)
- 100GB bandwidth/month
- Auto-sleep after 15 min inactivity

**MongoDB Free:**
- 512MB storage
- Shared RAM
- Shared vCPU

**Cloudinary Free:**
- 25GB storage
- 25GB bandwidth/month
- 25,000 transformations/month

### Upgrade When

- Need more bandwidth
- Need custom domain
- Need no auto-sleep
- Need more storage

---

## 📝 Environment Variables Quick Reference

### Netlify (Client-side)
```bash
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
```

### Render (Server-side)
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gbchat
JWT_SECRET=your-32-char-random-secret
CLIENT_URL=https://your-site.netlify.app
CORS_ORIGIN=https://your-site.netlify.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🎯 Post-Deployment Tasks

1. **Custom Domain (Optional):**
   - Netlify: Domain settings → Add custom domain
   - Render: Settings → Custom domain

2. **SSL Certificate:**
   - Automatic on both platforms
   - Verify HTTPS works

3. **Analytics:**
   - Add Google Analytics tracking ID
   - Monitor user engagement

4. **Error Tracking:**
   - Set up Sentry for error monitoring
   - Configure alerts

5. **Backup Strategy:**
   - MongoDB: Enable continuous backups
   - Cloudinary: Download important media

---

## 🆘 Support Resources

- **Netlify Docs:** docs.netlify.com
- **Render Docs:** render.com/docs
- **MongoDB Docs:** docs.mongodb.com
- **Cloudinary Docs:** cloudinary.com/documentation

---

## ✨ Success Indicators

You know deployment is successful when:
- ✅ Netlify shows "Published"
- ✅ Render shows "Live"
- ✅ Site loads via HTTPS
- ✅ Can register and login
- ✅ Messages send in real-time
- ✅ Images upload successfully
- ✅ No console errors

---

**Deployment Time:** 30-45 minutes (first time)  
**Difficulty:** Intermediate  
**Cost:** $0 (free tiers)

**Need Help?** Check the troubleshooting section or review deployment logs!
