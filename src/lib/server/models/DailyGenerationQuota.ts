import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const DailyGenerationQuotaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    /** UTC calendar day as YYYY-MM-DD */
    utcDate: { type: String, required: true },
    used: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

DailyGenerationQuotaSchema.index({ userId: 1, utcDate: 1 }, { unique: true });

export type DailyGenerationQuotaDoc = InferSchemaType<typeof DailyGenerationQuotaSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyGenerationQuota: Model<DailyGenerationQuotaDoc> =
  mongoose.models.DailyGenerationQuota ??
  mongoose.model<DailyGenerationQuotaDoc>("DailyGenerationQuota", DailyGenerationQuotaSchema);
