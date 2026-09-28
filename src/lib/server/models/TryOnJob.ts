import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TryOnJobSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    externalJobId: { type: String, index: true },
    pollingUrl: { type: String },
    styleId: { type: String },
    categoryId: { type: String },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed", "cancelled"],
      default: "queued",
      index: true,
    },
    errorMessage: { type: String },
    resultUrl: { type: String },
  },
  { timestamps: true }
);

TryOnJobSchema.index({ createdAt: -1 });
TryOnJobSchema.index({ userId: 1, createdAt: -1 });
TryOnJobSchema.index({ status: 1, createdAt: -1 });

export type TryOnJobDoc = InferSchemaType<typeof TryOnJobSchema> & { _id: mongoose.Types.ObjectId };

export const TryOnJob: Model<TryOnJobDoc> =
  mongoose.models.TryOnJob ?? mongoose.model<TryOnJobDoc>("TryOnJob", TryOnJobSchema);
