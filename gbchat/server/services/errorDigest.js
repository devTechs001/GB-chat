// server/services/errorDigest.js
/**
 * Client-side error digest.
 *
 * A crash in a browser is invisible to the server unless the browser tells us.
 * This keeps the last N reports in memory (bounded, no new collection, no PII
 * beyond what the client chooses to send) so an operator can see "12 users hit
 * the same TypeError on /channels after the last deploy" without a SaaS.
 *
 * Deliberately in-memory: reports are diagnostics, not records. A restart
 * clears them, which is exactly when the counter should start over anyway.
 */

const MAX_REPORTS = Number(process.env.CLIENT_ERROR_BUFFER || 100);
const MAX_MESSAGE = 500;
const MAX_STACK = 4000;

const reports = [];
const counts = new Map(); // fingerprint -> { fingerprint, count, firstAt, lastAt }
let total = 0;
let dropped = 0;

const truncate = (value, max) => String(value ?? "").slice(0, max);

/**
 * Stable-ish fingerprint so repeated crashes from many users collapse into one
 * row: message + first stack frame + route.
 */
export const fingerprintOf = ({ message, stack, route }) => {
  const firstFrame =
    String(stack || "")
      .split("\n")
      .find((line) => line.trim().startsWith("at ")) || "";

  // Strip line:column and any cache-busting query string from the frame so the
  // same crash still groups after a deploy shifts the lines by ten.
  const normalizedFrame = firstFrame
    .trim()
    .replace(/:\d+:\d+/g, "")
    .replace(/\?[^)\s]*/g, "")
    .toLowerCase();

  return [truncate(message, 120), truncate(normalizedFrame, 120), truncate(route, 80)]
    .join(" | ")
    .toLowerCase();
};

export const recordClientError = (input = {}) => {
  const report = {
    id: `${Date.now().toString(36)}-${(total + 1).toString(36)}`,
    message: truncate(input.message, MAX_MESSAGE) || "Unknown client error",
    stack: truncate(input.stack, MAX_STACK),
    route: truncate(input.route, 200),
    component: truncate(input.component, 200),
    kind: truncate(input.kind || "error", 32), // error | unhandledrejection | boundary
    userAgent: truncate(input.userAgent, 300),
    appVersion: truncate(input.appVersion, 40),
    requestId: truncate(input.requestId, 128),
    name: truncate(input.name, 120),
    at: new Date().toISOString(),
  };

  total += 1;

  // Newest first; oldest falls off the end.
  reports.unshift(report);
  if (reports.length > MAX_REPORTS) reports.length = MAX_REPORTS;

  const fingerprint = fingerprintOf(report);
  const existing = counts.get(fingerprint);
  if (existing) {
    existing.count += 1;
    existing.lastAt = report.at;
  } else {
    counts.set(fingerprint, {
      fingerprint,
      message: report.message,
      route: report.route,
      count: 1,
      firstAt: report.at,
      lastAt: report.at,
    });
    // Bound the aggregation map too: drop the least frequent entry.
    if (counts.size > MAX_REPORTS) {
      let weakestKey = null;
      let weakest = Infinity;
      for (const [key, value] of counts) {
        if (value.count < weakest) {
          weakest = value.count;
          weakestKey = key;
        }
      }
      if (weakestKey) counts.delete(weakestKey);
    }
  }

  report.fingerprint = fingerprint;
  return report;
};

export const clientErrorSnapshot = ({ limit = 25 } = {}) => ({
  total,
  dropped,
  bufferSize: reports.length,
  reports: reports.slice(0, Math.min(Math.max(Number(limit) || 25, 1), MAX_REPORTS)),
  groups: [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 20),
  since: reports.length ? reports[reports.length - 1].at : null,
});

export const resetClientErrors = () => {
  dropped += reports.length;
  reports.length = 0;
  counts.clear();
  total = 0;
  return true;
};

export default { recordClientError, clientErrorSnapshot, resetClientErrors, fingerprintOf };
