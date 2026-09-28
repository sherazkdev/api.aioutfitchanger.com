import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const StyleTabSchema = new Schema(
  { id: String, titleKey: String, titles: { type: Map, of: String, default: {} } },
  { _id: false }
);
const StyleItemSchema = new Schema(
  {
    id: { type: String, required: true },
    tabId: { type: String },
    genderTabId: { type: String },
    imageUrl: { type: String, required: true },
    nameLocalized: { type: Map, of: String, default: {} },
    promptCommand: { type: String },
    sortOrder: { type: Number, default: 0 },
    gender: { type: String, enum: ["men", "women", "both"], default: "women" },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const CatalogCategorySchema = new Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    titleKey: { type: String, required: true },
    titleLocalized: { type: Map, of: String, default: {} },
    sourceLocale: { type: String, default: "en" },
    genderScope: { type: String, enum: ["men", "women", "both"], default: "both" },
    genderTabs: [StyleTabSchema],
    tabs: [StyleTabSchema],
    items: [StyleItemSchema],
  },
  { timestamps: true }
);

export type CatalogCategoryDoc = InferSchemaType<typeof CatalogCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CatalogCategory: Model<CatalogCategoryDoc> =
  mongoose.models.CatalogCategory ?? mongoose.model<CatalogCategoryDoc>("CatalogCategory", CatalogCategorySchema);
