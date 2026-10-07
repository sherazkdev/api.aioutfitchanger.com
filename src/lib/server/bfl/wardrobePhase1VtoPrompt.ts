import { parseStyleCommand } from "@/lib/server/bfl/promptBuilder";

/** Phase 1: single-garment wardrobe tabs only (105 catalog styles). */
export const WARDROBE_PHASE1_GARMENT_TABS = ["tops", "shirts", "bottoms", "skirts", "jackets"] as const;

export type WardrobePhase1Tab = (typeof WARDROBE_PHASE1_GARMENT_TABS)[number];

const PHASE1_TAB_SET = new Set<string>(WARDROBE_PHASE1_GARMENT_TABS);

export function isWardrobePhase1GarmentTab(tab: string | null | undefined): tab is WardrobePhase1Tab {
  return Boolean(tab && PHASE1_TAB_SET.has(tab));
}

/**
 * True when VTO should use the Phase 1 short master prompt (wardrobe single-garment only).
 */
export function shouldUseWardrobePhase1VtoPrompt(
  promptCommand: string | null | undefined,
  categoryId?: string | null
): boolean {
  const parsed = promptCommand?.trim().startsWith("COMMAND:") ? parseStyleCommand(promptCommand.trim()) : null;
  const category = parsed?.category ?? categoryId ?? "";
  const tab = parsed?.tab ?? "";
  return category === "wardrobe_browse" && isWardrobePhase1GarmentTab(tab);
}

export function resolveWardrobePhase1Tab(
  promptCommand: string | null | undefined,
  categoryId?: string | null
): WardrobePhase1Tab | null {
  if (!shouldUseWardrobePhase1VtoPrompt(promptCommand, categoryId)) return null;
  const parsed = parseStyleCommand(promptCommand!.trim());
  return (parsed?.tab as WardrobePhase1Tab) ?? null;
}

function targetRegionInstruction(tab: WardrobePhase1Tab): string {
  switch (tab) {
    case "tops":
      return "Replace ONLY the top using image 2. Keep all lower-body clothing, footwear, and non-target layers unchanged.";
    case "shirts":
      return "Replace ONLY the shirt using image 2. Keep all lower-body clothing, footwear, and non-target layers unchanged.";
    case "bottoms":
      return "Replace ONLY the pants/trousers/bottom garment using image 2. Keep the original top, jacket, and all other non-target clothing unchanged.";
    case "skirts":
      return "Replace ONLY the skirt using image 2. Keep the original top, jacket, and all other non-target clothing unchanged.";
    case "jackets":
      return "Replace or add ONLY the jacket/outerwear layer using image 2. Preserve inner clothing where naturally visible.";
  }
}

function shortStyleSpecificInstruction(tab: WardrobePhase1Tab): string {
  switch (tab) {
    case "tops":
      return "Match the exact top from image 2, including cut, drape, textile, color, print, embroidery and trims.";
    case "shirts":
      return "Match the exact shirt from image 2, including cut, drape, textile, color, print, embroidery and trims.";
    case "bottoms":
      return "Match the exact pants/trousers/bottom garment from image 2, including cut, drape, textile, color, print, embroidery and trims.";
    case "skirts":
      return "Match the exact skirt/skater/midi silhouette from image 2, including cut, drape, textile, color, print, embroidery and trims.";
    case "jackets":
      return "Match the exact jacket/outerwear layer from image 2, including cut, drape, textile, color, print, embroidery and trims.";
  }
}

/** Short master VTO prompt for Phase 1 wardrobe single-garment styles only. */
export function buildWardrobePhase1VtoPrompt(
  promptCommand: string | null | undefined,
  styleId: string,
  categoryId?: string | null
): string {
  const tab = resolveWardrobePhase1Tab(promptCommand, categoryId);
  if (!tab) {
    throw new Error("buildWardrobePhase1VtoPrompt called for non-phase-1 style");
  }

  const changeOnly = targetRegionInstruction(tab);
  const styleSpecific = shortStyleSpecificInstruction(tab);

  return (
    "Edit image 1 directly. Keep the same person, face, identity, body, pose, camera, lighting and background.\n\n" +
    `Change ONLY: ${changeOnly}\n\n` +
    `Use image 2 only as the garment reference for ${styleId}.\n` +
    "Match its design, color, cut, fabric, length and visible details.\n\n" +
    "Keep every non-target garment unchanged.\n" +
    "Do not recreate the person or full image.\n" +
    "Photorealistic.\n\n" +
    styleSpecific
  );
}
