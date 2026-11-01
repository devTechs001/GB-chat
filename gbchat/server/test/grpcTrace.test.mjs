import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { buildMetadata } from '../grpc/client.js';
import { requestId, currentRequestId } from '../middleware/observability.js';

/**
 * Trace propagation: an internal gRPC call made while serving an HTTP request
 * must carry that request's id, and a call made outside a request must not
 * invent one.
 */

test('no trace header outside of a request', () => {
  assert.equal(currentRequestId(), null);
  assert.equal(buildMetadata().get('x-request-id')?.[0], undefined);
});

test('the HTTP request id is attached to gRPC metadata', async () => {
  const app = express();
  app.use(requestId);

  let insideRange = null;
  let outsideRange = null;

  app.get('/trace', (req, res) => {
    insideRange = buildMetadata().get('x-request-id')?.[0];
    setTimeout(() => {
      // Still inside the request scope after an await/timer: this is what makes
      // controllers able to call grpcNotify() without passing ids around.
      outsideRange = buildMetadata().get('x-request-id')?.[0];
      res.json({ ok: true });
    }, 10);
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/trace`, {
      headers: { 'x-request-id': 'trace-grpc00001' },
    });
    await res.json();
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  assert.equal(insideRange, 'trace-grpc00001');
  assert.equal(outsideRange, 'trace-grpc00001');
});

test('request ids stay isolated between concurrent requests', async () => {
  const app = express();
  app.use(requestId);
  app.get('/slow/:id', async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, Number(req.params.id) === 1 ? 30 : 5));
    res.json({ seen: buildMetadata().get('x-request-id')?.[0] });
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    const [first, second] = await Promise.all([
      fetch(`http://127.0.0.1:${port}/slow/1`, { headers: { 'x-request-id': 'trace-aaaa1111' } }).then(
        (r) => r.json()
      ),
      fetch(`http://127.0.0.1:${port}/slow/2`, { headers: { 'x-request-id': 'trace-bbbb2222' } }).then(
        (r) => r.json()
      ),
    ]);

    assert.equal(first.seen, 'trace-aaaa1111');
    assert.equal(second.seen, 'trace-bbbb2222');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('buildMetadata keeps the gRPC auth token when configured', () => {
  const previous = process.env.GRPC_AUTH_TOKEN;
  process.env.GRPC_AUTH_TOKEN = 'secret-token';
  try {
    assert.equal(buildMetadata().get('authorization')[0], 'Bearer secret-token');
  } finally {
    if (previous === undefined) delete process.env.GRPC_AUTH_TOKEN;
    else process.env.GRPC_AUTH_TOKEN = previous;
  }
});
