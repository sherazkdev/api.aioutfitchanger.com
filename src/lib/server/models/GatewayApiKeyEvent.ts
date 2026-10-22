import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const GATEWAY_API_KEY_ACTIONS = [
  "create",
  "rotate",
  "revoke",
  "reveal_requested",
  "reveal_success",
  "reveal_failed",
] as const;

export type GatewayApiKeyAction = (typeof GATEWAY_API_KEY_ACTIONS)[number];

const GatewayApiKeyEventSchema = new Schema(
  {
    keyId: { type: String, required: true, index: true },
    action: { type: String, enum: GATEWAY_API_KEY_ACTIONS, required: true, index: true },
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ip: { type: String, default: null },
    createdAt: { type: Date, required: true, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: false }
);

export type GatewayApiKeyEventDoc = InferSchemaType<typeof GatewayApiKeyEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GatewayApiKeyEvent: Model<GatewayApiKeyEventDoc> =
  mongoose.models.GatewayApiKeyEvent ??
  mongoose.model<GatewayApiKeyEventDoc>("GatewayApiKeyEvent", GatewayApiKeyEventSchema);
