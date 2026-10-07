import { parseStyleCommand } from "@/lib/server/bfl/promptBuilder";
import { buildTryOnBflPrompt } from "@/lib/server/bfl/resolveTryOnPrompt";
import {
  buildFullOutfitPhase2VtoPrompt,
  shouldUseFullOutfitPhase2VtoPrompt,
} from "@/lib/server/bfl/fullOutfitPhase2VtoPrompt";
import {
  buildWardrobePhase1VtoPrompt,
  shouldUseWardrobePhase1VtoPrompt,
} from "@/lib/server/bfl/wardrobePhase1VtoPrompt";

const OUTFIT_CATEGORY_IDS = new Set([
  "virtual_try_on",
  "outfit_change",
  "wardrobe_browse",
  "occasions",
  "couple_duo",
  "presets",
]);

/** Outfit/full-garment try-on uses BFL Virtual Try-On v2; localized edits stay on flux-2-pro. */
export function shouldUseVtoEngine(
  promptCommand: string | null | undefined,
  categoryId?: string | null
): boolean {
  const raw = promptCommand?.trim() ?? "";
  if (raw.startsWith("COMMAND:")) {
    const parsed = parseStyleCommand(raw);
    if (parsed) return parsed.region === "outfit";
  }
  if (categoryId && OUTFIT_CATEGORY_IDS.has(categoryId)) return true;
  return false;
}

export function buildVtoPrompt(
  promptCommand: string | null | undefined,
  styleId: string,
  categoryId?: string | null
): string {
  if (shouldUseWardrobePhase1VtoPrompt(promptCommand, categoryId)) {
    return buildWardrobePhase1VtoPrompt(promptCommand, styleId, categoryId);
  }
  if (shouldUseFullOutfitPhase2VtoPrompt(promptCommand, categoryId)) {
    return buildFullOutfitPhase2VtoPrompt(promptCommand, styleId, categoryId);
  }
  const parsed = promptCommand ? parseStyleCommand(promptCommand.trim()) : null;
  const styleHint = parsed?.styleRef ?? styleId;
  return (
    `TRY-ON: The person of image 1 wearing the garments of image 2. ` +
    `Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. ` +
    `Transfer only the outfit from image 2 (catalog style ${styleHint}). Photorealistic, no text or watermarks.`
  );
}

export function buildFluxEditPrompt(
  promptCommand: string | null | undefined,
  hasReferenceStyle: boolean
): string {
  return buildTryOnBflPrompt(promptCommand, hasReferenceStyle);
}
