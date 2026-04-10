# GBChat Deployment Troubleshooting Guide

## Issues Fixed ✅

### 1. MongoDB Connection Error (ENOTFOUND)
**Problem:** `querySrv ENOTFOUND _mongodb._tcp.cluster0.0xqzq.mongodb.net`

**Root Cause:** 
- The app was trying to use `MONGODB_URL` env var but Render uses `MONGODB_URI`
- DNS resolution failing due to incorrect or missing connection string

**Solution:**
- Updated `gbchat/server/config/db.js` to check both `MONGODB_URI` and `MONGODB_URL`
- Improved error handling and fallback logic
- Increased timeout from 5s to 10s for better reliability

**Action Required:**
1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Select your `gbchat-server` service
3. Go to **Environment** tab
4. Add/Update the `MONGODB_URI` variable with your MongoDB Atlas connection string:
   ```
   mongodb+srv://devtechs842_db_user:<YOUR_PASSWORD>@cluster0.kparor6.mongodb.net/gbchat?retryWrites=true&w=majority
   ```
5. Replace `<YOUR_PASSWORD>` with the actual password from your `.env` file
6. Click **Save Changes**
7. The service will automatically redeploy

### 2. Duplicate Schema Index Warnings
**Problem:** Mongoose warnings about duplicate indexes

**Root Cause:**
- Models declared `unique: true` on `userId` field (which auto-creates an index)
- AND also explicitly called `schema.index({ userId: 1 })` (creating a duplicate)

**Solution:**
Removed duplicate `schema.index({ userId: 1 })` from:
- ✅ `GBFeatures.model.js`
- ✅ `Permission.model.js`
- ✅ `PrivacySettings.model.js`
- ✅ `BusinessProfile.model.js`

These warnings should now be gone on next deployment.

### 3. Content Security Policy Issues (Frontend)
**Problem:** CSP blocking external scripts and MIME type errors

**Root Cause:**
- Strict CSP in Helmet middleware blocking legitimate resources
- Netlify serving wrong MIME types for JS/CSS files

**Recommendations:**
1. **For Netlify:** Add a `_headers` file in your client build folder:
   ```
   /*
     X-Content-Type-Options: nosniff
     X-Frame-Options: SAMEORIGIN
   ```

2. **For GitHub Pages:** The MIME type errors suggest the build path might be incorrect
   - Verify your `vite.config.js` has the correct `base` path for GitHub Pages
   - Should be `base: '/GB-chat/'` for `https://devtechs001.github.io/GB-chat/`

## Deploy to Render - Step by Step

### Prerequisites
1. MongoDB Atlas cluster created
2. Database user created with password
3. Network access set to `0.0.0.0/0` (allow from anywhere)

### Environment Variables to Set in Render

Go to **Render Dashboard** → **gbchat-server** → **Environment** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `MONGODB_URI` | `mongodb+srv://devtechs842_db_user:<PASSWORD>@cluster0.kparor6.mongodb.net/gbchat?retryWrites=true&w=majority` | ✅ Yes |
| `JWT_SECRET` | Random 32+ char string | ✅ Yes |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Optional |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### MongoDB Atlas Setup

1. **Get your connection string:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Click **Connect** on your cluster
   - Choose **Connect your application**
   - Copy the connection string

2. **Whitelist IP (if needed):**
   - Network Access → Add IP Address
   - Use `0.0.0.0/0` for Render (allows all IPs)

3. **Database User:**
   - Database Access → Edit user
   - Make sure user has `readWrite` access to `gbchat` database

### Redeploy

After setting environment variables:
1. Render will automatically trigger a redeployment
2. Or manually trigger: **Manual Deploy** → **Deploy latest commit**
3. Check logs: **Logs** tab → Look for `✅ MongoDB connected`

## Testing Locally

```bash
cd gbchat/server
cp .env.example .env
# Edit .env with your MongoDB connection string
npm install
npm start
```

Expected output:
```
📡 Attempting to connect to MongoDB...
✅ MongoDB connected: cluster0.kparor6.mongodb.net
🚀 GBChat server running on port 5000
```

## Common Errors

### ❌ `querySrv ENOTFOUND`
- **Fix:** Check MongoDB connection string in Render environment variables
- Verify the cluster name is correct (`kparor6` not `0xqzq`)

### ❌ `Authentication failed`
- **Fix:** Check MongoDB password is correct (case-sensitive)
- Special characters in password should be URL-encoded

### ❌ `MongoServerError: bad auth`
- **Fix:** Verify database user exists in MongoDB Atlas
- Check password doesn't have extra spaces

### ❌ `ECONNREFUSED 127.0.0.1:27017`
- **Fix:** This means it's trying to connect to local MongoDB in production
- Ensure `MONGODB_URI` is set in Render environment variables

## Files Modified

1. ✅ `gbchat/server/config/db.js` - Improved MongoDB connection logic
2. ✅ `gbchat/server/models/GBFeatures.model.js` - Removed duplicate index
3. ✅ `gbchat/server/models/Permission.model.js` - Removed duplicate index
4. ✅ `gbchat/server/models/PrivacySettings.model.js` - Removed duplicate index
5. ✅ `gbchat/server/models/BusinessProfile.model.js` - Removed duplicate index
6. ✅ `gbchat/server/.env` - Created production env file (not committed)

## Next Steps

1. **Update Render Environment Variables** (most important!)
2. **Redeploy to Render**
3. **Verify MongoDB connection** in logs
4. **Test the application** end-to-end
5. **Monitor logs** for any remaining warnings

---

**Need Help?**
- Check Render logs: Dashboard → gbchat-server → Logs
- Check MongoDB Atlas: Clusters → Metrics → Logs
- Test connection string locally with `mongodb+srv://...`
