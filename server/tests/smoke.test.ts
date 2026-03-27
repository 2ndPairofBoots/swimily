import test from 'node:test';
import assert from 'node:assert/strict';

import { createServer } from '../src/server';
import { SCHEMA_SQL } from '../src/storage/db';

test('GET /api/healthz returns ok + db status', async () => {
  const { server } = createServer();

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');

  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/healthz`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.ok, true);
    assert.ok(body.db === 'ok' || body.db === 'error');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('schema includes birthday on users table', () => {
  assert.match(SCHEMA_SQL, /birthday DATE/);
});

test('schema includes preferred_courses on user_preferences', () => {
  assert.match(SCHEMA_SQL, /preferred_courses TEXT\[\]/);
});

test('schema includes notifications_enabled on user_notification_settings', () => {
  assert.match(SCHEMA_SQL, /notifications_enabled BOOLEAN NOT NULL DEFAULT true/);
});

test('GET /api/clubs/search returns results', async () => {
  const { server } = createServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const port = address.port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/clubs/search?q=club&limit=5`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as Array<any>;
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    assert.equal(typeof body[0]?.name, 'string');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

