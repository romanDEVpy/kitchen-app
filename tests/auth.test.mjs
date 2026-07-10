import test from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../src/lib/auth.js';

test('signed auth token round-trips role and username', async () => {
  const token = await signToken({ username: 'admin', role: 'admin', exp: Date.now() + 60_000 }, 'test-secret');
  const payload = await verifyToken(token, 'test-secret');

  assert.equal(payload.username, 'admin');
  assert.equal(payload.role, 'admin');
});

test('expired auth token is rejected', async () => {
  const token = await signToken({ username: 'manager', role: 'manager', exp: Date.now() - 1 }, 'test-secret');

  assert.equal(await verifyToken(token, 'test-secret'), null);
});

test('tampered auth token is rejected', async () => {
  const token = await signToken({ username: 'admin', role: 'admin', exp: Date.now() + 60_000 }, 'test-secret');
  const tampered = `${token.slice(0, -1)}${token.endsWith('0') ? '1' : '0'}`;

  assert.equal(await verifyToken(tampered, 'test-secret'), null);
});
