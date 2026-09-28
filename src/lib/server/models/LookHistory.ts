import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const LookHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    imageUrl: { type: String, required: true },
    sourceImageUrl: { type: String },
    styleId: { type: String, index: true },
    categoryId: { type: String },
    isFavorite: { type: Boolean, default: false, index: true },
    savedToWardrobe: { type: Boolean, default: false, index: true },
    tryOnJobId: { type: Schema.Types.ObjectId, ref: "TryOnJob" },
  },
  { timestamps: true }
);

LookHistorySchema.index({ createdAt: -1 });
LookHistorySchema.index({ userId: 1, createdAt: -1 });
LookHistorySchema.index({ userId: 1, isFavorite: 1, createdAt: -1 });
LookHistorySchema.index({ userId: 1, savedToWardrobe: 1, createdAt: -1 });

export type LookHistoryDoc = InferSchemaType<typeof LookHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const LookHistory: Model<LookHistoryDoc> =
  mongoose.models.LookHistory ?? mongoose.model<LookHistoryDoc>("LookHistory", LookHistorySchema);
