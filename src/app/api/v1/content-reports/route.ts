import mongoose from "mongoose";
import { connectMongo } from "@/lib/server/db";
import { requireMobileUser } from "@/lib/server/auth/requireMobileUser";
import { ContentReport } from "@/lib/server/models/ContentReport";
import { jsonError, jsonOk } from "@/lib/server/http";

export async function POST(req: Request) {
  const auth = await requireMobileUser(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  let body: {
    reason?: string;
    details?: string;
    reporter_email?: string;
    content_type?: string;
    content_id?: string;
    look_id?: string;
    history_id?: string;
    try_on_job_id?: string;
    job_id?: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const reason = body.reason?.trim();
  if (!reason || reason.length < 3) {
    return jsonError("VALIDATION", "reason required (min 3 characters)", 422);
  }

  const lookId = body.look_id ?? body.history_id;
  const jobId = body.try_on_job_id ?? body.job_id;
  const contentId = body.content_id ?? lookId ?? jobId;

  let contentType: "look" | "try_on_job" | "other" = "other";
  if (lookId) contentType = "look";
  else if (jobId) contentType = "try_on_job";
  else if (body.content_type === "look" || body.content_type === "try_on_job") {
    contentType = body.content_type;
  }

  await connectMongo();

  const doc = await ContentReport.create({
    userId: auth.payload!.userId,
    reporterEmail: body.reporter_email?.trim(),
    contentType,
    contentId,
    lookHistoryId: lookId && mongoose.isValidObjectId(lookId) ? lookId : undefined,
    tryOnJobId: jobId && mongoose.isValidObjectId(jobId) ? jobId : undefined,
    reason,
    details: body.details?.trim(),
  });

  return jsonOk({
    id: String(doc._id),
    status: doc.status,
    created_at: doc.createdAt.toISOString(),
  });
}
