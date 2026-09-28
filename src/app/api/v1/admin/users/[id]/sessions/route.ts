import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { tokenStatus } from "@/lib/server/admin/tokenStatus";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const user = await User.findById(id).select("_id").lean();
    if (!user) return jsonError("NOT_FOUND", "User not found", 404);

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 10)));
    const status = url.searchParams.get("status");
    const skip = (page - 1) * limit;
    const now = new Date();

    const filter: Record<string, unknown> = { userId: user._id };
    if (status === "active") {
      filter.revokedAt = null;
      filter.expiresAt = { $gt: now };
    } else if (status === "expired") {
      filter.revokedAt = null;
      filter.expiresAt = { $lte: now };
    } else if (status === "revoked") {
      filter.revokedAt = { $ne: null };
    }

    const [rows, total] = await Promise.all([
      RefreshToken.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      RefreshToken.countDocuments(filter),
    ]);

    return jsonOk({
      items: rows.map((s) => ({
        id: String(s._id),
        status: tokenStatus(s.expiresAt, s.revokedAt),
        device_id: s.deviceId,
        label: s.label ?? s.userAgent?.slice(0, 48) ?? "Session",
        ip: s.ip,
        created_at: s.createdAt ? new Date(s.createdAt).toISOString() : null,
        expires_at: new Date(s.expiresAt).toISOString(),
        revoked_at: s.revokedAt ? new Date(s.revokedAt).toISOString() : null,
        last_used_at: s.lastUsedAt?.toISOString() ?? null,
      })),
      meta: { page, limit, total },
    });
  });
}
