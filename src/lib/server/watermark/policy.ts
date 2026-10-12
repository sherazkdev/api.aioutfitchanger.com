import { connectMongo } from "../db";
import { User } from "../models/User";

export type SubscriptionPlan = "free" | "premium";

export function watermarkGloballyEnabled(): boolean {
  const v = process.env.TRY_ON_WATERMARK_ENABLED?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  return true;
}

/** Free users get watermark; premium (and admins) do not. */
export async function shouldApplyAiResultWatermark(userId: string): Promise<boolean> {
  if (!watermarkGloballyEnabled()) return false;

  await connectMongo();
  const user = await User.findById(userId).select("role subscriptionPlan").lean();
  if (!user) return true;

  if (user.role === "admin") return false;
  const plan = (user.subscriptionPlan as SubscriptionPlan | undefined) ?? "free";
  return plan !== "premium";
}
