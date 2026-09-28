import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { resolveSessionIdFromRefreshHeader } from "@/lib/server/admin/currentSession";
import { User } from "@/lib/server/models/User";

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    const body = (await req.json()) as { ids?: string[] };
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) return jsonError("VALIDATION", "ids required", 422);
    if (ids.length > 200) return jsonError("VALIDATION", "Maximum 200 sessions per request", 422);

    await connectMongo();
    const admin = await User.findById(auth.payload!.userId).select("_id").lean();
    const currentSessionId = admin ? await resolveSessionIdFromRefreshHeader(req, admin._id) : null;

    const skipped_current: string[] = [];
    const revoked: string[] = [];
    const not_found: string[] = [];

    for (const id of ids) {
      if (currentSessionId && id === currentSessionId) {
        skipped_current.push(id);
        continue;
      }
      const doc = await RefreshToken.findById(id);
      if (!doc) {
        not_found.push(id);
        continue;
      }
      if (!doc.revokedAt) {
        doc.revokedAt = new Date();
        doc.revokeReason = doc.revokeReason ?? "admin_revoke";
        await doc.save();
      }
      revoked.push(id);
    }

    await logAdminAudit(req, auditActor(auth), {
      action: "token.bulk_revoke",
      resource_type: "token_session",
      meta: { revoked_count: revoked.length, skipped_current, not_found_count: not_found.length },
    });

    return jsonOk({ revoked, skipped_current, not_found });
  });
}
