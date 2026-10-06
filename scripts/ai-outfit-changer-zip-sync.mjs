/**
 * Overlay CDN PNGs from app dev ai_outfit_changer.zip onto existing catalog paths.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { publicImageUrl } from "./asset-catalog-lib.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const AI_OUTFIT_ZIP = path.join(ROOT, ".new-requirements", "ai_outfit_changer.zip");
export const AI_OUTFIT_EXTRACT = path.join(ROOT, ".asset-requirements", "_extract_ai_outfit_changer");

const REGIONAL_FOLDER = {
  chinese: "CHINESE",
  indian: "INDIAN",
  arabian: "ARABIAN",
};

const GARMENT_TABS = new Set(["tops", "shirts", "bottoms", "skirts", "jackets"]);

function extractNewZip() {
  mkdirSync(AI_OUTFIT_EXTRACT, { recursive: true });
  const marker = path.join(AI_OUTFIT_EXTRACT, "ai_outfit_changer");
  if (existsSync(marker)) return AI_OUTFIT_EXTRACT;
  if (!existsSync(AI_OUTFIT_ZIP)) return null;

  const unzip = spawnSync("unzip", ["-oq", AI_OUTFIT_ZIP, "-d", AI_OUTFIT_EXTRACT], { stdio: "pipe" });
  if (unzip.status === 0) return AI_OUTFIT_EXTRACT;
  const tar = spawnSync("tar", ["-xf", AI_OUTFIT_ZIP, "-C", AI_OUTFIT_EXTRACT], { stdio: "pipe" });
  if (tar.status === 0) return AI_OUTFIT_EXTRACT;
  throw new Error("Could not extract ai_outfit_changer.zip");
}

function listRelPngs() {
  const base = path.join(AI_OUTFIT_EXTRACT, "ai_outfit_changer");
  if (!existsSync(base)) return [];
  const out = [];
  const walk = (dir, prefix = "") => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${name.name}` : name.name;
      const abs = path.join(dir, name.name);
      if (name.isDirectory()) walk(abs, rel);
      else if (/\.png$/i.test(name.name)) out.push(rel.replace(/\\/g, "/"));
    }
  };
  walk(base);
  return out;
}

/** @param {ReturnType<import("./asset-catalog-lib.mjs").loadCatalogRows>[number]} row */
export function newZipRelPathForRow(row, allRows, relsSet, regionalCache) {
  const n = String(row.sort_order).padStart(2, "0");
  const g = row.gender;
  const tab = row.tab_id;

  switch (row.category_id) {
    case "outfit_change":
      return `outfit-change/style_${n}.png`;
    case "couple_duo":
      return `couple-duo/style_${n}.png`;
    case "beard_styles":
      return `beard_styles/beard_style${n}.png`;
    case "hair_styles":
      if (g === "men") return `hair_styles/men/hair_style${n}.png`;
      if (g === "women") return `beauty-lab/hair-styles/style_${n}.png`;
      return null;
    case "hair_color":
      if (g === "women") return `hair_colors/women/hair_color${n}.png`;
      if (g === "men") return `beauty-lab/hair-color/style_${n}.png`;
      return null;
    case "hijab_styles":
      return `beauty-lab/hijab-styles/style_${n}.png`;
    case "occasions":
      if (tab === "casual") return `occasions/casual/style_${n}.png`;
      if (tab === "formal") return `occasions/formal/style_${n}.png`;
      if (tab === "wedding") return `occasions/wedding/style_${n}.png`;
      return null;
    case "presets":
      if (tab === "preset_gym") return `presets/gym/style_${n}.png`;
      return null;
    case "wardrobe_browse":
      if (tab && GARMENT_TABS.has(tab)) return `wardrobe/garments/${tab}/style_${n}.png`;
      if (tab && REGIONAL_FOLDER[tab]) {
        const key = `${tab}:${g}`;
        if (!regionalCache.has(key)) {
          const folder = REGIONAL_FOLDER[tab];
          const files = [...relsSet].filter((p) => p.startsWith(`${folder}/`)).sort();
          const rowsSame = allRows
            .filter(
              (r) =>
                r.category_id === "wardrobe_browse" && r.tab_id === tab && r.gender === g
            )
            .sort((a, b) => a.sort_order - b.sort_order);
          const map = new Map();
          rowsSame.forEach((r, i) => {
            if (files[i]) map.set(r.style_id, files[i]);
          });
          regionalCache.set(key, map);
        }
        return regionalCache.get(key)?.get(row.style_id) ?? null;
      }
      return null;
    default:
      return null;
  }
}

/**
 * @param {ReturnType<import("./asset-catalog-lib.mjs").loadCatalogRows)} rows
 */
export function applyAiOutfitChangerZipOverrides(rows) {
  if (!existsSync(AI_OUTFIT_ZIP)) {
    return { applied: 0, skipped: 0, missingZip: true };
  }
  extractNewZip();
  const rels = new Set(listRelPngs());
  const regionalCache = new Map();

  let applied = 0;
  let skipped = 0;
  const base = path.join(AI_OUTFIT_EXTRACT, "ai_outfit_changer");

  for (const row of rows) {
    const rel = newZipRelPathForRow(row, rows, rels, regionalCache);
    if (!rel) {
      skipped++;
      continue;
    }
    if (!rels.has(rel)) {
      skipped++;
      continue;
    }
    const src = path.join(base, rel);
    const dest = path.join(ROOT, "public", publicImageUrl(row.suggested_image_url_path).replace(/^\//, ""));
    mkdirSync(path.dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    applied++;
  }

  return { applied, skipped, missingZip: false };
}

export function summarizeNewZipMatches(rows) {
  if (!existsSync(AI_OUTFIT_ZIP)) return null;
  extractNewZip();
  const rels = new Set(listRelPngs());
  const regionalCache = new Map();
  let ok = 0;
  const byCat = {};
  for (const row of rows) {
    const rel = newZipRelPathForRow(row, rows, rels, regionalCache);
    if (rel && rels.has(rel)) {
      ok++;
      byCat[row.category_id] = (byCat[row.category_id] || 0) + 1;
    }
  }
  return { zipPngs: rels.size, mappedRows: ok, totalRows: rows.length, byCat };
}
