import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const lines = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const idx = line.indexOf(",COMMAND:");
  if (idx < 0) continue;
  const head = line.slice(0, idx).split(",");
  const cmd = line.slice(idx + 1);
  rows.push({
    style_id: head[0],
    category_id: head[1],
    tab_id: head[2] || "",
    gender: head[3] || "",
    region: head[5],
    pipeline: head[6],
    prompt_command: cmd,
  });
}

const vtoCats = new Set([
  "virtual_try_on",
  "outfit_change",
  "wardrobe_browse",
  "occasions",
  "couple_duo",
  "presets",
]);

function engine(cat, region) {
  return vtoCats.has(cat) || region === "outfit" ? "VTO v2" : "FLUX-2-pro";
}

function vtoSent(styleId) {
  return (
    `TRY-ON: The person of image 1 wearing the garments of image 2. ` +
    `Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. ` +
    `Transfer only the outfit from image 2 (catalog style ${styleId}). Photorealistic, no text or watermarks.`
  );
}

let md = `# Current prompt catalog (${rows.length} styles)

Source: \`.asset-requirements/.new-requirements/BACKEND_PROMPT_CATALOG_OPTIMIZED.csv\` → seeded into Mongo \`promptCommand\` on each catalog item.

## How BFL receives it

| Engine | Categories | What is sent |
|--------|------------|--------------|
| **BFL Virtual Try-On v2** | outfit_change, virtual_try_on, wardrobe_browse, occasions, couple_duo, presets | Fixed \`buildVtoPrompt()\` (below). Stored COMMAND is metadata + audit; VTO uses **person + garment** images. |
| **FLUX-2-pro** | beard_styles, hair_color, hair_styles, hijab_styles | \`buildFluxPrompt(COMMAND)\` = IDENTITY_LOCK + region rule + **action from COMMAND** + NEGATIVE |

**VTO wrapper (every outfit style — \`style_id\` inserted at runtime):**

\`\`\`
${vtoSent("{style_id}")}
\`\`\`

**FLUX beauty:** prefix \`TRY-ON EDIT. Photorealistic...\` + region transfer line + COMMAND action text + \`Do not add text, watermarks...\`

---

## A) By category (stored COMMAND)

`;

const byCat = new Map();
for (const r of rows) {
  if (!byCat.has(r.category_id)) byCat.set(r.category_id, []);
  byCat.get(r.category_id).push(r);
}

for (const cat of [...byCat.keys()].sort()) {
  const list = byCat.get(cat);
  const e = engine(cat, list[0].region);
  md += `### ${cat} (${list.length} styles) — **${e}**\n\n`;
  const sub = new Map();
  for (const r of list) {
    const k = [r.tab_id || "-", r.pipeline, r.gender].join("|");
    if (!sub.has(k)) sub.set(k, { ...r, count: 0 });
    sub.get(k).count++;
  }
  for (const [, g] of [...sub.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])))) {
    md += `- **tab:** \`${g.tab_id || "—"}\` | **pipeline:** \`${g.pipeline}\` | **count:** ${g.count} | **example:** \`${g.style_id}\`\n\n`;
    md += "```\n" + g.prompt_command + "\n```\n\n";
  }
}

md += `---

## B) By style (full list)

| style_id | category | tab | gender | engine | prompt_command |
|----------|----------|-----|--------|--------|----------------|
`;

for (const r of rows.sort(
  (a, b) => a.category_id.localeCompare(b.category_id) || a.style_id.localeCompare(b.style_id)
)) {
  const e = engine(r.category_id, r.region);
  const cmd = r.prompt_command.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  md += `| ${r.style_id} | ${r.category_id} | ${r.tab_id || "—"} | ${r.gender || "—"} | ${e} | ${cmd} |\n`;
}

const out = path.join(ROOT, "docs", "CURRENT_PROMPT_CATALOG.md");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log("Wrote", out, rows.length, "rows");
