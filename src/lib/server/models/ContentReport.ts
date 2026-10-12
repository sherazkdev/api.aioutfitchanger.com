import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ContentReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    reporterEmail: { type: String },
    contentType: {
      type: String,
      enum: ["look", "try_on_job", "other"],
      default: "other",
    },
    contentId: { type: String, index: true },
    tryOnJobId: { type: Schema.Types.ObjectId, ref: "TryOnJob" },
    lookHistoryId: { type: Schema.Types.ObjectId, ref: "LookHistory" },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open", index: true },
  },
  { timestamps: true }
);

ContentReportSchema.index({ createdAt: -1 });

export type ContentReportDoc = InferSchemaType<typeof ContentReportSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ContentReport: Model<ContentReportDoc> =
  mongoose.models.ContentReport ??
  mongoose.model<ContentReportDoc>("ContentReport", ContentReportSchema);
