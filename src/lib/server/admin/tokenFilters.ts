import { User } from "@/lib/server/models/User";
import { addUtcDays, startOfUtcDay } from "@/lib/server/admin/dates";

export type TokenListParams = {
  status?: string | null;
  role?: string | null;
  q?: string | null;
  from?: string | null;
  to?: string | null;
  createdPreset?: string | null;
};

export function createdFromPreset(preset: string | null | undefined): string | null {
  if (!preset || preset === "all") return null;
  const now = startOfUtcDay(new Date());
  if (preset === "7d") return addUtcDays(now, -7).toISOString();
  if (preset === "30d") return addUtcDays(now, -30).toISOString();
  return null;
}

export async function buildRefreshTokenFilter(params: TokenListParams): Promise<Record<string, unknown>> {
  const now = new Date();
  const filter: Record<string, unknown> = {};

  const from = params.from ?? createdFromPreset(params.createdPreset);
  const to = params.to;
  if (from || to) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};
    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);
    filter.createdAt = createdAt;
  }

  if (params.status === "active") {
    filter.revokedAt = null;
    filter.expiresAt = { $gt: now };
  } else if (params.status === "expired") {
    filter.revokedAt = null;
    filter.expiresAt = { $lte: now };
  } else if (params.status === "revoked") {
    filter.revokedAt = { $ne: null };
  }

  if (params.role === "admin" || params.role === "user") {
    const userIds = await User.find({ role: params.role }).distinct("_id");
    filter.userId = { $in: userIds };
  }

  const q = params.q?.trim();
  if (q) {
    const userIds = await User.find({
      $or: [
        { email: { $regex: q, $options: "i" } },
        { displayName: { $regex: q, $options: "i" } },
      ],
    }).distinct("_id");
    filter.$or = [
      { familyId: { $regex: q, $options: "i" } },
      { deviceId: { $regex: q, $options: "i" } },
      { ip: { $regex: q, $options: "i" } },
      { userId: { $in: userIds } },
    ];
  }

  return filter;
}
