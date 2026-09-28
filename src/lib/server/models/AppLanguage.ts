import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AppLanguageSchema = new Schema(
  {
    languageId: { type: String, required: true, unique: true },
    languageCode: { type: String, required: true },
    countryCode: { type: String },
    nativeName: { type: String, required: true },
    englishName: { type: String, required: true },
    flagUrl: { type: String },
    enabled: { type: Boolean, default: true },
    rtl: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type AppLanguageDoc = InferSchemaType<typeof AppLanguageSchema> & { _id: mongoose.Types.ObjectId };

export const AppLanguage: Model<AppLanguageDoc> =
  mongoose.models.AppLanguage ?? mongoose.model<AppLanguageDoc>("AppLanguage", AppLanguageSchema);
