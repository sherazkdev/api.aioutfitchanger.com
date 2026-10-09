/**
 * Phase 3 mapping + prompt audit (no prompt mutations).
 * Run: npx tsx artifacts/phase3-beauty-audit.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFluxPrompt, parseStyleCommand } from "../src/lib/server/bfl/promptBuilder.ts";
import { shouldUseFullOutfitPhase2VtoPrompt } from "../src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts";
import { shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import { shouldUseWardrobePhase1VtoPrompt } from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const OUT = path.join(ROOT, "artifacts", "phase3-beauty-audit.json");

const BEAUTY_REGIONS = new Set(["hair_style", "hair_color", "beard", "hijab"]);
const OUTFIT_WORDS = [/wearing the garments of image 2/i, /virtual try-on/i, /full replacement outfit/i, /Transfer silhouette, fit, fabric/i];
const IDENTITY_RISK = [/new person/i, /different person/i, /replace the person/i, /regenerate the entire/i];
const BACKGROUND_RISK = [/change the background/i, /new background/i, /replace background/i];

function loadRows() {
  const lines = fs.readFileSync(PROMPT_CSV, "utf8").trim().split(/\r?\n/).slice(1);
  const rows = [];
  for (const line of lines) {
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    const head = line.slice(0, idx).split(",");
    rows.push({
      style_id: head[0],
      category_id: head[1],
      region: head[4],
      stored_command: line.slice(idx + 1),
    });
  }
  return rows;
}

function loadAssets() {
  const map = new Map();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length >= 8) map.set(p[0], p[7].replace(/\.webp$/i, ".png"));
  }
  return map;
}

const beauty = loadRows().filter((r) => BEAUTY_REGIONS.has(r.region));
const assets = loadAssets();
const counts = { hair_style: 0, hair_color: 0, beard: 0, hijab: 0 };
for (const r of beauty) counts[r.region]++;

const routing_issues = [];
const prompt_flags = [];

for (const row of beauty) {
  const vto = shouldUseVtoEngine(row.stored_command, row.category_id);
  const p1 = shouldUseWardrobePhase1VtoPrompt(row.stored_command, row.category_id);
  const p2 = shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id);
  if (vto || p1 || p2) {
    routing_issues.push({ style_id: row.style_id, vto, p1, p2 });
  }
  const rel = assets.get(row.style_id);
  if (!rel || !fs.existsSync(path.join(ROOT, "public", rel.replace(/^\//, "")))) {
    routing_issues.push({ style_id: row.style_id, error: "missing_reference_asset" });
  }

  const flux = buildFluxPrompt(row.stored_command, { hasReferenceStyle: true });
  const parsed = parseStyleCommand(row.stored_command);
  if (!parsed || parsed.styleRef !== row.style_id) {
    prompt_flags.push({ style_id: row.style_id, flag: "style_ref_mismatch" });
  }
  for (const re of OUTFIT_WORDS) {
    if (re.test(flux) && row.region !== "hijab") {
      prompt_flags.push({ style_id: row.style_id, flag: "outfit_language_in_flux", match: String(re) });
    }
  }
  for (const re of IDENTITY_RISK) {
    if (re.test(flux)) prompt_flags.push({ style_id: row.style_id, flag: "identity_risk_wording", match: String(re) });
  }
  for (const re of BACKGROUND_RISK) {
    if (re.test(flux) && !/background from image 1|background identical|background unchanged/i.test(flux)) {
      prompt_flags.push({ style_id: row.style_id, flag: "background_change_wording", match: String(re) });
    }
  }
  if (!/ONLY/i.test(flux) && !/only/i.test(parsed?.action ?? "")) {
    prompt_flags.push({ style_id: row.style_id, flag: "weak_region_only_lock" });
  }
}

const report = {
  assessed_at: new Date().toISOString(),
  counts,
  total: beauty.length,
  routing: {
    all_flux: routing_issues.length === 0,
    issues: routing_issues,
  },
  prompt_audit: {
    styles_audited: beauty.length,
    flags: prompt_flags,
    clean: prompt_flags.length === 0,
  },
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (routing_issues.length || prompt_flags.length) process.exit(1);
