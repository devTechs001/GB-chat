import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SERVICES,
  gatewayEnabled,
  migratedServiceIds,
  resolveRoutes,
  matchRoute,
  isProxied,
  servicesSnapshot,
} from '../services/gateway/registry.js';
import { createBreaker } from '../services/gateway/circuitBreaker.js';

const withEnv = (vars, fn) => {
  const previous = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test('monolith mode is the default and owns no routes', () => {
  withEnv({ GATEWAY_ENABLED: undefined, GATEWAY_ROUTES: undefined }, () => {
    assert.equal(gatewayEnabled(), false);
    assert.deepEqual(migratedServiceIds(), []);
    assert.deepEqual(resolveRoutes(), []);
    assert.equal(isProxied('/api/groups'), false);
  });
});

test('every service declares prefixes and a distinct default port', () => {
  const ports = new Set();
  for (const service of SERVICES) {
    assert.ok(service.prefixes.length > 0, `${service.id} has no prefixes`);
    assert.ok(!ports.has(service.defaultPort), `${service.defaultPort} reused`);
    ports.add(service.defaultPort);
  }
});

test('no prefix is claimed twice across services', () => {
  const seen = new Map();
  for (const service of SERVICES) {
    for (const prefix of service.prefixes) {
      assert.equal(seen.has(prefix), false, `${prefix} claimed by ${seen.get(prefix)} and ${service.id}`);
      seen.set(prefix, service.id);
    }
  }
});

test('GATEWAY_ROUTES selects only the listed services', () => {
  withEnv({ GATEWAY_ENABLED: 'true', GATEWAY_ROUTES: 'social' }, () => {
    assert.deepEqual(migratedServiceIds(), ['social']);
    const routes = resolveRoutes();
    assert.ok(routes.every((route) => route.service === 'social'));
    assert.equal(isProxied('/api/groups/123/polls'), true);
    assert.equal(isProxied('/api/users/me'), false);
  });
});

test('the longest prefix wins so /api/backup/local is not swallowed', () => {
  withEnv({ GATEWAY_ENABLED: 'true', GATEWAY_ROUTES: 'data' }, () => {
    const routes = resolveRoutes();
    assert.equal(matchRoute('/api/backup/local/list', routes)?.prefix, '/api/backup/local');
    assert.equal(matchRoute('/api/backup/abc', routes)?.prefix, '/api/backup');
    assert.equal(matchRoute('/api/backup', routes)?.prefix, '/api/backup');
    // "/api/backups" must not match "/api/backup"
    assert.equal(matchRoute('/api/backups', routes), null);
  });
});

test('a service URL can be overridden by env', () => {
  withEnv(
    {
      GATEWAY_ENABLED: 'true',
      GATEWAY_ROUTES: 'social',
      GATEWAY_SOCIAL_URL: 'http://social.internal:9000',
    },
    () => {
      assert.equal(resolveRoutes().find((route) => route.service === 'social').target, 'http://social.internal:9000');
    }
  );
});

test('GATEWAY_ROUTES=all migrates every service', () => {
  withEnv({ GATEWAY_ENABLED: 'true', GATEWAY_ROUTES: 'all' }, () => {
    assert.equal(migratedServiceIds().length, SERVICES.length);
    assert.equal(servicesSnapshot().every((service) => service.migrated), true);
  });
});

test('breaker opens after the threshold and recovers through half-open', () => {
  const breaker = createBreaker('test', { failureThreshold: 2, cooldownMs: 0, halfOpenProbes: 1 });
  assert.equal(breaker.canAttempt(), true);

  breaker.onFailure(new Error('boom'));
  assert.equal(breaker.snapshot().status, 'closed');

  breaker.onFailure(new Error('boom'));
  assert.equal(breaker.snapshot().status, 'open');
  assert.equal(breaker.snapshot().lastError, 'boom');

  // cooldownMs is 0, so the next attempt flips to half-open and is allowed.
  assert.equal(breaker.canAttempt(), true);
  assert.equal(breaker.snapshot().status, 'half-open');

  breaker.onSuccess();
  assert.equal(breaker.snapshot().status, 'closed');
});

test('breaker stays open (and counts rejections) during the cooldown', () => {
  const breaker = createBreaker('test', { failureThreshold: 1, cooldownMs: 60000 });
  breaker.onFailure(new Error('down'));
  const before = breaker.snapshot().rejected;
  assert.equal(breaker.canAttempt(), false);
  assert.equal(breaker.canAttempt(), false);
  assert.equal(breaker.snapshot().rejected, before + 2);
});

test('a failed half-open probe re-opens the circuit', () => {
  const breaker = createBreaker('test', { failureThreshold: 1, cooldownMs: 0 });
  breaker.onFailure(new Error('down'));
  assert.equal(breaker.canAttempt(), true); // half-open
  breaker.onFailure(new Error('still down'));
  assert.equal(breaker.snapshot().status, 'open');
});
