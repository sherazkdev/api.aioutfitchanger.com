import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { buildFluxPrompt, parseStyleCommand } from "../src/lib/server/bfl/promptBuilder.ts";
import { shouldUseFullOutfitPhase2VtoPrompt } from "../src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts";
import { shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import { shouldUseWardrobePhase1VtoPrompt } from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");

const BEAUTY_REGIONS = new Set(["hair_style", "hair_color", "beard", "hijab"]);

function loadPromptRows() {
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

function loadAssetRefs() {
  const map = new Map<string, string>();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length >= 8) map.set(p[0], p[7].replace(/\.webp$/i, ".png"));
  }
  return map;
}

function loadBeautyStyles() {
  return loadPromptRows().filter((r) => BEAUTY_REGIONS.has(r.region));
}

describe("Phase 3 — Beauty / FLUX catalog (56 styles)", () => {
  const beauty = loadBeautyStyles();
  const assets = loadAssetRefs();

  it("counts 16 hair_style, 20 hair_color, 10 beard, 10 hijab (56 total)", () => {
    const counts = { hair_style: 0, hair_color: 0, beard: 0, hijab: 0 };
    for (const r of beauty) counts[r.region as keyof typeof counts]++;
    assert.equal(counts.hair_style, 16);
    assert.equal(counts.hair_color, 20);
    assert.equal(counts.beard, 10);
    assert.equal(counts.hijab, 10);
    assert.equal(beauty.length, 56);
  });

  it("every Beauty style routes to FLUX only (not VTO / Phase 1 / Phase 2)", () => {
    for (const row of beauty) {
      assert.equal(shouldUseWardrobePhase1VtoPrompt(row.stored_command, row.category_id), false, row.style_id);
      assert.equal(shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id), false, row.style_id);
      assert.equal(shouldUseVtoEngine(row.stored_command, row.category_id), false, row.style_id);
    }
  });

  it("every Beauty style has a local reference asset", () => {
    for (const row of beauty) {
      const rel = (assets.get(row.style_id) ?? "").replace(/^\//, "");
      assert.ok(rel, row.style_id);
      const fp = path.join(ROOT, "public", rel);
      assert.ok(fs.existsSync(fp), `missing asset ${row.style_id} ${fp}`);
    }
  });

  it("FLUX prompts use region locks (no outfit VTO wrapper)", () => {
    for (const row of beauty) {
      const flux = buildFluxPrompt(row.stored_command, { hasReferenceStyle: true });
      assert.match(flux, /TRY-ON EDIT\. Photorealistic/, row.style_id);
      assert.doesNotMatch(flux, /wearing the garments of image 2/, row.style_id);
      const parsed = parseStyleCommand(row.stored_command);
      assert.ok(parsed, row.style_id);
      assert.equal(parsed!.region, row.region, row.style_id);
      if (row.region === "beard") assert.match(flux, /beard|facial hair/i, row.style_id);
      if (row.region === "hair_color") assert.match(flux, /hair color|recolor ONLY/i, row.style_id);
      if (row.region === "hair_style") assert.match(flux, /haircut|hair style/i, row.style_id);
      if (row.region === "hijab") assert.match(flux, /hijab|headscarf/i, row.style_id);
    }
  });
});
