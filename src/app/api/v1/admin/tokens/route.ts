import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { addUtcDays, startOfUtcDay } from "@/lib/server/admin/dates";
import { buildRefreshTokenFilter } from "@/lib/server/admin/tokenFilters";
import { serializeTokenRow } from "@/lib/server/admin/tokenSerialize";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const skip = (page - 1) * limit;

    const filter = await buildRefreshTokenFilter({
      status: url.searchParams.get("status"),
      role: url.searchParams.get("role"),
      q: url.searchParams.get("q"),
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });

    const now = new Date();
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const urlParams = url.searchParams;
    const filtersApplied = Boolean(
      urlParams.get("status") || urlParams.get("role") || urlParams.get("q")?.trim() || urlParams.get("from")
    );
    const andWithFilter = (extra: Record<string, unknown>) =>
      filtersApplied ? { $and: [filter, extra] } : extra;

    const [rows, total, active, expiring, expired, reuseFamilies, chartRows] = await Promise.all([
      RefreshToken.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "email displayName role photoUrl")
        .lean(),
      RefreshToken.countDocuments(filter),
      RefreshToken.countDocuments(andWithFilter({ revokedAt: null, expiresAt: { $gt: now } })),
      RefreshToken.countDocuments(andWithFilter({ revokedAt: null, expiresAt: { $gt: now, $lte: in24h } })),
      RefreshToken.countDocuments(andWithFilter({ revokedAt: null, expiresAt: { $lte: now } })),
      RefreshToken.distinct("familyId", filtersApplied ? { ...filter, revokeReason: "reuse_detected" } : { revokeReason: "reuse_detected" }),
      RefreshToken.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: addUtcDays(startOfUtcDay(now), -6) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const items = rows.map((r) => serializeTokenRow(r as Parameters<typeof serializeTokenRow>[0]));
    const chart = chartRows.map((c) => ({ date: c._id, count: c.count }));

    return jsonOk({
      kpis: {
        active_sessions: active,
        expiring_24h: expiring,
        expired_sessions: expired,
        revoked_families_reuse: reuseFamilies.length,
        filtered_total: filtersApplied ? total : undefined,
        filters_applied: filtersApplied,
      },
      sessions_chart: chart,
      items,
      meta: { page, limit, total },
    });
  });
}
