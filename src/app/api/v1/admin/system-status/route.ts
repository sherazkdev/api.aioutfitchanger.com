import mongoose from "mongoose";
import { connectMongo, mongoStatus } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { fcmStatus, initFirebaseAdmin } from "@/lib/server/fcm";
import { getServerEnv } from "@/lib/server/env";
import { jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { BroadcastCampaign } from "@/lib/server/models/BroadcastCampaign";
import { addUtcDays, startOfUtcDay } from "@/lib/server/admin/dates";
import { AdminAuditLog } from "@/lib/server/models/AdminAuditLog";
import { getAuditSummary } from "@/lib/server/admin/auditLog";

function formatEventAt(d: Date): string {
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

function maskMongoUri(uri: string): string {
  try {
    const u = new URL(uri);
    const host = u.hostname;
    if (host.length <= 8) return `${host.slice(0, 2)}****`;
    return `${host.slice(0, 6)}*****${host.slice(-8)}`;
  } catch {
    return "****";
  }
}

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    let mongo: "connected" | "disconnected" | "error" = "disconnected";
    let mongoLatencyMs: number | null = null;
    let mongoHostMasked = "—";

    try {
      const env = getServerEnv();
      mongoHostMasked = maskMongoUri(env.MONGODB_URI);
      const start = Date.now();
      await connectMongo();
      await mongoose.connection.db?.admin().ping();
      mongoLatencyMs = Date.now() - start;
      mongo = mongoStatus() === "connected" ? "connected" : "error";
    } catch {
      mongo = "error";
    }

    const fcmConfigured = initFirebaseAdmin();
    const fcm = fcmStatus();

    let googleOAuth = "not_configured";
    let googleClients: string[] = [];
    try {
      const env = getServerEnv();
      googleClients = [
        env.GOOGLE_CLIENT_ID_WEB ? `web:${env.GOOGLE_CLIENT_ID_WEB.slice(0, 8)}…` : null,
        env.GOOGLE_CLIENT_ID_IOS ? `ios:${env.GOOGLE_CLIENT_ID_IOS.slice(0, 8)}…` : null,
        env.GOOGLE_CLIENT_ID_ANDROID ? `android:${env.GOOGLE_CLIENT_ID_ANDROID.slice(0, 8)}…` : null,
      ].filter((x): x is string => Boolean(x));
      if (googleClients.length) googleOAuth = "configured";
    } catch {
      googleOAuth = "error";
    }

    let bfl = "not_configured";
    try {
      const env = getServerEnv();
      bfl = env.BFL_API_KEY ? "configured" : "not_configured";
    } catch {
      bfl = "error";
    }

    const [lastPush, lastJobPoll] = await Promise.all([
      BroadcastCampaign.findOne({ status: { $in: ["completed", "partial"] }, sentAt: { $ne: null } })
        .sort({ sentAt: -1 })
        .select("sentAt pushSuccess pushFailure status")
        .lean(),
      TryOnJob.findOne({ externalJobId: { $ne: null } })
        .sort({ updatedAt: -1 })
        .select("updatedAt status")
        .lean(),
    ]);

    const fcmLastSend =
      lastPush?.sentAt
        ? `OK · ${formatEventAt(new Date(lastPush.sentAt))} (${lastPush.pushSuccess ?? 0} ok)`
        : null;
    const bflLastPoll =
      lastJobPoll?.updatedAt
        ? `${lastJobPoll.status === "failed" ? "Error" : "OK"} · ${formatEventAt(new Date(lastJobPoll.updatedAt))}`
        : null;

    const dayStart = addUtcDays(startOfUtcDay(new Date()), -1);
    const hourly = await TryOnJob.aggregate<{
      _id: { hour: number; status: string };
      count: number;
    }>([
      { $match: { createdAt: { $gte: dayStart } } },
      {
        $group: {
          _id: {
            hour: { $hour: { date: "$createdAt", timezone: "UTC" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      completed: 0,
      failed: 0,
      cancelled: 0,
    }));
    for (const row of hourly) {
      const b = buckets[row._id.hour];
      if (!b) continue;
      if (row._id.status === "completed") b.completed = row.count;
      else if (row._id.status === "failed") b.failed = row.count;
      else if (row._id.status === "cancelled") b.cancelled = row.count;
    }

    const auditRows = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(20).lean();
    const operations = await getAuditSummary();

    return jsonOk({
      mongodb: { status: mongo, latency_ms: mongoLatencyMs },
      fcm: { status: fcm, configured: fcmConfigured, last_send: fcmLastSend },
      google_oauth: { status: googleOAuth, client_ids_masked: googleClients },
      bfl_api: { status: bfl, last_poll: bflLastPoll },
      environment: {
        app_url: process.env.APP_URL ?? null,
        node_env: process.env.NODE_ENV ?? "development",
        mongo_host_masked: mongoHostMasked,
      },
      try_on_hourly_24h: buckets,
      operations,
      incident_log: {
        available: true,
        message: auditRows.length ? "Recent admin actions" : "No admin actions recorded yet",
        view_all_href: "/admin/activity",
        items: auditRows.map((r) => ({
          time: r.createdAt ? formatEventAt(new Date(r.createdAt)) : "—",
          service: "admin",
          level: "info",
          message: `${r.action} · ${r.resourceType}${r.resourceId ? ` (${r.resourceId})` : ""}${r.actorEmail ? ` — ${r.actorEmail}` : ""}`,
        })),
      },
      checked_at: new Date().toISOString(),
    });
  });
}
