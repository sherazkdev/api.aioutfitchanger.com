import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { bflStartGeneration, mapBflStatus } from "@/lib/server/bfl";
import { getServerEnv } from "@/lib/server/env";
import { jsonError, jsonOk, rateLimit } from "@/lib/server/http";

export async function POST(req: Request) {
  let env;
  try {
    env = getServerEnv();
  } catch {
    return jsonError("SERVER_CONFIG", "Server not configured", 503);
  }
  if (!env.BFL_API_KEY?.trim()) {
    return jsonError("SERVER_CONFIG", "BFL_API_KEY not configured in .env.local", 503);
  }

  const auth = await requireAuth(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  if (!rateLimit(`tryon:${auth.payload!.userId}`, 10, 60_000)) {
    return jsonError("RATE_LIMIT", "Too many try-on requests", 429);
  }

  const body = (await req.json()) as {
    source_image_base64?: string;
    style_id?: string;
    category_id?: string;
    style_reference_image_base64?: string;
    prompt?: string;
    width?: number;
    height?: number;
  };

  if (!body.source_image_base64 || !body.style_id) {
    return jsonError("VALIDATION", "source_image_base64 and style_id required", 422);
  }

  await connectMongo();

  const job = await TryOnJob.create({
    userId: auth.payload!.userId,
    styleId: body.style_id,
    categoryId: body.category_id,
    status: "queued",
  });

  try {
    const bflBody: Record<string, unknown> = {
      prompt: body.prompt ?? `Apply outfit style ${body.style_id} to the person. Preserve face and pose.`,
      input_image: body.source_image_base64,
      width: body.width ?? 768,
      height: body.height ?? 1024,
    };
    if (body.style_reference_image_base64) {
      bflBody.input_image_2 = body.style_reference_image_base64;
    }

    const started = await bflStartGeneration(bflBody);
    job.externalJobId = started.id;
    job.pollingUrl = started.polling_url;
    job.status = mapBflStatus(started.status);
    await job.save();

    return jsonOk({
      job_id: String(job._id),
      external_job_id: started.id,
      polling_url: `/api/v1/try-on/jobs/${job._id}`,
      status: job.status,
    });
  } catch (e) {
    job.status = "failed";
    job.errorMessage = e instanceof Error ? e.message : "BFL_ERROR";
    await job.save();
    return jsonError("TRY_ON_FAILED", job.errorMessage, 502);
  }
}
