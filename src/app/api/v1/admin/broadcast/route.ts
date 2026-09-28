import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { BroadcastCampaign } from "@/lib/server/models/BroadcastCampaign";
import { jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";
import { executeBroadcastCampaign, processDueScheduledCampaigns } from "@/lib/server/broadcast/runCampaign";

export async function GET(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  return handleApiRoute(async () => {
    await connectMongo();
    await processDueScheduledCampaigns();

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      BroadcastCampaign.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BroadcastCampaign.countDocuments(),
    ]);

    return jsonOk({
      items: rows.map((c) => ({
        id: String(c._id),
        title: c.title,
        audience: c.audience,
        app_version: c.appVersion ?? null,
        targeted_devices: c.targetedDevices,
        push_success: c.pushSuccess,
        push_failure: c.pushFailure,
        status: c.status,
        scheduled_at: c.scheduledAt ? new Date(c.scheduledAt).toISOString() : null,
        sent_at: c.sentAt ? new Date(c.sentAt).toISOString() : null,
      })),
      meta: { page, limit, total },
    });
  });
}

export async function POST(req: Request) {
  const auth = await requireAuth(req, ["admin"]);
  if (auth.error) return auth.error;

  if (!rateLimit(`admin:broadcast:${auth.payload!.userId}`, 5, 60_000)) {
    return jsonError("RATE_LIMIT", "Broadcast rate limit exceeded", 429);
  }

  return handleApiRoute(async () => {
    const body = (await req.json()) as {
      title?: string;
      body?: string;
      image_url?: string;
      deep_link?: string;
      audience?: "all" | "ios" | "android";
      app_version?: string;
      schedule_at?: string;
      send_now?: boolean;
      data?: Record<string, string>;
    };

    if (!body.title || !body.body) {
      return jsonError("VALIDATION", "title and body required", 422);
    }

    const audience = body.audience ?? "all";
    const scheduleAt = body.schedule_at ? new Date(body.schedule_at) : null;
    const sendNow = body.send_now !== false && !scheduleAt;

    if (scheduleAt && Number.isNaN(scheduleAt.getTime())) {
      return jsonError("VALIDATION", "Invalid schedule_at", 422);
    }
    if (scheduleAt && scheduleAt.getTime() <= Date.now()) {
      return jsonError("VALIDATION", "schedule_at must be in the future", 422);
    }

    await connectMongo();

    if (!sendNow && scheduleAt) {
      const campaign = await BroadcastCampaign.create({
        title: body.title,
        body: body.body,
        imageUrl: body.image_url,
        deepLink: body.deep_link,
        audience,
        appVersion: body.app_version?.trim() || undefined,
        status: "scheduled",
        scheduledAt: scheduleAt,
        targetedDevices: 0,
        pushSuccess: 0,
        pushFailure: 0,
      });
      await logAdminAudit(req, auditActor(auth), {
        action: "broadcast.schedule",
        resource_type: "broadcast_campaign",
        resource_id: String(campaign._id),
        meta: { audience, scheduled_at: scheduleAt.toISOString() },
      });
      return jsonOk({
        id: String(campaign._id),
        status: "scheduled",
        scheduled_at: scheduleAt.toISOString(),
        targeted_devices: 0,
      });
    }

    const campaign = await BroadcastCampaign.create({
      title: body.title,
      body: body.body,
      imageUrl: body.image_url,
      deepLink: body.deep_link,
      audience,
      appVersion: body.app_version?.trim() || undefined,
      status: "sending",
      targetedDevices: 0,
      pushSuccess: 0,
      pushFailure: 0,
    });

    const result = await executeBroadcastCampaign(String(campaign._id));

    await logAdminAudit(req, auditActor(auth), {
      action: "broadcast.send",
      resource_type: "broadcast_campaign",
      resource_id: String(campaign._id),
      meta: { audience, targeted_devices: result.tokens, status: result.status },
    });

    return jsonOk({
      id: String(campaign._id),
      targeted_devices: result.tokens,
      push_success: result.success,
      push_failure: result.failure,
      status: result.status,
      sent_at: campaign.sentAt?.toISOString() ?? new Date().toISOString(),
    });
  });
}
