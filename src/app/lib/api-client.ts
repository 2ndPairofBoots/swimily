import { authService } from './auth';
import { cacheClearByPrefix, cacheGet, cacheSet, inflightDelete, inflightGet, inflightSet } from './api-cache';

async function getApiErrorMessage(res: Response): Promise<string | null> {
  return res
    .json()
    .then((body) => (typeof (body as any)?.error === 'string' ? (body as any).error : null))
    .catch(() => null);
}

async function fetchWithRefreshRetry(url: string, options: RequestInit): Promise<Response> {
  const res = await authService.fetchWithAuth(url, options);
  if (res.status !== 401) return res;

  // If access token expired, try refresh once and retry once.
  await authService.refreshToken();
  return await authService.fetchWithAuth(url, options);
}

async function checkApiHealth(): Promise<'ok' | 'db_error' | 'down'> {
  try {
    const res = await fetch('/api/healthz', { method: 'GET', credentials: 'same-origin' });
    if (!res.ok) return 'down';
    const body = (await res.json()) as any;
    if (body?.db === 'error') return 'db_error';
    return 'ok';
  } catch {
    return 'down';
  }
}

export async function getJsonWithAuth<T>(url: string, opts?: { cacheKey?: string; ttlMs?: number }): Promise<T> {
  const cacheKey = opts?.cacheKey ?? `GET:${url}`;
  const ttlMs = opts?.ttlMs ?? 10_000;

  const cached = cacheGet<T>(cacheKey);
  if (cached != null) return cached;

  const existing = inflightGet<T>(cacheKey);
  if (existing) return await existing;

  const p = (async () => {
    try {
      const res = await fetchWithRefreshRetry(url, { method: 'GET' });
      if (!res.ok) {
        const msg = await getApiErrorMessage(res);
        throw new Error(msg || `Request failed (${res.status})`);
      }

      const body = (await res.json()) as T;
      cacheSet(cacheKey, body, ttlMs);
      return body;
    } catch (err) {
      const health = await checkApiHealth();
      if (health === 'db_error') {
        throw new Error('Server is up but database is unavailable. Please retry in a moment.');
      }
      if (health === 'down') {
        throw new Error('Cannot reach the API server. Make sure backend dev server is running.');
      }
      throw err instanceof Error ? err : new Error('Request failed');
    }
  })();

  inflightSet(cacheKey, p);
  try {
    return await p;
  } finally {
    inflightDelete(cacheKey);
  }
}

export async function sendJsonWithAuth(
  url: string,
  opts: { method: 'POST' | 'PUT' | 'DELETE'; body?: unknown; invalidatePrefix?: string }
): Promise<Response> {
  const res = await fetchWithRefreshRetry(url, {
    method: opts.method,
    body: opts.body == null ? undefined : JSON.stringify(opts.body),
  });

  if (opts.invalidatePrefix) {
    cacheClearByPrefix(opts.invalidatePrefix);
  }

  if (!res.ok && res.status !== 204) {
    const msg = await getApiErrorMessage(res);
    throw new Error(msg || `Request failed (${res.status})`);
  }

  return res;
}

