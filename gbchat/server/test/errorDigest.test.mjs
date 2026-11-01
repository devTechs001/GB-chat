import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordClientError,
  clientErrorSnapshot,
  resetClientErrors,
  fingerprintOf,
} from '../services/errorDigest.js';

const report = (overrides = {}) => ({
  message: 'Cannot read properties of undefined (reading "map")',
  stack: 'TypeError: boom\n    at ChannelList (ChannelList.jsx:42:11)\n    at renderWithHooks',
  route: '/channels',
  kind: 'boundary',
  ...overrides,
});

test('a report is stored newest-first with a fingerprint', () => {
  resetClientErrors();
  recordClientError(report({ message: 'first' }));
  recordClientError(report({ message: 'second' }));

  const snapshot = clientErrorSnapshot();
  assert.equal(snapshot.total, 2);
  assert.equal(snapshot.reports[0].message, 'second');
  assert.ok(snapshot.reports[0].fingerprint);
  assert.ok(snapshot.reports[0].id);
});

test('the same crash from many users collapses into one group', () => {
  resetClientErrors();
  for (let i = 0; i < 5; i += 1) recordClientError(report());

  const snapshot = clientErrorSnapshot();
  assert.equal(snapshot.total, 5);
  assert.equal(snapshot.groups.length, 1);
  assert.equal(snapshot.groups[0].count, 5);
});

test('different routes or messages produce different groups', () => {
  resetClientErrors();
  recordClientError(report());
  recordClientError(report({ route: '/stories' }));
  recordClientError(report({ message: 'something else entirely' }));

  assert.equal(clientErrorSnapshot().groups.length, 3);
});

test('long fields are truncated so one report cannot bloat the buffer', () => {
  resetClientErrors();
  const stored = recordClientError({
    message: 'x'.repeat(5000),
    stack: 'y'.repeat(20000),
    route: 'z'.repeat(1000),
  });

  assert.equal(stored.message.length, 500);
  assert.equal(stored.stack.length, 4000);
  assert.equal(stored.route.length, 200);
});

test('missing fields fall back instead of storing undefined', () => {
  resetClientErrors();
  const stored = recordClientError({ route: '/chats' });
  assert.equal(stored.message, 'Unknown client error');
  assert.equal(stored.stack, '');
  assert.equal(stored.kind, 'error');
});

test('the buffer is bounded and keeps the newest reports', () => {
  resetClientErrors();
  const buffer = Number(process.env.CLIENT_ERROR_BUFFER || 100);
  for (let i = 0; i < buffer + 25; i += 1) {
    recordClientError(report({ message: `error ${i}` }));
  }

  const snapshot = clientErrorSnapshot({ limit: 500 });
  assert.equal(snapshot.bufferSize, buffer);
  assert.equal(snapshot.reports.length, buffer);
  assert.equal(snapshot.reports[0].message, `error ${buffer + 24}`);
});

test('limit is clamped and defaults sanely', () => {
  resetClientErrors();
  for (let i = 0; i < 30; i += 1) recordClientError(report({ message: `e${i}` }));

  assert.equal(clientErrorSnapshot({ limit: 5 }).reports.length, 5);
  assert.ok(clientErrorSnapshot({ limit: 0 }).reports.length >= 1);
  assert.ok(clientErrorSnapshot({ limit: 'nonsense' }).reports.length >= 1);
});

test('reset clears both reports and groups', () => {
  resetClientErrors();
  recordClientError(report());
  resetClientErrors();

  const snapshot = clientErrorSnapshot();
  assert.equal(snapshot.total, 0);
  assert.equal(snapshot.reports.length, 0);
  assert.equal(snapshot.groups.length, 0);
});

test('fingerprint ignores line numbers in later frames', () => {
  const a = fingerprintOf({
    message: 'boom',
    stack: 'Error: boom\n    at Thing (a.jsx:1:1)\n    at Other (b.jsx:9:9)',
    route: '/chats',
  });
  const b = fingerprintOf({
    message: 'boom',
    stack: 'Error: boom\n    at Thing (a.jsx:99:99)\n    at Other (b.jsx:2:2)',
    route: '/chats',
  });
  assert.equal(a, b);
});
