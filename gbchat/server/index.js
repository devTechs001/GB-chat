// server/index.js
// Must be the first import: loads .env before anything else reads process.env.
import "./config/env.js";

import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { existsSync } from "fs";

import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/index.js";
import { corsOptions } from "./config/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { validateEnv } from "./config/validateEnv.js";
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
import { startScheduler } from "./services/schedulerService.js";
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
import pushRoutes from "./routes/pushRoutes.js";

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
import { metricsMiddleware, requestId } from "./middleware/observability.js";
import localBackupRoutes from "./routes/localBackupRoutes.js";
import offlineRoutes from "./routes/offlineRoutes.js";
import recoveryRoutes from "./routes/recoveryRoutes.js";
import {
  gatewayEnabled,
  migratedServiceIds,
  isProxied,
  servicesSnapshot,
} from "./services/gateway/registry.js";
import { createProxyMiddleware, breakerSnapshots, resetBreakers } from "./services/gateway/proxyMiddleware.js";

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
// Every response carries an id; anything logged for this request can be
// matched to it. Metrics are recorded on `finish`, so they include 4xx/5xx.
app.use(requestId);
app.use(metricsMiddleware);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/**
 * Where the built SPA lives.
 *
 * The old code used the relative path `client/dist`, resolved against whatever
 * cwd the process happened to have. Started from the repo root (`npm start`) it
 * pointed at `./client/dist`; started from `gbchat/server` (`npm run dev`, Docker,
 * most process managers) it pointed at `./server/client/dist` — which does not
 * exist, so every page returned `404 ENOENT: stat …/server/client/dist/index.html`
 * while the API kept working. The path is now anchored to this file.
 */
const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = [
  path.resolve(SERVER_DIR, "../client/dist"),
  path.resolve(SERVER_DIR, "../../client/dist"),
].find((dir) => existsSync(path.join(dir, "index.html")));

// Set proper MIME types
app.use(express.static(CLIENT_DIST || path.resolve(SERVER_DIR, "../client/dist"), {
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

// ---------------------------------------------------------------------------
// Microservice gateway (opt-in).
//
// `GATEWAY_ENABLED=false` (the default) registers a no-op middleware and every
// route below mounts in-process exactly as before — local dev is unaffected.
//
// `GATEWAY_ENABLED=true GATEWAY_ROUTES=social` forwards only /api/social-owned
// prefixes to `GATEWAY_SOCIAL_URL` and skips their local mounts. The same
// handler code serves both shapes, so a migrated prefix behaves identically.
// ---------------------------------------------------------------------------
const GATEWAY_ON = gatewayEnabled();
app.use(createProxyMiddleware());
const isRemote = (prefix) => GATEWAY_ON && isProxied(prefix);
const mountIfLocal = (prefix) => !isRemote(prefix);

if (GATEWAY_ON) {
  console.log(
    `⛩️  gateway enabled — forwarding ${migratedServiceIds().join(", ") || "nothing"} (in-process: the rest)`
  );
}

// Routes (per-route rate limiting)
// Authentication: strict, password resets stricter still
if (mountIfLocal("/api/auth")) {
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", registerLimiter);
  app.use("/api/auth/verify-otp", authLimiter);
  app.use("/api/auth/forgot-password", passwordResetLimiter);
  app.use("/api/auth/reset-password", passwordResetLimiter);

  app.use("/api/auth", authRoutes);
  app.use("/api/users/avatar", uploadLimiter);
  app.use("/api/users/search", searchLimiter);
  app.use("/api/users", userRoutes);
  app.use("/api/contacts", contactRoutes);
  app.use("/api/devices", deviceRoutes);
  app.use("/api/privacy", privacyRoutes);
  app.use("/api/push", pushRoutes);
  app.use("/api/account", accountRoutes);
  app.use("/api/recovery", recoveryRoutes);
}
if (mountIfLocal("/api/chats")) app.use("/api/chats", chatRoutes);
if (mountIfLocal("/api/messages")) app.use("/api/messages", writeLimiter, messageRoutes);
if (mountIfLocal("/api/groups")) app.use("/api/groups", groupRoutes);
if (mountIfLocal("/api/stories")) app.use("/api/stories", writeLimiter, storyRoutes);
if (mountIfLocal("/api/channels")) app.use("/api/channels", channelRoutes);
if (mountIfLocal("/api/calls")) app.use("/api/calls", callLimiter, callRoutes);
if (mountIfLocal("/api/gb-features")) app.use("/api/gb-features", gbFeaturesRoutes);
if (mountIfLocal("/api/chat-lock")) app.use("/api/chat-lock", chatLockRoutes);

// Settings routes
if (mountIfLocal("/api/appearance")) app.use("/api/appearance", appearanceRoutes);
if (mountIfLocal("/api/chat-settings")) app.use("/api/chat-settings", chatSettingsRoutes);
if (mountIfLocal("/api/notifications")) app.use("/api/notifications", notificationRoutes);
if (mountIfLocal("/api/storage")) app.use("/api/storage", storageRoutes);
if (mountIfLocal("/api/chat-display")) app.use("/api/chat-display", chatDisplayRoutes);
if (mountIfLocal("/api/emoji")) app.use("/api/emoji", emojiRoutes);
if (mountIfLocal("/api/translations")) app.use("/api/translations", translationRoutes);
if (mountIfLocal("/api/gb-settings")) app.use("/api/gb-settings", gbSettingsRoutes);

// Permissions, Backup, and Recovery routes
if (mountIfLocal("/api/permissions")) app.use("/api/permissions", permissionRoutes);
// Local (SQLite) + offline mirror endpoints must be mounted before the
// Mongo-backed /api/backup router so its "/:backupId" route cannot swallow them.
if (mountIfLocal("/api/backup")) {
  app.use("/api/backup/local", localBackupRoutes);
  app.use("/api/backup/offline", offlineRoutes);
  app.use("/api/backup", backupRoutes);
}

// Gateway self-diagnostics: which services exist, which are migrated, and the
// live breaker state. Mounted after the proxy so a remote `/api/system` would
// still win — it never is, system routes are always local (probes must work
// even when every service is down).
app.get("/api/system/gateway", (req, res) => {
  res.json({
    success: true,
    enabled: GATEWAY_ON,
    migrated: migratedServiceIds(),
    services: servicesSnapshot(),
    breakers: breakerSnapshots(),
  });
});
app.post("/api/system/gateway/reset", (req, res) => {
  resetBreakers();
  res.json({ success: true, message: "Circuit breakers reset" });
});

// Health check (kept for backwards compatibility with Render/Netlify probes)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    pid: process.pid,
    timestamp: new Date().toISOString(),
  });
});

// Unknown API route → JSON 404 (never the SPA fallback HTML, which made client
// errors look like a 200 with an HTML body).
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `No API route matches ${req.method} ${req.originalUrl}`,
  });
});

// Serve SPA for all non-API routes
app.get('*', (req, res, next) => {
  // `next()` when the build is missing: a JSON 404 from errorHandler is far
  // easier to diagnose than an HTML-less ENOENT from sendFile.
  if (!CLIENT_DIST) return next();
  return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startHttp = () => {
  server.listen(PORT, () => {
    console.log(`🚀 GBChat server running on port ${PORT}`);
    console.log(`   pid ${process.pid} · node ${process.env.NODE_ID || "local"}`);
  });
};

/**
 * Boot sequence.
 *
 * The HTTP listener (and the internal gRPC API) start even when MongoDB is
 * unreachable: probes and `/api/system/*` must keep answering so a load
 * balancer / orchestrator can see "degraded" instead of "connection refused",
 * and the process keeps retrying Mongo in the background instead of dying.
 */
const start = async () => {
  // Fail fast on a configuration that cannot work (production only); warn
  // everywhere else so a fresh clone with .env.example still boots.
  const env = validateEnv();
  if (!env.ok && String(process.env.ALLOW_INVALID_ENV || "") !== "true") {
    process.exit(1);
  }

  let dbReady = false;

  try {
    dbReady = await connectDB();
  } catch (error) {
    console.error("[boot] Mongo connection failed:", error.message);
  }

  if (dbReady) {
    try {
      await initializeAdmin();
    } catch (error) {
      console.warn("[boot] admin seed skipped:", error.message);
    }
  } else {
    console.warn("[boot] starting WITHOUT MongoDB — /api/system/ready will report degraded");
  }

  await startGrpcServer({ io }).catch((error) =>
    console.warn("[grpc] failed to start:", error.message)
  );

  // Background jobs. A Redis leader lock makes this safe with N replicas — only
  // one node executes each tick. Set SCHEDULER_ENABLED=false and run the
  // dedicated worker (npm run worker) instead if you prefer to split concerns.
  if (process.env.SCHEDULER_ENABLED !== "false" && dbReady) {
    startScheduler(io);
  }

  startHttp();
};

start().catch((error) => {
  console.error("[boot] fatal:", error);
  process.exit(1);
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