import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PasswordResetOtpSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    failedAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PasswordResetOtpSchema.index({ userId: 1, usedAt: 1, expiresAt: -1 });

export type PasswordResetOtpDoc = InferSchemaType<typeof PasswordResetOtpSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PasswordResetOtp: Model<PasswordResetOtpDoc> =
  mongoose.models.PasswordResetOtp ??
  mongoose.model<PasswordResetOtpDoc>("PasswordResetOtp", PasswordResetOtpSchema);
