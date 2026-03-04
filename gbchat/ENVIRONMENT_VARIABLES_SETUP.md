# GBChat Environment Variables Setup

This guide covers all environment variables needed for **Netlify (Frontend)** and **Render (Backend)** deployment.

---

## 🔷 NETLIFY (Frontend) Environment Variables

Go to: **Netlify Dashboard** → **Site Settings** → **Environment Variables** → **Add a variable**

### Required Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_URL` | Backend API URL (Render server) | `https://gbchat-server.onrender.com/api` |
| `VITE_SOCKET_URL` | WebSocket server URL | `https://gbchat-server.onrender.com` |

### Optional Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_ENABLE_DEV_TOOLS` | Enable React DevTools in production | `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `true` |

### Production Values (Example)
```
VITE_API_URL=https://gbchat-enterprise.onrender.com/api
VITE_SOCKET_URL=https://gbchat-enterprise.onrender.com
```

### Development Values (Example)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔴 RENDER (Backend) Environment Variables

Go to: **Render Dashboard** → Select your service → **Environment** → **Add Environment Variable**

### 🔐 Core Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | MongoDB Atlas (see below) |
| `JWT_SECRET` | JWT signing secret | Generate 32+ char random string |

### 🗄️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/gbchat?retryWrites=true&w=majority`
4. Replace `<username>` and `<password>` with your credentials

### 🔒 Security Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `JWT_SECRET` | Secret for JWT tokens | Generate: `openssl rand -base64 32` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

### 📦 File Storage (Cloudinary)

Required for avatar and media uploads:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | [Cloudinary Dashboard](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | API key | Cloudinary Dashboard → Settings |
| `CLOUDINARY_API_SECRET` | API secret | Cloudinary Dashboard → Settings |

**Cloudinary Setup:**
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Go to Dashboard
3. Copy the three values

### 💳 Payment Gateways (Optional)

#### Stripe (International Payments)
| Variable | Description | How to Get |
|----------|-------------|------------|
| `STRIPE_SECRET_KEY` | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard |

#### Razorpay (India - UPI)
| Variable | Description | How to Get |
|----------|-------------|------------|
| `RAZORPAY_KEY_ID` | Razorpay key ID | [Razorpay Dashboard](https://dashboard.razorpay.com/) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | Razorpay Dashboard |

### 🤖 AI Services (Optional)

#### Google Generative AI
| Variable | Description | How to Get |
|----------|-------------|------------|
| `GOOGLE_CLOUD_API_KEY` | Google AI API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### 📧 Communication Services (Optional)

#### Twilio (SMS/WhatsApp)
| Variable | Description | How to Get |
|----------|-------------|------------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | [Twilio Console](https://console.twilio.com/) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Twilio Console |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Twilio Console → Phone Numbers |

#### Email (SMTP)
| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | your-email@gmail.com |
| `EMAIL_PASS` | SMTP password | App-specific password |

### 🔔 Push Notifications (Optional)

#### Firebase
| Variable | Description | How to Get |
|----------|-------------|------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | [Firebase Console](https://console.firebase.google.com/) |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Firebase → Project Settings → Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Service account private key | Firebase → Service Accounts → Generate Private Key |

### 🌐 CORS & Client

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `CLIENT_URL` | Frontend URL | `https://gbchat.netlify.app` |
| `CORS_ORIGIN` | Allowed origin | `https://gbchat.netlify.app` |

### ⚡ Performance & Limits

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `MAX_FILE_SIZE` | Max upload size | `2147483648` (2GB) |

---

## 📋 Quick Setup Checklist

### For Netlify (Frontend)
- [ ] `VITE_API_URL` = Your Render backend URL + `/api`
- [ ] `VITE_SOCKET_URL` = Your Render backend URL (without `/api`)

### For Render (Backend)
**Required:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGODB_URI` = MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Random 32+ character string
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `CLIENT_URL` = Your Netlify frontend URL

**Optional (add as needed):**
- [ ] Payment gateway keys (Stripe/Razorpay)
- [ ] AI service keys (Google AI)
- [ ] Communication services (Twilio, Email)
- [ ] Firebase push notifications

---

## 🔧 How to Add Environment Variables

### Netlify
1. Go to **Netlify Dashboard**
2. Select your site
3. Click **Site settings**
4. Go to **Environment variables** (left sidebar)
5. Click **Add a variable**
6. Enter key and value
7. Click **Save**

### Render
1. Go to **Render Dashboard**
2. Select your web service
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Enter key and value
6. Click **Save**
7. **Redeploy** the service for changes to take effect

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git (already in `.gitignore`)
2. **Use different secrets** for development and production
3. **Rotate keys regularly** (especially JWT_SECRET)
4. **Use environment-specific values** (test keys for dev, live keys for prod)
5. **Enable 2FA** on all service accounts
6. **Review access** periodically and remove unused keys

---

## 🧪 Testing Locally

Create a `.env` file in the `gbchat/` directory:

```bash
# Server (.env)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gbchat
JWT_SECRET=your-local-dev-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173

# Client (client/.env)
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🆘 Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` and `VITE_SOCKET_URL` are correct
- Ensure CORS_ORIGIN on backend matches frontend URL
- Check for trailing slashes in URLs

### Backend can't upload files
- Verify Cloudinary credentials are correct
- Check Cloudinary account has storage space
- Ensure uploads folder has write permissions

### Authentication fails
- Verify JWT_SECRET is the same across redeployments
- Check MongoDB connection string is correct
- Ensure database user has proper permissions

---

## 📞 Support

- **MongoDB Atlas**: [support.mongodb.com](https://support.mongodb.com)
- **Cloudinary**: [support.cloudinary.com](https://support.cloudinary.com)
- **Render**: [render.com/docs](https://render.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
