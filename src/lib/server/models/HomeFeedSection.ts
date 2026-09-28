import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const FeedItemSchema = new Schema(
  {
    styleId: { type: String },
    categoryId: { type: String },
    thumbnailUrl: { type: String },
    labelKey: { type: String },
    label: { type: String },
    labelLocalized: { type: Map, of: String, default: {} },
    genderScope: { type: String, enum: ["men", "women", "both"], default: "both" },
  },
  { _id: false }
);

const HomeFeedSectionSchema = new Schema(
  {
    sectionId: { type: String, required: true, unique: true },
    titleKey: { type: String, required: true },
    titleLocalized: { type: Map, of: String, default: {} },
    sourceLocale: { type: String, default: "en" },
    type: { type: String, enum: ["category_cards", "image_rail"], required: true },
    categoryId: { type: String },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    items: [FeedItemSchema],
  },
  { timestamps: true }
);

export type HomeFeedSectionDoc = InferSchemaType<typeof HomeFeedSectionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const HomeFeedSection: Model<HomeFeedSectionDoc> =
  mongoose.models.HomeFeedSection ?? mongoose.model<HomeFeedSectionDoc>("HomeFeedSection", HomeFeedSectionSchema);
