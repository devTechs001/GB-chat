# Deployment Quick Reference

Quick reference guide for deploying GBChat.

---

## 🚀 Quick Deploy

### 1. Backend (Render)

**Service URL:** https://gb-chat-backend.onrender.com

**Configuration:**
- **Root Directory:** `gbchat/server`
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Port:** 5000

**Environment Variables:**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=https://devtechs001.github.io/GB-chat
CORS_ORIGIN=https://devtechs001.github.io/GB-chat
```

### 2. Frontend (GitHub Pages)

**URL:** https://devtechs001.github.io/GB-chat

**Deploy Command:**
```bash
cd gbchat/client
npm install
npm run deploy
```

**Environment Variables (in Vite config):**
```javascript
// vite.config.js
base: "/GB-chat/"

// Build env vars
VITE_API_URL=https://gb-chat-backend.onrender.com/api
VITE_SOCKET_URL=https://gb-chat-backend.onrender.com
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Cloudinary account set up
- [ ] Gmail app password generated (for email)
- [ ] All `.env` files configured
- [ ] Dependencies installed (`npm install`)
- [ ] Build tested locally

### Backend Deployment
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] `render.yaml` configured
- [ ] All environment variables set
- [ ] Build completes successfully
- [ ] Health endpoint responds: `/api/health`

### Frontend Deployment
- [ ] GitHub Pages enabled
- [ ] gh-pages branch created
- [ ] Build completes without errors
- [ ] Frontend loads correctly
- [ ] API calls work (check CORS)

### Post-Deployment
- [ ] Register new user works
- [ ] Login works
- [ ] Real-time messaging works (Socket.IO)
- [ ] File uploads work (Cloudinary)
- [ ] Email sending works (Nodemailer)
- [ ] All features tested

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** `Cannot find package 'nodemailer'`
```bash
# Solution: Add to gbchat/server/package.json
"nodemailer": "^8.0.1"
```

**Problem:** CORS errors
```bash
# Solution: Set correct CLIENT_URL and CORS_ORIGIN
CLIENT_URL=https://devtechs001.github.io/GB-chat
CORS_ORIGIN=https://devtechs001.github.io/GB-chat
```

**Problem:** MongoDB connection failed
```bash
# Solution: Check MongoDB URI format
mongodb+srv://username:password@cluster.mongodb.net/gbchat?retryWrites=true&w=majority
```

**Problem:** Port already in use
```bash
# Solution: Use PORT environment variable
PORT=5000
```

### Frontend Issues

**Problem:** 404 on refresh
```bash
# Solution: Set correct base path in vite.config.js
# For Netlify (root domain):
base: "/"

# For GitHub Pages (subfolder):
base: "/GB-chat/"
```

**Problem:** API calls fail
```bash
# Solution: Check VITE_API_URL
VITE_API_URL=https://gb-chat-backend.onrender.com/api
```

**Problem:** WebSocket connection failed
```bash
# Solution: Check VITE_SOCKET_URL
VITE_SOCKET_URL=https://gb-chat-backend.onrender.com
```

---

## 📊 Testing Endpoints

### Health Check
```bash
curl https://gb-chat-backend.onrender.com/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Register Test User
```bash
curl -X POST https://gb-chat-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login Test
```bash
curl -X POST https://gb-chat-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is 32+ characters
- [ ] BCRYPT_ROUNDS is 12 or higher
- [ ] MongoDB password is strong
- [ ] Cloudinary credentials are secure
- [ ] Email app password (not main password)
- [ ] CORS configured for production URL only
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all endpoints
- [ ] File upload size limits set

---

## 💰 Cost Estimation

### Free Tier (Development)
- **Render:** $0 (Starter plan, 750 hours/month)
- **MongoDB Atlas:** $0 (512MB storage)
- **Cloudinary:** $0 (25GB storage, 25GB bandwidth)
- **GitHub Pages:** $0 (Unlimited)
- **Total:** $0/month

### Production (Small Scale)
- **Render:** $7/month (Starter plan)
- **MongoDB Atlas:** $0 (M10 shared RAM) or $25/month (dedicated)
- **Cloudinary:** $0 (Plus plan) or $89/month
- **Total:** $7 - $121/month

---

## 📈 Monitoring

### Backend Logs
- **Render Dashboard:** View logs in real-time
- **Health Check:** `/api/health`

### Frontend Analytics
- **GitHub Pages Traffic:** GitHub Insights
- **Browser Console:** Check for errors

### Database
- **MongoDB Atlas:** Performance monitoring
- **Slow queries:** Enable profiling

---

## 🔄 Update Deployment

### Backend Update
```bash
# Just push to main branch
git push origin main

# Render auto-deploys
```

### Frontend Update
```bash
cd gbchat/client
npm run deploy
```

---

## 📞 Support

- **Full Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Deployment Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Environment Variables:** [ENVIRONMENT_VARIABLES_SETUP.md](./ENVIRONMENT_VARIABLES_SETUP.md)
- **GitHub Issues:** https://github.com/devTechs001/GB-chat/issues

---

**Last Updated:** March 2026
