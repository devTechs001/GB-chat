# 🚀 Deploy GBChat to Render - Quick Start

This is your **one-stop guide** to deploy GBChat server to Render.

---

## ⚡ 3-Minute Deploy

### Prerequisites (Do this once)

1. **MongoDB Atlas** (5 min setup)
   - Go to https://cloud.mongodb.com
   - Create free cluster
   - Create database user
   - Get connection string
   - Whitelist IP: `0.0.0.0/0`

2. **Cloudinary** (2 min setup)
   - Go to https://cloudinary.com
   - Sign up (free)
   - Get: Cloud Name, API Key, API Secret

3. **Gmail App Password** (3 min setup)
   - Enable 2FA on Gmail
   - Generate App Password
   - Copy the 16-character password

---

## 📦 Deploy to Render

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Connect to Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. Click **Apply**

### Step 3: Add Environment Variables

In Render Dashboard → Environment tab, add:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gbchat

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (Netlify)
CLIENT_URL=https://gbchat.netlify.app
CORS_ORIGIN=https://gbchat.netlify.app

# Email (for recovery)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Step 4: Wait for Deploy

- Build takes ~2-3 minutes
- Watch logs in Render Dashboard
- Once done, you'll see: `🚀 GBChat server running on port 5000`

---

## ✅ Verify Deployment

### Test 1: Health Check

```bash
curl https://gbchat-server.onrender.com/api/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Test 2: Create Account

Visit: `https://gbchat.netlify.app`

Try registering a new account. If it works, deployment is successful! 🎉

---

## 🔧 Common Issues

### "Cannot connect to database"

**Fix:**
1. Check MONGODB_URI is correct
2. Verify MongoDB Atlas IP whitelist: `0.0.0.0/0`
3. Ensure cluster is not paused

### "CORS error"

**Fix:**
Set these in Render environment:
```
CLIENT_URL=https://gbchat.netlify.app
CORS_ORIGIN=https://gbchat.netlify.app
```

### "Build failed"

**Check:**
- Root Directory is `server`
- Build Command is `npm install`
- Start Command is `node index.js`

### "Server sleeps after 15 minutes"

**Solution:** Upgrade to Starter plan ($7/month) in Render Dashboard

---

## 📊 Environment Variables Reference

| Variable | Where to Get | Example |
|----------|--------------|---------|
| `MONGODB_URI` | MongoDB Atlas | `mongodb+srv://user:pass@cluster...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | `dxxxxx` |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard | `abc123...` |
| `CLIENT_URL` | Your Netlify URL | `https://gbchat.netlify.app` |
| `CORS_ORIGIN` | Same as CLIENT_URL | `https://gbchat.netlify.app` |
| `EMAIL_USER` | Your Gmail | `you@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `abcd1234...` |

---

## 🎯 What's Deployed

✅ **Server API** - `https://gbchat-server.onrender.com`
- All API endpoints
- Socket.IO for real-time
- File uploads to Cloudinary
- Email notifications
- Backup & Recovery
- Permissions management

✅ **Frontend** - `https://gbchat.netlify.app` (already deployed)
- React app
- Connects to Render backend

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Render Server | ✅ Free (sleeps) | $7/mo (no sleep) |
| MongoDB Atlas | ✅ 512 MB | $9/mo (M10) |
| Cloudinary | ✅ 25 GB | $89/mo (Plus) |
| Netlify | ✅ Free | $19/mo (Pro) |
| **Total** | **$0/mo** | **$7-115/mo** |

**Recommendation:** Start with free tier, upgrade as needed.

---

## 📈 Next Steps

1. **Test all features:**
   - Register/Login
   - Send messages
   - Upload images
   - Test real-time chat

2. **Set up monitoring:**
   - Check Render logs daily
   - Monitor MongoDB size
   - Track Cloudinary usage

3. **Configure domain (optional):**
   - Buy custom domain
   - Connect to Render
   - Update CLIENT_URL

4. **Enable backups:**
   - MongoDB Atlas automatic backups
   - Cloudinary backup settings

---

## 📞 Need Help?

- **Render Docs:** https://render.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **Full Guide:** See `docs/RENDER_SERVER_DEPLOYMENT.md`
- **Checklist:** See `docs/DEPLOYMENT_CHECKLIST.md`

---

## 🎉 Success!

If you see the health check response and can login, **you're deployed!** 🚀

Your GBChat server is now running 24/7 on Render.

---

**Last Updated:** March 2026
