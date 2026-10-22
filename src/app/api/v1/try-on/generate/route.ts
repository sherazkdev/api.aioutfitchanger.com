import { connectMongo } from "@/lib/server/db";
import { requireMobileUser } from "@/lib/server/auth/requireMobileUser";
import { TryOnJob } from "@/lib/server/models/TryOnJob";
import { User } from "@/lib/server/models/User";
import { normalizePersonGender } from "@/lib/server/bfl/coupleDuoGarmentRouting";
import { bflStartGeneration, bflStartVtoV2, mapBflStatus } from "@/lib/server/bfl";
import { normalizeImageInput } from "@/lib/server/bfl/normalizeImageInput";
import { resolveCatalogPromptCommand } from "@/lib/server/bfl/resolveTryOnPrompt";
import { resolveGarmentImage } from "@/lib/server/bfl/resolveGarmentImage";
import { buildFluxEditPrompt, buildVtoPrompt, shouldUseVtoEngine } from "@/lib/server/bfl/tryOnEngine";
import { runBytePlusBeautyGeneration } from "@/lib/server/byteplus/provider";
import { getServerEnv } from "@/lib/server/env";
import { jsonError, jsonOk, rateLimit } from "@/lib/server/http";
import { moderateTryOnRequest } from "@/lib/server/moderation/moderateTryOn";
import {
  releaseDailyGenerationReservation,
  reserveDailyGeneration,
  type QuotaReservation,
} from "@/lib/server/tryOn/atomicQuota";
import type { QuotaPlan } from "@/lib/server/tryOn/planQuota";
import { publicTryOnFailureMessage } from "@/lib/server/tryOn/publicErrors";
import { readBodyTextLimited } from "@/lib/server/security/requestGuards";
import { persistLookImageUrl } from "@/lib/server/storage/persistLookImages";
import { resolveTryOnImageProvider } from "@/lib/server/tryOn/providerSelection";

function resolveQuotaPlan(role: string, subscriptionPlan?: string | null): QuotaPlan {
  if (role === "admin") return "admin";
  if (subscriptionPlan === "premium") return "premium";
  return "free";
}

export async function POST(req: Request) {
  let env;
  try {
    env = getServerEnv();
  } catch {
    return jsonError("SERVER_CONFIG", "Server not configured", 503);
  }
  const auth = await requireMobileUser(req, ["user", "admin"]);
  if (auth.error) return auth.error;

  if (!(await rateLimit(`tryon:${auth.payload!.userId}`, 10, 60_000))) {
    return jsonError("RATE_LIMIT", "Too many try-on requests", 429);
  }

  await connectMongo();

  const limited = await readBodyTextLimited(req);
  if (!limited.ok) return limited.response;

  let body: {
    source_image_base64?: string;
    style_id?: string;
    category_id?: string;
    style_reference_image_base64?: string;
    prompt?: string;
    width?: number;
    height?: number;
    /** Person / source gender for couple_duo split garment routing (`men` | `women`). */
    person_gender?: string;
    gender?: string;
  };
  try {
    body = JSON.parse(limited.text) as typeof body;
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  if (!body.source_image_base64 || !body.style_id) {
    return jsonError("VALIDATION", "source_image_base64 and style_id required", 422);
  }

  const user = await User.findById(auth.payload!.userId)
    .select("gender preferences.styleGenderPreference subscriptionPlan role")
    .lean();
  const plan = resolveQuotaPlan(auth.payload!.role, user?.subscriptionPlan);

  let quotaReservation: QuotaReservation | null = null;
  try {
    quotaReservation = await reserveDailyGeneration(auth.payload!.userId, plan);
  } catch (e) {
    if (e instanceof Error && e.message === "DAILY_LIMIT_EXCEEDED") {
      return jsonError(
        "DAILY_LIMIT",
        "Daily try-on limit reached. Try again tomorrow or upgrade your plan.",
        429
      );
    }
    throw e;
  }

  const releaseQuota = async () => {
    if (quotaReservation) {
      await releaseDailyGenerationReservation(quotaReservation);
      quotaReservation = null;
    }
  };

  let personGender = normalizePersonGender(body.person_gender ?? body.gender);
  if (!personGender) {
    personGender = normalizePersonGender(user?.gender ?? user?.preferences?.styleGenderPreference ?? null);
  }

  const job = await TryOnJob.create({
    userId: auth.payload!.userId,
    styleId: body.style_id,
    categoryId: body.category_id,
    status: "queued",
  });

  let providerStarted = false;

  try {
    const person = normalizeImageInput(body.source_image_base64, "PERSON");
    const catalogCommand =
      body.prompt?.trim() ||
      (await resolveCatalogPromptCommand(body.style_id, body.category_id)) ||
      `COMMAND: style_ref=${body.style_id} | category=${body.category_id ?? "virtual_try_on"} | pipeline=neutral | region=outfit | Apply outfit from reference image 2.`;

    // Prompt/structural moderation and/or Google Vision SafeSearch before paid provider.
    if (env.TRY_ON_MODERATION_ENABLED || env.IMAGE_SAFETY_MODERATION_ENABLED) {
      let garmentForModeration = null;
      if (body.style_reference_image_base64?.trim()) {
        garmentForModeration = normalizeImageInput(body.style_reference_image_base64, "GARMENT");
      }
      const safetyCache = new Map();
      const moderation = await moderateTryOnRequest({
        promptTexts: env.TRY_ON_MODERATION_ENABLED ? [body.prompt, catalogCommand] : [],
        person,
        garment: garmentForModeration,
        safetyCache,
      });
      if (moderation) {
        job.status = "failed";
        job.errorMessage = moderation.code;
        await job.save();
        await releaseQuota();
        return jsonError(moderation.code, moderation.message, moderation.httpStatus);
      }
    }

    const useVto = shouldUseVtoEngine(catalogCommand, body.category_id);
    const imageProvider = resolveTryOnImageProvider(catalogCommand, body.category_id, useVto);

    if (useVto || imageProvider === "bfl") {
      if (!env.BFL_API_KEY?.trim()) {
        job.status = "failed";
        job.errorMessage = "BFL_NOT_CONFIGURED";
        await job.save();
        await releaseQuota();
        return jsonError("SERVER_CONFIG", "Try-on service is temporarily unavailable", 503);
      }
    }
    if (imageProvider === "byteplus") {
      if (!env.ARK_API_KEY?.trim()) {
        job.status = "failed";
        job.errorMessage = "BYTEPLUS_NOT_CONFIGURED";
        await job.save();
        await releaseQuota();
        return jsonError("SERVER_CONFIG", "Try-on service is temporarily unavailable", 503);
      }
    }

    let started;
    if (useVto) {
      job.provider = "bfl";
      const garment = await resolveGarmentImage({
        styleId: body.style_id,
        categoryId: body.category_id,
        styleReferenceBase64: body.style_reference_image_base64,
        appOrigin: process.env.APP_URL ?? null,
        personGender,
      });
      const vtoBody: Record<string, unknown> = {
        prompt: buildVtoPrompt(catalogCommand, body.style_id, body.category_id),
        person: person.dataUrl,
        garment: garment.dataUrl,
        output_format: "jpeg",
      };
      providerStarted = true;
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
            personGender,
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

      if (imageProvider === "byteplus") {
        job.provider = "byteplus";
        job.status = "processing";
        await job.save();

        providerStarted = true;
        const byteplus = await runBytePlusBeautyGeneration({
          prompt: bflBody.prompt as string,
          personDataUrl: person.dataUrl,
          referenceDataUrl: inputImage2,
          width: body.width ?? 768,
          height: body.height ?? 1024,
        });

        job.modelId = byteplus.model;
        job.generationDurationMs = byteplus.durationMs;
        job.status = "completed";
        job.externalJobId = `byteplus:${job._id}`;
        try {
          job.resultUrl = await persistLookImageUrl(
            auth.payload!.userId,
            byteplus.resultUrl,
            String(job._id)
          );
        } catch (e) {
          if (
            e instanceof Error &&
            (e.message === "OUTPUT_MODERATION_BLOCKED" || e.message === "OUTPUT_MODERATION_UNAVAILABLE")
          ) {
            job.status = "failed";
            job.errorMessage =
              e.message === "OUTPUT_MODERATION_UNAVAILABLE"
                ? "MODERATION_UNAVAILABLE"
                : "MODERATION_BLOCKED";
            job.resultUrl = undefined;
            await job.save();
            return jsonError(
              job.errorMessage,
              e.message === "OUTPUT_MODERATION_UNAVAILABLE"
                ? "Content safety check is temporarily unavailable. Please try again."
                : "This result could not be generated because it was blocked by content moderation.",
              e.message === "OUTPUT_MODERATION_UNAVAILABLE" ? 503 : 422
            );
          }
          // Transient persist failure: keep remote URL for retry via job poll (still gated on persist).
          job.resultUrl = byteplus.resultUrl;
        }
        await job.save();

        return jsonOk({
          job_id: String(job._id),
          external_job_id: job.externalJobId,
          polling_url: `/api/v1/try-on/jobs/${job._id}`,
          status: job.status,
        });
      }

      job.provider = "bfl";
      providerStarted = true;
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
    const msg = e instanceof Error ? e.message : "TRY_ON_ERROR";
    if (!providerStarted) await releaseQuota();
    if (msg.startsWith("BYTEPLUS_")) {
      job.status = "failed";
      job.errorMessage = msg;
      await job.save();
      return jsonError("TRY_ON_FAILED", publicTryOnFailureMessage(msg), 502);
    }
    if (msg.includes("COUPLE_PERSON_GENDER_REQUIRED")) {
      job.status = "failed";
      job.errorMessage = msg;
      await job.save();
      return jsonError(
        "VALIDATION",
        "person_gender (men|women) required for couple_duo try-on, or set style gender preference on your profile",
        422
      );
    }
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
    return jsonError("TRY_ON_FAILED", publicTryOnFailureMessage(msg), 502);
  }
}
