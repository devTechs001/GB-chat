import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { errorHandler } from '../middleware/errorHandler.js';
import { validateEnv } from '../config/validateEnv.js';

/**
 * The error surface is what a client actually sees when something breaks, so it
 * is tested through a real express app: throw from a route, assert the status,
 * code, message and that internals never leak.
 */

const buildApp = (handler, { production = false } = {}) => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    req.id = 'test-request-id';
    next();
  });
  app.all('/boom', handler);
  app.use(errorHandler);

  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = production ? 'production' : 'test';
  return { app, restore: () => (process.env.NODE_ENV = previous) };
};

const call = async (app, init) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}/boom`, init);
    return { status: res.status, body: await res.json(), headers: res.headers };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('a plain error becomes a 500 with a code and the request id', async () => {
  const { app, restore } = buildApp((req, res, next) => next(new Error('kaboom')));
  try {
    const { status, body, headers } = await call(app);
    assert.equal(status, 500);
    assert.equal(body.success, false);
    assert.equal(body.code, 'INTERNAL_ERROR');
    assert.equal(body.message, 'kaboom');
    assert.equal(headers.get('x-request-id'), 'test-request-id');
  } finally {
    restore();
  }
});

test('production hides internal 5xx messages', async () => {
  const { app, restore } = buildApp((req, res, next) => next(new Error('secret internals here')), {
    production: true,
  });
  try {
    const { body } = await call(app);
    assert.equal(body.message, 'Something went wrong on our side');
    assert.equal(JSON.stringify(body).includes('secret internals'), false);
  } finally {
    restore();
  }
});

test('a database outage is a 503 with a retryable message, not a 500', async () => {
  const error = new Error('Operation `users.findOne()` buffering timed out after 2000ms');
  error.name = 'MongooseError';
  const { app, restore } = buildApp((req, res, next) => next(error));
  try {
    const { status, body } = await call(app);
    assert.equal(status, 503);
    assert.equal(body.code, 'DATABASE_UNAVAILABLE');
    assert.match(body.message, /retry/i);
  } finally {
    restore();
  }
});

test('malformed JSON is a 400 INVALID_BODY', async () => {
  const { app, restore } = buildApp((req, res) => res.json({ ok: true }));
  try {
    const { status, body } = await call(app, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"broken": ',
    });
    assert.equal(status, 400);
    assert.equal(body.code, 'INVALID_BODY');
    assert.match(body.message, /not valid JSON/);
  } finally {
    restore();
  }
});

test('an oversized payload is a 413 PAYLOAD_TOO_LARGE', async () => {
  const { app, restore } = buildApp((req, res) => res.json({ ok: true }));
  try {
    const { status, body } = await call(app, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blob: 'a'.repeat(2 * 1024 * 1024) }),
    });
    assert.equal(status, 413);
    assert.equal(body.code, 'PAYLOAD_TOO_LARGE');
  } finally {
    restore();
  }
});

test('mongoose shape errors keep their specific codes', async () => {
  const validation = Object.assign(new Error('Validation failed'), {
    name: 'ValidationError',
    errors: { email: { message: 'Email is required' }, phone: { message: 'Phone is invalid' } },
  });
  const { app, restore } = buildApp((req, res, next) => next(validation));
  try {
    const { status, body } = await call(app);
    assert.equal(status, 400);
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.equal(body.message, 'Email is required, Phone is invalid');
  } finally {
    restore();
  }

  const duplicate = Object.assign(new Error('E11000 duplicate key'), {
    code: 11000,
    keyValue: { email: 'a@b.c' },
  });
  const second = buildApp((req, res, next) => next(duplicate));
  try {
    const { body } = await call(second.app);
    assert.equal(body.code, 'DUPLICATE_KEY');
    assert.match(body.message, /email already exists/);
  } finally {
    second.restore();
  }
});

test('headers already sent are handed back to express', async () => {
  const app = express();
  let passedThrough = false;
  app.get('/boom', (req, res, next) => {
    res.headersSent_ = true;
    res.json = () => {};
    res.status = () => res;
    res.setHeader = () => {};
    Object.defineProperty(res, 'headersSent', { value: true });
    next(new Error('after send'));
  });
  app.use((err, req, res, next) => {
    passedThrough = true;
    next(err);
  });
  app.use(errorHandler);

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await fetch(`http://127.0.0.1:${port}/boom`).catch(() => {});
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  assert.equal(passedThrough, true);
});

/* ------------------------------- validateEnv ------------------------------- */

const withEnv = (overrides, run) => {
  const previous = {};
  for (const [key, value] of Object.entries(overrides)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

const silentLogger = { warn() {}, error() {} };

test('a placeholder JWT secret is an error in strict mode', () => {
  const result = withEnv(
    {
      JWT_SECRET: 'your-super-secret-jwt-key-min-32-chars-replace-in-production',
      MONGODB_URI: 'mongodb://localhost:27017/gbchat',
    },
    () => validateEnv({ strict: true, logger: silentLogger })
  );

  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /JWT_SECRET/);
  assert.match(result.errors[0], /placeholder/);
});

test('a missing Mongo URI is an error, a valid pair passes', () => {
  const missing = withEnv(
    { JWT_SECRET: 'a'.repeat(48), MONGODB_URI: undefined, MONGODB_URL: undefined },
    () => validateEnv({ strict: true, logger: silentLogger })
  );
  assert.equal(missing.ok, false);
  assert.match(missing.errors[0], /MONGODB_URI/);

  const valid = withEnv(
    {
      JWT_SECRET: 'a'.repeat(48),
      MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/gbchat',
    },
    () => validateEnv({ strict: true, logger: silentLogger })
  );
  assert.equal(valid.ok, true);
  assert.equal(valid.errors.length, 0);
});

test('non-strict mode reports the same problems without blocking boot', () => {
  const result = withEnv(
    { JWT_SECRET: 'short', MONGODB_URI: 'not-a-uri' },
    () => validateEnv({ strict: false, logger: silentLogger })
  );

  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 2);
});

test('optional integrations are warnings, never errors', () => {
  const result = withEnv(
    {
      JWT_SECRET: 'b'.repeat(48),
      MONGODB_URI: 'mongodb://localhost:27017/gbchat',
      VAPID_PUBLIC_KEY: undefined,
      REDIS_URL: undefined,
    },
    () => validateEnv({ strict: true, logger: silentLogger })
  );

  assert.equal(result.ok, true);
  assert.ok(result.warnings.some((w) => w.includes('VAPID_PUBLIC_KEY')));
  assert.ok(result.warnings.some((w) => w.includes('REDIS_URL')));
});
