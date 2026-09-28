import { tokenStatus, expiresInMs, ttlElapsedPercent } from "@/lib/server/admin/tokenStatus";

export function serializeTokenRow(r: {
  _id: unknown;
  userId?: {
    _id?: unknown;
    email?: string;
    displayName?: string;
    role?: string;
    photoUrl?: string;
  } | null;
  familyId?: string;
  deviceId?: string;
  label?: string;
  useCount?: number;
  lastUsedAt?: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
  revokeReason?: string | null;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
}) {
  const user = r.userId;
  const st = tokenStatus(r.expiresAt, r.revokedAt);
  const createdAt = r.createdAt ? new Date(r.createdAt) : null;
  const id = String(r._id);
  return {
    id,
    session_id: id.slice(0, 8),
    user: user
      ? {
          id: String(user._id),
          email: user.email,
          display_name: user.displayName,
          role: user.role,
          photo_url: user.photoUrl,
        }
      : null,
    family_id: r.familyId,
    device_id: r.deviceId,
    label: r.label,
    use_count: r.useCount ?? 0,
    last_used_at: r.lastUsedAt?.toISOString() ?? null,
    expires_at: new Date(r.expiresAt).toISOString(),
    revoked_at: r.revokedAt ? new Date(r.revokedAt).toISOString() : null,
    revoke_reason: r.revokeReason ?? null,
    status: st,
    expires_in_ms: st === "active" ? expiresInMs(r.expiresAt) : 0,
    ttl_elapsed_percent: createdAt ? ttlElapsedPercent(createdAt, r.expiresAt) : null,
    ip: r.ip,
    user_agent: r.userAgent,
    created_at: createdAt?.toISOString() ?? null,
  };
}
