import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {
  requestId,
  metricsMiddleware,
  metricsSnapshot,
  metricsAsPrometheus,
  resetMetrics,
  currentRequestId,
} from '../middleware/observability.js';

/**
 * Spin up a throwaway express app on port 0 so these tests exercise the real
 * middleware order (requestId → metrics → route) instead of calling functions
 * directly.
 */
const withServer = async (buildRoutes, run) => {
  const app = express();
  app.use(requestId);
  app.use(metricsMiddleware);
  buildRoutes(app);

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test('requestId echoes an upstream id and mints one when absent', async () => {
  await withServer(
    (app) => app.get('/api/thing', (req, res) => res.json({ id: req.id })),
    async (base) => {
      const honoured = await fetch(`${base}/api/thing`, {
        headers: { 'x-request-id': 'trace-abcdef12' },
      });
      assert.equal(honoured.headers.get('x-request-id'), 'trace-abcdef12');
      assert.equal((await honoured.json()).id, 'trace-abcdef12');

      const minted = await fetch(`${base}/api/thing`);
      const id = minted.headers.get('x-request-id');
      assert.match(id, /^[0-9a-f-]{36}$/);
    }
  );
});

test('requestId rejects a too-short upstream id', async () => {
  await withServer(
    (app) => app.get('/x', (req, res) => res.json({ id: req.id })),
    async (base) => {
      const res = await fetch(`${base}/x`, { headers: { 'x-request-id': 'short' } });
      assert.notEqual(res.headers.get('x-request-id'), 'short');
    }
  );
});

test('the request id is available through async boundaries', async () => {
  await withServer(
    (app) =>
      app.get('/ctx', async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        res.json({ seen: currentRequestId() });
      }),
    async (base) => {
      const res = await fetch(`${base}/ctx`, { headers: { 'x-request-id': 'trace-context01' } });
      assert.equal((await res.json()).seen, 'trace-context01');
    }
  );
});

test('metrics collapse ids into one route template with percentiles', async () => {
  resetMetrics();

  await withServer(
    (app) => app.get('/api/chats/:id/messages', (req, res) => res.json({ id: req.params.id })),
    async (base) => {
      await fetch(`${base}/api/chats/65f000000000000000000001/messages`);
      await fetch(`${base}/api/chats/65f000000000000000000002/messages`);

      const snapshot = metricsSnapshot();
      const key = 'GET /api/chats/:id/messages';
      const route = snapshot.routes.find((r) => r.route === key);

      assert.ok(route, `expected a ${key} row, got ${snapshot.routes.map((r) => r.route)}`);
      assert.equal(route.count, 2);
      assert.equal(typeof route.p95, 'number');
      assert.ok(route.p95 >= 0);
      assert.equal(snapshot.totals.requests, 2);
      assert.equal(snapshot.totals.statusClasses['2xx'], 2);
    }
  );
});

test('server errors increment the 5xx counter, errors and errorRate', async () => {
  resetMetrics();

  await withServer(
    (app) => {
      app.get('/api/boom', (req, res) => res.status(500).json({ nope: true }));
      app.get('/api/fine', (req, res) => res.json({ ok: true }));
    },
    async (base) => {
      await fetch(`${base}/api/boom`);
      await fetch(`${base}/api/fine`);

      const snapshot = metricsSnapshot();
      assert.equal(snapshot.totals.statusClasses['5xx'], 1);
      assert.equal(snapshot.totals.statusClasses['2xx'], 1);
      assert.equal(snapshot.totals.errorRate, 50);

      const boom = snapshot.routes.find((r) => r.route === 'GET /api/boom');
      assert.equal(boom.errors, 1);
      assert.equal(boom.lastStatus, 500);
    }
  );
});

test('prometheus output has the expected metric names and labels', async () => {
  resetMetrics();

  await withServer(
    (app) => app.get('/api/prom/:id', (req, res) => res.json({ ok: true })),
    async (base) => {
      await fetch(`${base}/api/prom/1`);

      const text = metricsAsPrometheus();
      assert.match(text, /# TYPE gbchat_http_requests_total counter/);
      assert.match(text, /gbchat_http_requests_total\{method="GET",route="\/api\/prom\/:id"\} 1/);
      assert.match(
        text,
        /gbchat_http_request_duration_ms\{method="GET",route="\/api\/prom\/:id",quantile="0.95"\}/
      );
      assert.match(text, /gbchat_process_resident_memory_mb/);
      assert.match(text, /gbchat_uptime_seconds/);
    }
  );
});

test('resetMetrics clears counters but keeps the process block', async () => {
  resetMetrics();
  await withServer(
    (app) => app.get('/api/one', (req, res) => res.json({ ok: true })),
    async (base) => {
      await fetch(`${base}/api/one`);
      assert.ok(metricsSnapshot().totals.requests > 0);

      resetMetrics();
      const after = metricsSnapshot();
      assert.equal(after.totals.requests, 0);
      assert.equal(after.routes.length, 0);
      assert.ok(after.process.pid > 0);
    }
  );
});
