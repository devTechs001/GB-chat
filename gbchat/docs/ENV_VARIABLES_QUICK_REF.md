# 📝 Environment Variables Quick Reference

## 🚀 Quick Deploy Checklist

### For Netlify (Frontend)
Copy these 5 essential variables to Netlify dashboard:

```bash
VITE_API_URL=https://YOUR_RENDER_URL.onrender.com
VITE_WS_URL=wss://YOUR_RENDER_URL.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
NODE_ENV=production
```

### For Render (Backend)
Copy these 10 essential variables to Render dashboard:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gbchat?retryWrites=true&w=majority
JWT_SECRET=your-random-32-character-secret-key-here
CLIENT_URL=https://YOUR_SITE_NAME.netlify.app
CORS_ORIGIN=https://YOUR_SITE_NAME.netlify.app
NODE_ENV=production
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BCRYPT_ROUNDS=12
```

---

## 📋 Complete Variable List

### Netlify Environment Variables
From file: `.env.netlify`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ CRITICAL | Your Render backend URL |
| `VITE_WS_URL` | ✅ CRITICAL | WebSocket URL (wss://) |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ Required | Cloudinary cloud name |
| `VITE_CLOUDINARY_API_KEY` | ✅ Required | Cloudinary API key |
| `NODE_ENV` | Recommended | Set to "production" |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | For payments |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Push notifications |
| `VITE_GA_TRACKING_ID` | Optional | Analytics |

### Render Environment Variables
From file: `.env.render`

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ CRITICAL | MongoDB connection string |
| `JWT_SECRET` | ✅ CRITICAL | Random 32+ character secret |
| `CLIENT_URL` | ✅ CRITICAL | Your Netlify frontend URL |
| `CORS_ORIGIN` | ✅ CRITICAL | Same as CLIENT_URL |
| `CLOUDINARY_CLOUD_NAME` | ✅ Required | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ Required | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ Required | Cloudinary secret (server-only) |
| `NODE_ENV` | Recommended | Set to "production" |
| `PORT` | Auto-set | Render sets this automatically |
| `BCRYPT_ROUNDS` | Recommended | Password hashing (12) |
| `REDIS_URL` | Optional | Caching (recommended) |
| `STRIPE_SECRET_KEY` | Optional | Payment processing |
| `GOOGLE_CLOUD_API_KEY` | Optional | AI features |
| `TWILIO_*` | Optional | SMS/WhatsApp |

---

## 🔑 Where to Get Credentials

### MongoDB Atlas
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Connect → Connect your application
4. Copy connection string
5. Replace `<password>` with actual password

### Cloudinary
1. Go to: https://cloudinary.com
2. Sign up (free)
3. Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret

### Generate JWT Secret
```bash
# Run this command locally:
openssl rand -base64 32

# Or use this online tool:
# https://generate-secret.vercel.app/32
```

### Stripe (Optional)
1. Go to: https://dashboard.stripe.com
2. Developers → API keys
3. Copy publishable key (for Netlify)
4. Copy secret key (for Render)

---

## ⚡ Quick Setup Commands

### Generate Strong Secrets
```bash
# JWT Secret (32 characters)
openssl rand -base64 32

# Bcrypt salt (for testing)
openssl rand -base64 16
```

### Test MongoDB Connection
```bash
# Replace with your actual connection string
mongo "mongodb+srv://user:pass@cluster.mongodb.net/gbchat"
```

---

## 🔒 Security Best Practices

### DO:
- ✅ Use strong random secrets
- ✅ Enable 2FA on all accounts
- ✅ Rotate secrets every 90 days
- ✅ Use different secrets for dev/prod
- ✅ Store secrets in platform dashboards

### DON'T:
- ❌ Commit .env files to Git
- ❌ Share credentials publicly
- ❌ Use default/weak passwords
- ❌ Reuse secrets across projects
- ❌ Store secrets in code

---

## 🚨 Common Mistakes

### Mistake 1: Wrong API URL
```
❌ VITE_API_URL=http://localhost:5000
✅ VITE_API_URL=https://gbchat-backend.onrender.com
```

### Mistake 2: Missing Protocol
```
❌ VITE_WS_URL=gbchat-backend.onrender.com
✅ VITE_WS_URL=wss://gbchat-backend.onrender.com
```

### Mistake 3: MongoDB Password Not Escaped
```
❌ MONGODB_URI=mongodb+srv://user:my@password@cluster...
✅ MONGODB_URI=mongodb+srv://user:my%40password@cluster...
# (@ becomes %40 in URL)
```

### Mistake 4: CORS Mismatch
```
❌ CLIENT_URL=https://my-site.netlify.com
✅ CLIENT_URL=https://my-site.netlify.app
# (netlify.app, not netlify.com)
```

---

## 📊 Deployment Order

1. **First:** MongoDB Atlas (database)
2. **Second:** Cloudinary (file storage)
3. **Third:** Render (backend)
4. **Fourth:** Netlify (frontend)

### Why This Order?
- Backend needs database credentials
- Frontend needs backend URL
- Everything needs Cloudinary

---

## 🧪 Testing After Setup

### Test Backend (Render)
```bash
# Replace with your Render URL
curl https://your-backend.onrender.com/api/health

# Should return: {"status": "OK"} or similar
```

### Test Frontend (Netlify)
```
1. Open browser
2. Go to: https://your-site.netlify.app
3. Check console (F12) for errors
4. Try to register/login
```

### Test Connection
```
1. Open Netlify site
2. Open browser console
3. Should see no CORS errors
4. Messages should send/receive
```

---

## 📞 Troubleshooting Variables

### If Frontend Can't Connect:
Check these Netlify variables:
```bash
VITE_API_URL=https://CORRECT_RENDER_URL.onrender.com
VITE_WS_URL=wss://CORRECT_RENDER_URL.onrender.com
```

### If CORS Errors:
Check these Render variables:
```bash
CLIENT_URL=https://your-site.netlify.app
CORS_ORIGIN=https://your-site.netlify.app
```

### If Database Fails:
Check Render variable:
```bash
MONGODB_URI=mongodb+srv://user:PASSWORD@cluster...
# Verify password is correct and URL-encoded
```

### If Uploads Fail:
Check both Netlify and Render:
```bash
# Netlify:
VITE_CLOUDINARY_CLOUD_NAME=correct-name
VITE_CLOUDINARY_API_KEY=correct-key

# Render:
CLOUDINARY_CLOUD_NAME=correct-name
CLOUDINARY_API_KEY=correct-key
CLOUDINARY_API_SECRET=correct-secret
```

---

## 🎯 Verification Checklist

After setting up variables:

**Netlify:**
- [ ] VITE_API_URL set
- [ ] VITE_WS_URL set
- [ ] Cloudinary variables set
- [ ] Site redeployed

**Render:**
- [ ] MONGODB_URI set
- [ ] JWT_SECRET set (32+ chars)
- [ ] CLIENT_URL set (Netlify URL)
- [ ] CORS_ORIGIN set (same as CLIENT_URL)
- [ ] Cloudinary variables set (all 3)
- [ ] Service redeployed

**Test:**
- [ ] Site loads
- [ ] Can register
- [ ] Can login
- [ ] Messages work
- [ ] Images upload

---

## 📚 Additional Resources

- **Full Files:**
  - `.env.netlify` - Complete Netlify template
  - `.env.render` - Complete Render template
  - `DEPLOYMENT_GUIDE.md` - Step-by-step guide

- **Documentation:**
  - Netlify: docs.netlify.com
  - Render: render.com/docs
  - MongoDB: docs.mongodb.com

---

**Last Updated:** March 4, 2026  
**Version:** 2.0.0  
**Status:** Ready for Deployment 🚀
