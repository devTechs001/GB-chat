# Render Deployment - Server Only

This guide explains how to deploy **only the server** to Render (frontend is hosted on Netlify).

---

## ⚡ Quick Deploy

### Step 1: Update render.yaml

The `render.yaml` is already configured for **server-only** deployment:

```yaml
services:
  - type: web
    name: gbchat-server
    env: node
    region: oregon
    plan: starter
    branch: main
    rootDir: server
    buildCommand: npm install
    startCommand: node index.js
    # ... environment variables
```

**Key Configuration:**
- `rootDir: server` - Tells Render to use the server folder
- `buildCommand: npm install` - Installs server dependencies
- `startCommand: node index.js` - Starts the server

---

## 🚀 Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update render.yaml for server-only deployment"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to https://dashboard.render.com
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository
   - Render will detect `render.yaml`
   - Click **Apply**

3. **Add Environment Variables:**
   In the Render dashboard, add these required variables:
   
   | Key | Value |
   |-------|-------|
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/gbchat` |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
   | `EMAIL_USER` | Your Gmail address |
   | `EMAIL_PASS` | Gmail App Password |

4. **Deploy:**
   - Render will automatically build and deploy
   - Build logs will show in the dashboard
   - Once deployed, you'll get a URL like: `https://gbchat-server.onrender.com`

---

### Option 2: Manual Setup

If not using render.yaml:

1. **Create New Web Service:**
   - Dashboard → New + → Web Service
   - Connect your GitHub repository

2. **Configure Service:**
   ```
   Name: gbchat-server
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node index.js
   ```

3. **Add Environment Variables:**
   (Same as above)

4. **Add Persistent Disk:**
   ```
   Name: uploads
   Mount Path: /opt/render/project/src/uploads
   Size: 1 GB
   ```

---

## ✅ Verify Deployment

### 1. Health Check

```bash
curl https://gbchat-server.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test API Endpoints

```bash
# Test authentication
curl -X POST https://gbchat-server.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 3. Check Logs

In Render Dashboard → Logs tab:
- Should show: `🚀 GBChat server running on port 5000`
- Should show: `✅ MongoDB connected`

---

## 🔧 Troubleshooting

### Issue: "Build successful but app won't start"

**Check:**
1. Root Directory is set to `server`
2. Start Command is `node index.js`
3. PORT environment variable is set to `5000`

### Issue: "Cannot find module"

**Solution:**
```bash
# Make sure server/package.json has all dependencies
cd server
npm install
git add package.json package-lock.json
git commit -m "Update server dependencies"
git push
```

### Issue: "MongoDB connection failed"

**Check:**
1. MONGODB_URI is correct in Render environment variables
2. MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Database user credentials are correct

### Issue: "CORS errors from Netlify frontend"

**Solution:**
Set these environment variables in Render:
```
CLIENT_URL=https://gbchat.netlify.app
CORS_ORIGIN=https://gbchat.netlify.app
```

---

## 📊 Environment Variables Required

Add these in Render Dashboard → Environment tab:

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `5000` |
| `MONGODB_URI` | ✅ | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ | Auto-generated or custom |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `dxxxxx` |
| `CLOUDINARY_API_KEY` | ✅ | `1234567890` |
| `CLOUDINARY_API_SECRET` | ✅ | `abc123...` |
| `CLIENT_URL` | ✅ | `https://gbchat.netlify.app` |
| `CORS_ORIGIN` | ✅ | `https://gbchat.netlify.app` |
| `EMAIL_USER` | ✅ | `you@gmail.com` |
| `EMAIL_PASS` | ✅ | Gmail App Password |

Optional:
- `RATE_LIMIT_WINDOW_MS` (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS` (default: 100)
- `REDIS_URL` (for caching)

---

## 💰 Cost

**Free Tier:**
- Server will sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up

**Starter Plan ($7/month):**
- No sleep
- Faster response times
- Recommended for production

---

## 🔐 Security Checklist

- [ ] All environment variables set
- [ ] MongoDB IP whitelist: `0.0.0.0/0`
- [ ] CORS configured for Netlify URL
- [ ] HTTPS enabled (automatic on Render)
- [ ] JWT secret is strong
- [ ] Email 2FA enabled
- [ ] Rate limiting configured

---

## 📈 Monitoring

### Render Dashboard

- **Logs:** Real-time application logs
- **Metrics:** CPU, memory usage
- **Requests:** HTTP request count

### Health Check URL

```
https://gbchat-server.onrender.com/api/health
```

Monitor this endpoint for uptime.

---

## 🔄 Updates

To deploy updates:

```bash
# Make changes
git add .
git commit -m "Fix: your changes"
git push origin main
```

Render will automatically:
1. Detect the push
2. Build the server
3. Deploy the update
4. Restart the service

No downtime! ✨

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Status Page:** https://status.render.com
- **Support:** https://render.com/support

---

**Last Updated:** March 2026
