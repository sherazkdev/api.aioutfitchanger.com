export type TokenLifecycleStatus = "active" | "expired" | "revoked";

export function tokenStatus(
  expiresAt: Date,
  revokedAt: Date | null | undefined,
  now = Date.now()
): TokenLifecycleStatus {
  if (revokedAt) return "revoked";
  if (new Date(expiresAt).getTime() <= now) return "expired";
  return "active";
}

export function expiresInMs(expiresAt: Date, now = Date.now()): number {
  return Math.max(0, new Date(expiresAt).getTime() - now);
}

/** Elapsed share of refresh lifetime; requires createdAt and expiresAt. */
export function ttlElapsedPercent(createdAt: Date, expiresAt: Date, now = Date.now()): number | null {
  const start = new Date(createdAt).getTime();
  const end = new Date(expiresAt).getTime();
  if (end <= start) return null;
  const elapsed = now - start;
  const total = end - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}
