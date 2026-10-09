import { getServerEnv } from "@/lib/server/env";
import type { BytePlusImageGenerationRequest, BytePlusImageGenerationResponse } from "./types";

export async function byteplusPostImagesGenerations(
  body: BytePlusImageGenerationRequest
): Promise<BytePlusImageGenerationResponse> {
  const env = getServerEnv();
  if (!env.ARK_API_KEY?.trim()) {
    throw new Error("BYTEPLUS_NOT_CONFIGURED");
  }

  const base = env.ARK_BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ARK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: BytePlusImageGenerationResponse;
  try {
    json = JSON.parse(text) as BytePlusImageGenerationResponse;
  } catch {
    throw new Error(`BYTEPLUS_GENERATE_FAILED:${res.status}:invalid_json`);
  }

  if (!res.ok) {
    const msg = json.error?.message ?? text.slice(0, 500);
    throw new Error(`BYTEPLUS_GENERATE_FAILED:${res.status}:${msg}`);
  }

  return json;
}
