import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const GatewayApiKeySchema = new Schema(
  {
    keyId: { type: String, required: true, unique: true, index: true },
    ciphertext: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    keyFingerprint: { type: String, required: true, index: true },
    lastFour: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "grace", "revoked"],
      required: true,
      index: true,
    },
    createdAt: { type: Date, required: true, default: Date.now },
    rotatedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    graceExpiresAt: { type: Date, default: null },
    createdByAdminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastUsedAt: { type: Date, default: null },
    version: { type: String, required: true, default: "aes-256-gcm-v1" },
  },
  { timestamps: false }
);

GatewayApiKeySchema.index({ status: 1, graceExpiresAt: 1 });
/** At most one active key — enforced in application logic + partial unique index. */
GatewayApiKeySchema.index(
  { status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export type GatewayApiKeyDoc = InferSchemaType<typeof GatewayApiKeySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GatewayApiKey: Model<GatewayApiKeyDoc> =
  mongoose.models.GatewayApiKey ??
  mongoose.model<GatewayApiKeyDoc>("GatewayApiKey", GatewayApiKeySchema);
