import { connectMongo } from "@/lib/server/db";
import { requireMobileUser } from "@/lib/server/auth/requireMobileUser";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { bflPollResult, extractBflResultUrl, mapBflStatus } from "@/lib/server/bfl";
import { jsonError, jsonOk } from "@/lib/server/http";
import {
  isProviderModerationFailure,
  MODERATION_USER_MESSAGE,
} from "@/lib/server/moderation/moderateTryOn";
import { serializeTryOnJob } from "@/lib/server/tryOn/jobResponse";
import { persistLookImageUrl } from "@/lib/server/storage/persistLookImages";
import { isHostedUploadUrl } from "@/lib/server/storage/uploads";
import { shouldSkipBflPoll } from "@/lib/server/tryOn/pollThrottle";

async function ensureJobResultPersisted(job: InstanceType<typeof TryOnJob>) {
  if (job.status !== "completed" || !job.resultUrl || isHostedUploadUrl(job.resultUrl)) return;
  try {
    const persisted = await persistLookImageUrl(String(job.userId), job.resultUrl, String(job._id));
    if (persisted !== job.resultUrl) {
      job.resultUrl = persisted;
      await job.save();
    }
  } catch (e) {
    if (
      e instanceof Error &&
      (e.message === "OUTPUT_MODERATION_BLOCKED" || e.message === "OUTPUT_MODERATION_UNAVAILABLE")
    ) {
      job.status = "failed";
      job.errorMessage =
        e.message === "OUTPUT_MODERATION_UNAVAILABLE" ? "MODERATION_UNAVAILABLE" : "MODERATION_BLOCKED";
      job.resultUrl = undefined;
      await job.save();
      return;
    }
    // Keep BFL URL; retry persist on next poll.
  }
}

function publicJobError(job: InstanceType<typeof TryOnJob>): string | null {
  if (job.status !== "failed") return null;
  if (job.errorMessage === "MODERATION_UNAVAILABLE") {
    return "Content safety check is temporarily unavailable. Please try again.";
  }
  if (isProviderModerationFailure(job.errorMessage)) return MODERATION_USER_MESSAGE;
  return job.errorMessage ?? null;
}

function jobPayload(job: InstanceType<typeof TryOnJob>) {
  return serializeTryOnJob({
    job_id: String(job._id),
    status: job.status,
    result_image_url: job.resultUrl ?? null,
    error: publicJobError(job),
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const auth = await requireMobileUser(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const { jobId } = await ctx.params;
  await connectMongo();

  const job = await TryOnJob.findById(jobId);
  if (!job) return jsonError("NOT_FOUND", "Job not found", 404);

  if (auth.payload!.role !== "admin" && String(job.userId) !== auth.payload!.userId) {
    return jsonError("FORBIDDEN", "Not your job", 403);
  }

  if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
    if (job.status === "completed") await ensureJobResultPersisted(job);
    return jsonOk(jobPayload(job));
  }

  if (job.provider === "byteplus" || !job.externalJobId) {
    return jsonOk(jobPayload(job));
  }

  const jobKey = String(job._id);
  if (shouldSkipBflPoll(jobKey)) {
    return jsonOk(jobPayload(job));
  }

  try {
    const pollingUrl =
      job.pollingUrl ?? `https://api.bfl.ai/v1/get_result?id=${job.externalJobId}`;
    const poll = await bflPollResult(pollingUrl);
    const status = mapBflStatus(poll.status);
    job.status = status;

    const sampleUrl = extractBflResultUrl(poll);
    if (status === "completed" && sampleUrl) {
      job.resultUrl = sampleUrl;
    }
    if (status === "failed") {
      const providerMsg = poll.details?.message ?? poll.status ?? "Generation failed";
      job.errorMessage = isProviderModerationFailure(providerMsg) ? "MODERATION_BLOCKED" : providerMsg;
    }
    await job.save();
    if (job.status === "completed") await ensureJobResultPersisted(job);

    return jsonOk(jobPayload(job));
  } catch (e) {
    return jsonOk(
      serializeTryOnJob({
        job_id: String(job._id),
        status: job.status,
        result_image_url: job.resultUrl ?? null,
        error: e instanceof Error ? e.message : "POLL_ERROR",
      })
    );
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ jobId: string }> }) {
  const auth = await requireMobileUser(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  const { jobId } = await ctx.params;
  await connectMongo();
  const job = await TryOnJob.findById(jobId);
  if (!job) return jsonError("NOT_FOUND", "Job not found", 404);

  if (auth.payload!.role !== "admin" && String(job.userId) !== auth.payload!.userId) {
    return jsonError("FORBIDDEN", "Not your job", 403);
  }

  job.status = "cancelled";
  await job.save();
  return jsonOk({ job_id: String(job._id), status: "cancelled" });
}
