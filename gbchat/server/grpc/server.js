// server/grpc/server.js
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { getRedis, isRedisConfigured } from '../config/redis.js';

/**
 * Internal gRPC server.
 *
 * Runs next to the HTTP server (GRPC_PORT, default 50051) and exposes:
 *   HealthService.Ping          – node identity + health (used by the LB/k8s probes)
 *   PresenceService.GetPresence – presence lookup, Redis-backed across replicas
 *   PresenceService.SetStatus   – status write shared by all nodes
 *   NotificationService.Send    – fan-out to connected sockets on every node
 *
 * Security: in production the port should only be reachable on the private
 * network (docker network / VPC). Set GRPC_AUTH_TOKEN to require a bearer
 * token on every call.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.join(__dirname, '..', 'proto', 'gbchat.proto');

const NODE_ID = process.env.NODE_ID || `${os.hostname()}-${process.pid}`;
const STARTED_AT = new Date();

/* ------------------------------------------------------------------ */
/* Presence store (Redis when available, local Map otherwise)          */
/* ------------------------------------------------------------------ */
const localPresence = new Map();

const PRESENCE_TTL = 60; // seconds

const presenceKey = (userId) => `gbchat:presence:${userId}`;

const readPresence = async (userId) => {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get(presenceKey(userId));
      if (raw) return JSON.parse(raw);
    } catch (error) {
      console.warn('[grpc] presence read failed:', error.message);
    }
  }
  return localPresence.get(String(userId)) || null;
};

const writePresence = async (userId, payload) => {
  const record = {
    ...payload,
    userId: String(userId),
    updatedAt: Date.now(),
    servedBy: NODE_ID,
  };
  localPresence.set(String(userId), record);

  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(presenceKey(userId), JSON.stringify(record), { EX: PRESENCE_TTL });
      await redis.sAdd('gbchat:presence:index', String(userId));
    } catch (error) {
      console.warn('[grpc] presence write failed:', error.message);
    }
  }
  return record;
};

/** Called by the Socket.IO layer so gRPC lookups reflect real connections */
export const markPresence = async (userId, { online, status = 'online', socketId } = {}) => {
  const existing = (await readPresence(userId)) || { socketIds: [] };
  const socketIds = new Set(existing.socketIds || []);
  if (online && socketId) socketIds.add(socketId);
  if (!online && socketId) socketIds.delete(socketId);
  if (!online && socketIds.size > 0) {
    // other devices are still connected
    return writePresence(userId, {
      online: true,
      status: existing.status || 'online',
      socketIds: [...socketIds],
    });
  }
  return writePresence(userId, {
    online: Boolean(online && (socketIds.size > 0 || !socketId)),
    status: online ? status : 'offline',
    socketIds: [...socketIds],
  });
};

/* ------------------------------------------------------------------ */
/* Server                                                              */
/* ------------------------------------------------------------------ */
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).gbchat.v1;

const nodeInfo = (io) => ({
  node_id: NODE_ID,
  version: process.env.npm_package_version || '2.0.0',
  hostname: os.hostname(),
  pid: process.pid,
  uptime_seconds: Math.floor((Date.now() - STARTED_AT.getTime()) / 1000),
  started_at: STARTED_AT.toISOString(),
  redis: isRedisConfigured,
  connections: io?.engine?.clientsCount || 0,
});

const withAuth = (handler) => (call, callback) => {
  const token = process.env.GRPC_AUTH_TOKEN;
  if (token) {
    const provided = call.metadata.get('authorization')[0] || '';
    if (provided !== `Bearer ${token}`) {
      return callback({ code: grpc.status.UNAUTHENTICATED, message: 'Invalid gRPC token' });
    }
  }
  return handler(call, callback);
};

export const startGrpcServer = async ({ io } = {}) => {
  if (String(process.env.GRPC_ENABLED || 'true') === 'false') {
    console.log('[grpc] disabled via GRPC_ENABLED=false');
    return null;
  }

  const server = new grpc.Server();

  server.addService(proto.HealthService.service, {
    Ping: withAuth((call, callback) => {
      callback(null, {
        healthy: true,
        node: nodeInfo(io),
        message: `GBChat node ${NODE_ID} is healthy`,
      });
    }),
  });

  server.addService(proto.PresenceService.service, {
    GetPresence: withAuth(async (call, callback) => {
      const { user_id: userId } = call.request;
      const record = await readPresence(userId);
      callback(null, {
        user_id: userId,
        online: Boolean(record?.online),
        status: record?.status || 'offline',
        last_seen_ms: String(record?.updatedAt || 0),
        socket_ids: record?.socketIds || [],
        served_by: NODE_ID,
      });
    }),

    SetStatus: withAuth(async (call, callback) => {
      const { user_id: userId, status } = call.request;
      if (!userId) {
        return callback({ code: grpc.status.INVALID_ARGUMENT, message: 'user_id is required' });
      }
      const record = await writePresence(userId, {
        ...(await readPresence(userId)),
        status: status || 'online',
        online: (status || 'online') !== 'offline',
      });
      callback(null, {
        user_id: userId,
        online: Boolean(record.online),
        status: record.status,
        last_seen_ms: String(record.updatedAt),
        socket_ids: record.socketIds || [],
        served_by: NODE_ID,
      });
    }),
  });

  server.addService(proto.NotificationService.service, {
    Send: withAuth(async (call, callback) => {
      const { user_ids: userIds = [], title, body, type, data_json: dataJson, event } = call.request;

      if (!io) {
        return callback({ code: grpc.status.UNAVAILABLE, message: 'Socket layer not ready' });
      }

      const payload = {
        title,
        body,
        type: type || 'system',
        data: dataJson ? safeJson(dataJson) : {},
        at: new Date().toISOString(),
        servedBy: NODE_ID,
      };

      const eventName = event || 'notification';

      try {
        if (!userIds.length) {
          io.emit(eventName, payload);
          return callback(null, { accepted: true, delivered_to: io.engine.clientsCount, served_by: NODE_ID });
        }

        userIds.forEach((userId) => io.to(String(userId)).emit(eventName, payload));
        return callback(null, { accepted: true, delivered_to: userIds.length, served_by: NODE_ID });
      } catch (error) {
        return callback({ code: grpc.status.INTERNAL, message: error.message });
      }
    }),
  });

  const port = Number(process.env.GRPC_PORT || 50051);
  const bindAddress = `${process.env.GRPC_HOST || '0.0.0.0'}:${port}`;

  await new Promise((resolve, reject) => {
    server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  console.log(`🔌 gRPC internal API listening on ${bindAddress} (node ${NODE_ID})`);

  const shutdown = () => {
    try {
      server.tryShutdown(() => {});
    } catch {
      /* already closed */
    }
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return server;
};

const safeJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export { NODE_ID, PROTO_PATH };
