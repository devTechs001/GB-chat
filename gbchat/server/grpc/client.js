// server/grpc/client.js
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { PROTO_PATH } from './server.js';

/**
 * Thin gRPC client used by REST controllers / services to talk to the
 * internal API (presence + notification fan-out). One channel per process,
 * lazily created; every call fails soft so HTTP requests are never blocked by
 * an unavailable internal service.
 */

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).gbchat.v1;

const target = process.env.GRPC_TARGET || `127.0.0.1:${process.env.GRPC_PORT || 50051}`;

let clients = null;

const metadata = () => {
  const meta = new grpc.Metadata();
  if (process.env.GRPC_AUTH_TOKEN) {
    meta.set('authorization', `Bearer ${process.env.GRPC_AUTH_TOKEN}`);
  }
  return meta;
};

export const getGrpcClients = () => {
  if (String(process.env.GRPC_CLIENT_ENABLED || 'true') === 'false') return null;
  if (clients) return clients;

  const options = {
    'grpc.keepalive_time_ms': 30000,
    'grpc.keepalive_timeout_ms': 10000,
    'grpc.max_receive_message_length': 4 * 1024 * 1024,
  };

  clients = {
    health: new proto.HealthService(target, grpc.credentials.createInsecure(), options),
    presence: new proto.PresenceService(target, grpc.credentials.createInsecure(), options),
    notifications: new proto.NotificationService(target, grpc.credentials.createInsecure(), options),
  };
  return clients;
};

const call = (client, method, payload, { timeout = 1500 } = {}) =>
  new Promise((resolve, reject) => {
    if (!client) return reject(new Error('gRPC client disabled'));
    client[method](payload, metadata(), { deadline: Date.now() + timeout }, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });

export const grpcPing = async () => {
  try {
    return await call(getGrpcClients()?.health, 'Ping', {});
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

export const grpcGetPresence = async (userId) => {
  try {
    return await call(getGrpcClients()?.presence, 'GetPresence', { user_id: String(userId) });
  } catch (error) {
    console.warn('[grpc] GetPresence failed:', error.message);
    return null;
  }
};

export const grpcSetStatus = async (userId, status) => {
  try {
    return await call(getGrpcClients()?.presence, 'SetStatus', {
      user_id: String(userId),
      status,
    });
  } catch (error) {
    console.warn('[grpc] SetStatus failed:', error.message);
    return null;
  }
};

/**
 * Push an in-app notification to one or more users on any node.
 * Returns { accepted, delivered_to } or null when the internal API is down.
 */
export const grpcNotify = async ({ userIds = [], title, body, type = 'system', data = {}, event }) => {
  try {
    return await call(getGrpcClients()?.notifications, 'Send', {
      user_ids: userIds.map(String),
      title,
      body: body || '',
      type,
      data_json: JSON.stringify(data || {}),
      event: event || '',
    });
  } catch (error) {
    console.warn('[grpc] Send notification failed:', error.message);
    return null;
  }
};

export const grpcStatus = async () => {
  const ping = await grpcPing();
  return {
    target,
    enabled: String(process.env.GRPC_CLIENT_ENABLED || 'true') !== 'false',
    healthy: Boolean(ping?.healthy),
    node: ping?.node || null,
    error: ping?.error || null,
  };
};

export default getGrpcClients;
