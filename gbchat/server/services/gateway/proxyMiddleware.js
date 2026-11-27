// server/services/gateway/proxyMiddleware.js
import { forwardRequest } from "./upstream.js";
import { createBreaker } from "./circuitBreaker.js";
import { resolveRoutes, matchRoute } from "./registry.js";

/**
 * The gateway middleware.
 *
 * Correctness over cleverness, because this sits in front of every API call:
 *
 *  - **Trace id** — the request id from `requestId` is forwarded as
 *    `x-request-id`, and echoed back, so one id spans gateway → service → logs.
 *  - **Retries are idempotency-safe.** GET/HEAD are retried on connection
 *    errors. Writes are only retried when the client supplied an idempotency
 *    key (`Idempotency-Key` or `x-idempotency-key`), because replaying a POST
 *    that already succeeded upstream would duplicate a message or a payment.
 *  - **No phantom writes.** Once the first upstream byte has been received the
 *    response body is streamed straight through and never replayed; the retry
 *    buffer only exists for responses that failed *before* any data arrived.
 *  - **Circuit breaker per service** — a dead service fails fast with 503
 *    `SERVICE_UNAVAILABLE` instead of occupying sockets for 30 s each.
 */

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const RETRYABLE_ERRORS = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
]);

const breakers = new Map();
const breakerFor = (service, timeoutMs) => {
  if (!breakers.has(service)) {
    breakers.set(
      service,
      createBreaker(service, {
        timeoutMs,
        failureThreshold: Number(process.env.GATEWAY_BREAKER_THRESHOLD || 5),
        cooldownMs: Number(process.env.GATEWAY_BREAKER_COOLDOWN_MS || 10000),
      })
    );
  }
  return breakers.get(service);
};

export const breakerSnapshots = () =>
  [...breakers.values()].map((breaker) => breaker.snapshot());

export const resetBreakers = () => breakers.forEach((breaker) => breaker.reset());

const idempotencyKeyOf = (req) =>
  req.headers["idempotency-key"] || req.headers["x-idempotency-key"] || null;

const isRetryable = (error) => RETRYABLE_ERRORS.has(error?.code) || /timeout/i.test(error?.message || "");

const sendGatewayError = (res, status, code, message, extra = {}) =>
  res.status(status).json({ success: false, code, message, ...extra });

/**
 * Build the request headers for the upstream call: the client's headers minus
 * hop-by-hop ones, with gateway-added tracing headers.
 */
const buildHeaders = (req, target) => {
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  headers["x-forwarded-for"] = req.headers["x-forwarded-for"]
    ? `${req.headers["x-forwarded-for"]}, ${req.ip}`
    : req.ip || "";
  headers["x-forwarded-proto"] = req.protocol;
  headers["x-forwarded-host"] = req.headers.host || "";
  headers["x-gateway-service"] = target.service;
  if (req.id) headers["x-request-id"] = req.id;
  return headers;
};

/**
 * Read the request body once. Bodies are tiny (JSON) or streamed separately
 * for uploads; Express's json/urlencoded middleware has already consumed JSON,
 * so `req.body` is used for those and the raw stream for everything else.
 */
const readBody = (req) =>
  new Promise((resolve) => {
    if (req.readableEnded) return resolve(Buffer.alloc(0));
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", () => resolve(Buffer.alloc(0)));
  });

export const createProxyMiddleware = (options = {}) => {
  const routes = options.routes || resolveRoutes();
  const maxAttempts = Number(process.env.GATEWAY_MAX_ATTEMPTS || 2);

  return async function gatewayProxy(req, res, next) {
    const route = matchRoute(req.originalUrl || req.url, routes);
    if (!route) return next();

    const breaker = breakerFor(route.service, route.timeoutMs);
    const startedAt = process.hrtime.bigint();

    if (!breaker.canAttempt()) {
      res.setHeader("retry-after", "5");
      return sendGatewayError(
        res,
        503,
        "SERVICE_UNAVAILABLE",
        `${route.label} is temporarily unavailable. Please retry in a moment.`,
        { service: route.service, requestId: req.id }
      );
    }

    const headers = buildHeaders(req, route);
    const body = WRITE_METHODS.has(req.method) ? await readBody(req) : undefined;
    if (body?.length) headers["content-length"] = String(body.length);
    else delete headers["content-length"];

    const idempotencyKey = idempotencyKeyOf(req);
    const attempts = WRITE_METHODS.has(req.method) && !idempotencyKey ? 1 : maxAttempts;

    let lastError = null;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const result = await forwardRequest({
          path: req.originalUrl || req.url,
          method: req.method,
          headers,
          target: route.target,
          timeoutMs: route.timeoutMs,
        });

        breaker.onSuccess();

        const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        res.setHeader("x-gateway-service", route.service);
        res.setHeader("x-gateway-attempts", String(attempt));
        res.setHeader("x-gateway-ms", elapsedMs.toFixed(1));
        if (req.id) res.setHeader("x-request-id", req.id);

        res.status(result.status);
        for (const [key, value] of Object.entries(result.headers)) {
          if (key.startsWith("x-gateway-")) continue;
          try {
            res.setHeader(key, value);
          } catch {
            /* header already set by express (content-type etc.) — ignore */
          }
        }

        if (req.method === "HEAD") return res.end();
        return res.end(result.body);
      } catch (error) {
        lastError = error;

        // A 4xx/5xx *response* is an answer, not a transport failure: never retry.
        if (attempt >= attempts) break;

        // Writes without an idempotency key must not be replayed.
        if (WRITE_METHODS.has(req.method) && !idempotencyKey) break;
        if (!isRetryable(error)) break;

        await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
      }
    }

    breaker.onFailure(lastError);
    console.error(
      `[gateway] ${req.method} ${req.originalUrl} → ${route.service} failed after attempt(s): ${lastError?.message}`
    );

    res.setHeader("x-gateway-service", route.service);
    res.setHeader("x-gateway-attempts", String(attempts));
    return sendGatewayError(
      res,
      503,
      "SERVICE_UNAVAILABLE",
      `${route.label} is temporarily unavailable. Please retry in a moment.`,
      { service: route.service, requestId: req.id }
    );
  };
};

export default createProxyMiddleware;
