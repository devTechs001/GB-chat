// server/middleware/observability.js
/**
 * Request identity + in-process metrics.
 *
 * No APM, no dependency: a bounded histogram per route template, a counter per
 * status class, and a request id that is echoed back and logged with anything
 * that goes wrong. That is enough to answer the three questions an operator
 * actually asks during an incident:
 *
 *   1. Is it slow?          → p50 / p95 / p99 per route
 *   2. Is it failing?       → 4xx / 5xx per route, plus the error log line
 *   3. Which request was it? → `x-request-id`, logged on the way out
 *
 * Memory is bounded: at most MAX_ROUTES distinct route templates are tracked
 * and each keeps a 200-sample reservoir (a fixed array, not an endless list).
 */
import crypto from "node:crypto";

const MAX_ROUTES = 200;
const RESERVOIR = 200;
const SLOW_MS = Number(process.env.SLOW_REQUEST_MS || 1000);

const startedAt = new Date();

/** key -> { count, errors, totalMs, maxMs, samples: number[], lastStatus, lastAt } */
const routes = new Map();
const statusClasses = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 };
let totalRequests = 0;
let totalMs = 0;
let slowRequests = 0;

/** Collapse ids so `/api/chats/65f.../messages` is one metric, not thousands. */
const routeTemplate = (req) => {
  const base = req.baseUrl || "";
  const path = req.route?.path && req.route.path !== "/" ? req.route.path : req.path || "";

  if (req.route?.path) return `${base}${req.route.path}`;

  return `${base}${path}`
    .replace(/\/[0-9a-f]{24}(?=\/|$)/gi, "/:id")
    .replace(/\/\d+(?=\/|$)/g, "/:n")
    .replace(/\/{2,}/g, "/") || "/";
};

const record = (key, status, ms) => {
  totalRequests += 1;
  totalMs += ms;

  const bucket =
    status >= 500 ? "5xx" : status >= 400 ? "4xx" : status >= 300 ? "3xx" : "2xx";
  statusClasses[bucket] += 1;

  if (ms >= SLOW_MS) slowRequests += 1;

  let entry = routes.get(key);
  if (!entry) {
    if (routes.size >= MAX_ROUTES) {
      // Evict the least-used route rather than growing without bound.
      let weakestKey = null;
      let weakest = Infinity;
      for (const [k, v] of routes) {
        if (v.count < weakest) {
          weakest = v.count;
          weakestKey = k;
        }
      }
      if (weakestKey) routes.delete(weakestKey);
    }
    entry = { count: 0, errors: 0, totalMs: 0, maxMs: 0, samples: [], lastStatus: 0, lastAt: null };
    routes.set(key, entry);
  }

  entry.count += 1;
  entry.totalMs += ms;
  entry.maxMs = Math.max(entry.maxMs, ms);
  entry.lastStatus = status;
  entry.lastAt = new Date().toISOString();
  if (status >= 500) entry.errors += 1;

  // Fixed-size reservoir: overwrite in a ring so the percentile stays recent.
  if (entry.samples.length < RESERVOIR) entry.samples.push(ms);
  else entry.samples[entry.count % RESERVOIR] = ms;
};

const percentile = (samples, p) => {
  if (!samples.length) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Math.round(sorted[index] * 100) / 100;
};

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */

export const requestId = (req, res, next) => {
  // Honour an upstream id (nginx, a cloud LB, the client's retry tooling) so a
  // whole trace shares one identifier.
  const incoming = req.headers["x-request-id"];
  const id =
    typeof incoming === "string" && incoming.length >= 8 && incoming.length <= 128
      ? incoming
      : crypto.randomUUID();

  req.id = id;
  res.setHeader("x-request-id", id);
  next();
};

export const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const key = `${req.method} ${routeTemplate(req)}`;
    record(key, res.statusCode, ms);

    if (ms >= SLOW_MS) {
      console.warn(
        `[slow] ${key} ${res.statusCode} ${ms.toFixed(0)}ms id=${req.id} user=${req.user?._id || "-"}`
      );
    }
  });

  next();
};

/* ------------------------------------------------------------------ */
/* Snapshot                                                            */
/* ------------------------------------------------------------------ */

export const metricsSnapshot = () => {
  const now = Date.now();

  const list = [...routes.entries()]
    .map(([key, entry]) => ({
      route: key,
      count: entry.count,
      errors: entry.errors,
      avgMs: Math.round((entry.totalMs / Math.max(entry.count, 1)) * 100) / 100,
      maxMs: Math.round(entry.maxMs * 100) / 100,
      p50: percentile(entry.samples, 50),
      p95: percentile(entry.samples, 95),
      p99: percentile(entry.samples, 99),
      lastStatus: entry.lastStatus,
      lastAt: entry.lastAt,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    startedAt: startedAt.toISOString(),
    uptimeSeconds: Math.round((now - startedAt.getTime()) / 1000),
    process: {
      pid: process.pid,
      node: process.version,
      memoryMb: Math.round(process.memoryUsage().rss / 1048576),
      cpuUserMs: Math.round(process.cpuUsage().user / 1000),
      eventLoopMs: 0,
    },
    totals: {
      requests: totalRequests,
      avgMs: Math.round((totalMs / Math.max(totalRequests, 1)) * 100) / 100,
      slowRequests,
      slowThresholdMs: SLOW_MS,
      statusClasses,
      errorRate:
        totalRequests > 0
          ? Math.round(((statusClasses["5xx"] / totalRequests) * 100 + Number.EPSILON) * 100) / 100
          : 0,
      trackedRoutes: routes.size,
    },
    routes: list,
  };
};

/**
 * Minimal Prometheus exposition format, so this can feed a scraper without a
 * metrics library. Enabled at `GET /api/system/metrics?format=prom`.
 */
export const metricsAsPrometheus = () => {
  const snapshot = metricsSnapshot();
  const lines = [];

  const label = (key) => key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  lines.push("# HELP gbchat_http_requests_total HTTP requests handled, by method and route");
  lines.push("# TYPE gbchat_http_requests_total counter");
  for (const route of snapshot.routes) {
    const [method, ...rest] = route.route.split(" ");
    lines.push(
      `gbchat_http_requests_total{method="${label(method)}",route="${label(rest.join(" "))}"} ${route.count}`
    );
  }

  lines.push("# HELP gbchat_http_request_duration_ms Request latency in milliseconds");
  lines.push("# TYPE gbchat_http_request_duration_ms gauge");
  for (const route of snapshot.routes) {
    const [method, ...rest] = route.route.split(" ");
    const labels = `method="${label(method)}",route="${label(rest.join(" "))}"`;
    lines.push(`gbchat_http_request_duration_ms{${labels},quantile="0.5"} ${route.p50}`);
    lines.push(`gbchat_http_request_duration_ms{${labels},quantile="0.95"} ${route.p95}`);
    lines.push(`gbchat_http_request_duration_ms{${labels},quantile="0.99"} ${route.p99}`);
  }

  lines.push("# HELP gbchat_process_resident_memory_mb Resident memory in MB");
  lines.push("# TYPE gbchat_process_resident_memory_mb gauge");
  lines.push(`gbchat_process_resident_memory_mb ${snapshot.process.memoryMb}`);

  lines.push("# HELP gbchat_uptime_seconds Process uptime in seconds");
  lines.push("# TYPE gbchat_uptime_seconds gauge");
  lines.push(`gbchat_uptime_seconds ${snapshot.uptimeSeconds}`);

  return `${lines.join("\n")}\n`;
};

export const resetMetrics = () => {
  routes.clear();
  statusClasses["2xx"] = 0;
  statusClasses["3xx"] = 0;
  statusClasses["4xx"] = 0;
  statusClasses["5xx"] = 0;
  totalRequests = 0;
  totalMs = 0;
  slowRequests = 0;
};
