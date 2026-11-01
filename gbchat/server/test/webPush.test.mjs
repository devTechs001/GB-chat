import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPayload,
  isPushConfigured,
  getVapidPublicKey,
  sendToUsers,
  sendToSubscription,
  getPushConfigError,
} from '../services/webPushService.js';
import { hashEndpoint, isGoneStatus } from '../models/PushSubscription.js';

test('buildPayload fills defaults and caps the text fields', () => {
  const payload = buildPayload({
    title: 'T'.repeat(500),
    body: 'B'.repeat(500),
  });

  assert.equal(payload.title.length, 120);
  assert.equal(payload.body.length, 240);
  assert.equal(payload.url, '/chats');
  assert.equal(payload.icon, '/icons/icon-192x192.png');
  assert.equal(payload.badge, '/icons/favicon-32x32.png');
  assert.equal(payload.force, false);
  assert.ok(payload.at);
});

test('buildPayload keeps the caller values that matter for routing', () => {
  const payload = buildPayload({
    title: 'Ada',
    body: 'Hi there',
    url: '/chats/65f000000000000000000001',
    tag: 'chat-65f000000000000000000001',
    type: 'message',
    data: { chatId: '65f000000000000000000001' },
  });

  assert.equal(payload.url, '/chats/65f000000000000000000001');
  assert.equal(payload.tag, 'chat-65f000000000000000000001');
  assert.equal(payload.type, 'message');
  assert.deepEqual(payload.data, { chatId: '65f000000000000000000001' });
});

test('sends are no-ops (never throw) when VAPID keys are absent', async () => {
  // This test env has no VAPID keys, which is exactly the "unconfigured" path
  // a fresh clone hits. It must be silent, not crash the caller.
  assert.equal(isPushConfigured(), false);
  assert.equal(getVapidPublicKey(), '');
  assert.ok(getPushConfigError());

  const result = await sendToUsers(['65f000000000000000000001'], { title: 'x' });
  assert.equal(result.sent, 0);
  assert.equal(result.configured, false);

  assert.equal(await sendToSubscription({ endpoint: 'https://example.test/x' }, buildPayload()), 'skipped');
  assert.equal((await sendToUsers([], { title: 'x' })).sent, 0);
});

test('endpoint hashing is stable, opaque and collision-free enough', () => {
  const endpoint = 'https://fcm.googleapis.com/fcm/send/abc123';
  assert.equal(hashEndpoint(endpoint), hashEndpoint(endpoint));
  assert.notEqual(hashEndpoint(endpoint), hashEndpoint(`${endpoint}4`));
  assert.match(hashEndpoint(endpoint), /^[0-9a-f]{64}$/);
  assert.equal(hashEndpoint(endpoint).includes('fcm'), false);
});

test('only 404 and 410 are treated as dead subscriptions', () => {
  assert.equal(isGoneStatus(404), true);
  assert.equal(isGoneStatus(410), true);
  assert.equal(isGoneStatus(400), false);
  assert.equal(isGoneStatus(500), false);
  assert.equal(isGoneStatus(0), false);
});
