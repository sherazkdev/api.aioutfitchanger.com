import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AppMetadataSchema = new Schema(
  {
    key: { type: String, default: "default", unique: true },
    appName: { type: String, required: true },
    appNameLocalized: { type: Map, of: String, default: {} },
    sourceLocale: { type: String, default: "en" },
    version: { type: String, required: true },
    buildNumber: { type: String, required: true },
    supportEmail: { type: String },
    privacyUrl: { type: String },
    termsUrl: { type: String },
    helpUrl: { type: String },
    featureFlags: { type: Schema.Types.Mixed, default: {} },
    minVersionIos: { type: String, default: "1.0.0" },
    minVersionAndroid: { type: String, default: "1.0.0" },
    appStoreUrlIos: { type: String },
    appStoreUrlAndroid: { type: String },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "" },
    draftPayload: { type: Schema.Types.Mixed, default: null },
    publishedAt: { type: Date },
    draftUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

export type AppMetadataDoc = InferSchemaType<typeof AppMetadataSchema> & { _id: mongoose.Types.ObjectId };

export const AppMetadata: Model<AppMetadataDoc> =
  mongoose.models.AppMetadata ?? mongoose.model<AppMetadataDoc>("AppMetadata", AppMetadataSchema);
