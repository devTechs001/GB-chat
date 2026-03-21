# GBChat Documentation Index

Welcome to the GBChat technical documentation. This folder contains comprehensive documentation for developers and deployers.

---

## 📚 Available Documentation

### 1. [Documentation README](./README.md)
**Start here!** Overview of all documentation and quick start guide.

### 2. [API Documentation](#api-documentation)

#### [GB Settings API](./GB_SETTINGS_API.md)
Complete reference for GBChat enhanced settings endpoints:
- Privacy settings (hide online status, anti-delete, anti-revoke, etc.)
- Theme & customization (custom themes, fonts, icons, widgets)
- Messaging features (schedule, auto-delete, DND mode)
- Media settings (HD upload, auto-download, zoom)
- Group management
- Advanced features
- Statistics

**Endpoints:** 70+ | **Base Path:** `/api/gb-settings`

#### [Permissions, Backup & Recovery API](./PERMISSIONS_BACKUP_RECOVERY_API.md)
Complete reference for device permissions, data backup, and account recovery:
- **Device Permissions:** Camera, microphone, contacts, media, location, notifications
- **Feature Permissions:** Voice messages, video calls, file sharing, etc.
- **Privacy Permissions:** Who can see what (online, last seen, profile, status)
- **Backup System:** Create, restore, schedule, email backups
- **Recovery System:** Email/phone recovery, 2FA, recovery codes, trusted contacts
- **Block/Unblock:** User management

**Endpoints:** 60+ | **Base Paths:** `/api/permissions`, `/api/backup`, `/api/recovery`

### 3. [Deployment Guide](./DEPLOYMENT.md)
Complete guide for deploying GBChat to Render or any cloud platform:
- Prerequisites and setup
- Render configuration (`render.yaml`)
- Environment variables (complete list)
- Step-by-step deployment
- Post-deployment verification
- Troubleshooting common issues
- Performance optimization
- Cost estimation
- Security checklist

**Includes:** MongoDB Atlas, Cloudinary, Gmail SMTP setup

### 4. [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
Comprehensive checklist for deployment:
- Pre-deployment tasks
- Deployment steps
- Post-deployment verification
- Feature testing
- Performance testing
- Security verification
- Troubleshooting guide
- Monitoring schedule
- Production readiness criteria

---

## 🚀 Quick Reference

### Base URLs

| Environment | Backend URL | Frontend URL |
|-------------|-------------|--------------|
| Development | `http://localhost:5000/api` | `http://localhost:5173` |
| Production | `https://gbchat-server.onrender.com/api` | `https://gbchat.netlify.app` |

### Main API Endpoints

```
Authentication     → /api/auth
Users             → /api/users
Chats             → /api/chats
Messages          → /api/messages
Groups            → /api/groups
Stories           → /api/stories
Channels          → /api/channels
Calls             → /api/calls
Contacts          → /api/contacts

GB Settings       → /api/gb-settings
Permissions       → /api/permissions
Backup            → /api/backup
Recovery          → /api/recovery

Settings:
  Appearance      → /api/appearance
  Chat Settings   → /api/chat-settings
  Notifications   → /api/notifications
  Storage         → /api/storage
  Account         → /api/account
  Privacy         → /api/privacy
  GB Features     → /api/gb-features
```

### Environment Variables

**Required for Deployment:**

```bash
# Server
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://gbchat.netlify.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client
VITE_API_URL=https://gbchat-server.onrender.com/api
VITE_SOCKET_URL=https://gbchat-server.onrender.com
```

---

## 📦 Models Reference

### Core Models
- `User` - User accounts and profiles
- `Chat` - Chat conversations
- `Message` - Individual messages
- `Group` - Group chats
- `Contact` - User contacts
- `Story` - Status stories
- `Channel` - Broadcast channels
- `Call` - Call history

### GB Features Models
- `GBFeatures` - Enhanced features configuration
- `Permission` - Device and feature permissions
- `Backup` - User data backups
- `Recovery` - Account recovery settings

---

## 🔐 Authentication

All API endpoints (except public routes) require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

Token is obtained from `/api/auth/login` or `/api/auth/register` and stored in localStorage.

---

## 🛠️ Development

### Project Structure

```
gbchat/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand stores
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities
│   ├── .env.example
│   └── package.json
│
├── server/              # Node.js backend (Express)
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, etc.
│   ├── services/        # Business logic
│   ├── config/          # Database, Cloudinary, etc.
│   ├── .env.example
│   └── index.js
│
├── docs/                # Documentation (this folder)
│   ├── README.md
│   ├── GB_SETTINGS_API.md
│   ├── PERMISSIONS_BACKUP_RECOVERY_API.md
│   ├── DEPLOYMENT.md
│   └── DEPLOYMENT_CHECKLIST.md
│
└── render.yaml          # Render deployment config
```

### Local Development

```bash
# Server
cd server
npm install
npm run dev  # Runs on http://localhost:5000

# Client
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

---

## 📊 Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **State:** Zustand
- **Routing:** React Router v6
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Icons:** Heroicons
- **HTTP Client:** Axios/Fetch

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.IO
- **Auth:** JWT (jsonwebtoken)
- **Validation:** Custom
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer

### DevOps
- **Hosting:** Render (backend), Netlify (frontend)
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary
- **CDN:** Cloudinary/Cloudflare

---

## 🔒 Security Features

- JWT authentication with expiration
- Bcrypt password hashing
- CORS protection
- Rate limiting
- Helmet.js security headers
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection
- CSRF protection
- Account lockout after failed attempts
- Email verification for recovery
- Two-factor authentication (2FA)
- Encrypted backups

---

## 📞 Support

For issues or questions:

1. Check relevant documentation
2. Review API documentation
3. Check deployment troubleshooting guide
4. Open GitHub issue
5. Contact support team

---

## 📝 Version Information

- **API Version:** 2.0
- **Last Updated:** March 2026
- **Status:** Production Ready

---

## 📄 License

See main repository for license information.

---

**Quick Links:**
- [GB Settings API Docs](./GB_SETTINGS_API.md)
- [Permissions API Docs](./PERMISSIONS_BACKUP_RECOVERY_API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
