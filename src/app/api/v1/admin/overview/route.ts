import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { User } from "@/lib/server/models/User";
import { RefreshToken } from "@/lib/server/models/RefreshToken";
import { Device } from "@/lib/server/models/Device";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { getOrSet } from "@/lib/server/cache/ttl";
import {
  addUtcDays,
  formatOverviewChartLabel,
  formatShortUtcDate,
  pctChangeLabel,
  startOfUtcDay,
} from "@/lib/server/admin/dates";
import { BroadcastCampaign } from "@/lib/server/models/BroadcastCampaign";

const DAY_MS = 24 * 60 * 60 * 1000;

async function countJobsBetween(from: Date, to: Date) {
  return TryOnJob.countDocuments({ createdAt: { $gte: from, $lt: to } });
}

async function dailyJobCounts(from: Date, days: number) {
  const to = addUtcDays(from, days);
  const rows = await TryOnJob.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } },
        count: { $sum: 1 },
      },
    },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.count]));
  const labels: string[] = [];
  const display_labels: string[] = [];
  const values: number[] = [];
  for (let i = 0; i < days; i++) {
    const d = addUtcDays(from, i);
    const key = formatShortUtcDate(d);
    labels.push(key);
    display_labels.push(formatOverviewChartLabel(d));
    values.push(map.get(key) ?? 0);
  }
  return { labels, display_labels, values, total: values.reduce((s, n) => s + n, 0) };
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    const url = new URL(req.url);
    const periodDays = Math.min(30, Math.max(1, Number(url.searchParams.get("days") ?? 7)));

    const payload = await getOrSet(`admin:overview:${periodDays}`, 20_000, async () => {
    const now = new Date();
    const periodStart = addUtcDays(startOfUtcDay(now), -periodDays);
    const prevStart = addUtcDays(periodStart, -periodDays);

    const [
      totalUsers,
      usersInPeriod,
      usersPrevPeriod,
      totalDevices,
      jobsInPeriod,
      jobsPrevPeriod,
      activeTokens,
      expiredTokens,
      revokedTokens,
      statusAgg,
      recentRows,
      recentCampaigns,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", createdAt: { $gte: periodStart } }),
      User.countDocuments({ role: "user", createdAt: { $gte: prevStart, $lt: periodStart } }),
      Device.countDocuments({ revokedAt: null }),
      countJobsBetween(periodStart, now),
      countJobsBetween(prevStart, periodStart),
      RefreshToken.countDocuments({ revokedAt: null, expiresAt: { $gt: now } }),
      RefreshToken.countDocuments({ revokedAt: null, expiresAt: { $lte: now } }),
      RefreshToken.countDocuments({ revokedAt: { $ne: null } }),
      TryOnJob.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      TryOnJob.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("externalJobId styleId createdAt status userId")
        .populate("userId", "displayName email photoUrl")
        .lean(),
      BroadcastCampaign.find().sort({ sentAt: -1 }).limit(5).select("title sentAt status").lean(),
    ]);

    const statusMap = new Map(statusAgg.map((s) => [s._id, s.count]));
    const tryOnTotal = statusAgg.reduce((sum, s) => sum + s.count, 0);
    const tryOnCompleted = statusMap.get("completed") ?? 0;
    const tryOnFailed = statusMap.get("failed") ?? 0;
    const tryOnProcessing = statusMap.get("processing") ?? 0;
    const tryOnQueued = statusMap.get("queued") ?? 0;
    const tryOnCancelled = statusMap.get("cancelled") ?? 0;

    const currentPeriodStart = addUtcDays(startOfUtcDay(now), -(periodDays - 1));
    const previousPeriodStart = addUtcDays(currentPeriodStart, -periodDays);
    const [currentPeriod, previousPeriod] = await Promise.all([
      dailyJobCounts(currentPeriodStart, periodDays),
      dailyJobCounts(previousPeriodStart, periodDays),
    ]);

    const statusColors: Record<string, string> = {
      completed: "#22c55e",
      processing: "#a855f7",
      failed: "#ef4444",
      queued: "#3b82f6",
      cancelled: "#9ca3af",
    };

    const job_status = statusAgg.map((s) => ({
      label: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      value: s.count,
      color: statusColors[s._id] ?? "#9ca3af",
      status: s._id,
    }));

    const terminal = tryOnCompleted + tryOnFailed + tryOnCancelled;
    const success_rate = terminal ? Math.round((tryOnCompleted / terminal) * 1000) / 10 : 0;

    return {
      period_days: periodDays,
      period_start: periodStart.toISOString(),
      period_end: now.toISOString(),
      users: {
        total: totalUsers,
        change_label: pctChangeLabel(usersInPeriod, usersPrevPeriod),
        created_in_period: usersInPeriod,
      },
      devices: { registered: totalDevices },
      try_on_jobs: {
        total: tryOnTotal,
        completed: tryOnCompleted,
        failed: tryOnFailed,
        processing: tryOnProcessing,
        queued: tryOnQueued,
        cancelled: tryOnCancelled,
        success_rate,
        change_label: pctChangeLabel(jobsInPeriod, jobsPrevPeriod),
        created_in_period: jobsInPeriod,
      },
      sessions: {
        active_tokens: activeTokens,
        expired_tokens: expiredTokens,
        revoked_tokens: revokedTokens,
      },
      activity: {
        current: currentPeriod.values,
        previous: previousPeriod.values,
        labels: currentPeriod.display_labels,
        iso_labels: currentPeriod.labels,
        current_total: currentPeriod.total,
        previous_total: previousPeriod.total,
        current_series_name: `Last ${periodDays} days`,
        previous_series_name: `Prior ${periodDays} days`,
        previous_period_start: previousPeriodStart.toISOString(),
        current_period_start: currentPeriodStart.toISOString(),
        note: `Daily job creations (UTC), ${periodDays}d vs prior ${periodDays}d`,
      },
      job_status,
      recent_jobs: recentRows.map((j) => {
        const u = j.userId as { displayName?: string; email?: string; photoUrl?: string } | null;
        return {
          id: String(j._id),
          job_id: j.externalJobId ? `JOB-${String(j.externalJobId).slice(-4)}` : String(j._id).slice(-8),
          user_name: u?.displayName ?? u?.email ?? "—",
          user_avatar: u?.photoUrl ?? null,
          style: j.styleId ?? "—",
          created_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
          status: j.status,
        };
      }),
      notifications_feed: {
        available: true,
        notifications: recentCampaigns.map((c) => ({
          id: String(c._id),
          title: c.title,
          time: c.sentAt ? new Date(c.sentAt).toISOString() : null,
          type: c.status === "failed" ? "error" : c.status === "partial" ? "user" : "success",
        })),
        activities: recentRows.map((j) => {
          const u = j.userId as { displayName?: string; email?: string } | null;
          return {
            id: String(j._id),
            title: `Try-on ${j.status} — ${u?.displayName ?? u?.email ?? "user"}`,
            time: j.createdAt ? new Date(j.createdAt).toISOString() : null,
          };
        }),
      },
      generated_at: now.toISOString(),
    };
    });

    return jsonOk(payload);
  });
}
