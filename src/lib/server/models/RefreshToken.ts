import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** Dashboard-visible session / refresh token record (hash only — never store raw token). */
const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    familyId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date },
    useCount: { type: Number, default: 0 },
    userAgent: { type: String },
    ip: { type: String },
    deviceId: { type: String, index: true },
    label: { type: String },
    revokeReason: { type: String },
  },
  { timestamps: true }
);

RefreshTokenSchema.index({ userId: 1, revokedAt: 1, expiresAt: -1 });

export type RefreshTokenDoc = InferSchemaType<typeof RefreshTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RefreshToken: Model<RefreshTokenDoc> =
  mongoose.models.RefreshToken ?? mongoose.model<RefreshTokenDoc>("RefreshToken", RefreshTokenSchema);
