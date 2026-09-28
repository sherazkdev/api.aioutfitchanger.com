import { Device } from "@/lib/server/models/Device";

export type RegisterDeviceInput = {
  userId: string;
  fcmToken: string;
  platform: "android" | "ios" | "web";
  deviceId?: string;
  appVersion?: string;
};

export async function registerUserDevice(input: RegisterDeviceInput) {
  const device = await Device.findOneAndUpdate(
    input.deviceId
      ? { userId: input.userId, deviceId: input.deviceId }
      : { fcmToken: input.fcmToken },
    {
      userId: input.userId,
      fcmToken: input.fcmToken,
      platform: input.platform,
      deviceId: input.deviceId,
      appVersion: input.appVersion,
      lastSeenAt: new Date(),
      revokedAt: null,
    },
    { upsert: true, new: true }
  );

  return {
    device_id: device.deviceId ?? String(device._id),
    registered_at: device.updatedAt,
  };
}
