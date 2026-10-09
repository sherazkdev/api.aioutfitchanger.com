/**
 * Full 419-style regression after Phase 2 (Phase 1 + Phase 2 + FLUX).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt, shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import { shouldUseFullOutfitPhase2VtoPrompt } from "../src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts";
import {
  shouldUseWardrobePhase1VtoPrompt,
  WARDROBE_PHASE1_GARMENT_TABS,
} from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const OUT = path.join(ROOT, "artifacts", "full-catalog-prompt-regression.json");

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
      tab_id: head[2] || "",
      stored_command: line.slice(idx + 1),
    });
  }
  return rows;
}

const rows = loadRows();
const phase1 = [];
const phase2 = [];
const legacyFlux = [];
const legacyVtoFallback = [];
const unexpected = [];

for (const row of rows) {
  const p1 = shouldUseWardrobePhase1VtoPrompt(row.stored_command, row.category_id);
  const p2 = shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id);
  const vto = shouldUseVtoEngine(row.stored_command, row.category_id);
  const prompt = buildVtoPrompt(row.stored_command, row.style_id, row.category_id);

  if (p1 && p2) {
    unexpected.push({ style_id: row.style_id, reason: "both phase1 and phase2" });
    continue;
  }

  if (p1) {
    if (!prompt.startsWith("Edit image 1 directly") || !prompt.includes("Change ONLY:")) {
      unexpected.push({ style_id: row.style_id, reason: "phase1 flag but prompt not phase1 master" });
    }
    phase1.push(row.style_id);
    continue;
  }

  if (p2) {
    if (!prompt.startsWith("Edit image 1 directly") || !prompt.includes("Use image 2 as the visual source of truth")) {
      unexpected.push({ style_id: row.style_id, reason: "phase2 flag but prompt not phase2 master", got: prompt.slice(0, 100) });
    }
    if (prompt.startsWith("TRY-ON:")) {
      unexpected.push({ style_id: row.style_id, reason: "phase2 still TRY-ON" });
    }
    phase2.push(row.style_id);
    continue;
  }

  if (!vto) {
    legacyFlux.push(row.style_id);
    continue;
  }

  if (!prompt.startsWith("TRY-ON: The person of image 1 wearing the garments of image 2")) {
    unexpected.push({ style_id: row.style_id, reason: "expected legacy TRY-ON fallback", got: prompt.slice(0, 80) });
  }
  legacyVtoFallback.push(row.style_id);
}

const out = {
  total: rows.length,
  phase1_count: phase1.length,
  phase2_count: phase2.length,
  legacy_flux_count: legacyFlux.length,
  legacy_vto_fallback_count: legacyVtoFallback.length,
  unexpected,
  phase1_by_tab: Object.fromEntries(
    WARDROBE_PHASE1_GARMENT_TABS.map((t) => [
      t,
      rows.filter(
        (r) =>
          r.category_id === "wardrobe_browse" &&
          r.tab_id === t &&
          shouldUseWardrobePhase1VtoPrompt(r.stored_command, "wardrobe_browse")
      ).length,
    ])
  ),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

if (unexpected.length) process.exit(1);
if (out.phase1_count !== 105 || out.phase2_count !== 258 || out.legacy_flux_count !== 56) process.exit(2);
if (out.legacy_vto_fallback_count !== 0) process.exit(3);
