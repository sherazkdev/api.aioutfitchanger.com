/**
 * Pre-flight check before VPS assets:sync / assets:seed
 *   node scripts/verify-assets.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { CSV_PATH, ZIP_PATH, GENERATED_JSON, loadCatalogRows, publicImageUrl } from "./asset-catalog-lib.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const issues = [];
const ok = [];

function walkPng(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkPng(p, acc);
    else if (ent.name.endsWith(".png")) acc.push(p);
  }
  return acc;
}

// tar
const tar = spawnSync("tar", ["--version"], { encoding: "utf8" });
if (tar.status !== 0) issues.push("tar not in PATH (required to extract assets.zip on Linux VPS)");
else ok.push(`tar available: ${(tar.stdout || tar.stderr || "").split("\n")[0].trim()}`);

if (!existsSync(ZIP_PATH)) issues.push(`Missing ${ZIP_PATH}`);
else ok.push(`assets.zip present (${Math.round(statSync(ZIP_PATH).size / 1e6)} MB)`);

if (!existsSync(CSV_PATH)) issues.push(`Missing ${CSV_PATH}`);
else {
  const rows = loadCatalogRows();
  ok.push(`CSV rows: ${rows.length}`);
  const ids = new Set(rows.map((r) => r.style_id));
  if (ids.size !== rows.length) issues.push("Duplicate style_id in CSV");
}

if (!existsSync(GENERATED_JSON)) {
  issues.push(`Missing ${GENERATED_JSON} — run npm run assets:sync first`);
} else {
  const payload = JSON.parse(readFileSync(GENERATED_JSON, "utf8"));
  const urls = new Set();
  for (const c of payload.catalogCategories) {
    for (const i of c.items) urls.add(i.imageUrl);
  }
  for (const s of payload.homeFeedSections) {
    for (const i of s.items ?? []) {
      if (i.thumbnailUrl) urls.add(i.thumbnailUrl);
    }
  }
  for (const w of payload.wardrobeCategories) {
    for (const p of w.previewItems ?? []) urls.add(p.thumbnailUrl);
  }
  let missing = 0;
  for (const u of urls) {
    const file = path.join(root, "public", u.replace(/^\//, ""));
    if (!existsSync(file)) missing++;
  }
  if (missing) issues.push(`${missing} image URLs in seed JSON have no file under public/ (run assets:sync)`);
  else ok.push(`All ${urls.size} seeded image URLs exist on disk`);

  const catIds = payload.catalogCategories.map((c) => c.categoryId).sort();
  ok.push(`Mongo seed payload: ${payload.catalogCategories.length} categories [${catIds.join(", ")}]`);
}

const pngs = walkPng(path.join(root, "public", "media", "catalog"));
if (pngs.length === 0) issues.push("No PNG files in public/media/catalog — run assets:sync on VPS");
else ok.push(`PNG files on disk: ${pngs.length}`);

const rows = existsSync(CSV_PATH) ? loadCatalogRows() : [];
if (pngs.length && rows.length && pngs.length !== rows.length) {
  issues.push(`PNG count (${pngs.length}) != CSV rows (${rows.length})`);
}

for (const row of rows.slice(0, 3)) {
  const url = publicImageUrl(row.suggested_image_url_path);
  if (!url.endsWith(".png")) issues.push(`publicImageUrl should end with .png for ${row.style_id}`);
}

const envPath = [".env.local", ".env"].map((f) => path.join(root, f)).find(existsSync);
if (!envPath) issues.push("No .env.local or .env (needed for assets:seed)");
else {
  const text = readFileSync(envPath, "utf8");
  if (!/MONGODB_URI=/.test(text)) issues.push("MONGODB_URI not set in env file");
  else ok.push("MONGODB_URI present in env");
  if (!/APP_URL=/.test(text)) issues.push("APP_URL not set — mobile absolute media URLs may be wrong");
  else ok.push("APP_URL present in env");
}

console.log("=== Asset catalog verification ===\n");
for (const line of ok) console.log("OK  ", line);
for (const line of issues) console.log("FAIL", line);
console.log(issues.length ? `\n${issues.length} issue(s) — fix before production seed.` : "\nReady for VPS: npm run assets:sync && npm run assets:seed && pm2 reload ai-outfit-changer");
process.exit(issues.length ? 1 : 0);
