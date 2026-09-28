import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const OnboardingPageSchema = new Schema(
  {
    sortOrder: { type: Number, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    titleLocalized: { type: Map, of: String, default: {} },
    bodyLocalized: { type: Map, of: String, default: {} },
    sourceLocale: { type: String, default: "en" },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export type OnboardingPageDoc = InferSchemaType<typeof OnboardingPageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const OnboardingPage: Model<OnboardingPageDoc> =
  mongoose.models.OnboardingPage ?? mongoose.model<OnboardingPageDoc>("OnboardingPage", OnboardingPageSchema);
