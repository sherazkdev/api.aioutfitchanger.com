import { connectMongo } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/auth/requireAuth";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { bflStartGeneration, bflStartVtoV2, mapBflStatus } from "@/lib/server/bfl";
import { normalizeImageInput } from "@/lib/server/bfl/normalizeImageInput";
import { resolveCatalogPromptCommand } from "@/lib/server/bfl/resolveTryOnPrompt";
import { resolveGarmentImage } from "@/lib/server/bfl/resolveGarmentImage";
import { buildFluxEditPrompt, buildVtoPrompt, shouldUseVtoEngine } from "@/lib/server/bfl/tryOnEngine";
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
    const person = normalizeImageInput(body.source_image_base64, "PERSON");
    const catalogCommand =
      body.prompt?.trim() ||
      (await resolveCatalogPromptCommand(body.style_id, body.category_id)) ||
      `COMMAND: style_ref=${body.style_id} | category=${body.category_id ?? "virtual_try_on"} | pipeline=neutral | region=outfit | Apply outfit from reference image 2.`;

    const useVto = shouldUseVtoEngine(catalogCommand, body.category_id);

    let started;
    if (useVto) {
      const garment = await resolveGarmentImage({
        styleId: body.style_id,
        categoryId: body.category_id,
        styleReferenceBase64: body.style_reference_image_base64,
        appOrigin: process.env.APP_URL ?? null,
      });
      const vtoBody: Record<string, unknown> = {
        prompt: buildVtoPrompt(catalogCommand, body.style_id),
        person: person.dataUrl,
        garment: garment.dataUrl,
        output_format: "jpeg",
      };
      started = await bflStartVtoV2(vtoBody);
    } else {
      const hasReferenceStyle = Boolean(body.style_reference_image_base64?.trim());
      let inputImage2: string | undefined;
      if (hasReferenceStyle) {
        inputImage2 = normalizeImageInput(body.style_reference_image_base64!, "GARMENT").dataUrl;
      } else {
        try {
          const garment = await resolveGarmentImage({
            styleId: body.style_id,
            categoryId: body.category_id,
            styleReferenceBase64: null,
            appOrigin: process.env.APP_URL ?? null,
          });
          inputImage2 = garment.dataUrl;
        } catch {
          // Localized edits may run text-only when no reference (legacy).
        }
      }

      const bflBody: Record<string, unknown> = {
        prompt: buildFluxEditPrompt(catalogCommand, Boolean(inputImage2)),
        input_image: person.dataUrl,
        width: body.width ?? 768,
        height: body.height ?? 1024,
        disable_pup: true,
      };
      if (inputImage2) bflBody.input_image_2 = inputImage2;
      started = await bflStartGeneration(bflBody);
    }

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
    const msg = e instanceof Error ? e.message : "BFL_ERROR";
    if (msg.includes("GARMENT_NOT_FOUND") || msg.includes("GARMENT_FILE_MISSING")) {
      job.status = "failed";
      job.errorMessage = msg;
      await job.save();
      return jsonError("VALIDATION", "Garment reference image required but could not be resolved", 422);
    }
    if (msg.startsWith("PERSON_") || msg.startsWith("GARMENT_")) {
      job.status = "failed";
      job.errorMessage = msg;
      await job.save();
      return jsonError("VALIDATION", "Invalid image input", 422);
    }
    job.status = "failed";
    job.errorMessage = msg;
    await job.save();
    return jsonError("TRY_ON_FAILED", job.errorMessage, 502);
  }
}
