// server/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedis } from '../config/redis.js';

/**
 * Rate limiting
 * -------------
 * Every policy below shares one key strategy: authenticated requests are
 * limited **per user id**, anonymous ones per IP (IPv6-safe via ipKeyGenerator).
 *
 * When REDIS_URL is set the counters live in Redis, so limits apply across all
 * server replicas; otherwise each process keeps its own in-memory counters.
 */

const WINDOW = (process.env.RATE_LIMIT_WINDOW_MS && Number(process.env.RATE_LIMIT_WINDOW_MS)) || 15 * 60 * 1000;

const redis = getRedis();

const makeStore = (prefix) => {
  if (!redis) return undefined; // falls back to the default memory store
  return new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
    prefix: `gbchat:rl:${prefix}:`,
  });
};

// Authenticated traffic is limited per account, anonymous per IP.
// IPv6 addresses are normalised to their /64 prefix so a single client cannot
// rotate through thousands of addresses.
const normalizeIp = (ip = '') => {
  const value = String(ip).replace(/^::ffff:/, '');
  if (!value.includes(':')) return value;
  return value.split(':').slice(0, 4).join(':');
};

const keyGenerator = (req) => (req.user?._id ? `u:${req.user._id}` : `ip:${normalizeIp(req.ip)}`);

const handler = (message) => (req, res) => {
  const retryAfter = Number(res.getHeader('Retry-After')) || Math.ceil(WINDOW / 1000);
  res.status(429).json({
    success: false,
    code: 'RATE_LIMITED',
    message,
    retryAfter,
  });
};

const create = ({ name, windowMs = WINDOW, max, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skipSuccessfulRequests,
    store: makeStore(name),
    handler: handler(message || 'Too many requests — please slow down'),
    // Health checks and static assets should never be throttled
    skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health' || req.path === '/api/ready',
  });

/* ------------------------------------------------------------------ */
/* Policies                                                            */
/* ------------------------------------------------------------------ */

/** Broad safety net for the whole API */
export const rateLimiter = create({
  name: 'global',
  max: Number(process.env.RATE_LIMIT_MAX) || 600,
  message: 'Too many requests — please slow down',
});

/** Login / register / OTP: the classic brute-force target */
export const authLimiter = create({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  message: 'Too many sign-in attempts — try again in 15 minutes',
  skipSuccessfulRequests: true,
});

/** Password reset & OTP resend (also anti email-bombing) */
export const passwordResetLimiter = create({
  name: 'pwreset',
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_RESET_MAX) || 5,
  message: 'Too many reset requests — try again in an hour',
});

/** Sending messages / stories / posts */
export const writeLimiter = create({
  name: 'write',
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_WRITE_MAX) || 120,
  message: 'You are sending messages too quickly',
});

/** Uploads are expensive (Cloudinary + sharp) */
export const uploadLimiter = create({
  name: 'upload',
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 60,
  message: 'Upload limit reached — try again later',
});

/** Search / analytics style read fan-out */
export const searchLimiter = create({
  name: 'search',
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_SEARCH_MAX) || 90,
  message: 'Too many searches — take a short break',
});

/** Call signalling storms */
export const callLimiter = create({
  name: 'call',
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_CALL_MAX) || 30,
  message: 'Too many call attempts — wait a minute',
});

/** Registration of new accounts per network */
export const registerLimiter = create({
  name: 'register',
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 10,
  message: 'Too many accounts created from this network',
});

/**
 * Introspection used by GET /api/system/info so operators can see the active
 * policies without reading the source.
 */
export const rateLimitInfo = () => ({
  windowMs: WINDOW,
  store: redis ? 'redis' : 'memory',
  policies: [
    { name: 'global', windowMs: WINDOW, max: Number(process.env.RATE_LIMIT_MAX) || 600 },
    { name: 'auth', windowMs: 15 * 60 * 1000, max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20 },
    { name: 'pwreset', windowMs: 60 * 60 * 1000, max: Number(process.env.RATE_LIMIT_RESET_MAX) || 5 },
    { name: 'write', windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_WRITE_MAX) || 120 },
    { name: 'upload', windowMs: 60 * 60 * 1000, max: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 60 },
    { name: 'search', windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_SEARCH_MAX) || 90 },
    { name: 'call', windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT_CALL_MAX) || 30 },
    { name: 'register', windowMs: 60 * 60 * 1000, max: Number(process.env.RATE_LIMIT_REGISTER_MAX) || 10 },
  ],
});

export default rateLimiter;
