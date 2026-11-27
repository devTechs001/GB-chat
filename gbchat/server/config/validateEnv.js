// server/config/validateEnv.js
/**
 * Boot-time environment check.
 *
 * A server that starts in production with a placeholder JWT secret can sign
 * tokens that anyone can forge, and a missing database URI means every request
 * eventually fails with a 503 nobody connected to configuration. Both are cheap
 * to detect at boot and expensive to discover in production.
 *
 * Policy:
 *   errors   → production refuses to boot (fail fast, before traffic)
 *   warnings → log a line and keep going (optional integrations)
 *
 * Development is warning-only so a fresh clone still runs with the checked-in
 * example values.
 */

const PLACEHOLDER_PATTERNS = [/change[-_]?me/i, /your-?super-?secret/i, /^secret$/i, /replace-?in-?production/i, /example/i];

const isPlaceholder = (value) => PLACEHOLDER_PATTERNS.some((re) => re.test(String(value || "")));

const REQUIRED = [
  {
    key: "JWT_SECRET",
    why: "every access token is signed with it",
    check: (v) => (v || "").length >= 32 && !isPlaceholder(v),
    fix: "generate one: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
  },
  {
    key: "MONGODB_URI",
    why: "every database action depends on it",
    check: (v) => /^mongodb(\+srv)?:\/\//.test(v || ""),
    fix: "set MONGODB_URI (or MONGODB_URL) to your Atlas / self-hosted connection string",
  },
];

const RECOMMENDED = [
  { key: "CLIENT_URL", why: 'the web app\'s CORS origin is unrestricted' },
  { key: "VAPID_PUBLIC_KEY", why: "push notifications cannot be delivered (in-app still works)" },
  { key: "VAPID_PRIVATE_KEY", why: "push notifications cannot be delivered (in-app still works)" },
  { key: "CLOUDINARY_CLOUD_NAME", why: "avatars, attachments and story media cannot be uploaded" },
  { key: "REDIS_URL", why: "rate limiting and presence stay per-process (fine for one replica)" },
];

export const validateEnv = ({ strict = process.env.NODE_ENV === "production", logger = console } = {}) => {
  const errors = [];
  const warnings = [];

  for (const rule of REQUIRED) {
    const value = process.env[rule.key];
    if (!rule.check(value)) {
      const detail = !value
        ? "is missing"
        : isPlaceholder(value)
        ? "still holds the placeholder value from .env.example"
        : "is set but invalid";
      errors.push(`${rule.key} ${detail} — ${rule.why}. ${rule.fix}`);
    }
  }

  for (const rule of RECOMMENDED) {
    if (!process.env[rule.key]) warnings.push(`${rule.key} is not set — ${rule.why}`);
  }

  if (process.env.NODE_ENV === "production" && String(process.env.CORS_ALLOW_ALL || "") === "true") {
    warnings.push("CORS_ALLOW_ALL is enabled in production — any origin can call the API");
  }

  const fatal = strict && errors.length > 0;

  for (const message of errors) {
    if (fatal) logger.error(`[env] ✖ ${message}`);
    else logger.warn(`[env] ⚠ ${message}`);
  }
  for (const message of warnings) logger.warn(`[env] ⚠ ${message}`);

  if (fatal) {
    logger.error(
      "[env] refusing to start in production with an invalid configuration (set ALLOW_INVALID_ENV=true to override)"
    );
  }

  return { ok: !fatal, errors, warnings, strict };
};

export default validateEnv;
