// server/config/redis.js
import { createClient } from 'redis';

/**
 * Redis is optional: the app runs single-node with in-memory state, and
 * horizontally scales as soon as REDIS_URL is present.
 *
 * Clients created here:
 *   redis        – commands (cache, rate-limit store, presence)
 *   redisPub     – socket.io adapter publisher
 *   redisSub     – socket.io adapter subscriber
 *   redisQueueSub – internal cross-node fan-out (gRPC notifications, events)
 */

const url = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : '');

export const isRedisConfigured = Boolean(url);

let redis = null;
let redisPub = null;
let redisSub = null;
let redisQueueSub = null;
let connected = false;

const baseOptions = {
  url,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    connectTimeout: 10000,
  },
};

const build = (name) => {
  const client = createClient(baseOptions);
  client.on('error', (error) => {
    // Never crash the API because Redis hiccuped
    console.warn(`[redis:${name}] ${error.message}`);
  });
  client.on('ready', () => {
    if (name === 'main') connected = true;
    console.log(`[redis:${name}] ready`);
  });
  client.on('end', () => {
    if (name === 'main') connected = false;
  });
  return client;
};

export const getRedis = () => {
  if (!isRedisConfigured) return null;
  if (!redis) {
    redis = build('main');
    redis.connect().catch((error) => console.warn('[redis] connect failed:', error.message));
  }
  return redis;
};

const duplicate = async (name) => {
  const client = build(name);
  await client.connect();
  return client;
};

/** Pub/sub clients used by the Socket.IO Redis adapter */
export const getSocketAdapterClients = async () => {
  if (!isRedisConfigured) return null;
  if (!redisPub) redisPub = await duplicate('pub');
  if (!redisSub) redisSub = await duplicate('sub');
  return { pubClient: redisPub, subClient: redisSub };
};

/** Cross-node messaging channel (used by the gRPC notification fan-out) */
export const getQueueSubscriber = async () => {
  if (!isRedisConfigured) return null;
  if (!redisQueueSub) redisQueueSub = await duplicate('queue-sub');
  return redisQueueSub;
};

/**
 * Best-effort distributed lock.
 *
 * Returns `true` when the caller owns the lock for `ttlMs`. Without Redis the
 * call always succeeds (single-process deployments need no coordination).
 * The lock is released by expiry, so a crashed node can never deadlock the
 * others — keep the TTL slightly longer than the interval between runs.
 */
export const acquireLock = async (key, ttlMs = 60_000) => {
  const client = getRedis();
  if (!client) return true;

  try {
    const result = await client.set(`gbchat:lock:${key}`, process.env.NODE_ID || process.pid, {
      NX: true,
      PX: ttlMs,
    });
    return result === 'OK';
  } catch (error) {
    console.warn('[redis] lock failed, running unlocked:', error.message);
    return true;
  }
};

export const redisStatus = () => ({
  configured: isRedisConfigured,
  connected,
});

export const closeRedis = async () => {
  const clients = [redis, redisPub, redisSub, redisQueueSub].filter(Boolean);
  await Promise.allSettled(clients.map((client) => client.quit().catch(() => {})));
  redis = null;
  redisPub = null;
  redisSub = null;
  redisQueueSub = null;
  connected = false;
};

export default getRedis;
