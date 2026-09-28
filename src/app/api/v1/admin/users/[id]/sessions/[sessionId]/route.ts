import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { User } from "@/lib/server/models/User";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string; sessionId: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id, sessionId } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const user = await User.findById(id).select("_id").lean();
    if (!user) return jsonError("NOT_FOUND", "User not found", 404);

    const doc = await RefreshToken.findOne({ _id: sessionId, userId: user._id });
    if (!doc) return jsonError("NOT_FOUND", "Session not found", 404);

    if (!doc.revokedAt) {
      doc.revokedAt = new Date();
      doc.revokeReason = doc.revokeReason ?? "admin_revoke";
      await doc.save();
    }

    await logAdminAudit(req, auditActor(auth), {
      action: "user.session_revoke",
      resource_type: "token_session",
      resource_id: sessionId,
      meta: { user_id: id },
    });

    return jsonOk({ id: sessionId, revoked: true });
  });
}
