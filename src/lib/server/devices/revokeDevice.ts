import { Device } from "../models/Device";

export async function revokeUserFcmTokens(params: {
  userId: string;
  fcmToken?: string;
  deviceId?: string;
}): Promise<number> {
  const filter: Record<string, unknown> = { userId: params.userId, revokedAt: null };

  if (params.fcmToken?.trim()) {
    filter.fcmToken = params.fcmToken.trim();
  } else if (params.deviceId?.trim()) {
    filter.deviceId = params.deviceId.trim();
  }

  const result = await Device.updateMany(filter, { revokedAt: new Date() });
  return result.modifiedCount;
}
