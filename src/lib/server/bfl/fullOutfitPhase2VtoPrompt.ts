import { parseStyleCommand } from "@/lib/server/bfl/promptBuilder";
import { shouldUseWardrobePhase1VtoPrompt } from "@/lib/server/bfl/wardrobePhase1VtoPrompt";

const PHASE2_OUTFIT_CATEGORY_IDS = new Set([
  "virtual_try_on",
  "outfit_change",
  "wardrobe_browse",
  "occasions",
  "couple_duo",
  "presets",
]);

/**
 * Phase 2: full-outfit VTO (258 catalog styles) — all legacy VTO except Phase 1 single-garment wardrobe tabs.
 */
export function shouldUseFullOutfitPhase2VtoPrompt(
  promptCommand: string | null | undefined,
  categoryId?: string | null
): boolean {
  if (shouldUseWardrobePhase1VtoPrompt(promptCommand, categoryId)) return false;

  const raw = promptCommand?.trim() ?? "";
  if (raw.startsWith("COMMAND:")) {
    const parsed = parseStyleCommand(raw);
    if (parsed) return parsed.region === "outfit";
  }
  if (categoryId && PHASE2_OUTFIT_CATEGORY_IDS.has(categoryId)) return true;
  return false;
}

function occasionLabel(tab: string): string {
  if (tab === "casual" || tab === "formal" || tab === "wedding") return tab;
  return tab || "occasion";
}

/** Short tail only — image 2 is source of truth; no invented garment type names. */
export function shortFullOutfitPhase2StyleInstruction(
  categoryId: string,
  tabId: string | null | undefined
): string {
  const tab = tabId ?? "";

  if (categoryId === "couple_duo") {
    return (
      "Preserve exactly the people already present in image 1.\n\n" +
      "Do not add or remove people.\n\n" +
      "Apply only the clothing reference that can naturally be transferred to the existing person or people in image 1."
    );
  }

  if (categoryId === "outfit_change" || categoryId === "virtual_try_on") {
    return "Match the exact complete outfit shown in image 2, including silhouette, layering, fit, fabric, color and pattern.";
  }

  if (categoryId === "presets") {
    return "Match the exact preset outfit shown in image 2, including all visible clothing layers.";
  }

  if (categoryId === "occasions") {
    const occ = occasionLabel(tab);
    return `Match the exact ${occ} outfit shown in image 2, including all visible garment layers and details.`;
  }

  if (tab === "indian") {
    return "Match the exact traditional Indian outfit shown in image 2, including its visible layers, textile, color, pattern and detailing.";
  }
  if (tab === "arabian") {
    return "Match the exact Arabian outfit shown in image 2, including silhouette, layers, textile, color and detailing.";
  }
  if (tab === "chinese") {
    return "Match the exact Chinese-inspired outfit shown in image 2, including silhouette, layers, textile, color and detailing.";
  }
  if (tab === "korean") {
    return "Match the exact Korean-inspired outfit shown in image 2, including silhouette, layers, textile, color and detailing.";
  }
  if (tab === "pakistani") {
    return "Match the exact Pakistani outfit shown in image 2, including silhouette, layers, textile, color, drape and detailing.";
  }

  return "Match the exact complete outfit shown in image 2, including silhouette, layering, fit, fabric, color and pattern.";
}

export function buildFullOutfitPhase2VtoPrompt(
  promptCommand: string | null | undefined,
  styleId: string,
  categoryId?: string | null
): string {
  if (!shouldUseFullOutfitPhase2VtoPrompt(promptCommand, categoryId)) {
    throw new Error("buildFullOutfitPhase2VtoPrompt called for non-phase-2 style");
  }

  const parsed = promptCommand?.trim().startsWith("COMMAND:")
    ? parseStyleCommand(promptCommand.trim())
    : null;
  const category = parsed?.category ?? categoryId ?? "";
  const tab = parsed?.tab ?? "";
  const styleSpecific = shortFullOutfitPhase2StyleInstruction(category, tab);

  return (
    "Edit image 1 directly.\n\n" +
    "Keep the same person or people from image 1, including identity, face, skin tone, hair, body proportions, pose, hands, camera, lighting and background.\n\n" +
    "Preserve the exact number of people from image 1. Do not add, remove, or replace any person.\n\n" +
    "Replace ONLY the visible clothing on the existing person or people with the outfit shown in image 2.\n\n" +
    `Use image 2 as the visual source of truth for ${styleId}.\n` +
    "Match the outfit silhouette, garment layers, fit, fabric, color, pattern, length, drape and visible garment details.\n\n" +
    "Do not invent garment types or clothing that are not shown in image 2.\n" +
    "Do not recreate the person or the full image.\n" +
    "Keep all non-clothing features unchanged.\n\n" +
    "Photorealistic.\n\n" +
    styleSpecific
  );
}
