import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { jsonError, jsonOk } from "@/lib/server/http";
import { resolveSessionIdFromRefreshHeader } from "@/lib/server/admin/currentSession";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  await connectMongo();

  const currentSessionId = await resolveSessionIdFromRefreshHeader(req);
  if (currentSessionId && id === currentSessionId) {
    return jsonError("VALIDATION", "Cannot revoke your current admin session", 422);
  }

  const doc = await RefreshToken.findById(id);
  if (!doc) return jsonError("NOT_FOUND", "Token session not found", 404);

  if (!doc.revokedAt) {
    doc.revokedAt = new Date();
    doc.revokeReason = doc.revokeReason ?? "admin_revoke";
    await doc.save();
    await logAdminAudit(req, auditActor(auth), {
      action: "token.revoke",
      resource_type: "token_session",
      resource_id: id,
    });
  }

  return jsonOk({ id, revoked: true });
}
