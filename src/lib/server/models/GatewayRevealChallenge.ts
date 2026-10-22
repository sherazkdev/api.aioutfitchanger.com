import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const GatewayRevealChallengeSchema = new Schema(
  {
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    failedAttempts: { type: Number, default: 0 },
    keyId: { type: String, required: true },
  },
  { timestamps: true }
);

GatewayRevealChallengeSchema.index({ adminUserId: 1, usedAt: 1, expiresAt: -1 });

export type GatewayRevealChallengeDoc = InferSchemaType<typeof GatewayRevealChallengeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GatewayRevealChallenge: Model<GatewayRevealChallengeDoc> =
  mongoose.models.GatewayRevealChallenge ??
  mongoose.model<GatewayRevealChallengeDoc>("GatewayRevealChallenge", GatewayRevealChallengeSchema);
