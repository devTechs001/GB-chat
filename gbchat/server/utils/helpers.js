// server/utils/helpers.js
/**
 * Small, dependency-free helpers used across controllers.
 *
 * Kept deliberately boring: no I/O, no models, no express. Anything that needs
 * a request or a database belongs in a controller; anything here can be tested
 * with a plain assertion.
 */

/** Await `ms` milliseconds. */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Escape a string for safe use inside a RegExp (user search input). */
export const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Case-insensitive "contains" filter for Mongo queries. */
export const containsFilter = (value = "") => new RegExp(escapeRegex(value), "i");

/**
 * Retry an async function with exponential backoff.
 * Retries only on network-ish failures by default — replaying a validation
 * error is pointless and slows the caller down.
 */
export const retry = async (fn, { attempts = 3, baseDelayMs = 100, shouldRetry } = {}) => {
  const retryable = shouldRetry || ((error) => ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"].includes(error?.code));
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !retryable(error)) break;
      // eslint-disable-next-line no-await-in-loop
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastError;
};

/** Remove keys whose value is undefined/null/'' (partial updates). */
export const compactObject = (object = {}) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

/** Pick only the allowed keys from an object (mass-assignment guard). */
export const pick = (object = {}, keys = []) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)));

/** Drop the listed keys. */
export const omit = (object = {}, keys = []) =>
  Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));

/** Unique values, preserving order. */
export const uniq = (values = []) => [...new Set(values.filter(Boolean))];

/** Split an array into chunks. */
export const chunk = (values = [], size = 50) => {
  const output = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
};

/** Human duration: 3725 → "1h 2m". Used in call summaries and exports. */
export const formatDuration = (seconds = 0) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  if (!total) return "0s";
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return [hours && `${hours}h`, minutes && `${minutes}m`, (!hours && secs) || (!hours && !minutes && secs) ? `${secs}s` : ""]
    .filter(Boolean)
    .join(" ");
};

/** "Ada Lovelace" → "AL"; "Ada" → "A"; "" → "?" */
export const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/** Convert an ISO date/Date into a Mongo ObjectId-free sort key (descending). */
export const newestFirst = (a, b) =>
  new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();

/** True when the value is a plain object (not an array, Date or null). */
export const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

/** Safe JSON.parse with a fallback. */
export const parseJSON = (value, fallback = null) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

/** Parse `?tags=a,b,c` or `?tags=a&tags=b` into a clean array. */
export const parseList = (value, { limit = 100 } = {}) => {
  if (Array.isArray(value)) return uniq(value.map(String)).slice(0, limit);
  if (typeof value !== "string" || !value.trim()) return [];
  return uniq(value.split(",").map((entry) => entry.trim())).slice(0, limit);
};

/** Mask the middle of a secret for logs: "abcdef123456" → "abc***456". */
export const maskSecret = (value = "", visible = 3) => {
  const text = String(value);
  if (text.length <= visible * 2) return "***";
  return `${text.slice(0, visible)}***${text.slice(-visible)}`;
};

export default {
  sleep,
  escapeRegex,
  containsFilter,
  retry,
  compactObject,
  pick,
  omit,
  uniq,
  chunk,
  formatDuration,
  initials,
  newestFirst,
  isPlainObject,
  parseJSON,
  parseList,
  maskSecret,
};
