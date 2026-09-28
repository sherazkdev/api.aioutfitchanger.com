type Row = { role: string; status: string; email?: string | null; expires: number };

const cache = new Map<string, Row>();
const TTL_MS = Number(process.env.USER_AUTH_CACHE_MS ?? 30_000);

export function getCachedUserGate(
  userId: string
): { role: string; status: string; email?: string | null } | null {
  const row = cache.get(userId);
  if (!row || row.expires <= Date.now()) {
    if (row) cache.delete(userId);
    return null;
  }
  return { role: row.role, status: row.status, email: row.email };
}

export function setCachedUserGate(
  userId: string,
  role: string,
  status: string,
  email?: string | null
): void {
  cache.set(userId, {
    role,
    status,
    email,
    expires: Date.now() + Math.min(120_000, Math.max(5_000, TTL_MS)),
  });
  if (cache.size > 5000) {
    const now = Date.now();
    for (const [id, r] of cache) {
      if (r.expires <= now) cache.delete(id);
    }
  }
}

export function invalidateUserAuthCache(userId: string): void {
  cache.delete(userId);
}
