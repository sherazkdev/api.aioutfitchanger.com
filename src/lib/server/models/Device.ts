import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DeviceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fcmToken: { type: String, required: true },
    platform: { type: String, enum: ["android", "ios", "web"], required: true },
    deviceId: { type: String, index: true },
    appVersion: { type: String },
    lastSeenAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true, sparse: true });
DeviceSchema.index({ fcmToken: 1 }, { unique: true });

export type DeviceDoc = InferSchemaType<typeof DeviceSchema> & { _id: mongoose.Types.ObjectId };

export const Device: Model<DeviceDoc> =
  mongoose.models.Device ?? mongoose.model<DeviceDoc>("Device", DeviceSchema);
