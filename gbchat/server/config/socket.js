// server/config/socket.js
/**
 * Socket.IO server options.
 *
 * These lived inline in `socket/index.js`, which made it impossible to tune one
 * deployment (e.g. a bigger buffer for a self-hosted instance, or polling-only
 * behind a restrictive proxy) without editing the server bootstrap. Config is
 * now a pure function of the environment and easy to unit-test.
 */

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value, fallback) =>
  typeof value === "string" && value.trim()
    ? value.split(",").map((entry) => entry.trim()).filter(Boolean)
    : fallback;

/**
 * @param {{ clientUrl?: string }} overrides
 * @returns {import("socket.io").ServerOptions}
 */
export const buildSocketOptions = (overrides = {}) => {
  const clientUrl = overrides.clientUrl || process.env.CLIENT_URL || "http://localhost:5173";

  // A comma-separated CLIENT_URL is legitimate (web app + published docs site).
  const origins = list(clientUrl, [clientUrl]);

  return {
    cors: {
      origin: origins.length === 1 ? origins[0] : origins,
      credentials: true,
      methods: ["GET", "POST"],
    },
    // 25 s heartbeat with a 60 s timeout tolerates a sleeping mobile radio
    // without declaring the client gone during a brief network blip.
    pingTimeout: num(process.env.SOCKET_PING_TIMEOUT, 60000),
    pingInterval: num(process.env.SOCKET_PING_INTERVAL, 25000),
    transports: list(process.env.SOCKET_TRANSPORTS, ["websocket", "polling"]),
    maxHttpBufferSize: num(process.env.SOCKET_MAX_BUFFER, 1e6),
    connectionStateRecovery: {
      maxDisconnectionDuration: num(process.env.SOCKET_RECOVERY_MS, 2 * 60 * 1000),
      skipMiddlewares: true,
    },
    // Behind nginx/the LB, the client's real address comes from X-Forwarded-For.
    serveClient: false,
  };
};

export default buildSocketOptions;
