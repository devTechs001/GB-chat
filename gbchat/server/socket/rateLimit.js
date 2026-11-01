// server/socket/rateLimit.js
/**
 * Per-socket token bucket.
 *
 * Socket.IO has no HTTP status codes, so abuse protection is done here: every
 * incoming event is charged against a bucket; when the bucket is empty the
 * event is dropped and the client receives a `rateLimited` notice. This keeps
 * a single misbehaving client from saturating a node (or Redis).
 */

const DEFAULT_CAPACITY = Number(process.env.SOCKET_RATE_CAPACITY) || 40;
const DEFAULT_REFILL_PER_SEC = Number(process.env.SOCKET_RATE_REFILL || 20);

export class TokenBucket {
  constructor({ capacity = DEFAULT_CAPACITY, refillPerSec = DEFAULT_REFILL_PER_SEC } = {}) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.tokens = capacity;
    this.updatedAt = Date.now();
  }

  consume(count = 1) {
    const now = Date.now();
    const elapsed = (now - this.updatedAt) / 1000;
    if (elapsed > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSec);
      this.updatedAt = now;
    }
    if (this.tokens < count) return false;
    this.tokens -= count;
    return true;
  }

  retryAfterMs(count = 1) {
    const missing = count - this.tokens;
    return Math.ceil((missing / this.refillPerSec) * 1000);
  }
}

/** Events that are cheap and should never be throttled */
const EXEMPT = new Set(['disconnect', 'error', 'ping', 'pong']);

export const socketRateLimit = (socket, { capacity, refillPerSec } = {}) => {
  const bucket = new TokenBucket({ capacity, refillPerSec });
  const originalOn = socket.on.bind(socket);

  socket.use((packet, next) => {
    const event = packet?.[0];
    if (!event || EXEMPT.has(event)) return next();

    if (bucket.consume()) return next();

    socket.emit('rateLimited', {
      event,
      retryAfterMs: bucket.retryAfterMs(),
      message: 'Too many events — slow down',
    });
    // Swallow the event: do not call next()
    return undefined;
  });

  return { originalOn, bucket };
};

export default socketRateLimit;
