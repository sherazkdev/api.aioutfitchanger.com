import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PreviewItemSchema = new Schema(
  {
    styleId: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    gender: { type: String, enum: ["men", "women"], default: "women" },
  },
  { _id: false }
);

const WardrobeCategorySchema = new Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    titleKey: { type: String, required: true },
    titleLocalized: { type: Map, of: String, default: {} },
    sourceLocale: { type: String, default: "en" },
    browseTabId: { type: String, required: true },
    backgroundToken: { type: String },
    genderScope: { type: String, enum: ["men", "women", "both"], default: "women" },
    sortOrder: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    previewItems: [PreviewItemSchema],
  },
  { timestamps: true }
);

export type WardrobeCategoryDoc = InferSchemaType<typeof WardrobeCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WardrobeCategory: Model<WardrobeCategoryDoc> =
  mongoose.models.WardrobeCategory ?? mongoose.model<WardrobeCategoryDoc>("WardrobeCategory", WardrobeCategorySchema);
