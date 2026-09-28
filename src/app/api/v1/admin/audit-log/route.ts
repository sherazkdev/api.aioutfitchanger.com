import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { AdminAuditLog } from "@/lib/server/models/AdminAuditLog";
import { buildAuditListFilter, getAuditSummary } from "@/lib/server/admin/auditLog";
import { jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const url = new URL(req.url);

    if (url.searchParams.get("summary") === "1") {
      const summary = await getAuditSummary();
      return jsonOk(summary);
    }

    const filter = buildAuditListFilter({
      category: url.searchParams.get("category"),
      action: url.searchParams.get("action"),
      q: url.searchParams.get("q"),
    });

    if (url.searchParams.get("export") === "csv") {
      const rows = await AdminAuditLog.find(filter).sort({ createdAt: -1 }).limit(5000).lean();
      const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const header = "created_at,action,resource_type,resource_id,actor_email,ip\n";
      const body = rows
        .map((r) =>
          [
            r.createdAt ? new Date(r.createdAt).toISOString() : "",
            r.action,
            r.resourceType,
            r.resourceId ?? "",
            r.actorEmail ?? "",
            r.ip ?? "",
          ]
            .map((c) => esc(String(c)))
            .join(",")
        )
        .join("\n");
      return new Response(header + body, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="admin-audit-log.csv"',
        },
      });
    }

    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 30)));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      AdminAuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AdminAuditLog.countDocuments(filter),
    ]);

    return jsonOk({
      items: rows.map((r) => ({
        id: String(r._id),
        action: r.action,
        resource_type: r.resourceType,
        resource_id: r.resourceId ?? null,
        actor_email: r.actorEmail ?? null,
        actor_user_id: String(r.actorUserId),
        meta: r.meta ?? {},
        ip: r.ip ?? null,
        created_at: r.createdAt ? new Date(r.createdAt).toISOString() : null,
      })),
      meta: { page, limit, total },
    });
  });
}
