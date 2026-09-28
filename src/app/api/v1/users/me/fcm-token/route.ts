import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { registerUserDevice } from "@/lib/server/devices/registerDevice";
import { jsonError, jsonOk } from "@/lib/server/http";

/**
 * Mobile contract (.requirements v1): POST /users/me/fcm-token
 * Accepts fcm_token (preferred) or token alias; requires platform.
 */
export async function POST(req: Request) {
  const auth = await requireAuth(req, ["user", "admin"]);
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
