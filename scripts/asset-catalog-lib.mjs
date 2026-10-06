import { copyFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { applyVirtualTryonGarmentOverrides } from "./virtual-tryon-garments.mjs";
import { applyAiOutfitChangerZipOverrides } from "./ai-outfit-changer-zip-sync.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ASSET_REQ = path.join(ROOT, ".asset-requirements");
const NEW_REQ = path.join(ASSET_REQ, ".new-requirements");

function pickCsv(name) {
  const inNew = path.join(NEW_REQ, name);
  if (existsSync(inNew)) return inNew;
  return path.join(ASSET_REQ, name);
}

/** Prefer `.asset-requirements/.new-requirements/` when present (pre-backend audit drop). */
export const CSV_PATH = pickCsv("BACKEND_ASSET_CATALOG.csv");
export const PROMPT_CSV_PATH = pickCsv("BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
export const ZIP_PATH = path.join(ASSET_REQ, "assets.zip");
export const EXTRACT_DIR = path.join(ASSET_REQ, "_extract");
export const PUBLIC_MEDIA = path.join(ROOT, "public", "media", "catalog");
export const GENERATED_JSON = path.join(ROOT, "src", "lib", "server", "seed", "asset-catalog.generated.json");

const CATEGORY_GENDER_SCOPE = {
  beard_styles: "men",
  hijab_styles: "women",
  couple_duo: "both",
  presets: "both",
};

const CATEGORY_TAB_DEFAULTS = {
  virtual_try_on: ["tops", "shirts", "bottoms", "skirts", "jackets"],
  occasions: ["casual", "formal", "wedding"],
  presets: ["preset_interview", "preset_gym", "preset_wedding_guest"],
  wardrobe_browse: [
    "chinese",
    "indian",
    "arabian",
    "korean",
    "pakistani",
    "tops",
    "shirts",
    "bottoms",
    "skirts",
    "jackets",
  ],
};

const WARDROBE_REGIONS = [
  { categoryId: "chinese_traditional", titleKey: "wardrobeChineseTraditional", browseTabId: "chinese" },
  { categoryId: "indian_traditional", titleKey: "wardrobeIndianTraditional", browseTabId: "indian" },
  { categoryId: "korean_traditional", titleKey: "wardrobeKoreanTraditional", browseTabId: "korean" },
  { categoryId: "pakistani_traditional", titleKey: "wardrobePakistaniTraditional", browseTabId: "pakistani" },
  { categoryId: "arabian_traditional", titleKey: "wardrobeArabianTraditional", browseTabId: "arabian" },
];

export function enMap(text) {
  return { en: text };
}

export function parseCatalogCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 8) continue;
    rows.push({
      style_id: parts[0],
      category_id: parts[1],
      title_key: parts[2],
      gender: parts[3] || null,
      tab_id: parts[4] || null,
      sort_order: Number(parts[5]) || 0,
      local_asset_path: parts[6],
      suggested_image_url_path: parts[7],
    });
  }
  return rows;
}

/** PNG copies use .png paths (sources are PNG; catalog doc lists .webp). */
export function publicImageUrl(suggestedPath) {
  return suggestedPath.replace(/\.webp$/i, ".png");
}

function extractZipArchive() {
  mkdirSync(EXTRACT_DIR, { recursive: true });

  // GNU tar on Linux cannot read .zip; unzip is standard on VPS.
  const unzip = spawnSync("unzip", ["-oq", ZIP_PATH, "-d", EXTRACT_DIR], { stdio: "inherit" });
  if (unzip.status === 0) return;

  const tar = spawnSync("tar", ["-xf", ZIP_PATH, "-C", EXTRACT_DIR], { stdio: "inherit" });
  if (tar.status === 0) return;

  const hint =
    unzip.error?.code === "ENOENT"
      ? "Install unzip: apt-get install -y unzip"
      : "Check assets.zip is valid; try: apt-get install -y unzip";
  throw new Error(`Could not extract assets.zip (${hint})`);
}

export function ensureZipExtracted() {
  const marker = path.join(EXTRACT_DIR, "assets", "images");
  if (existsSync(marker)) return EXTRACT_DIR;
  if (!existsSync(ZIP_PATH)) {
    throw new Error(`Missing ${ZIP_PATH} — add assets.zip under .asset-requirements/`);
  }
  extractZipArchive();
  if (!existsSync(marker)) throw new Error("Extracted zip but assets/images not found");
  return EXTRACT_DIR;
}

export function syncMediaFiles(rows, { extractDir = EXTRACT_DIR, destRoot = PUBLIC_MEDIA } = {}) {
  let copied = 0;
  let missing = 0;
  for (const row of rows) {
    const src = path.join(extractDir, row.local_asset_path);
    const source = existsSync(src) ? src : null;
    const urlPath = publicImageUrl(row.suggested_image_url_path);
    const dest = path.join(ROOT, "public", urlPath.replace(/^\//, ""));
    mkdirSync(path.dirname(dest), { recursive: true });
    if (!source) {
      missing++;
      continue;
    }
    copyFileSync(source, dest);
    copied++;
  }
  return { copied, missing };
}

/** Copy garment PNGs onto virtual_try_on paths (generate refs + legacy API thumbnails). */
export function syncVirtualTryonGarmentRefs(rows, { extractDir = EXTRACT_DIR } = {}) {
  return applyVirtualTryonGarmentOverrides(rows, extractDir, ROOT, publicImageUrl);
}

export function syncAiOutfitChangerZipOverrides(rows) {
  return applyAiOutfitChangerZipOverrides(rows);
}

function categoryGenderScope(categoryId, rows) {
  if (CATEGORY_GENDER_SCOPE[categoryId]) return CATEGORY_GENDER_SCOPE[categoryId];
  const genders = new Set(rows.map((r) => r.gender).filter(Boolean));
  if (genders.size === 1 && genders.has("men")) return "men";
  if (genders.size === 1 && genders.has("women")) return "women";
  return "both";
}

function buildTabs(categoryId, rows) {
  const fromRows = new Set();
  for (const r of rows) {
    if (!r.tab_id) continue;
    if (r.tab_id === "men" || r.tab_id === "women") {
      if (categoryId === "hair_color") fromRows.add(r.tab_id);
      continue;
    }
    fromRows.add(r.tab_id);
  }
  let tabIds = [...fromRows];
  if (tabIds.length === 0 && CATEGORY_TAB_DEFAULTS[categoryId]) {
    tabIds = CATEGORY_TAB_DEFAULTS[categoryId];
  }
  if (tabIds.length === 0) {
    return [{ id: "all", titleKey: "tryOnTabAll", titles: enMap("All") }];
  }
  return tabIds.map((id) => ({
    id,
    titleKey: `tab_${id}`,
    titles: enMap(id.replace(/_/g, " ")),
  }));
}

function itemGender(row) {
  if (row.gender === "men" || row.gender === "women") return row.gender;
  return "both";
}

function itemTabId(row, categoryId) {
  if (!row.tab_id) return undefined;
  if (row.tab_id === "men" || row.tab_id === "women") {
    if (categoryId === "hair_color") return row.tab_id;
    return undefined;
  }
  return row.tab_id;
}

function humanName(styleId) {
  return styleId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function loadPromptByStyleId() {
  if (!existsSync(PROMPT_CSV_PATH)) return new Map();
  const lines = readFileSync(PROMPT_CSV_PATH, "utf8").trim().split(/\r?\n/).filter(Boolean);
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 7) continue;
    const styleId = parts[0].trim();
    const promptCommand = parts.slice(6).join(",").trim();
    if (styleId && promptCommand) map.set(styleId, promptCommand);
  }
  return map;
}

export function buildSeedPayload(rows, promptByStyleId = loadPromptByStyleId()) {
  const byCategory = new Map();
  for (const row of rows) {
    if (!byCategory.has(row.category_id)) byCategory.set(row.category_id, []);
    byCategory.get(row.category_id).push(row);
  }

  const catalogCategories = [];
  for (const [categoryId, catRows] of byCategory) {
    catRows.sort((a, b) => a.sort_order - b.sort_order);
    const titleKey = catRows[0]?.title_key ?? categoryId;
    const genderScope = categoryGenderScope(categoryId, catRows);
    const genderTabs = [];
    if (genderScope === "both" || genderScope === "women") {
      genderTabs.push({ id: "women", titleKey: "styleTabWomen", titles: enMap("Women") });
    }
    if (genderScope === "both" || genderScope === "men") {
      genderTabs.push({ id: "men", titleKey: "styleTabMen", titles: enMap("Men") });
    }

    const items = catRows.map((row) => ({
      id: row.style_id,
      tabId: itemTabId(row, categoryId),
      genderTabId: row.gender === "men" || row.gender === "women" ? row.gender : undefined,
      imageUrl: publicImageUrl(row.suggested_image_url_path),
      nameLocalized: enMap(humanName(row.style_id)),
      promptCommand:
        promptByStyleId.get(row.style_id) ??
        `Apply ${row.style_id} exactly as shown in the reference image.`,
      sortOrder: row.sort_order,
      gender: itemGender(row),
      enabled: true,
    }));

    catalogCategories.push({
      categoryId,
      titleKey,
      titleLocalized: enMap(humanName(categoryId.replace(/_/g, " "))),
      sourceLocale: "en",
      genderScope,
      genderTabs,
      tabs: buildTabs(categoryId, catRows),
      items,
    });
  }

  catalogCategories.sort((a, b) => a.categoryId.localeCompare(b.categoryId));

  const occasions = rows.filter((r) => r.category_id === "occasions" && r.gender === "women").slice(0, 8);
  const couples = rows.filter((r) => r.category_id === "couple_duo").slice(0, 11);
  const beautyCats = ["virtual_try_on", "hair_styles", "hair_color", "beard_styles"];

  const homeFeedSections = [
    {
      sectionId: "beauty_lab",
      titleKey: "homeBeautyLab",
      titleLocalized: enMap("Beauty Lab"),
      sourceLocale: "en",
      type: "category_cards",
      sortOrder: 1,
      published: true,
      items: beautyCats.map((cid) => {
        const cat = catalogCategories.find((c) => c.categoryId === cid);
        const thumb = cat?.items[0]?.imageUrl ?? "/media/catalog/virtual_try_on/men_tryon_01.png";
        return {
          categoryId: cid,
          labelKey: cat?.titleKey ?? cid,
          label: cat?.titleLocalized?.en ?? cid,
          labelLocalized: cat?.titleLocalized ?? enMap(cid),
          thumbnailUrl: thumb,
          genderScope: "both",
        };
      }),
    },
    {
      sectionId: "occasions",
      titleKey: "homeOccasions",
      titleLocalized: enMap("Occasions"),
      sourceLocale: "en",
      type: "image_rail",
      categoryId: "occasions",
      sortOrder: 2,
      published: true,
      items: occasions.map((row) => ({
        styleId: row.style_id,
        categoryId: "occasions",
        thumbnailUrl: publicImageUrl(row.suggested_image_url_path),
        label: humanName(row.style_id),
        labelLocalized: enMap(humanName(row.style_id)),
        genderScope: "women",
      })),
    },
    {
      sectionId: "couple_duo",
      titleKey: "homeCoupleDuo",
      titleLocalized: enMap("Couple / Duo"),
      sourceLocale: "en",
      type: "image_rail",
      categoryId: "couple_duo",
      sortOrder: 3,
      published: true,
      items: couples.map((row) => ({
        styleId: row.style_id,
        categoryId: "couple_duo",
        thumbnailUrl: publicImageUrl(row.suggested_image_url_path),
        label: humanName(row.style_id),
        labelLocalized: enMap(humanName(row.style_id)),
        genderScope: "both",
      })),
    },
  ];

  const wardrobeBrowse = rows.filter((r) => r.category_id === "wardrobe_browse");
  const wardrobeCategories = WARDROBE_REGIONS.map((w, i) => {
    const previews = wardrobeBrowse
      .filter((r) => r.tab_id === w.browseTabId && r.gender === "women")
      .slice(0, 6)
      .map((r) => ({
        styleId: r.style_id,
        thumbnailUrl: publicImageUrl(r.suggested_image_url_path),
        gender: "women",
      }));
    return {
      categoryId: w.categoryId,
      titleKey: w.titleKey,
      titleLocalized: enMap(w.categoryId.replace(/_/g, " ")),
      sourceLocale: "en",
      browseTabId: w.browseTabId,
      backgroundToken: `${w.categoryId}_bg`,
      genderScope: "both",
      sortOrder: i,
      previewItems: previews,
      enabled: true,
    };
  });

  const onboardingPages = [
    {
      sortOrder: 1,
      title: "Virtual try-on",
      body: "See outfits on your photo in seconds.",
      imageUrl: publicImageUrl(rows.find((r) => r.style_id === "women_tryon_01")?.suggested_image_url_path ?? "/media/catalog/virtual_try_on/women_tryon_01.webp"),
    },
    {
      sortOrder: 2,
      title: "Curated styles",
      body: "Browse traditional and modern looks.",
      imageUrl: publicImageUrl(rows.find((r) => r.category_id === "occasions" && r.gender === "women")?.suggested_image_url_path ?? "/media/catalog/occasions/women_casual_01.webp"),
    },
    {
      sortOrder: 3,
      title: "Save your looks",
      body: "Keep favorites in your wardrobe.",
      imageUrl: publicImageUrl(rows.find((r) => r.tab_id === "pakistani" && r.gender === "women")?.suggested_image_url_path ?? "/media/catalog/wardrobe_browse/women_pakistani_01.webp"),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    styleCount: rows.length,
    catalogCategories,
    homeFeedSections,
    wardrobeCategories,
    onboardingPages,
  };
}

export function loadCatalogRows() {
  if (!existsSync(CSV_PATH)) throw new Error(`Missing ${CSV_PATH}`);
  return parseCatalogCsv(readFileSync(CSV_PATH, "utf8"));
}
