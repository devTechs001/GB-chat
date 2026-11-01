// server/index.js
import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";

import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/index.js";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {
  rateLimiter,
  authLimiter,
  passwordResetLimiter,
  writeLimiter,
  uploadLimiter,
  searchLimiter,
  callLimiter,
  registerLimiter,
} from "./middleware/rateLimiter.js";
import { startGrpcServer } from "./grpc/server.js";
import { closeRedis } from "./config/redis.js";
import systemRoutes from "./routes/systemRoutes.js";
import { initializeAdmin } from "./utils/initAdmin.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import privacyRoutes from "./routes/privacyRoutes.js";
import gbFeaturesRoutes from "./routes/gbFeaturesRoutes.js";
import chatLockRoutes from "./routes/chatLockRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";

// Settings routes
import appearanceRoutes from "./routes/appearanceRoutes.js";
import chatSettingsRoutes from "./routes/chatSettingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import storageRoutes from "./routes/storageRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import chatDisplayRoutes from "./routes/chatDisplayRoutes.js";
import emojiRoutes from "./routes/emojiRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import gbSettingsRoutes from "./routes/gbSettingsRoutes.js";

// New routes: Permissions, Backup, and Recovery
import permissionRoutes from "./routes/permissionRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import recoveryRoutes from "./routes/recoveryRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);
app.set("io", io);
global.io = io; // Make io available globally for services

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "https://www.google-analytics.com"],
      connectSrc: ["'self'", "ws:", "wss:", "https:", "https://www.google-analytics.com", "https://stats.g.doubleclick.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Behind nginx / a cloud LB, req.ip must come from X-Forwarded-For so that
// per-IP rate limits and logs stay accurate.
app.set("trust proxy", process.env.TRUST_PROXY || 1);

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Set proper MIME types
app.use(express.static('client/dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(rateLimiter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// System / probes / internal diagnostics
app.use("/api/system", systemRoutes);

// Routes (per-route rate limiting)
// Authentication: strict, password resets stricter still
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", registerLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users/avatar", uploadLimiter);
app.use("/api/users/search", searchLimiter);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", writeLimiter, messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/stories", writeLimiter, storyRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/calls", callLimiter, callRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/gb-features", gbFeaturesRoutes);
app.use("/api/chat-lock", chatLockRoutes);
app.use("/api/devices", deviceRoutes);

// Settings routes
app.use("/api/appearance", appearanceRoutes);
app.use("/api/chat-settings", chatSettingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/chat-display", chatDisplayRoutes);
app.use("/api/emoji", emojiRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/gb-settings", gbSettingsRoutes);

// Permissions, Backup, and Recovery routes
app.use("/api/permissions", permissionRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/recovery", recoveryRoutes);

// Health check (kept for backwards compatibility with Render/Netlify probes)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    pid: process.pid,
    timestamp: new Date().toISOString(),
  });
});

// Serve SPA for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Initialize admin user
  await initializeAdmin();

  // Internal gRPC API (presence + notification fan-out across nodes)
  await startGrpcServer({ io }).catch((error) =>
    console.warn("[grpc] failed to start:", error.message)
  );

  server.listen(PORT, () => {
    console.log(`🚀 GBChat server running on port ${PORT}`);
    console.log(`   pid ${process.pid} · node ${process.env.NODE_ID || "local"}`);
  });
});

// ---------------------------------------------------------------------------
// Graceful shutdown — lets the load balancer drain in-flight requests before
// the container/worker exits (important when running several replicas).
// ---------------------------------------------------------------------------
const shutdown = async (signal) => {
  console.log(`[shutdown] ${signal} received — draining…`);
  server.close(async () => {
    await closeRedis();
    try {
      await (await import("./config/db.js")).default?.connection?.close?.();
    } catch {
      /* optional */
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 15000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));