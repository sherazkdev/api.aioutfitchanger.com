/** Garment tabs on Beauty Lab → Virtual Try-On (same as wardrobe_browse garment tabs). */
export const VIRTUAL_TRYON_GARMENT_TABS = new Set([
  "tops",
  "shirts",
  "bottoms",
  "skirts",
  "jackets",
]);

export function isWardrobeGarmentStyleId(styleId: string): boolean {
  return /^(men|women)_(tops|shirts|bottoms|skirts|jackets)_\d+$/.test(styleId);
}

/** Legacy apps call GET /catalog/virtual_try_on?tab=tops&gender=women — serve wardrobe grid. */
export function shouldServeWardrobeForVirtualTryon(
  categoryId: string,
  tab?: string,
  gender?: string
): boolean {
  if (categoryId !== "virtual_try_on") return false;
  if (!tab || !VIRTUAL_TRYON_GARMENT_TABS.has(tab)) return false;
  return gender === "men" || gender === "women";
}
