import { registerUserDevice } from "./registerDevice";

export type FcmRegisterBody = {
  fcm_token?: string;
  token?: string;
  platform?: "android" | "ios" | "web";
  device_id?: string;
  app_version?: string;
};

/** Saves FCM token when app sends it on register/login (same fields as POST /users/me/fcm-token). */
export async function registerFcmIfProvided(userId: string, body: FcmRegisterBody): Promise<boolean> {
  const fcmToken = body.fcm_token?.trim() || body.token?.trim();
  if (!fcmToken || !body.platform) return false;

  await registerUserDevice({
    userId,
    fcmToken,
    platform: body.platform,
    deviceId: body.device_id,
    appVersion: body.app_version,
  });
  return true;
}
