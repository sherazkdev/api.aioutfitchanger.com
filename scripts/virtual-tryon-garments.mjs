/**
 * Virtual Try-On generate refs: map men_tryon_* / women_tryon_* → wardrobe garment PNGs
 * (same art as Beauty Lab grid via wardrobe_browse tabs).
 */
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export const GARMENT_TAB_IDS = new Set(["tops", "shirts", "bottoms", "skirts", "jackets"]);

const TABS_BY_GENDER = {
  /** CSV has no men_tops_* rows; "Tops" chip uses shirt flat-lays. */
  men: ["shirts", "bottoms", "jackets"],
  women: ["tops", "shirts", "bottoms", "skirts", "jackets"],
};

/** @param {{ gender?: string | null, sort_order?: number }} row */
export function wardrobeStyleIdForVirtualTryonRow(row) {
  const gender = row.gender === "men" || row.gender === "women" ? row.gender : null;
  if (!gender) return null;
  const tabs = TABS_BY_GENDER[gender];
  const order = Math.max(1, Number(row.sort_order) || 1);
  const tab = tabs[(order - 1) % tabs.length];
  const slot = Math.floor((order - 1) / tabs.length) + 1;
  return `${gender}_${tab}_${String(slot).padStart(2, "0")}`;
}

export function isWardrobeGarmentStyleId(styleId) {
  return /^(men|women)_(tops|shirts|bottoms|skirts|jackets)_\d+$/.test(styleId);
}

/**
 * After normal sync, overwrite virtual_try_on CDN files with wardrobe garment sources.
 */
export function applyVirtualTryonGarmentOverrides(rows, extractDir, root, publicImageUrlFn) {
  const byId = new Map(rows.map((r) => [r.style_id, r]));
  let applied = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.category_id !== "virtual_try_on") continue;
    const wardrobeId = wardrobeStyleIdForVirtualTryonRow(row);
    const wardrobeRow = wardrobeId ? byId.get(wardrobeId) : null;
    if (!wardrobeRow) {
      skipped++;
      continue;
    }

    const srcFromZip = path.join(extractDir, wardrobeRow.local_asset_path);
    const srcPublic = path.join(
      root,
      "public",
      publicImageUrlFn(wardrobeRow.suggested_image_url_path).replace(/^\//, "")
    );
    const dest = path.join(root, "public", publicImageUrlFn(row.suggested_image_url_path).replace(/^\//, ""));

    const source = existsSync(srcFromZip) ? srcFromZip : existsSync(srcPublic) ? srcPublic : null;
    if (!source) {
      skipped++;
      continue;
    }
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(source, dest);
    applied++;
  }

  return { applied, skipped };
}
