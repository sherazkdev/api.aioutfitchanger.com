import type { ImageSafetyProvider, ImageSafetyResult } from "./imageSafetyTypes";
import { GoogleVisionSafeSearchProvider } from "./googleVisionSafeSearchProvider";

export type { ImageSafetyResult, ImageSafetyCategories, SafetyLikelihood, ImageSafetyProvider } from "./imageSafetyTypes";
export { applyImageSafetyPolicy, normalizeLikelihood } from "./imageSafetyPolicy";

let injectedProvider: ImageSafetyProvider | null = null;

export function imageSafetyModerationEnabled(): boolean {
  const v = process.env.IMAGE_SAFETY_MODERATION_ENABLED?.trim().toLowerCase();
  if (v === undefined || v === "") return true; // default ON
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

export function imageSafetyFailClosed(): boolean {
  const v = process.env.IMAGE_SAFETY_FAIL_CLOSED?.trim().toLowerCase();
  if (v === undefined || v === "") return true; // production default: fail closed
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

/** Test hook — never use in production routes. */
export function setImageSafetyProviderForTests(provider: ImageSafetyProvider | null): void {
  injectedProvider = provider;
}

function getProvider(): ImageSafetyProvider {
  return injectedProvider ?? new GoogleVisionSafeSearchProvider();
}

export type ModerateImageSafetyOutcome =
  | { status: "allowed"; result: ImageSafetyResult }
  | { status: "blocked"; result: ImageSafetyResult }
  | { status: "disabled" }
  | { status: "error"; failClosed: boolean; message: string };

/**
 * Real image safety / NSFW moderation (Google Vision SafeSearch in production).
 * Separate from structural format/size checks in moderateImage.ts.
 */
export async function moderateImageSafety(buffer: Buffer): Promise<ModerateImageSafetyOutcome> {
  if (!imageSafetyModerationEnabled()) {
    return { status: "disabled" };
  }
  if (!buffer?.length) {
    return {
      status: "blocked",
      result: {
        allowed: false,
        reason: "empty",
        categories: { adult: "UNKNOWN", racy: "UNKNOWN", violence: "UNKNOWN" },
      },
    };
  }

  try {
    const result = await getProvider().moderate(buffer);
    if (!result.allowed) return { status: "blocked", result };
    return { status: "allowed", result };
  } catch {
    const failClosed = imageSafetyFailClosed();
    return {
      status: "error",
      failClosed,
      message: "Image safety check temporarily unavailable",
    };
  }
}

/** Decode data-URL / raw base64 to bytes for safety scan (no logging of content). */
export function bufferFromDataUrlOrBase64(input: string): Buffer | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("data:")) {
      const comma = trimmed.indexOf(",");
      if (comma < 0) return null;
      return Buffer.from(trimmed.slice(comma + 1), "base64");
    }
    return Buffer.from(trimmed, "base64");
  } catch {
    return null;
  }
}
