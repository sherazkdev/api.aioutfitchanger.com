import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { buildRefreshTokenFilter } from "@/lib/server/admin/tokenFilters";
import { serializeTokenRow } from "@/lib/server/admin/tokenSerialize";

const MAX_EXPORT = 10_000;

function csvEscape(value: string) {
  const safe = value.replace(/"/g, '""');
  const prefix = /^[=+\-@]/.test(safe) ? "'" : "";
  return `"${prefix}${safe}"`;
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const url = new URL(req.url);
    const filter = await buildRefreshTokenFilter({
      status: url.searchParams.get("status"),
      role: url.searchParams.get("role"),
      q: url.searchParams.get("q"),
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });

    const rows = await RefreshToken.find(filter)
      .sort({ createdAt: -1 })
      .limit(MAX_EXPORT)
      .populate("userId", "email displayName role photoUrl")
      .lean();

    const header = [
      "session_id",
      "email",
      "role",
      "status",
      "family_id",
      "use_count",
      "expires_at",
      "device_id",
      "ip",
      "created_at",
      "revoked_at",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      const t = serializeTokenRow(r as Parameters<typeof serializeTokenRow>[0]);
      lines.push(
        [
          t.session_id,
          t.user?.email ?? "",
          t.user?.role ?? "",
          t.status,
          t.family_id ?? "",
          String(t.use_count),
          t.expires_at,
          t.device_id ?? "",
          t.ip ?? "",
          t.created_at ?? "",
          t.revoked_at ?? "",
        ]
          .map((c) => csvEscape(String(c)))
          .join(",")
      );
    }

    await logAdminAudit(req, auditActor(auth), {
      action: "token.export",
      resource_type: "token_session",
      meta: { row_count: rows.length, filters: Object.keys(filter).length > 0 },
    });

    const filename = `token-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  });
}
