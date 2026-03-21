# Render deployment - Server only configuration

## Quick Deploy

1. **Push to GitHub** with the updated render.yaml
2. **In Render Dashboard:**
   - New + → Blueprint
   - Connect repository
   - Apply render.yaml

3. **Add Environment Variables:**
   - MONGODB_URI
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - CLIENT_URL (https://gbchat.netlify.app)
   - CORS_ORIGIN (https://gbchat.netlify.app)
   - EMAIL_USER
   - EMAIL_PASS

## Configuration

- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Port:** 5000

## Health Check

```bash
curl https://your-server.onrender.com/api/health
```

Expected: `{"status":"ok",...}`

## Important Notes

- Frontend is hosted separately on Netlify
- Only the server folder is deployed to Render
- Environment variables must be set in Render dashboard
- Persistent disk mounted at `/opt/render/project/src/uploads`

See docs/RENDER_SERVER_DEPLOYMENT.md for complete guide.
