import { parseStyleCommand } from "@/lib/server/bfl/promptBuilder";
import { getServerEnv } from "@/lib/server/env";

export type TryOnProviderId = "bfl" | "byteplus";

const BEAUTY_REGIONS = new Set(["hair_style", "hair_color", "beard", "hijab"]);

const BEAUTY_CATEGORY_HINTS = [
  "hair_styles",
  "hair_style",
  "hair_colors",
  "hair_color",
  "beard",
  "beard_styles",
  "hijab",
  "hijab_styles",
  "beauty",
];

/**
 * Production routing plan (when TRY_ON_PROVIDER=byteplus):
 *
 * | Pipeline | region / engine | Provider | Model |
 * |----------|-----------------|----------|-------|
 * | Beauty FLUX | hair_style, hair_color, beard, hijab | BytePlus | ARK_MODEL (default flash) |
 * | VTO Phase 1 wardrobe | tops, shirts, bottoms, … | BFL | vto-v2 |
 * | VTO Phase 2 outfit | regional, occasions, presets, … | BFL | vto-v2 |
 * | couple_duo / virtual_try_on | outfit | BFL | vto-v2 |
 *
 * Default TRY_ON_PROVIDER=bfl → everything on BFL (flux-2-pro + vto-v2).
 * No silent fallback between providers.
 */

export function getConfiguredTryOnProvider(): TryOnProviderId {
  const env = getServerEnv();
  return env.TRY_ON_PROVIDER === "byteplus" ? "byteplus" : "bfl";
}

export function isBeautyTryOn(
  promptCommand: string | null | undefined,
  categoryId?: string | null
): boolean {
  const raw = promptCommand?.trim() ?? "";
  if (raw.startsWith("COMMAND:")) {
    const parsed = parseStyleCommand(raw);
    if (parsed && BEAUTY_REGIONS.has(parsed.region)) return true;
  }
  const cat = (categoryId ?? "").toLowerCase();
  if (!cat) return false;
  return BEAUTY_CATEGORY_HINTS.some((hint) => cat.includes(hint));
}

/**
 * Resolves image provider for POST /try-on/generate.
 * BytePlus: beauty localized edits only. VTO / outfit: always BFL.
 */
export function resolveTryOnImageProvider(
  promptCommand: string | null | undefined,
  categoryId: string | null | undefined,
  useVto: boolean
): TryOnProviderId {
  if (useVto) return "bfl";
  if (getConfiguredTryOnProvider() !== "byteplus") return "bfl";
  if (!isBeautyTryOn(promptCommand, categoryId)) return "bfl";
  return "byteplus";
}

/** @deprecated Use resolveTryOnImageProvider */
export const resolveBeautyGenerationProvider = resolveTryOnImageProvider;
