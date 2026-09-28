import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { tokenStatus } from "@/lib/server/admin/tokenStatus";

export async function GET(req: Request, ctx: { params: Promise<{ familyId: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { familyId } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const tokens = await RefreshToken.find({ familyId })
      .sort({ createdAt: 1 })
      .populate("userId", "email displayName photoUrl role")
      .lean();

    if (tokens.length === 0) return jsonError("NOT_FOUND", "Token family not found", 404);

    const reuse = tokens.some((t) => t.revokeReason === "reuse_detected");
    const user = tokens[0].userId as { email?: string; displayName?: string; photoUrl?: string; role?: string } | null;

    const timeline: { at: string; label: string; kind: string }[] = [];
    const first = tokens[0];
    if (first.createdAt) {
      timeline.push({
        at: new Date(first.createdAt).toISOString(),
        label: "Token family issued",
        kind: "issued",
      });
    }
    for (const t of tokens) {
      if (t.lastUsedAt && (t.useCount ?? 0) > 0) {
        timeline.push({
          at: new Date(t.lastUsedAt).toISOString(),
          label: `Refreshed (use count ${t.useCount})`,
          kind: "refresh",
        });
      }
    }
    if (reuse) {
      const revoked = tokens.find((t) => t.revokeReason === "reuse_detected" && t.revokedAt);
      timeline.push({
        at: revoked?.revokedAt ? new Date(revoked.revokedAt).toISOString() : new Date().toISOString(),
        label: "Reuse detected — family revoked",
        kind: "reuse",
      });
    }

    return jsonOk({
      family_id: familyId,
      user: user
        ? { email: user.email, display_name: user.displayName, photo_url: user.photoUrl, role: user.role }
        : null,
      reuse_detected: reuse,
      revoke_reason: reuse ? "reuse_detected" : tokens.find((t) => t.revokedAt)?.revokeReason ?? null,
      timeline,
      tokens: tokens.map((t) => ({
        id: String(t._id),
        status: tokenStatus(t.expiresAt, t.revokedAt),
        created_at: t.createdAt ? new Date(t.createdAt).toISOString() : null,
        revoked_at: t.revokedAt ? new Date(t.revokedAt).toISOString() : null,
        use_count: t.useCount ?? 0,
      })),
    });
  });
}
