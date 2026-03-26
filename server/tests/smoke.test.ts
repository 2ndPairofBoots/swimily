import test from 'node:test';
import assert from 'node:assert/strict';

import { createServer } from '../src/server';

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

