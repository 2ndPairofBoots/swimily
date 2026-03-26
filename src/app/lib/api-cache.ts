type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheDelete(key: string): void {
  cache.delete(key);
}

export function cacheClearByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function inflightGet<T>(key: string): Promise<T> | null {
  const p = inflight.get(key);
  return (p as Promise<T> | undefined) ?? null;
}

export function inflightSet<T>(key: string, promise: Promise<T>): void {
  inflight.set(key, promise as Promise<unknown>);
}

export function inflightDelete(key: string): void {
  inflight.delete(key);
}

