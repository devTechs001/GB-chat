// server/services/gateway/registry.js
/**
 * Service registry for the gateway.
 *
 * Two deployment shapes are supported from the same code:
 *
 *  1. **Monolith** (today, and the default): `GATEWAY_ENABLED` is false, so
 *     `index.js` mounts the routers in-process exactly as before. Nothing in
 *     this folder runs. This is deliberate — a refactor must not break the app.
 *
 *  2. **Composed**: `GATEWAY_ENABLED=true` and either `GATEWAY_ROUTES=all` or a
 *     comma-separated list of service ids. The listed prefixes are forwarded to
 *     the URL in `<SERVICE>_URL` and are no longer mounted locally.
 *
 * Because both shapes use the identical routers and the gateway forwards paths
 * untouched, a migrated prefix behaves the same whether it is local or remote.
 * Migration is therefore per-service and reversible with one env var.
 */

/**
 * Route prefixes per service. The first matching (longest) prefix wins, so
 * `/api/backup/local` must be listed before `/api/backup`.
 */
export const SERVICES = [
  {
    id: "identity",
    label: "Identity",
    description: "Authentication, users, contacts, devices, recovery, privacy",
    defaultPort: 5001,
    prefixes: [
      "/api/auth",
      "/api/users",
      "/api/contacts",
      "/api/devices",
      "/api/privacy",
      "/api/recovery",
      "/api/account",
      "/api/push",
    ],
  },
  {
    id: "messaging",
    label: "Messaging",
    description: "Chats, messages, media, search, translation, chat settings",
    defaultPort: 5002,
    prefixes: [
      "/api/chats",
      "/api/messages",
      "/api/chat-lock",
      "/api/chat-settings",
      "/api/chat-display",
      "/api/translations",
      "/api/emoji",
    ],
  },
  {
    id: "social",
    label: "Social",
    description: "Groups, stories, channels, calls",
    defaultPort: 5003,
    prefixes: ["/api/groups", "/api/stories", "/api/channels", "/api/calls"],
  },
  {
    id: "content",
    label: "Content & settings",
    description: "GB settings/features, appearance, notifications, permissions",
    defaultPort: 5004,
    prefixes: [
      "/api/gb-settings",
      "/api/gb-features",
      "/api/appearance",
      "/api/notifications",
      "/api/permissions",
    ],
  },
  {
    id: "data",
    label: "Data",
    description: "Storage, backups (Mongo, SQLite, offline), exports",
    defaultPort: 5005,
    prefixes: ["/api/storage", "/api/backup/local", "/api/backup/offline", "/api/backup"],
  },
];

const truthy = (value) => ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());

export const gatewayEnabled = () => truthy(process.env.GATEWAY_ENABLED);

/** Which services the gateway owns, or [] when running as a monolith. */
export const migratedServiceIds = () => {
  if (!gatewayEnabled()) return [];
  const raw = String(process.env.GATEWAY_ROUTES || "").trim();
  if (!raw || raw === "all") return SERVICES.map((s) => s.id);
  const wanted = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return SERVICES.filter((s) => wanted.includes(s.id)).map((s) => s.id);
};

const urlFor = (service) => {
  const envKey = `GATEWAY_${service.id.toUpperCase()}_URL`;
  return (
    process.env[envKey] ||
    process.env[`${service.id.toUpperCase()}_SERVICE_URL`] ||
    `http://127.0.0.1:${service.defaultPort}`
  );
};

/**
 * Prefix → service map for the migrated services, longest prefix first.
 * Returns [] in monolith mode (the caller then mounts everything locally).
 */
export const resolveRoutes = () => {
  const ids = migratedServiceIds();
  if (!ids.length) return [];

  return SERVICES.filter((s) => ids.includes(s.id))
    .flatMap((service) =>
      service.prefixes.map((prefix) => ({
        prefix,
        service: service.id,
        label: service.label,
        target: urlFor(service),
        timeoutMs: Number(process.env.GATEWAY_TIMEOUT_MS || 30000),
      }))
    )
    .sort((a, b) => b.prefix.length - a.prefix.length);
};

/** The prefix a given path belongs to, or null. */
export const matchRoute = (path, routes = resolveRoutes()) =>
  routes.find((route) => path === route.prefix || path.startsWith(`${route.prefix}/`)) || null;

/** True when the gateway owns this path (so index.js must not mount it locally). */
export const isProxied = (path) => Boolean(matchRoute(path));

export const servicesSnapshot = () => {
  const enabled = gatewayEnabled();
  const ids = migratedServiceIds();
  return SERVICES.map((service) => ({
    id: service.id,
    label: service.label,
    description: service.description,
    migrated: ids.includes(service.id),
    target: urlFor(service),
    prefixes: service.prefixes,
  }));
};

export default {
  SERVICES,
  gatewayEnabled,
  migratedServiceIds,
  resolveRoutes,
  matchRoute,
  isProxied,
  servicesSnapshot,
};
