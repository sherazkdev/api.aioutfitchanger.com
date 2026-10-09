import { getServerEnv } from "@/lib/server/env";
import { byteplusPostImagesGenerations } from "./client";
import { buildBytePlusBeautyRequest, extractBytePlusResultUrl } from "./imageGeneration";
import type { BytePlusBeautyGenerationInput, BytePlusBeautyGenerationResult } from "./types";

export async function runBytePlusBeautyGeneration(
  input: BytePlusBeautyGenerationInput
): Promise<BytePlusBeautyGenerationResult> {
  const env = getServerEnv();
  const model = env.ARK_MODEL;
  const body = buildBytePlusBeautyRequest(input, model);
  const started = Date.now();

  const response = await byteplusPostImagesGenerations(body);
  const resultUrl = extractBytePlusResultUrl(response);
  if (!resultUrl) {
    throw new Error("BYTEPLUS_GENERATE_FAILED:empty_result");
  }

  const durationMs = Date.now() - started;
  console.info("[try-on] byteplus beauty completed", {
    provider: "byteplus",
    model,
    duration_ms: durationMs,
    has_reference: Boolean(input.referenceDataUrl),
  });

  return { resultUrl, durationMs, model };
}
