import { connectMongo } from "@/lib/server/db";
import { auditActor, requireAuth } from "@/lib/server/auth/requireAuth";
import { logAdminAudit } from "@/lib/server/admin/auditLog";
import { BroadcastCampaign } from "@/lib/server/models/BroadcastCampaign";
import { jsonError, jsonOk } from "@/lib/server/http";
import { handleApiRoute } from "@/lib/server/routeHandler";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(_req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const doc = await BroadcastCampaign.findById(id).lean();
    if (!doc) return jsonError("NOT_FOUND", "Campaign not found", 404);

    return jsonOk({
      id: String(doc._id),
      title: doc.title,
      body: doc.body,
      image_url: doc.imageUrl ?? null,
      deep_link: doc.deepLink ?? null,
      audience: doc.audience,
      app_version: doc.appVersion ?? null,
      targeted_devices: doc.targetedDevices,
      push_success: doc.pushSuccess,
      push_failure: doc.pushFailure,
      status: doc.status,
      scheduled_at: doc.scheduledAt ? new Date(doc.scheduledAt).toISOString() : null,
      sent_at: doc.sentAt ? new Date(doc.sentAt).toISOString() : null,
      cancelled_at: doc.cancelledAt ? new Date(doc.cancelledAt).toISOString() : null,
      created_at: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    });
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(_req, ["admin"]);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;

  return handleApiRoute(async () => {
    await connectMongo();
    const doc = await BroadcastCampaign.findById(id);
    if (!doc) return jsonError("NOT_FOUND", "Campaign not found", 404);

    if (doc.status !== "scheduled" && doc.status !== "draft") {
      return jsonError("VALIDATION", "Only scheduled campaigns can be cancelled", 422);
    }

    doc.status = "cancelled";
    doc.cancelledAt = new Date();
    await doc.save();

    await logAdminAudit(_req, auditActor(auth), {
      action: "broadcast.cancel",
      resource_type: "broadcast_campaign",
      resource_id: id,
    });

    return jsonOk({ id, status: "cancelled" });
  });
}
