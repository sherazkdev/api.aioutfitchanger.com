import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const BroadcastCampaignSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    imageUrl: { type: String },
    deepLink: { type: String },
    audience: { type: String, enum: ["all", "ios", "android"], default: "all" },
    appVersion: { type: String },
    targetedDevices: { type: Number, default: 0 },
    pushSuccess: { type: Number, default: 0 },
    pushFailure: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "completed", "partial", "failed", "cancelled"],
      default: "completed",
    },
    scheduledAt: { type: Date, index: true },
    sentAt: { type: Date, index: true },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export type BroadcastCampaignDoc = InferSchemaType<typeof BroadcastCampaignSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BroadcastCampaign: Model<BroadcastCampaignDoc> =
  mongoose.models.BroadcastCampaign ??
  mongoose.model<BroadcastCampaignDoc>("BroadcastCampaign", BroadcastCampaignSchema);
