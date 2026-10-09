/**
 * Generates PRODUCTION_STYLE_PROMPT_AUDIT.md — documentation only.
 * Run: node scripts/generate-production-style-prompt-audit.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  assessMismatch,
  buildFluxPrompt,
  buildVtoPrompt,
  classifyTransformation,
  parseStyleCommand,
  productionEngineLabel,
  promptFamilyKey,
  promptSourceFunction,
  resolveProductionPrompt,
  shouldUseVtoEngine,
} from "./lib/prompt-audit-mirror.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const OUT = path.join(ROOT, "PRODUCTION_STYLE_PROMPT_AUDIT.md");

function pickCsv(baseName) {
  const inNew = path.join(ROOT, ".asset-requirements", ".new-requirements", baseName);
  const legacy = path.join(ROOT, ".asset-requirements", baseName);
  if (fs.existsSync(inNew)) return inNew;
  return legacy;
}

function parseAssetCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 8) continue;
    map.set(parts[0], {
      style_id: parts[0],
      category_id: parts[1],
      title_key: parts[2],
      gender: parts[3] || "",
      tab_id: parts[4] || "",
      local_asset_path: parts[6],
      image_url: parts[7].replace(/\.webp$/i, ".png"),
    });
  }
  return map;
}

function parsePromptCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    const head = line.slice(0, idx).split(",");
    const cmd = line.slice(idx + 1);
    map.set(head[0], {
      style_id: head[0],
      category_id: head[1],
      tab_id: head[2] || "",
      gender: head[3] || "",
      region: head[4] || "",
      pipeline: head[5] || "",
      stored_command: cmd,
    });
  }
  return map;
}

function assetExists(relUrl) {
  if (!relUrl) return false;
  const rel = relUrl.startsWith("/") ? relUrl.slice(1) : relUrl;
  return fs.existsSync(path.join(ROOT, "public", rel));
}

function tabDisplayName(tab, category) {
  if (!tab) return category;
  return tab.replace(/_/g, " ");
}

function dynamicVars(stored, useVto, styleId) {
  const parsed = parseStyleCommand(stored);
  const vars = ["style_id", "category_id from request body"];
  if (parsed?.styleRef) vars.push(`style_ref=${parsed.styleRef}`);
  if (useVto) vars.push(`buildVtoPrompt styleHint (from COMMAND style_ref or body style_id)`);
  else vars.push("COMMAND action segment", "region meta", "hasReferenceStyle (true when image 2 resolved)");
  return vars.join("; ");
}

function sharesWith(styleId, productionPrompt, allRows) {
  return allRows
    .filter((r) => r.style_id !== styleId && r.production_prompt === productionPrompt)
    .map((r) => r.style_id);
}

const assetPath = pickCsv("BACKEND_ASSET_CATALOG.csv");
const promptPath = pickCsv("BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const assets = parseAssetCsv(fs.readFileSync(assetPath, "utf8"));
const prompts = parsePromptCsv(fs.readFileSync(promptPath, "utf8"));

const styleIds = [...new Set([...assets.keys(), ...prompts.keys()])].sort();
const dupCheck = new Map();
for (const id of styleIds) {
  dupCheck.set(id, (dupCheck.get(id) || 0) + 1);
}

const audited = [];
const missingPrompt = [];
const missingAsset = [];
const unconfirmed = [];

for (const style_id of styleIds) {
  const a = assets.get(style_id);
  const p = prompts.get(style_id);
  if (!p) missingPrompt.push(style_id);
  if (!a) missingAsset.push(style_id);

  const category_id = p?.category_id ?? a?.category_id ?? "UNKNOWN";
  const tab_id = p?.tab_id || a?.tab_id || "";
  const gender = p?.gender || a?.gender || "";
  const region = p?.region || "";
  const stored_command =
    p?.stored_command ??
    `COMMAND: style_ref=${style_id} | category=${category_id} | pipeline=neutral | region=outfit | Apply outfit from reference image 2.`;

  const { useVto, productionPrompt } = resolveProductionPrompt(stored_command, style_id, category_id);
  const classification = classifyTransformation({
    category_id,
    tab_id,
    region,
    gender,
  });
  const mismatch = assessMismatch({ region, category_id, tab_id }, classification, useVto, stored_command);
  const src = promptSourceFunction(useVto);
  const familyKey = promptFamilyKey(productionPrompt, stored_command, useVto);
  const imageUrl = a?.image_url ?? "(not in asset CSV)";
  const localPath = a?.local_asset_path ?? "";
  const assetOnDisk = a?.image_url ? assetExists(a.image_url) : false;

  if (!p || !a) unconfirmed.push(style_id);

  audited.push({
    style_id,
    category_id,
    tab_id,
    gender,
    image_url: imageUrl,
    local_asset_path: localPath,
    asset_on_disk: assetOnDisk,
    classification,
    useVto,
    stored_command,
    production_prompt: productionPrompt,
    engine: productionEngineLabel(useVto),
    prompt_file: src.file,
    prompt_fn: src.fn,
    familyKey,
    mismatch,
    resolve_prompt: "resolveCatalogPromptCommand(style_id, category_id) → Mongo CatalogCategory.items[].promptCommand (seeded from BACKEND_PROMPT_CATALOG_OPTIMIZED.csv)",
    resolve_image:
      "resolveGarmentImage(style_id, category_id) → item.imageUrl; virtual_try_on + wardrobe style_id falls back to wardrobe_browse item",
  });
}

for (const r of audited) {
  r.share_with = sharesWith(r.style_id, r.production_prompt, audited);
}

const families = new Map();
for (const r of audited) {
  if (!families.has(r.familyKey)) families.set(r.familyKey, []);
  families.get(r.familyKey).push(r.style_id);
}

const bucketCounts = {};
for (const r of audited) {
  bucketCounts[r.classification.bucket] = (bucketCounts[r.classification.bucket] || 0) + 1;
}

const mismatchStyles = audited.filter((r) => r.mismatch.flag === "YES");
const uniqueProduction = new Set(audited.map((r) => r.production_prompt)).size;
const sharedCount = audited.filter((r) => r.share_with.length > 0).length;

const mismatchSection = audited
  .filter((r) => r.mismatch.flag === "YES")
  .map(
    (r) =>
      `- \`${r.style_id}\` (${r.category_id}/${r.tab_id || "—"}): ${r.mismatch.reason}`
  )
  .join("\n");

let md = `# Production style prompt audit

Generated: ${new Date().toISOString()}  
Scope: **Current production code behavior** in this repository (not ideal/target design).  
Catalog sources: \`${path.relative(ROOT, assetPath)}\`, \`${path.relative(ROOT, promptPath)}\`.  
Try-on entrypoint: \`POST /api/v1/try-on/generate\` (\`src/app/api/v1/try-on/generate/route.ts\`).

### Production vs local seed note

When MongoDB is populated via \`assets:seed\`, each catalog item’s \`promptCommand\` matches the optimized prompt CSV. If the DB were empty and only mock seed ran (\`src/lib/server/seed/content.ts\` fallback), prompts would differ (\`Wear {name} exactly as shown in the reference.\`) — **this audit assumes the asset-catalog seed path used on production VPS after \`assets:seed\`.**

### scripts/bfl-prompt-builder.mjs

Maintained in sync with \`src/lib/server/bfl/promptBuilder.ts\` for CSV regeneration. Runtime uses **TypeScript** files only.

---

## 1. Production Engines

| Engine | BFL endpoint | Started by | Used when |
|--------|--------------|------------|-----------|
| **BFL Virtual Try-On v2** | \`POST {BFL_API_BASE}/v1/flux-tools/vto-v2\` | \`bflStartVtoV2\` in \`src/lib/server/bfl.ts\` | \`shouldUseVtoEngine()\` true: \`region=outfit\` in COMMAND, or \`category_id\` ∈ virtual_try_on, outfit_change, wardrobe_browse, occasions, couple_duo, presets |
| **FLUX-2-pro** | \`POST {BFL_API_BASE}/v1/flux-2-pro\` | \`bflStartGeneration\` | Beauty/localized edits: beard, hair_color, hair_style, hijab (\`region\` ≠ outfit) |

**Request images (production):**

| Engine | Person | Garment/reference |
|--------|--------|-------------------|
| VTO v2 | \`person\` data URL from \`source_image_base64\` | \`garment\` data URL from \`resolveGarmentImage\` or client \`style_reference_image_base64\` |
| FLUX-2-pro | \`input_image\` | \`input_image_2\` when garment resolved (optional fallback text-only if resolve fails) |

---

## 2. Prompt Sources

| File | Role |
|------|------|
| \`.asset-requirements/.new-requirements/BACKEND_PROMPT_CATALOG_OPTIMIZED.csv\` | Source of truth for seeded \`promptCommand\` per \`style_id\` |
| \`scripts/asset-catalog-lib.mjs\` | Loads prompt CSV into seed payload |
| \`src/lib/server/seed/loadAssetCatalogSeed.ts\` | Reads generated JSON into Mongo on seed |
| \`src/lib/server/bfl/resolveTryOnPrompt.ts\` | \`resolveCatalogPromptCommand\`, \`buildTryOnBflPrompt\` |
| \`src/lib/server/bfl/tryOnEngine.ts\` | \`shouldUseVtoEngine\`, \`buildVtoPrompt\`, \`buildFluxEditPrompt\` |
| \`src/lib/server/bfl/promptBuilder.ts\` | \`parseStyleCommand\`, \`buildFluxPrompt\`, \`buildStyleAction\` (FLUX expansion) |
| \`src/app/api/v1/try-on/generate/route.ts\` | Orchestrates prompt + engine + BFL call |
| \`src/lib/server/bfl/resolveGarmentImage.ts\` | Resolves catalog PNG for image 2 |
| \`scripts/bfl-prompt-builder.mjs\` | Offline CSV prompt generation (mirror of promptBuilder.ts) |

**Hardcoded production strings:**

- \`buildVtoPrompt\` wrapper (all VTO styles) — \`src/lib/server/bfl/tryOnEngine.ts\`
- \`IDENTITY_LOCK\`, \`NEGATIVE\`, \`regionEditBlock\` — \`src/lib/server/bfl/promptBuilder.ts\`
- Generate fallback COMMAND if DB miss — \`src/app/api/v1/try-on/generate/route.ts\` line ~58

**No separate makeup/accessories catalog or prompts found in codebase.**

---

## 3. Prompt Families

`;

for (const [key, ids] of [...families.entries()].sort((a, b) => b[1].length - a[1].length)) {
  md += `### ${key}\n\nStyles (${ids.length}): ${ids.slice(0, 12).join(", ")}${ids.length > 12 ? `, … +${ids.length - 12} more` : ""}\n\n`;
  const sample = audited.find((r) => r.style_id === ids[0]);
  md += "Example production prompt:\n\n```text\n" + sample.production_prompt + "\n```\n\n";
  if (sample.useVto) {
    md += "Stored catalog COMMAND (not sent to VTO API; audit reference):\n\n```text\n" + sample.stored_command + "\n```\n\n";
  }
}

md += `---

## 4. Transformation Classification

| Bucket | Count |
|--------|------:|
`;

for (const [k, v] of Object.entries(bucketCounts).sort((a, b) => b[1] - a[1])) {
  md += `| ${k} | ${v} |\n`;
}

md += `
Classification rules: \`scripts/lib/prompt-audit-mirror.mjs\` \`classifyTransformation()\` using category, tab, region, and asset path metadata (reference PNG filenames/paths). **Visual pixel inspection of all 419 PNGs was not performed in this generator** — garment type inferred from tab_id + naming conventions.

---

## 5. Potentially Incorrect Prompt Mapping

**Flagged count:** ${mismatchStyles.length} styles with \`Potential mismatch: YES\`

${mismatchSection || "_None flagged._"}

---

## 6. Final Audit Summary

| Metric | Value |
|--------|------:|
| Total catalog style IDs (asset ∪ prompt CSV) | ${styleIds.length} |
| Total styles audited | ${audited.length} |
| Total prompt families | ${families.size} |
| Total unique **production** prompts sent to BFL | ${uniqueProduction} |
| Styles sharing identical production prompt with ≥1 other | ${sharedCount} |
| Total engines | 2 |
| Potential prompt mismatches (YES) | ${mismatchStyles.length} |
| Styles missing prompt CSV row | ${missingPrompt.length} |
| Styles missing asset CSV row | ${missingAsset.length} |
| Duplicate style IDs in union | ${[...dupCheck.values()].filter((c) => c > 1).length} |
| Reference PNG missing under \`public/\` (local workspace) | ${audited.filter((r) => r.image_url.startsWith("/") && !r.asset_on_disk).length} |

---

## Style-by-style audit

`;

for (const r of audited) {
  const shared =
    r.share_with.length > 0
      ? r.share_with.slice(0, 8).join(", ") + (r.share_with.length > 8 ? `, … +${r.share_with.length - 8} more` : "")
      : "_(unique production prompt string among catalog)_";

  md += `### \`${r.style_id}\`

- **Category:** \`${r.category_id}\`
- **Tab / category name:** ${tabDisplayName(r.tab_id, r.category_id)} (\`${r.tab_id || "—"}\`)
- **Gender:** ${r.gender || "—"}
- **Reference asset:** \`${r.image_url}\`${r.local_asset_path ? ` (source pack: \`${r.local_asset_path}\`)` : ""}
- **Asset file present locally:** ${r.asset_on_disk ? "YES" : "NO (may exist on production CDN after assets:sync)"}
- **Intended transformation:** ${r.classification.intended}
- **Edit region:** ${r.classification.editRegion}
- **Transformation bucket:** ${r.classification.bucket}
- **Production model:** ${r.engine}
- **Prompt source file:** \`${r.prompt_file}\`
- **Function:** \`${r.prompt_fn}\`
- **Prompt type:** ${r.useVto ? "Dynamic VTO wrapper (stored COMMAND not sent to BFL VTO)" : "Expanded FLUX prompt from stored COMMAND"}
- **Stored catalog COMMAND:**

\`\`\`text
${r.stored_command}
\`\`\`

- **Exact production prompt sent to BFL:**

\`\`\`text
${r.production_prompt}
\`\`\`

- **Dynamic variables:** ${dynamicVars(r.stored_command, r.useVto, r.style_id)}
- **Image 1:** User photo (\`source_image_base64\`) — identity/pose anchor
- **Image 2:** Catalog garment/reference PNG for this \`style_id\` (or client override \`style_reference_image_base64\`)
- **Expected to change:** ${r.useVto ? "Outfit/garment appearance transferred from image 2 per VTO prompt" : r.classification.intended}
- **Expected to preserve:** Face, identity, pose, background (per prompt locks); beauty edits preserve non-target regions per COMMAND
- **Shares production prompt with:** ${shared}
- **Prompt resolution:** ${r.resolve_prompt}
- **Reference image resolution:** ${r.resolve_image}
- **Potential mismatch:** ${r.mismatch.flag} — ${r.mismatch.reason}
- **Notes:** Engine chosen by \`shouldUseVtoEngine(stored COMMAND, category_id)\` in \`tryOnEngine.ts\`.

`;

}

fs.writeFileSync(OUT, md);
console.log("Wrote", OUT);
console.log("Styles:", audited.length, "Families:", families.size, "Mismatches:", mismatchStyles.length);
