import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { Device } from "@/lib/server/models/Device";
import { User } from "@/lib/server/models/User";
import { jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { addUtcDays, startOfUtcDay } from "@/lib/server/admin/dates";
export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const skip = (page - 1) * limit;
    const platform = url.searchParams.get("platform");
    const appVersion = url.searchParams.get("app_version");
    const userId = url.searchParams.get("user_id") ?? url.searchParams.get("user");
    const q = url.searchParams.get("q")?.trim().toLowerCase();
    const lastSeen = url.searchParams.get("last_seen");

    const now = Date.now();
    const activeSince = addUtcDays(startOfUtcDay(new Date()), -7);
    const staleBefore = addUtcDays(startOfUtcDay(new Date()), -30);

    const filter: Record<string, unknown> = {};
    if (platform === "ios" || platform === "android") filter.platform = platform;
    if (appVersion) filter.appVersion = appVersion;
    if (userId) filter.userId = userId;
    if (lastSeen === "7d") {
      filter.revokedAt = null;
      filter.lastSeenAt = { $gte: activeSince };
    } else if (lastSeen === "stale") {
      filter.revokedAt = null;
      filter.lastSeenAt = { $lt: staleBefore };
    }

    if (q) {
      const userIds = await User.find({ email: { $regex: q, $options: "i" } }).distinct("_id");
      filter.$or = [{ deviceId: { $regex: q, $options: "i" } }, { userId: { $in: userIds } }];
    }

    const filtersApplied = Boolean(platform || appVersion || userId || q || lastSeen);
    const andWithFilter = (extra: Record<string, unknown>) =>
      filtersApplied ? { $and: [filter, extra] } : extra;

    const [rows, total, totalAll, activeCount, iosCount, androidCount, staleCount, regChart] =
      await Promise.all([
        Device.find(filter)
          .sort({ lastSeenAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("userId", "email")
          .lean(),
        Device.countDocuments(filter),
        Device.countDocuments(),
        Device.countDocuments(andWithFilter({ revokedAt: null, lastSeenAt: { $gte: activeSince } })),
        Device.countDocuments(andWithFilter({ platform: "ios", revokedAt: null })),
        Device.countDocuments(andWithFilter({ platform: "android", revokedAt: null })),
        Device.countDocuments(andWithFilter({ revokedAt: null, lastSeenAt: { $lt: staleBefore } })),
        Device.aggregate<{ _id: string; count: number }>([
          {
            $match: filtersApplied
              ? { $and: [filter, { createdAt: { $gte: addUtcDays(startOfUtcDay(new Date()), -13) } }] }
              : { createdAt: { $gte: addUtcDays(startOfUtcDay(new Date()), -13) } },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    let items = rows.map((d) => {
      const user = d.userId as { email?: string } | null;
      const revoked = Boolean(d.revokedAt);
      const lastSeen = d.lastSeenAt ? new Date(d.lastSeenAt) : null;
      const stale = !revoked && lastSeen && lastSeen < staleBefore;
      const token = d.fcmToken ?? "";
      return {
        id: String(d._id),
        user_email: user?.email ?? "—",
        user_id: String(d.userId),
        platform: d.platform,
        device_id: d.deviceId ?? "—",
        app_version: d.appVersion ?? "—",
        last_seen_at: lastSeen?.toISOString() ?? null,
        fcm_token_suffix: token.length >= 4 ? token.slice(-4) : "—",
        status: revoked ? "revoked" : stale ? "stale" : "active",
        revoked_at: d.revokedAt ? new Date(d.revokedAt).toISOString() : null,
      };
    });

    const platformTotal = iosCount + androidCount;

    return jsonOk({
      kpis: {
        total_devices: filtersApplied ? total : totalAll,
        active_7d: activeCount,
        stale_30d: staleCount,
        platform_split: {
          ios: iosCount,
          android: androidCount,
          ios_pct: platformTotal ? Math.round((iosCount / platformTotal) * 1000) / 10 : 0,
          android_pct: platformTotal ? Math.round((androidCount / platformTotal) * 1000) / 10 : 0,
        },
        filters_applied: filtersApplied,
      },
      registrations_chart: regChart.map((r) => ({ date: r._id, count: r.count })),
      items,
      meta: { page, limit, total },
    });
  });
}
