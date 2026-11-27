// server/utils/validators.js
/**
 * Shared validators.
 *
 * The API already answers with a consistent error envelope
 * (`{ success, code, message }`). What it lacked was one place that decides
 * whether an input is acceptable — each controller hand-rolled its own regexes
 * and length checks, so the rules drifted (`email` accepted in one endpoint and
 * rejected in another).
 *
 * These functions return booleans and never throw, which keeps them usable in
 * `if (!isEmail(x)) return res.status(400)...` and in unit tests alike.
 * Nothing in this file performs I/O.
 */

/** RFC-practical email check: one @, a dotted domain, no spaces. */
export const isEmail = (value) =>
  typeof value === "string" &&
  value.length <= 254 &&
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value.trim());

/** E.164-ish phone: optional +, 7–15 digits, allowing spaces/dashes. */
export const isPhone = (value) => {
  if (typeof value !== "string") return false;
  const digits = value.replace(/[^\d]/g, "");
  return /^\+?[\d\s\-().]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15;
};

/** MongoDB ObjectId (24 hex chars) or a 24-char string. */
export const isObjectId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export const isHexColor = (value) =>
  typeof value === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

export const isUrl = (value) => {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

/**
 * Password strength with a readable reason, so the API can explain a rejection
 * instead of a generic "invalid password".
 * @returns {{ valid: boolean, reason?: string, score: number }}
 */
export const checkPassword = (value) => {
  if (typeof value !== "string" || value.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters", score: 0 };
  }
  if (value.length > 128) {
    return { valid: false, reason: "Password must be at most 128 characters", score: 0 };
  }

  let score = 0;
  if (/[a-z]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^\w\s]/.test(value)) score += 1;
  if (value.length >= 12) score += 1;

  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
    return { valid: false, reason: "Password needs at least one letter and one number", score };
  }
  return { valid: true, score };
};

/** Trim, collapse whitespace, cap length. Safe on non-strings (returns ''). */
export const cleanText = (value, maxLength = 5000) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";

/** Keep newlines (message bodies) but strip control characters. */
export const cleanMessage = (value, maxLength = 20000) =>
  typeof value === "string"
    ? value
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim()
        .slice(0, maxLength)
    : "";

export const isLengthBetween = (value, min, max) =>
  typeof value === "string" && value.trim().length >= min && value.trim().length <= max;

/** Query-string boolean: accepts true/1/yes/on. */
export const toBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

/** Clamp a numeric query param into range. */
export const toInt = (value, { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0 } = {}) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

/** Standard 400 body for a validation failure. */
export const validationError = (message = "Invalid request", field) => ({
  success: false,
  code: "VALIDATION_ERROR",
  message,
  ...(field ? { field } : {}),
});

export default {
  isEmail,
  isPhone,
  isObjectId,
  isHexColor,
  isUrl,
  checkPassword,
  cleanText,
  cleanMessage,
  isLengthBetween,
  toBoolean,
  toInt,
  validationError,
};
