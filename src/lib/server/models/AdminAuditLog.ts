import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AdminAuditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String },
    meta: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AdminAuditLogSchema.index({ createdAt: -1 });

export type AdminAuditLogDoc = InferSchemaType<typeof AdminAuditLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AdminAuditLog: Model<AdminAuditLogDoc> =
  mongoose.models.AdminAuditLog ?? mongoose.model<AdminAuditLogDoc>("AdminAuditLog", AdminAuditLogSchema);
