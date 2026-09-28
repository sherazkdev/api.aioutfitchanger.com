import type { Types } from "mongoose";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { hashToken } from "@/lib/server/auth/tokens";

export function refreshTokenFromRequest(req: Request): string | null {
  const raw = req.headers.get("x-refresh-session");
  return raw?.trim() || null;
}

export async function resolveSessionIdFromRefreshHeader(
  req: Request,
  userId?: Types.ObjectId
): Promise<string | null> {
  const raw = refreshTokenFromRequest(req);
  if (!raw) return null;
  const hash = hashToken(raw);
  const filter: Record<string, unknown> = { tokenHash: hash, revokedAt: null };
  if (userId) filter.userId = userId;
  const doc = await RefreshToken.findOne(filter).select("_id").lean();
  return doc ? String(doc._id) : null;
}
