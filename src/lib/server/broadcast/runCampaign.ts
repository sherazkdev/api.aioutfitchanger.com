import { Device } from "@/lib/server/models/Device";
import { BroadcastCampaign } from "@/lib/server/models/BroadcastCampaign";
import { sendPushToTokens } from "@/lib/server/fcm";

export type AudienceFilter = {
  audience?: "all" | "ios" | "android";
  app_version?: string | null;
};

export function deviceQuery(filter: AudienceFilter): Record<string, unknown> {
  const q: Record<string, unknown> = { revokedAt: null };
  if (filter.audience === "ios" || filter.audience === "android") {
    q.platform = filter.audience;
  }
  if (filter.app_version?.trim()) {
    q.appVersion = filter.app_version.trim();
  }
  return q;
}

export async function executeBroadcastCampaign(campaignId: string) {
  const campaign = await BroadcastCampaign.findById(campaignId);
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status === "cancelled") {
    throw new Error("Campaign was cancelled");
  }

  const devices = await Device.find(
    deviceQuery({ audience: campaign.audience, app_version: campaign.appVersion })
  )
    .select("fcmToken")
    .lean();
  const tokens = devices.map((d) => d.fcmToken).filter(Boolean) as string[];

  const result = await sendPushToTokens(tokens, {
    title: campaign.title,
    body: campaign.body,
    data: { deep_link: campaign.deepLink ?? "" },
  });

  const failure = result.failure;
  const success = result.success;
  const status = failure === 0 ? "completed" : success === 0 ? "failed" : "partial";

  campaign.targetedDevices = tokens.length;
  campaign.pushSuccess = success;
  campaign.pushFailure = failure;
  campaign.status = status;
  campaign.sentAt = new Date();
  await campaign.save();

  return { tokens: tokens.length, success, failure, status };
}

export async function processDueScheduledCampaigns() {
  const now = new Date();
  const due = await BroadcastCampaign.find({
    status: "scheduled",
    cancelledAt: null,
    scheduledAt: { $lte: now },
  }).limit(5);

  for (const c of due) {
    if (c.status !== "scheduled" || c.cancelledAt) continue;
    c.status = "sending";
    await c.save();
    try {
      await executeBroadcastCampaign(String(c._id));
    } catch {
      c.status = "failed";
      await c.save();
    }
  }
}
