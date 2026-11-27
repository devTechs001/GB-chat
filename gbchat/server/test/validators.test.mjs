import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isEmail,
  isPhone,
  isObjectId,
  isHexColor,
  isUrl,
  checkPassword,
  cleanText,
  cleanMessage,
  toBoolean,
  toInt,
  validationError,
} from '../utils/validators.js';
import { formatDuration, initials, escapeRegex, uniq, chunk, pick, compactObject } from '../utils/helpers.js';

test('isEmail accepts real addresses and rejects malformed ones', () => {
  assert.equal(isEmail('ada@example.com'), true);
  assert.equal(isEmail('a.b+tag@sub.domain.co.ke'), true);
  assert.equal(isEmail('ada@example'), false);
  assert.equal(isEmail('ada@@example.com'), false);
  assert.equal(isEmail('ada example@x.com'), false);
  assert.equal(isEmail(null), false);
  assert.equal(isEmail(`${'a'.repeat(250)}@x.com`), false);
});

test('isPhone needs 7–15 digits and only phone punctuation', () => {
  assert.equal(isPhone('+254 712 345 678'), true);
  assert.equal(isPhone('0712-345-678'), true);
  assert.equal(isPhone('12345'), false);
  assert.equal(isPhone('call me maybe'), false);
  assert.equal(isPhone('+1234567890123456789'), false);
});

test('isObjectId, isHexColor and isUrl are strict about shape', () => {
  assert.equal(isObjectId('507f1f77bcf86cd799439011'), true);
  assert.equal(isObjectId('507f1f77bcf86cd79943901'), false);
  assert.equal(isObjectId('zzzzzzzzzzzzzzzzzzzzzzzz'), false);

  assert.equal(isHexColor('#fff'), true);
  assert.equal(isHexColor('#0ea5e9'), true);
  assert.equal(isHexColor('0ea5e9'), false);

  assert.equal(isUrl('https://example.com/a?b=1'), true);
  assert.equal(isUrl('javascript:alert(1)'), false);
  assert.equal(isUrl('not a url'), false);
});

test('checkPassword explains why it failed', () => {
  assert.equal(checkPassword('abc').valid, false);
  assert.match(checkPassword('abc').reason, /at least 8/);
  assert.equal(checkPassword('abcdefgh').valid, false); // no digit
  assert.equal(checkPassword('12345678').valid, false); // no letter
  assert.equal(checkPassword('abcd1234').valid, true);
  assert.ok(checkPassword('Abcd1234!xyz').score >= 4);
});

test('cleanText collapses whitespace, cleanMessage preserves newlines', () => {
  assert.equal(cleanText('  hello   world \n next '), 'hello world next');
  assert.equal(cleanText('x'.repeat(20), 5), 'xxxxx');
  assert.equal(cleanMessage('line1\nline2'), 'line1\nline2');
  assert.equal(cleanMessage('bad\u0000chars'), 'badchars');
  assert.equal(cleanText(undefined), '');
});

test('toBoolean and toInt coerce query params safely', () => {
  assert.equal(toBoolean('true'), true);
  assert.equal(toBoolean('1'), true);
  assert.equal(toBoolean('no'), false);
  assert.equal(toBoolean(undefined, true), true);

  assert.equal(toInt('12'), 12);
  assert.equal(toInt('999', { max: 50 }), 50);
  assert.equal(toInt('-3', { min: 0 }), 0);
  assert.equal(toInt('abc', { fallback: 7 }), 7);
});

test('validationError matches the API error envelope', () => {
  assert.deepEqual(validationError('Bad input', 'email'), {
    success: false,
    code: 'VALIDATION_ERROR',
    message: 'Bad input',
    field: 'email',
  });
});

test('helpers: duration, initials, regex escape, list utilities', () => {
  assert.equal(formatDuration(3725), '1h 2m');
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(0), '0s');
  assert.equal(formatDuration(undefined), '0s');

  assert.equal(initials('Ada Lovelace'), 'AL');
  assert.equal(initials('Ada'), 'A');
  assert.equal(initials(''), '?');

  assert.equal(escapeRegex('a.b*c'), 'a\\.b\\*c');
  assert.deepEqual(uniq([1, 1, 2, null, 3]), [1, 2, 3]);
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']), { a: 1, c: 3 });
  assert.deepEqual(compactObject({ a: 1, b: null, c: '', d: undefined, e: 0 }), { a: 1, e: 0 });
});
