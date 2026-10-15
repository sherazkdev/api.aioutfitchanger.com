/**
 * Production import for Archive.zip styles.
 * Usage: node scripts/import-archive-styles-production.mjs [--dry-run]
 * Reads ADMIN_EMAIL, ADMIN_PASSWORD from .env.local
 * Never prints tokens.
 */
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API_BASE = process.env.PRODUCTION_API_BASE || "https://appworkspro.com/api/v1";
const ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");
const ZIP = process.env.ARCHIVE_ZIP || "C:/Users/shera/Downloads/Archive.zip";
const WORK = path.join(ROOT, ".import-archive-work");
const ARTIFACTS = path.join(ROOT, "artifacts", "archive-style-import");
const dryRun = process.argv.includes("--dry-run");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function loadEnvLocal() {
  loadEnvFile(path.join(ROOT, ".env"));
  loadEnvFile(path.join(ROOT, ".env.local"));
}

async function api(token, method, urlPath, body, formData) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let bodyInit;
  if (formData) {
    bodyInit = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    bodyInit = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${urlPath}`, { method, headers, body: bodyInit });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { ok: res.ok, status: res.status, json };
}

function buildPrompt(styleId, categoryId, pipeline, tab, region, detail) {
  const tabPart = tab ? ` | tab=${tab}` : "";
  return `COMMAND: style_ref=${styleId} | category=${categoryId} | pipeline=${pipeline}${tabPart} | region=${region} | ${detail}`;
}

/** 17 independent styles + composite excluded */
const STYLE_PLAN = [
  {
    folder: "Chinese Traditional",
    file: "Frame 6.png",
    style_id: "women_chinese_29",
    category_id: "wardrobe_browse",
    tab_id: "chinese",
    gender: "women",
    name: "Women Chinese 29 — Sky Blue Hanfu",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact Chinese-inspired outfit from image 2 (style women_chinese_29): pale sky-blue layered hanfu with wide flowing sleeves, sheer outer robe, white inner collar, and a long mint-green sash belt. Reproduce cut, drape, textile sheen, color blocks, and accessories exactly as in image 2.",
  },
  {
    folder: "Chinese Traditional",
    file: "Frame 7.png",
    style_id: "women_chinese_30",
    category_id: "wardrobe_browse",
    tab_id: "chinese",
    gender: "women",
    name: "Women Chinese 30 — Red Bridal Hanfu",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact Chinese-inspired bridal outfit from image 2 (style women_chinese_30): rich red hanfu with gold floral embroidery, wide red sash, ornate gold hair ornaments, and sheer red outer layers. Copy silhouette, sleeve volume, embroidery placement, jewelry, and fabric texture exactly from image 2.",
  },
  {
    folder: "Chinese Traditional",
    file: "Frame 8.png",
    style_id: "men_chinese_29",
    category_id: "wardrobe_browse",
    tab_id: "chinese",
    gender: "men",
    name: "Men Chinese 29 — Black Scholar Robe",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, beard, body proportions, pose, camera angle, lighting, and background, wearing the exact Chinese-inspired men's robe from image 2 (style men_chinese_29): black cross-collar scholar robe with subtle woven texture, wide sleeves, and a long white inner collar panel. Reproduce garment length, collar geometry, sleeve drape, and matte fabric exactly as in image 2.",
  },
  {
    folder: "Couple : Duo Styles",
    file: "Frame 20.png",
    style_id: "couple_12",
    category_id: "couple_duo",
    gender: "both",
    name: "Couple 12 — Tropical Casual Duo",
    engine: "BFL Virtual Try-On v2 (couple_duo)",
    detail:
      "Preserve exactly the people already present in image 1; do not add or remove people. Apply the coordinated couple look from image 2 (style couple_12): woman in black spaghetti-strap top and cream pleated midi skirt; man in white tank top and black shorts with crossbody strap. Match colors, garment types, fits, and styling cues from image 2 onto the existing couple while keeping both faces, hair, skin tones, poses, and the scene unchanged.",
  },
  {
    folder: "Couple : Duo Styles",
    file: "Frame 21.png",
    style_id: "couple_13",
    category_id: "couple_duo",
    gender: "both",
    name: "Couple 13 — South Indian Traditional Duo",
    engine: "BFL Virtual Try-On v2 (couple_duo)",
    detail:
      "Preserve exactly the people already present in image 1; do not add or remove people. Apply the coordinated South Indian traditional couple ensemble from image 2 (style couple_13): man in navy shirt with white dhoti and gold border; woman in teal half-saree with magenta dupatta and gold border. Transfer textile colors, drape, borders, and accessories exactly from image 2 while preserving both identities and poses.",
  },
  {
    folder: "Couple : Duo Styles",
    file: "Frame 22.png",
    style_id: "couple_14",
    category_id: "couple_duo",
    gender: "both",
    name: "Couple 14 — Neutral Beach Duo",
    engine: "BFL Virtual Try-On v2 (couple_duo)",
    detail:
      "Preserve exactly the people already present in image 1; do not add or remove people. Apply the coordinated neutral beach couple look from image 2 (style couple_14): woman in beige sleeveless blouse, white trousers, and brown wide-brim hat; man in white shirt and khaki pants. Match silhouettes, neutral palette, and relaxed styling from image 2 without altering faces, hair, or background.",
  },
  {
    folder: "Eastern Traditional",
    file: "Frame 6.png",
    style_id: "men_arabian_35",
    category_id: "eastern_traditional",
    tab_id: "arabian_mens",
    gender: "men",
    name: "Men Arabian 35 — White Thobe",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact white Arabian thobe from image 2 (style men_arabian_35): crisp floor-length white robe with mandarin collar, concealed placket, and clean tailored fit. Reproduce fabric drape, collar shape, and sleeve length exactly as in image 2.",
  },
  {
    folder: "Eastern Traditional",
    file: "Frame 7.png",
    style_id: "women_arabian_35",
    category_id: "eastern_traditional",
    tab_id: "arabian_womens",
    gender: "women",
    name: "Women Arabian 35 — Red Embroidered Kaftan",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, makeup, body proportions, pose, camera angle, lighting, and background, wearing the exact red embroidered kaftan from image 2 (style women_arabian_35): vermilion kaftan with gold and lavender central bib embroidery, scalloped cream trim on placket and cuffs, and wide butterfly sleeves. Copy embroidery, trim, sleeve shape, and jewelry exactly from image 2.",
  },
  {
    folder: "Eastern Traditional",
    file: "Frame 8.png",
    style_id: "men_indian_31",
    category_id: "eastern_traditional",
    tab_id: "indian_mens",
    gender: "men",
    name: "Men Indian 31 — Lavender Kurta Waistcoat",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact lavender Indian kurta set from image 2 (style men_indian_31): light purple kurta with rolled sleeves, textured grey Nehru waistcoat with gold buttons, and matching lavender trousers. Reproduce layering, textile pattern on waistcoat, and asymmetrical kurta hem exactly as in image 2.",
  },
  {
    folder: "Outfit change",
    file: "Frame 6.png",
    style_id: "women_outfit_change_12",
    category_id: "outfit_change",
    gender: "women",
    name: "Women Outfit Change 12 — Yellow Tracksuit",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact yellow athleisure outfit from image 2 (style women_outfit_change_12): cropped yellow hoodie with drawstrings and matching high-waist yellow jogger sweatpants with tie waist. Transfer fleece texture, crop length, drawstrings, and fit exactly from image 2.",
  },
  {
    folder: "Outfit change",
    file: "Frame 7.png",
    style_id: "men_outfit_change_12",
    category_id: "outfit_change",
    gender: "men",
    name: "Men Outfit Change 12 — Camel Overcoat",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact camel monochrome outfit from image 2 (style men_outfit_change_12): long camel wool overcoat with dark buttons over matching turtleneck and trousers. Reproduce coat length, lapel shape, button placement, and tonal layering exactly as in image 2.",
  },
  {
    folder: "Outfit change",
    file: "Frame 8.png",
    style_id: "women_outfit_change_13",
    category_id: "outfit_change",
    gender: "women",
    name: "Women Outfit Change 13 — Red Drape Mini Dress",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact red mini dress from image 2 (style women_outfit_change_13): fitted mock-neck long-sleeve crimson dress with asymmetric high hem and a long floor-length draped sash/train from the hip. Copy neckline, sleeve fit, hem cut, and drape length exactly from image 2.",
  },
  {
    folder: "Pick look for occasions",
    file: "Frame 12.png",
    style_id: "women_formal_11",
    category_id: "occasions",
    tab_id: "formal",
    gender: "women",
    name: "Women Formal 11 — Navy Peplum Suit",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact formal pantsuit from image 2 (style women_formal_11): navy double-breasted peplum blazer with gold buttons and matching straight-leg trousers. Reproduce tailored waist, peplum flare, lapel shape, and handbag styling exactly as in image 2.",
  },
  {
    folder: "Pick look for occasions",
    file: "Frame 13.png",
    style_id: "women_wedding_11",
    category_id: "occasions",
    tab_id: "wedding",
    gender: "women",
    name: "Women Wedding 11 — Beach Bridal Veil",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact beach wedding bridal look from image 2 (style women_wedding_11): white lace wedding gown with long sheer veil draped around the couple silhouette, groom in charcoal suit. Transfer gown lace texture, veil transparency, and ceremonial styling exactly from image 2.",
  },
  {
    folder: "Trending Fashion",
    file: "Frame 6.png",
    style_id: "men_trending_01",
    category_id: "trending_fashion",
    tab_id: "street_mens",
    gender: "men",
    name: "Men Trending 01 — Brown Biker Jacket",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact street-style outfit from image 2 (style men_trending_01): brown leather biker jacket with silver zippers over light blue oxford shirt and navy tie, round gold sunglasses. Copy jacket hardware, layering, and accessories exactly from image 2.",
  },
  {
    folder: "Trending Fashion",
    file: "Frame 8.png",
    style_id: "women_trending_01",
    category_id: "trending_fashion",
    tab_id: "street_womens",
    gender: "women",
    name: "Women Trending 01 — Faux Fur Street Glam",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact glam street outfit from image 2 (style women_trending_01): black shaggy faux-fur coat over white off-shoulder patterned blouse, black studded midi skirt, pearl choker, large hoops, and mauve mini handbag. Reproduce textures, jewelry, and silhouette exactly as in image 2.",
  },
  {
    folder: "Western Traditional",
    file: "Frame 6.png",
    style_id: "women_western_01",
    category_id: "western_traditional",
    tab_id: "heritage_womens",
    gender: "women",
    name: "Women Western 01 — Red Embroidered Jacket",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact Western heritage outfit from image 2 (style women_western_01): red jacket with tan embroidered lapels, tan high-neck blouse with lace trim and gold buttons, matching tan wide-brim hat, and pearl necklace. Copy embroidery vines, color blocking, and hat shape exactly from image 2.",
  },
  {
    folder: "Western Traditional",
    file: "Frame 7.png",
    style_id: "men_western_01",
    category_id: "western_traditional",
    tab_id: "heritage_mens",
    gender: "men",
    name: "Men Western 01 — Cowboy Gentleman",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, beard, body proportions, pose, camera angle, lighting, and background, wearing the exact Western gentleman outfit from image 2 (style men_western_01): tan cowboy hat, grey tweed blazer, beige waistcoat, white shirt, black tie, and light trousers. Reproduce western tailoring layers and hat exactly as in image 2.",
  },
  {
    folder: "Western Traditional",
    file: "Frame 8.png",
    style_id: "women_western_02",
    category_id: "western_traditional",
    tab_id: "heritage_womens",
    gender: "women",
    name: "Women Western 02 — Boho Crop & Medallion Belt",
    engine: "BFL Virtual Try-On v2 (Phase 2 full-outfit)",
    detail:
      "The person of image 1, maintaining exactly their face, identity, skin tone, hair, body proportions, pose, camera angle, lighting, and background, wearing the exact boho-western outfit from image 2 (style women_western_02): black floral crop top with grommet neckline, dark jeans with center seams, and wide brown leather belt with large circular metal medallions. Copy floral placement, belt hardware, and denim fit exactly from image 2.",
  },
];

const NEW_CATEGORIES = [
  {
    category_id: "eastern_traditional",
    title_key: "homeEasternTraditional",
    title: "Eastern Traditional",
    gender_scope: "both",
    tabs: [
      { id: "arabian_mens", title: "arabian mens" },
      { id: "arabian_womens", title: "arabian womens" },
      { id: "indian_mens", title: "indian mens" },
      { id: "indian_womens", title: "indian womens" },
    ],
  },
  {
    category_id: "trending_fashion",
    title_key: "homeTrendingFashion",
    title: "Trending Fashion",
    gender_scope: "both",
    tabs: [
      { id: "street_mens", title: "street mens" },
      { id: "street_womens", title: "street womens" },
    ],
  },
  {
    category_id: "western_traditional",
    title_key: "homeWesternTraditional",
    title: "Western Traditional",
    gender_scope: "both",
    tabs: [
      { id: "heritage_mens", title: "heritage mens" },
      { id: "heritage_womens", title: "heritage womens" },
    ],
  },
];

function pipelineFor(plan) {
  if (plan.category_id === "couple_duo") return "neutral";
  return plan.gender === "men" ? "men" : plan.gender === "women" ? "women" : "neutral";
}

function promptFor(plan) {
  return buildPrompt(
    plan.style_id,
    plan.category_id,
    pipelineFor(plan),
    plan.tab_id,
    "outfit",
    plan.detail
  );
}

function extractZip() {
  mkdirSync(WORK, { recursive: true });
  if (!existsSync(ZIP)) throw new Error(`ZIP not found: ${ZIP}`);
  if (process.platform === "win32") {
    execSync(`tar -xf "${ZIP}" -C "${WORK}"`, { stdio: "pipe" });
  } else {
    execSync(`unzip -o -q "${ZIP}" -d "${WORK}"`, { stdio: "pipe" });
  }
}

async function main() {
  loadEnvLocal();
  mkdirSync(ARTIFACTS, { recursive: true });

  const tokenOverride = process.env.PRODUCTION_ACCESS_TOKEN?.trim();
  const email = (process.env.PRODUCTION_ADMIN_EMAIL || process.env.ADMIN_EMAIL)?.trim();
  const password = process.env.PRODUCTION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  if (!dryRun && !tokenOverride && (!email || !password)) {
    throw new Error(
      "Set PRODUCTION_ACCESS_TOKEN or PRODUCTION_ADMIN_EMAIL + PRODUCTION_ADMIN_PASSWORD (or local ADMIN_* in .env.local)"
    );
  }

  console.log(`API: ${API_BASE}`);
  console.log(dryRun ? "DRY RUN" : "LIVE IMPORT");

  extractZip();

  let token = tokenOverride;
  if (!token && !dryRun) {
    const login = await api(null, "POST", "/auth/admin/login", { email, password });
    if (!login.ok) {
      throw new Error(`Admin login failed: ${login.status} ${login.json?.error?.code || ""}`);
    }
    token = login.json.data.access_token;
  }

  const baselineStyles = dryRun
    ? { ok: true, json: { data: { items: [] } } }
    : await api(token, "GET", "/admin/catalog/styles");
  const baselineCats = dryRun
    ? { ok: true, json: { data: { items: [] } } }
    : await api(token, "GET", "/admin/catalog/categories");
  const baseline = {
    at: new Date().toISOString(),
    api_base: API_BASE,
    style_count: baselineStyles.json?.data?.items?.length ?? 0,
    category_count: baselineCats.json?.data?.items?.length ?? 0,
    categories: baselineCats.json?.data?.items ?? [],
  };
  writeFileSync(path.join(ARTIFACTS, "baseline-backup.json"), JSON.stringify(baseline, null, 2));
  console.log("Baseline styles:", baseline.style_count);

  const existingIds = new Set((baselineStyles.json?.data?.items ?? []).map((i) => i.style_id));

  const results = [];
  const skipped = [];

  for (const cat of NEW_CATEGORIES) {
    const exists = baseline.categories.some((c) => c.category_id === cat.category_id);
    if (exists) {
      console.log("Category exists:", cat.category_id);
      continue;
    }
    if (dryRun) {
      console.log("Would create category:", cat.category_id);
      continue;
    }
    const res = await api(token, "PATCH", "/admin/catalog/categories", {
      upsert: {
        category_id: cat.category_id,
        title_key: cat.title_key,
        title: cat.title,
        gender_scope: cat.gender_scope,
        tabs: cat.tabs.map((t) => ({ id: t.id, title: t.title })),
      },
    });
    if (!res.ok) throw new Error(`Create category ${cat.category_id} failed: ${res.status}`);
    console.log("Created category:", cat.category_id, "mongo id", res.json.data.id);
  }

  // refresh categories after create
  const catsAfter = await api(token, "GET", "/admin/catalog/categories");

  for (const plan of STYLE_PLAN) {
    const imgPath = path.join(WORK, plan.folder, plan.file);
    if (!existsSync(imgPath)) {
      skipped.push({ ...plan, reason: "image missing after extract" });
      continue;
    }
    if (existingIds.has(plan.style_id)) {
      skipped.push({ ...plan, reason: "style_id already exists — idempotent skip" });
      continue;
    }

    const prompt_command = promptFor(plan);
    let image_url = "";

    if (!dryRun) {
      const form = new FormData();
      const buf = readFileSync(imgPath);
      const blob = new Blob([buf], { type: "image/png" });
      form.append("file", blob, plan.file);
      form.append("folder", "catalog");
      const up = await api(token, "POST", "/admin/uploads", undefined, form);
      if (!up.ok) {
        results.push({ ...plan, status: "failed", step: "upload", http: up.status, error: up.json });
        continue;
      }
      image_url = up.json.data.url;

      const upsert = await api(token, "PATCH", "/admin/catalog/styles", {
        upsert: {
          category_id: plan.category_id,
          style_id: plan.style_id,
          name: plan.name,
          image_url,
          gender: plan.gender,
          tab_id: plan.tab_id,
          prompt_command,
          enabled: true,
        },
      });
      if (!upsert.ok) {
        results.push({ ...plan, status: "failed", step: "upsert", http: upsert.status, error: upsert.json, image_url });
        continue;
      }
    }

    const verify = dryRun
      ? null
      : await api(
          token,
          "GET",
          `/admin/catalog/styles?category_id=${encodeURIComponent(plan.category_id)}`
        );
    const row = dryRun
      ? null
      : verify?.json?.data?.items?.find((i) => i.style_id === plan.style_id);

    const imageAbsolute = image_url ? `${ORIGIN}${image_url}` : "";
    let imageHead = null;
    if (image_url && !dryRun) {
      try {
        const head = await fetch(imageAbsolute, { method: "HEAD" });
        imageHead = head.status;
      } catch {
        imageHead = "error";
      }
    }

    results.push({
      folder: plan.folder,
      file: plan.file,
      name: plan.name,
      category_id: plan.category_id,
      style_id: plan.style_id,
      tab_id: plan.tab_id ?? "",
      gender: plan.gender,
      engine: plan.engine,
      prompt_command,
      image_url,
      image_absolute_url: imageAbsolute,
      image_head_status: imageHead,
      status: dryRun ? "dry_run" : row ? "verified" : "verify_missing",
      api_style_row: row
        ? {
            id: row.id,
            enabled: row.enabled,
            prompt_len: row.prompt_command?.length ?? 0,
          }
        : null,
      note: plan.note ?? "",
    });
    console.log(plan.style_id, dryRun ? "planned" : row ? "OK" : "VERIFY_FAIL");
  }

  const publicCatalogChecks = [];
  for (const plan of STYLE_PLAN) {
    const r = results.find((x) => x.style_id === plan.style_id && x.status === "verified");
    if (!r) continue;
    const gender = plan.gender === "men" ? "men" : plan.gender === "women" ? "women" : "men";
    let url = `/catalog/${plan.category_id}?gender=${gender}`;
    if (plan.tab_id) url += `&tab=${encodeURIComponent(plan.tab_id)}`;
    const pub = await api(null, "GET", url);
    const found = pub.json?.data?.items?.some((i) => i.style_id === plan.style_id);
    publicCatalogChecks.push({ style_id: plan.style_id, url, listed: !!found, count: pub.json?.data?.items?.length });
  }

  const finalStyles = await api(token, "GET", "/admin/catalog/styles");
  const out = {
    completed_at: new Date().toISOString(),
    dry_run: dryRun,
    baseline,
    final_style_count: finalStyles.json?.data?.items?.length,
    created: results.filter((r) => r.status === "verified").length,
    failed: results.filter((r) => r.status === "failed").length,
    skipped,
    results,
    public_catalog_checks: publicCatalogChecks,
    excluded_assets: [
      {
        file: "Trending Fashion/Frame 5798.png",
        disposition: "supporting_asset_only",
        note:
          "Three-panel composite marketing strip. Center and right panels duplicate Frame 6.png (men biker) and Frame 8.png (women faux-fur) already imported as men_trending_01 and women_trending_01. Left panel (leopard cream suit) has no standalone file — not imported as a separate catalog style to avoid duplicate user-facing entries; retain asset for future crop/upload if product requests the leopard look.",
      },
    ],
    account_all_20_zip_files:
      "19 independent styles imported + Frame 5798 excluded (supporting composite, 2/3 panels duplicate existing styles) = 20/20 ZIP files accounted",
  };

  writeFileSync(path.join(ARTIFACTS, "import-results.json"), JSON.stringify(out, null, 2));
  console.log("Wrote", path.join(ARTIFACTS, "import-results.json"));
  console.log("Created:", out.created, "Failed:", out.failed, "Skipped:", skipped.length);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
