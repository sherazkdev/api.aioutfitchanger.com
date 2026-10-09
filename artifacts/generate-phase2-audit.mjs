/**
 * Generates PHASE2_FULL_OUTFIT_AUDIT.md — audit only, no production changes.
 * Run: npx tsx artifacts/generate-phase2-audit.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt, shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import {
  shouldUseWardrobePhase1VtoPrompt,
  WARDROBE_PHASE1_GARMENT_TABS,
} from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";
import { parseStyleCommand } from "../src/lib/server/bfl/promptBuilder.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const OUT = path.join(ROOT, "PHASE2_FULL_OUTFIT_AUDIT.md");

const REGIONAL_TABS = new Set(["chinese", "indian", "arabian", "korean", "pakistani"]);

function loadMergedRows() {
  const assets = new Map();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 8) continue;
    assets.set(p[0], {
      style_id: p[0],
      category_id: p[1],
      tab_id: p[4] || "",
      local_path: p[6],
      image_url: p[7].replace(/\.webp$/i, ".png"),
    });
  }
  const rows = [];
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    const head = line.slice(0, idx).split(",");
    const stored_command = line.slice(idx + 1);
    const style_id = head[0];
    const a = assets.get(style_id);
    rows.push({
      style_id,
      category_id: head[1] || a?.category_id,
      tab_id: head[2] || a?.tab_id || "",
      gender: head[3] || "",
      region: head[4] || "",
      stored_command,
      image_url: a?.image_url ?? "",
      local_path: a?.local_path ?? "",
    });
  }
  return rows;
}

function isPhase2FullOutfit(row) {
  if (shouldUseWardrobePhase1VtoPrompt(row.stored_command, row.category_id)) return false;
  return shouldUseVtoEngine(row.stored_command, row.category_id);
}

function fullOutfitIntent(row) {
  const { category_id, tab_id } = row;
  if (category_id === "couple_duo") return { intended: "full_outfit", note: "Coordinated duo look reference" };
  if (category_id === "outfit_change") return { intended: "full_outfit", note: "Full outfit replacement reference" };
  if (category_id === "virtual_try_on") return { intended: "full_outfit", note: "Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere)" };
  if (category_id === "presets") return { intended: "full_outfit", note: `Preset look (${tab_id || "preset"})` };
  if (category_id === "occasions") return { intended: "full_outfit", note: `Occasion ensemble (${tab_id})` };
  if (category_id === "wardrobe_browse" && REGIONAL_TABS.has(tab_id)) {
    return { intended: "full_outfit", note: `Regional traditional ensemble (${tab_id})` };
  }
  if (category_id === "wardrobe_browse" && WARDROBE_PHASE1_GARMENT_TABS.includes(tab_id)) {
    return { intended: "single_garment", note: "Phase 1 — excluded from Phase 2" };
  }
  return { intended: "review", note: "Unclassified wardrobe tab" };
}

function assetExistsLocal(imageUrl) {
  if (!imageUrl?.startsWith("/")) return false;
  return fs.existsSync(path.join(ROOT, "public", imageUrl.replace(/^\//, "")));
}

function shortenStyleSpecific(row) {
  const { category_id, tab_id, style_id } = row;
  const parsed = parseStyleCommand(row.stored_command);
  const action = parsed?.action ?? "";

  if (category_id === "couple_duo") {
    return "Match the coordinated couple/duo outfit from image 2, including colors, top/bottom pairing, and styling details.";
  }
  if (category_id === "outfit_change") {
    return "Match the full replacement outfit from image 2, including silhouette, layering, fabric, color, and visible accessories.";
  }
  if (category_id === "virtual_try_on") {
    return "Match the full try-on outfit ensemble from image 2, including all visible garment layers and footwear if shown.";
  }
  if (category_id === "presets") {
    const label = tab_id?.replace(/^preset_/, "").replace(/_/g, " ") || "preset";
    return `Match the ${label} preset outfit from image 2, including all visible layers and accessories.`;
  }
  if (category_id === "occasions") {
    const occ = { casual: "casual daywear", formal: "formal occasion", wedding: "wedding/festive" }[tab_id] || tab_id;
    return `Match the ${occ} outfit from image 2, including garment type, fit, fabric, embellishment, and accessories.`;
  }
  if (tab_id === "indian") {
    return "Match the traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown), including textile, color, drape, embroidery and accessories.";
  }
  if (tab_id === "arabian") {
    return "Match the Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown), including cut, textile, color and trims.";
  }
  if (tab_id === "chinese") {
    return "Match the Chinese-inspired outfit (qipao, cheongsam, or formal wear as shown), including silhouette, textile, color and details.";
  }
  if (tab_id === "korean") {
    return "Match the Korean-inspired outfit as shown, including silhouette, textile, color and styling details.";
  }
  if (tab_id === "pakistani") {
    return "Match the traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown), including textile, color, drape and embellishment.";
  }

  const trimmed = action
    .replace(/^The person of image 1,\s*maintaining exactly their face, identity,[^,]*,\s*and pose,\s*wearing\s*/i, "")
    .replace(/^The person of image 1,\s*maintaining exactly their face, identity, and pose,\s*wearing\s*/i, "")
    .replace(/\s*Copy .+$/i, "")
    .replace(/\s*Transfer .+$/i, "")
    .trim();
  if (trimmed.length > 20 && trimmed.length < 280) {
    return `Match ${trimmed.replace(/^the exact /i, "the ").replace(/ from image 2.*$/i, "")} from image 2.`;
  }
  return `Match the catalog outfit details for ${style_id} from image 2.`;
}

export function buildPhase2ProposedPrompt(row) {
  const style_id = row.style_id;
  const specific = shortenStyleSpecific(row);
  return (
    "Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.\n\n" +
    "Replace ONLY the visible clothing/outfit with the outfit shown in image 2.\n\n" +
    `Use image 2 only as the outfit reference for ${style_id}.\n` +
    "Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.\n\n" +
    "Keep the original person and scene unchanged.\n" +
    "Do not recreate the person or full image.\n" +
    "Photorealistic.\n\n" +
    specific
  );
}

const REPRESENTATIVES = [
  "women_indian_01",
  "men_arabian_01",
  "men_korean_01",
  "women_pakistani_01",
  "men_chinese_01",
  "women_formal_01",
  "men_preset_gym_01",
  "couple_01",
  "women_outfit_change_01",
  "men_tryon_01",
];

const allRows = loadMergedRows();
const phase2 = allRows.filter(isPhase2FullOutfit);
const notFullOutfit = phase2.filter((r) => fullOutfitIntent(r).intended !== "full_outfit");
const missingLocal = phase2.filter((r) => r.image_url && !assetExistsLocal(r.image_url));

const byCategory = {};
const byTab = {};
for (const r of phase2) {
  byCategory[r.category_id] = (byCategory[r.category_id] || 0) + 1;
  const t = r.tab_id || "(none)";
  byTab[t] = (byTab[t] || 0) + 1;
}

const suspiciousCommands = phase2.filter((r) => {
  const a = parseStyleCommand(r.stored_command)?.action ?? "";
  return a.length < 40 || !r.stored_command.includes("region=outfit");
});

let md = `# Phase 2 full-outfit audit (audit only)

**Generated:** ${new Date().toISOString()}  
**Status:** No production code changed. Phase 1 (105) and beauty (56) untouched.

---

## Executive summary

| Metric | Value |
|--------|------:|
| **Phase 2 full-outfit styles (legacy VTO)** | **${phase2.length}** |
| Expected from prior regression | 258 |
| Phase 1 excluded (frozen) | 105 |
| Beauty / FLUX excluded | 56 |
| Catalog total | 419 |

**Current production prompt (Phase 2 styles today):** generic \`buildVtoPrompt()\` → \`TRY-ON: The person of image 1 wearing the garments of image 2…\`  
**Engine:** BFL Virtual Try-On v2 (\`shouldUseVtoEngine\` true, \`shouldUseWardrobePhase1VtoPrompt\` false)

---

## Proposed Phase 2 master prompt (not implemented)

Same structure for all **258** styles when approved:

\`\`\`text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for {style_id}.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

{short_style_specific_instruction}
\`\`\`

Style-specific lines are **shortened** from stored COMMAND (no duplicate “maintaining face/identity/pose”).

---

## Categories included (Phase 2)

| category_id | count |
|-------------|------:|
`;

for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
  md += `| ${k} | ${v} |\n`;
}

md += `
---

## Tabs included (Phase 2)

| tab_id | count |
|--------|------:|
`;

for (const [k, v] of Object.entries(byTab).sort((a, b) => b[1] - a[1])) {
  md += `| ${k} | ${v} |\n`;
}

md += `
---

## Flags

### Styles NOT clearly full-outfit intent

`;

if (notFullOutfit.length === 0) {
  md += `_None in Phase 2 set._\n\n`;
} else {
  for (const r of notFullOutfit) {
    md += `- \`${r.style_id}\` (${r.category_id}/${r.tab_id || "—"}): ${fullOutfitIntent(r).note}\n`;
  }
  md += "\n";
}

md += `### Missing reference PNG under \`public/\` (local workspace)

Count: **${missingLocal.length}** (CDN may still serve after \`assets:sync\` on server)

`;

if (missingLocal.length <= 30) {
  for (const r of missingLocal) {
    md += `- \`${r.style_id}\` → \`${r.image_url}\`\n`;
  }
} else {
  md += `_First 25:_\n`;
  for (const r of missingLocal.slice(0, 25)) {
    md += `- \`${r.style_id}\` → \`${r.image_url}\`\n`;
  }
  md += `\n_… +${missingLocal.length - 25} more_\n`;
}

md += `
### Suspicious COMMANDs (short or missing region=outfit meta)

Count: **${suspiciousCommands.length}**

`;

for (const r of suspiciousCommands.slice(0, 15)) {
  md += `- \`${r.style_id}\`\n`;
}

md += `
---

## Representative proposed prompts (10 styles)

`;

for (const id of REPRESENTATIVES) {
  const row = phase2.find((r) => r.style_id === id) || allRows.find((r) => r.style_id === id);
  if (!row) {
    md += `### \`${id}\`\n\n_NOT FOUND in catalog._\n\n`;
    continue;
  }
  const current = buildVtoPrompt(row.stored_command, row.style_id, row.category_id);
  const proposed = buildPhase2ProposedPrompt(row);
  md += `### \`${id}\`

- **Category:** \`${row.category_id}\`
- **Tab:** \`${row.tab_id || "—"}\`
- **Reference:** \`${row.image_url}\`
- **Full-outfit intent:** ${fullOutfitIntent(row).note}
- **Engine:** BFL VTO v2

**Current production prompt:**

\`\`\`text
${current}
\`\`\`

**Proposed Phase 2 prompt:**

\`\`\`text
${proposed}
\`\`\`

`;
}

md += `---

## Files that would change if Phase 2 is approved (proposal only)

| File | Change |
|------|--------|
| \`src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts\` | **NEW** — gate + master prompt + short style-specific templates |
| \`src/lib/server/bfl/tryOnEngine.ts\` | Branch: Phase 1 → Phase 2 → legacy \`TRY-ON\` fallback (only if any edge case remains) |
| \`src/app/api/v1/try-on/generate/route.ts\` | No change expected if \`buildVtoPrompt\` remains single entry |
| \`scripts/wardrobe-phase1-prompt.test.ts\` | Unchanged (Phase 1 frozen) |
| \`scripts/full-outfit-phase2-prompt.test.ts\` | **NEW** — 258-style resolution tests |
| \`PHASE2_FULL_OUTFIT_AUDIT.md\` | This document |
| \`src/lib/server/bfl/wardrobePhase1VtoPrompt.ts\` | **DO NOT MODIFY** |

---

## Full style inventory (${phase2.length} styles)

| style_id | category | tab | engine | reference | full_outfit? | local PNG |
|----------|----------|-----|--------|-----------|------------|-----------|
`;

for (const r of phase2.sort((a, b) => a.category_id.localeCompare(b.category_id) || a.style_id.localeCompare(b.style_id))) {
  const intent = fullOutfitIntent(r);
  const flag = intent.intended === "full_outfit" ? "Yes" : "**Review**";
  const local = assetExistsLocal(r.image_url) ? "Yes" : "No";
  md += `| ${r.style_id} | ${r.category_id} | ${r.tab_id || "—"} | VTO v2 | ${r.image_url} | ${flag} | ${local} |\n`;
}

md += `
---

## Per-style audit (all ${phase2.length} styles)

Each entry: style_id, category, tab, stored COMMAND, current production prompt, engine, reference path, full-outfit intent, misclassification flag.

`;

for (const r of phase2.sort((a, b) => a.category_id.localeCompare(b.category_id) || a.style_id.localeCompare(b.style_id))) {
  const intent = fullOutfitIntent(r);
  const current = buildVtoPrompt(r.stored_command, r.style_id, r.category_id);
  const misclass =
    intent.intended !== "full_outfit"
      ? `**FLAG:** not clearly full-outfit — ${intent.note}`
      : "_None_";
  md += `### \`${r.style_id}\`

| Field | Value |
|-------|-------|
| **style_id** | \`${r.style_id}\` |
| **category** | \`${r.category_id}\` |
| **tab** | \`${r.tab_id || "—"}\` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | \`${r.image_url}\` |
| **local PNG present** | ${assetExistsLocal(r.image_url) ? "Yes" : "No"} |
| **full-outfit reference intent** | ${intent.note} |
| **misclassification flag** | ${misclass} |

**Stored COMMAND:**

\`\`\`text
${r.stored_command}
\`\`\`

**Current production prompt (\`buildVtoPrompt\`, legacy):**

\`\`\`text
${current}
\`\`\`

`;
}

fs.writeFileSync(OUT, md);
console.log("Wrote", OUT, "phase2 count:", phase2.length);
