type Entry<T> = { value: T; expires: number };

const store = new Map<string, Entry<unknown>>();
const MAX_ENTRIES = 800;

function pruneExpired(now: number) {
  for (const [key, entry] of store) {
    if (entry.expires <= now) store.delete(key);
  }
  if (store.size <= MAX_ENTRIES) return;
  const sorted = [...store.entries()].sort((a, b) => a[1].expires - b[1].expires);
  const remove = sorted.length - MAX_ENTRIES;
  for (let i = 0; i < remove; i++) store.delete(sorted[i][0]);
}

/** Process-local TTL cache (use CDN Cache-Control for multi-instance public reads). */
export async function getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;

  const value = await factory();
  if (store.size >= MAX_ENTRIES) pruneExpired(now);
  store.set(key, { value, expires: now + ttlMs });
  return value;
}

export function contentCacheMaxAgeSec(): number {
  const sec = Number(process.env.CONTENT_CACHE_TTL_SECONDS ?? 60);
  return Math.min(300, Math.max(5, sec));
}

export function contentCacheTtlMs(): number {
  return contentCacheMaxAgeSec() * 1000;
}

export function invalidateCacheKeysWithPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function invalidateCacheKey(key: string): void {
  store.delete(key);
}
