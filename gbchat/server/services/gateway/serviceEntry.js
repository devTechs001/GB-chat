// server/services/gateway/serviceEntry.js
//
// Entry point for a single service:  node services/gateway/serviceEntry.js messaging
//
//   SERVICE=messaging PORT=5002 node services/gateway/serviceEntry.js
//
// It boots the same mongodb connection, admin seed and graceful shutdown as the
// monolith, then mounts only its own routers.
//
// Sockets: Socket.IO stays on the gateway/monolith node. Splitting realtime out
// is a separate concern (sticky sessions, Redis adapter) and is explicitly not
// attempted here — a service is stateless HTTP, which is what makes it safe to
// scale independently.
import "../../config/env.js";

import { createServer } from "http";
import { connectDB } from "../../config/db.js";
import { createServiceApp } from "./serviceApp.js";
import { SERVICES } from "./registry.js";

/** service id → [ { mount, router } ] */
const ROUTERS = {
  identity: async () => [
    { mount: "/api/auth", router: (await import("../../routes/authRoutes.js")).default },
    { mount: "/api/users", router: (await import("../../routes/userRoutes.js")).default },
    { mount: "/api/contacts", router: (await import("../../routes/contactRoutes.js")).default },
    { mount: "/api/devices", router: (await import("../../routes/deviceRoutes.js")).default },
    { mount: "/api/privacy", router: (await import("../../routes/privacyRoutes.js")).default },
    { mount: "/api/recovery", router: (await import("../../routes/recoveryRoutes.js")).default },
    { mount: "/api/account", router: (await import("../../routes/accountRoutes.js")).default },
    { mount: "/api/push", router: (await import("../../routes/pushRoutes.js")).default },
  ],
  messaging: async () => [
    { mount: "/api/chats", router: (await import("../../routes/chatRoutes.js")).default },
    { mount: "/api/messages", router: (await import("../../routes/messageRoutes.js")).default },
    { mount: "/api/chat-lock", router: (await import("../../routes/chatLockRoutes.js")).default },
    { mount: "/api/chat-settings", router: (await import("../../routes/chatSettingsRoutes.js")).default },
    { mount: "/api/chat-display", router: (await import("../../routes/chatDisplayRoutes.js")).default },
    { mount: "/api/translations", router: (await import("../../routes/translationRoutes.js")).default },
    { mount: "/api/emoji", router: (await import("../../routes/emojiRoutes.js")).default },
  ],
  social: async () => [
    { mount: "/api/groups", router: (await import("../../routes/groupRoutes.js")).default },
    { mount: "/api/stories", router: (await import("../../routes/storyRoutes.js")).default },
    { mount: "/api/channels", router: (await import("../../routes/channelRoutes.js")).default },
    { mount: "/api/calls", router: (await import("../../routes/callRoutes.js")).default },
  ],
  content: async () => [
    { mount: "/api/gb-settings", router: (await import("../../routes/gbSettingsRoutes.js")).default },
    { mount: "/api/gb-features", router: (await import("../../routes/gbFeaturesRoutes.js")).default },
    { mount: "/api/appearance", router: (await import("../../routes/appearanceRoutes.js")).default },
    { mount: "/api/notifications", router: (await import("../../routes/notificationRoutes.js")).default },
    { mount: "/api/permissions", router: (await import("../../routes/permissionRoutes.js")).default },
  ],
  data: async () => [
    { mount: "/api/storage", router: (await import("../../routes/storageRoutes.js")).default },
    // Longest prefix first: /api/backup/:backupId must not swallow these.
    { mount: "/api/backup/local", router: (await import("../../routes/localBackupRoutes.js")).default },
    { mount: "/api/backup/offline", router: (await import("../../routes/offlineRoutes.js")).default },
    { mount: "/api/backup", router: (await import("../../routes/backupRoutes.js")).default },
  ],
};

const requested = process.argv[2] || process.env.SERVICE;
const service = SERVICES.find((entry) => entry.id === requested);

if (!service) {
  console.error(
    `Unknown service "${requested || ""}". Available: ${SERVICES.map((s) => s.id).join(", ")}`
  );
  process.exit(1);
}

const start = async () => {
  // Listen first, connect second — same posture as the monolith: a probe must
  // answer "degraded" immediately rather than hanging until Mongo times out
  // (three connection attempts × 15 s selection timeout = 45 s of silence).
  connectDB()
    .then((ok) =>
      ok
        ? console.log(`[${service.id}] database ready`)
        : console.error(`[${service.id}] starting WITHOUT MongoDB — DB routes return 503`)
    )
    .catch((error) => console.error(`[${service.id}] Mongo connection failed:`, error.message));

  const routes = await ROUTERS[service.id]();
  const app = createServiceApp({ routes, name: service.id });
  const server = createServer(app);
  const port = Number(process.env.PORT || service.defaultPort);

  server.listen(port, process.env.HOST || "0.0.0.0", () => {
    console.log(`🧩 ${service.label} service on :${port} — ${routes.length} routers`);
  });

  const shutdown = (signal) => {
    console.log(`[${service.id}] ${signal} received — draining…`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((error) => {
  console.error(`[${service.id}] failed to start:`, error);
  process.exit(1);
});
