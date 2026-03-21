# GBChat - Enterprise Messaging Platform

<div align="center">

![GBChat Banner](https://img.shields.io/badge/GBChat-Enterprise_Messaging-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)

**A full-featured WhatsApp clone with advanced enterprise features, AI integration, and payments.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://mongodb.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Demo](#-demo) • [Documentation](#-documentation) • [Deploy](#-deployment)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

GBChat is a modern, enterprise-grade messaging platform built with the MERN stack. It extends standard messaging with **GB WhatsApp features**, **AI-powered assistance**, **payment integration**, and **advanced privacy controls**.

### Live Demo

- **Frontend:** https://devtechs001.github.io/GB-chat/
- **Backend:** https://gb-chat-backend.onrender.com/api/health

---

## ✨ Features

### 💬 Core Messaging
- Real-time messaging with Socket.IO
- Individual and group chats
- Message reactions and replies
- Read receipts and typing indicators
- Message scheduling and auto-delete
- Anti-delete and anti-revoke

### 🔒 Privacy & Security
- Hide online status, last seen, profile photo
- Anti-status view tracking
- Incognito mode
- Chat lock with authentication
- Two-factor authentication (2FA)
- Encrypted backups

### 🎨 Customization
- Custom themes and colors
- Chat wallpapers
- Font customization
- Widget layouts
- Icon packs
- Home screen widgets

### 🤖 AI Integration
- AI chatbot assistant
- Smart replies
- Message suggestions
- Auto-translation
- Context-aware responses

### 💳 Payments
- Stripe integration (International)
- Razorpay integration (India - UPI)
- In-chat payments
- Payment history
- Business catalog

### 📱 Media & Calls
- HD image/video sharing
- Voice messages with waveform
- Video and voice calls (WebRTC)
- Document sharing
- Location sharing
- Contact sharing

### 👥 Group Features
- Create and manage groups
- Group admin controls
- Group descriptions and icons
- Member permissions
- Group announcements
- Polls and voting

### 📊 Business Tools
- Business profiles
- Product catalogs
- Quick replies
- Away messages
- Analytics dashboard
- Customer management

### 🔄 Backup & Recovery
- Cloud backups (daily/weekly/monthly)
- Email backups
- Account recovery via email/phone
- Trusted contacts
- Recovery codes

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **Vite** | Build Tool |
| **Zustand** | State Management |
| **React Router v6** | Routing |
| **TailwindCSS** | Styling |
| **Framer Motion** | Animations |
| **Socket.IO Client** | Real-time |
| **Axios** | HTTP Client |
| **React Query** | Data Fetching |
| **Stripe.js** | Payments |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | Web Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **Socket.IO** | WebSocket |
| **JWT** | Authentication |
| **Bcrypt** | Password Hashing |
| **Multer** | File Upload |
| **Cloudinary** | Media Storage |
| **Nodemailer** | Email Service |
| **Redis** | Caching |
| **Node-Cron** | Scheduled Tasks |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **GitHub** | Version Control |
| **GitHub Pages** | Frontend Hosting |
| **Render** | Backend Hosting |
| **MongoDB Atlas** | Cloud Database |
| **Cloudinary** | CDN & Storage |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (v22 recommended)
- npm or yarn
- Git
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### Clone the Repository
```bash
git clone https://github.com/devTechs001/GB-chat.git
cd GB-chat
```

### Backend Setup
```bash
cd gbchat/server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd gbchat/client
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URLs

# Start development server
npm run dev
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## 📁 Project Structure

```
GB-chat/
├── gbchat/
│   ├── client/              # React Frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── store/       # Zustand state stores
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities & helpers
│   │   │   ├── assets/      # Static assets
│   │   │   └── App.jsx      # Main app component
│   │   ├── public/          # Public assets
│   │   ├── .env.example     # Environment template
│   │   ├── vite.config.js   # Vite configuration
│   │   └── package.json
│   │
│   ├── server/              # Node.js Backend
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # Business logic
│   │   ├── socket/          # Socket.IO handlers
│   │   ├── config/          # DB, Cloudinary setup
│   │   ├── utils/           # Helper functions
│   │   ├── .env.example     # Environment template
│   │   ├── index.js         # Entry point
│   │   └── package.json
│   │
│   └── docs/                # Documentation
│       ├── README.md
│       ├── INDEX.md
│       ├── API.md
│       ├── DEPLOYMENT.md
│       └── ...
│
├── render.yaml              # Render deployment config
├── package.json             # Root package.json
└── README.md                # This file
```

---

## 📚 API Documentation

### Base URLs
| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000/api` |
| Production | `https://gb-chat-backend.onrender.com/api` |

### Main Endpoints

#### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
GET    /api/auth/me           - Get current user
POST   /api/auth/forgot-pass  - Request password reset
POST   /api/auth/reset-pass   - Reset password
```

#### Users
```
GET    /api/users             - Get all users
GET    /api/users/:id         - Get user by ID
PUT    /api/users/:id         - Update user
DELETE /api/users/:id         - Delete user
GET    /api/users/:id/chats   - Get user chats
```

#### Chats & Messages
```
GET    /api/chats             - Get all chats
POST   /api/chats             - Create chat
GET    /api/chats/:id         - Get chat by ID
GET    /api/chats/:id/messages - Get chat messages
POST   /api/messages          - Send message
PUT    /api/messages/:id      - Update message
DELETE /api/messages/:id      - Delete message
```

#### Groups
```
GET    /api/groups            - Get all groups
POST   /api/groups            - Create group
GET    /api/groups/:id        - Get group by ID
PUT    /api/groups/:id        - Update group
DELETE /api/groups/:id        - Delete group
POST   /api/groups/:id/add    - Add member
POST   /api/groups/:id/remove - Remove member
```

#### GB Features (Advanced)
```
GET    /api/gb-settings           - Get GB settings
PUT    /api/gb-settings           - Update GB settings
GET    /api/gb-settings/privacy   - Privacy settings
GET    /api/gb-settings/theme     - Theme settings
GET    /api/gb-settings/messaging - Messaging features
```

#### Backup & Recovery
```
POST   /api/backup/create     - Create backup
GET    /api/backup/list       - List backups
POST   /api/backup/restore    - Restore backup
POST   /api/recovery/request  - Request recovery
POST   /api/recovery/verify   - Verify recovery code
```

For complete API documentation, see [gbchat/docs/INDEX.md](./gbchat/docs/INDEX.md)

---

## 🌐 Deployment

### Frontend (GitHub Pages)
```bash
cd gbchat/client
npm install
npm run deploy
```

Frontend will be deployed to: `https://devtechs001.github.io/GB-chat/`

### Backend (Render)
1. Create account at [Render](https://render.com)
2. Connect GitHub repository
3. Use `render.yaml` for auto-configuration
4. Set environment variables
5. Deploy

Backend will be deployed to: `https://gb-chat-backend.onrender.com`

### Environment Variables

#### Backend (.env)
```bash
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gbchat

# Security
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS
CLIENT_URL=https://devtechs001.github.io/GB-chat
CORS_ORIGIN=https://devtechs001.github.io/GB-chat
```

#### Frontend (.env)
```bash
VITE_API_URL=https://gb-chat-backend.onrender.com/api
VITE_SOCKET_URL=https://gb-chat-backend.onrender.com
```

For detailed deployment instructions, see [gbchat/docs/DEPLOYMENT.md](./gbchat/docs/DEPLOYMENT.md)

---

## 🔧 Environment Variables

### Required for Development

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `PORT` | Server port | 5000 |
| `VITE_API_URL` | API base URL | http://localhost:5000/api |
| `VITE_SOCKET_URL` | Socket server URL | http://localhost:5000 |

### Required for Production

| Variable | Service | Purpose |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB Atlas | Database |
| `CLOUDINARY_*` | Cloudinary | Media storage |
| `EMAIL_*` | Gmail/SMTP | Email service |
| `STRIPE_*` | Stripe | Payments (optional) |
| `RAZORPAY_*` | Razorpay | UPI payments (optional) |

See [gbchat/docs/ENVIRONMENT_VARIABLES_SETUP.md](./gbchat/docs/ENVIRONMENT_VARIABLES_SETUP.md) for complete list.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure linting passes (`npm run lint`)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation:** [gbchat/docs](./gbchat/docs)
- **Issues:** [GitHub Issues](https://github.com/devTechs001/GB-chat/issues)
- **Discussions:** [GitHub Discussions](https://github.com/devTechs001/GB-chat/discussions)

---

## 🙏 Acknowledgments

- WhatsApp for inspiration
- React and Node.js communities
- All open-source contributors

---

<div align="center">

**Made with ❤️ by the GBChat Team**

[⬆ Back to Top](#gbchat---enterprise-messaging-platform)

</div>
