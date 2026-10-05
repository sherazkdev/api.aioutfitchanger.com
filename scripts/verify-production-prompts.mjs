/**
 * Verify production catalog prompts match expert catalog (sample + counts).
 * Usage: node scripts/verify-production-prompts.mjs [baseUrl]
 */
const base = (process.argv[2] || "https://appworkspro.com").replace(/\/$/, "");
const { readFileSync } = await import("fs");
const { fileURLToPath } = await import("url");
const path = await import("path");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const csv = readFileSync(
  path.join(root, ".asset-requirements/.new-requirements/BACKEND_PROMPT_CATALOG_OPTIMIZED.csv"),
  "utf8"
);
const expected = new Map();
for (const line of csv.trim().split(/\r?\n/).slice(1)) {
  const id = line.split(",")[0]?.trim();
  const cmd = line.slice(line.indexOf("COMMAND:"));
  if (id && cmd.startsWith("COMMAND:")) expected.set(id, cmd);
}

const CATEGORIES = [
  "beard_styles",
  "hair_styles",
  "hair_color",
  "hijab_styles",
  "virtual_try_on",
  "outfit_change",
  "occasions",
  "couple_duo",
  "presets",
  "wardrobe_browse",
];

async function getJson(p) {
  const res = await fetch(`${base}${p}`, { headers: { Accept: "application/json" } });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${p} → HTTP ${res.status}, not JSON`);
  }
}

const seen = new Map();
for (const cat of CATEGORIES) {
  const j = await getJson(`/api/v1/catalog/${cat}`);
  for (const it of j.data?.items ?? []) {
    if (!seen.has(it.id)) seen.set(it.id, it.prompt_command ?? "");
  }
}
for (const g of ["men", "women"]) {
  for (const cat of CATEGORIES) {
    const j = await getJson(`/api/v1/catalog/${cat}?gender=${g}`);
    for (const it of j.data?.items ?? []) {
      if (!seen.has(it.id)) seen.set(it.id, it.prompt_command ?? "");
    }
  }
}

let match = 0;
let mismatch = 0;
const samples = [];
for (const [id, exp] of expected) {
  const live = seen.get(id);
  if (live === exp) match++;
  else {
    mismatch++;
    if (samples.length < 5) samples.push({ id, live: live?.slice(0, 80), exp: exp.slice(0, 80) });
  }
}

console.log("Base:", base);
console.log("Catalog styles in API:", seen.size);
console.log("Expected from CSV:", expected.size);
console.log("Exact prompt_command match:", match);
console.log("Mismatch:", mismatch);
if (samples.length) {
  console.log("Sample mismatches:", JSON.stringify(samples, null, 2));
}
process.exit(mismatch === 0 && match === expected.size ? 0 : 1);
