import { connectMongo } from "@/lib/server/db";
import { requireMobileUser } from "@/lib/server/auth/requireMobileUser";
import { registerUserDevice } from "@/lib/server/devices/registerDevice";
import { revokeUserFcmTokens } from "@/lib/server/devices/revokeDevice";
import { jsonError, jsonOk } from "@/lib/server/http";

/**
 * Mobile contract (.requirements v1): POST /users/me/fcm-token
 * Accepts fcm_token (preferred) or token alias; requires platform.
 */
export async function POST(req: Request) {
  const auth = await requireMobileUser(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const body = (await req.json()) as {
    fcm_token?: string;
    token?: string;
    platform?: "android" | "ios" | "web";
    device_id?: string;
    app_version?: string;
  };

  const fcmToken = body.fcm_token?.trim() || body.token?.trim();
  if (!fcmToken || !body.platform) {
    return jsonError("VALIDATION", "fcm_token (or token) and platform required", 422);
  }

  await connectMongo();

  const result = await registerUserDevice({
    userId: auth.payload!.userId,
    fcmToken,
    platform: body.platform,
    deviceId: body.device_id,
    appVersion: body.app_version,
  });

  return jsonOk({
    device_id: result.device_id,
    registered_at: result.registered_at,
  });
}

/** Unregister push token(s) for this user (logout / account cleanup). */
export async function DELETE(req: Request) {
  const auth = await requireMobileUser(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const body = (await req.json().catch(() => ({}))) as {
    fcm_token?: string;
    token?: string;
    device_id?: string;
  };

  await connectMongo();

  const revoked = await revokeUserFcmTokens({
    userId: auth.payload!.userId,
    fcmToken: body.fcm_token?.trim() || body.token?.trim(),
    deviceId: body.device_id?.trim(),
  });

  return jsonOk({ revoked_count: revoked });
}
