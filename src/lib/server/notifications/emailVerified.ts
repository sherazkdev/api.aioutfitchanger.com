import { Types } from "mongoose";
import { Device } from "@/lib/server/models/Device";
import { sendEventPushToTokens } from "@/lib/server/fcm";

export const FCM_EVENT_EMAIL_VERIFIED = "email_verified";

export async function fcmTokensForUser(userId: string): Promise<string[]> {
  if (!Types.ObjectId.isValid(userId)) return [];
  const devices = await Device.find({
    userId: new Types.ObjectId(userId),
    revokedAt: null,
  })
    .select("fcmToken")
    .lean();
  return devices.map((d) => d.fcmToken).filter(Boolean) as string[];
}

/**
 * Tell the mobile app that email verification completed (web link or OTP).
 * Fire-and-forget from auth routes; logs on failure.
 */
export async function notifyEmailVerified(userId: string): Promise<void> {
  const tokens = await fcmTokensForUser(userId);
  if (tokens.length === 0) {
    console.info("[fcm] email_verified skip — no device tokens", { userId });
    return;
  }

  const data: Record<string, string> = {
    type: FCM_EVENT_EMAIL_VERIFIED,
    user_id: userId,
    email_verified: "true",
  };

  const result = await sendEventPushToTokens(tokens, data, {
    title: "Email verified",
    body: "You can continue in the app.",
  });

  console.info("[fcm] email_verified sent", {
    userId,
    tokens: tokens.length,
    success: result.success,
    failure: result.failure,
  });
}

export function scheduleEmailVerifiedPush(userId: string): void {
  void notifyEmailVerified(userId).catch((err) => {
    console.error("[fcm] email_verified notify failed", { userId, err });
  });
}
