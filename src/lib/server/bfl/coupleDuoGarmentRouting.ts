/** Production VTO garment paths for couple_duo (solo try-on uses split plates, not combined PNG). */

const COUPLE_COMBINED_STYLE_RE = /^couple_(\d{2})$/;

export type PersonGender = "men" | "women";

export function isCoupleDuoCombinedStyleId(styleId: string): boolean {
  return COUPLE_COMBINED_STYLE_RE.test(styleId);
}

/** Map request/session gender to split asset suffix (`male` | `female`). */
export function coupleDuoSplitSuffix(personGender: PersonGender): "male" | "female" {
  return personGender === "men" ? "male" : "female";
}

/**
 * Resolve catalog couple style id to the single-person garment URL used for BFL VTO image 2.
 * Does not infer gender from style_id.
 */
export function resolveCoupleDuoGarmentImageUrl(styleId: string, personGender: PersonGender): string | null {
  if (!COUPLE_COMBINED_STYLE_RE.test(styleId)) return null;
  const suffix = coupleDuoSplitSuffix(personGender);
  return `/media/catalog/couple_duo/${styleId}_${suffix}.png`;
}

export function normalizePersonGender(input?: string | null): PersonGender | null {
  const g = (input ?? "").trim().toLowerCase();
  if (g === "men" || g === "male") return "men";
  if (g === "women" || g === "female") return "women";
  return null;
}

export const COUPLE_DUO_PRODUCTION_STYLE_IDS = Array.from({ length: 11 }, (_, i) =>
  `couple_${String(i + 1).padStart(2, "0")}`
);

/** Paths checked for bad-hash / existence (VTO never uses legacy combined plate). */
export function activeCoupleDuoGarmentPaths(styleId: string): string[] {
  if (!isCoupleDuoCombinedStyleId(styleId)) return [];
  const male = resolveCoupleDuoGarmentImageUrl(styleId, "men");
  const female = resolveCoupleDuoGarmentImageUrl(styleId, "women");
  return [male, female].filter(Boolean) as string[];
}

export function isLegacyCombinedCoupleDuoUrl(url: string, styleId: string): boolean {
  const norm = (url || "").replace(/\\/g, "/");
  return norm.endsWith(`/couple_duo/${styleId}.png`) && !norm.includes("_male") && !norm.includes("_female");
}
