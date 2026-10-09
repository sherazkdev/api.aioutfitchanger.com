import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    displayName: { type: String, trim: true },
    photoUrl: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isGuest: { type: Boolean, default: false },
    passwordHash: { type: String, select: false },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    lastLoginAt: { type: Date },
    preferences: {
      themeMode: { type: String, enum: ["system", "light", "dark"], default: "system" },
      notificationsEnabled: { type: Boolean, default: true },
      languageId: { type: String, default: "en_US" },
      styleGenderPreference: { type: String, enum: ["men", "women"], default: "women" },
      notifyJobFailures: { type: Boolean, default: true },
      notifyNewUsers: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> =
  mongoose.models.User ?? mongoose.model<UserDoc>("User", UserSchema);
