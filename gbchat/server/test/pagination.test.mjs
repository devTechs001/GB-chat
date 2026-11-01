import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePagination,
  buildPageMeta,
  cursorFilter,
  setPaginationHeaders,
} from '../utils/pagination.js';

test('defaults apply when no params are given', () => {
  const p = parsePagination({}, { defaultLimit: 25, maxLimit: 100 });
  assert.equal(p.page, 1);
  assert.equal(p.limit, 25);
  assert.equal(p.skip, 0);
  assert.equal(p.cursor, null);
});

test('limit is clamped to the ceiling and never below one', () => {
  assert.equal(parsePagination({ limit: '1000' }, { maxLimit: 100 }).limit, 100);
  assert.equal(parsePagination({ limit: '0' }, { defaultLimit: 20 }).limit, 20);
  assert.equal(parsePagination({ limit: '-5' }, { defaultLimit: 20 }).limit, 20);
  assert.equal(parsePagination({ limit: 'abc' }, { defaultLimit: 20 }).limit, 20);
});

test('page drives the offset and rejects nonsense', () => {
  assert.equal(parsePagination({ page: '3', limit: '10' }).skip, 20);
  assert.equal(parsePagination({ page: '-2', limit: '10' }).page, 1);
  assert.equal(parsePagination({ page: 'NaN', limit: '10' }).page, 1);
});

test('cursor is trimmed and empty cursors are ignored', () => {
  assert.equal(parsePagination({ cursor: '  2024-01-02T00:00:00Z ' }).cursor, '2024-01-02T00:00:00Z');
  assert.equal(parsePagination({ cursor: '   ' }).cursor, null);
});

test('meta reports hasMore from an explicit flag or from totals', () => {
  assert.equal(buildPageMeta({ page: 1, limit: 10, hasMore: true }).hasMore, true);
  assert.equal(buildPageMeta({ page: 1, limit: 10, total: 35, returned: 10 }).hasMore, true);
  assert.equal(buildPageMeta({ page: 4, limit: 10, total: 35, returned: 5 }).hasMore, false);
  // No count available: a full page implies there may be another.
  assert.equal(buildPageMeta({ page: 2, limit: 10, returned: 10 }).hasMore, true);
  assert.equal(buildPageMeta({ page: 2, limit: 10, returned: 3 }).hasMore, false);
});

test('meta only exposes total/pages when a count was made', () => {
  const withTotal = buildPageMeta({ page: 2, limit: 10, total: 21, returned: 10 });
  assert.equal(withTotal.total, 21);
  assert.equal(withTotal.pages, 3);

  const withoutTotal = buildPageMeta({ page: 2, limit: 10, returned: 10 });
  assert.equal('total' in withoutTotal, false);
  assert.equal('pages' in withoutTotal, false);
});

test('cursor filter builds a strict date comparison and ignores junk', () => {
  const before = cursorFilter('createdAt', '2024-05-01T00:00:00.000Z');
  assert.ok(before.createdAt.$lt instanceof Date);
  assert.deepEqual(cursorFilter('createdAt', 'not-a-date'), {});
  assert.deepEqual(cursorFilter('createdAt', null), {});
  assert.ok(cursorFilter('createdAt', '2024-05-01', 'after').createdAt.$gt instanceof Date);
});

test('headers mirror the meta block for array-returning endpoints', () => {
  const headers = {};
  setPaginationHeaders(
    { setHeader: (k, v) => (headers[k] = v) },
    buildPageMeta({ page: 2, limit: 50, total: 120, returned: 50 })
  );
  assert.equal(headers['X-Total-Count'], '120');
  assert.equal(headers['X-Page'], '2');
  assert.equal(headers['X-Page-Limit'], '50');
  assert.equal(headers['X-Has-More'], 'true');
});

test('setPaginationHeaders tolerates a bare response object', () => {
  assert.doesNotThrow(() => setPaginationHeaders(undefined, buildPageMeta({ page: 1, limit: 5 })));
});
