/**
 * Verify all 19 new style IDs on public production API and refresh import-results.json
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API = "https://appworkspro.com/api/v1";
const ORIGIN = "https://appworkspro.com";

const NEW_STYLES = [
  { style_id: "women_chinese_29", category_id: "wardrobe_browse", tab: "chinese", gender: "women" },
  { style_id: "women_chinese_30", category_id: "wardrobe_browse", tab: "chinese", gender: "women" },
  { style_id: "men_chinese_29", category_id: "wardrobe_browse", tab: "chinese", gender: "men" },
  { style_id: "couple_12", category_id: "couple_duo", gender: "men" },
  { style_id: "couple_13", category_id: "couple_duo", gender: "men" },
  { style_id: "couple_14", category_id: "couple_duo", gender: "men" },
  { style_id: "men_arabian_35", category_id: "eastern_traditional", tab: "arabian_mens", gender: "men" },
  { style_id: "women_arabian_35", category_id: "eastern_traditional", tab: "arabian_womens", gender: "women" },
  { style_id: "men_indian_31", category_id: "eastern_traditional", tab: "indian_mens", gender: "men" },
  { style_id: "women_outfit_change_12", category_id: "outfit_change", gender: "women" },
  { style_id: "men_outfit_change_12", category_id: "outfit_change", gender: "men" },
  { style_id: "women_outfit_change_13", category_id: "outfit_change", gender: "women" },
  { style_id: "women_formal_11", category_id: "occasions", tab: "formal", gender: "women" },
  { style_id: "women_wedding_11", category_id: "occasions", tab: "wedding", gender: "women" },
  { style_id: "men_trending_01", category_id: "trending_fashion", tab: "street_mens", gender: "men" },
  { style_id: "women_trending_01", category_id: "trending_fashion", tab: "street_womens", gender: "women" },
  { style_id: "women_western_01", category_id: "western_traditional", tab: "heritage_womens", gender: "women" },
  { style_id: "men_western_01", category_id: "western_traditional", tab: "heritage_mens", gender: "men" },
  { style_id: "women_western_02", category_id: "western_traditional", tab: "heritage_womens", gender: "women" },
];

async function findInCatalog(plan) {
  let url = `${API}/catalog/${plan.category_id}?gender=${plan.gender}`;
  if (plan.tab) url += `&tab=${encodeURIComponent(plan.tab)}`;
  const res = await fetch(url);
  const json = await res.json();
  const item = (json.data?.items ?? []).find((i) => (i.style_id || i.id) === plan.style_id);
  return { ok: res.ok, listed: !!item, item, url };
}

async function head(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.status;
  } catch {
    return 0;
  }
}

async function main() {
  const results = [];
  for (const plan of NEW_STYLES) {
    const { listed, item, url } = await findInCatalog(plan);
    const image_url = item?.image_url || item?.thumbnail_url || "";
    const abs = image_url.startsWith("http") ? image_url : image_url ? `${ORIGIN}${image_url}` : "";
    const image_head_status = abs ? await head(abs) : 0;
    results.push({
      ...plan,
      name: item?.name || item?.label || plan.style_id,
      image_url,
      image_absolute_url: abs,
      image_head_status,
      catalog_listed: listed,
      catalog_url: url,
      status: listed && image_head_status === 200 ? "verified" : listed ? "partial" : "missing",
      prompt_command: item?.prompt_command ?? "(see admin API)",
    });
  }

  const allCats = [
    "beard_styles",
    "couple_duo",
    "hair_color",
    "hair_styles",
    "hijab_styles",
    "occasions",
    "outfit_change",
    "presets",
    "virtual_try_on",
    "wardrobe_browse",
    "eastern_traditional",
    "trending_fashion",
    "western_traditional",
  ];
  const ids = new Set();
  for (const c of allCats) {
    for (const g of ["men", "women"]) {
      const r = await fetch(`${API}/catalog/${c}?gender=${g}`);
      const j = await r.json();
      for (const it of j.data?.items ?? []) ids.add(it.style_id || it.id);
    }
  }

  const out = {
    completed_at: new Date().toISOString(),
    production_api: API,
    baseline_style_count: 419,
    final_unique_style_count: ids.size,
    new_styles_verified: results.filter((r) => r.status === "verified").length,
    results,
    generation_tests: [],
  };

  const outPath = path.join(ROOT, "artifacts/archive-style-import/import-results.json");
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("verified", out.new_styles_verified, "/", NEW_STYLES.length, "total", ids.size);
}

main();
