import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { parse, stringify } from '../src/server.js';

test('parses comments', () => {
  const v = parse('{ /* block */ a: 1, // line comment\n b: 2 }');
  assert.deepEqual(v, { a: 1, b: 2 });
});

test('parses trailing commas', () => {
  const v = parse('[1, 2, 3,]');
  assert.deepEqual(v, [1, 2, 3]);
});

test('parses unquoted keys', () => {
  const v = parse('{ key: "value" }');
  assert.deepEqual(v, { key: 'value' });
});

test('parses single-quoted strings', () => {
  const v = parse("{ msg: 'hello' }");
  assert.deepEqual(v, { msg: 'hello' });
});

test('rejects truly malformed input', () => {
  assert.throws(() => parse('{ a: '));
});

test('stringify produces valid JSON5', () => {
  const out = stringify({ a: 1, b: 'two' });
  assert.match(out, /a:\s*1/);
});

test('round-trips JSON values', () => {
  const v = { a: 1, b: [2, 3], c: { d: 'four', e: null, f: true } };
  assert.deepEqual(parse(stringify(v)), v);
});

test('also parses plain JSON', () => {
  assert.deepEqual(parse('{"a": 1}'), { a: 1 });
});
