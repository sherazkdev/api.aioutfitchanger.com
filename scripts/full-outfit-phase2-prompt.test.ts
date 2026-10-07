import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildFullOutfitPhase2VtoPrompt,
  shouldUseFullOutfitPhase2VtoPrompt,
  shortFullOutfitPhase2StyleInstruction,
} from "../src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts";
import { buildVtoPrompt, shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import {
  shouldUseWardrobePhase1VtoPrompt,
  WARDROBE_PHASE1_GARMENT_TABS,
} from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");

const FORBIDDEN_GARMENT_GUESSES = [
  /qipao/i,
  /cheongsam/i,
  /thobe/i,
  /kandura/i,
  /abaya/i,
  /saree/i,
  /lehenga/i,
  /shalwar/i,
];

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
      tab_id: head[2] || "",
      stored_command: line.slice(idx + 1),
    });
  }
  return rows;
}

function loadAssetRefs() {
  const map = new Map<string, string>();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 8) continue;
    const url = p[7].replace(/\.webp$/i, ".png");
    map.set(p[0], url.startsWith("/") ? url : `/${url}`);
  }
  return map;
}

function assertNoGarmentGuesses(prompt: string, styleId: string) {
  for (const re of FORBIDDEN_GARMENT_GUESSES) {
    assert.doesNotMatch(prompt, re, `${styleId} must not guess garment names: ${re}`);
  }
}

describe("full-outfit phase 2 master prompt", () => {
  it("couple_duo includes people-count preservation rule", () => {
    const cmd =
      "COMMAND: style_ref=couple_01 | category=couple_duo | pipeline=neutral | region=outfit | coordinated outfit";
    const p = buildFullOutfitPhase2VtoPrompt(cmd, "couple_01", "couple_duo");
    assert.match(p, /Preserve the exact number of people from image 1/);
    assert.match(p, /Preserve exactly the people already present in image 1/);
    assert.match(p, /Do not add or remove people/);
    assert.match(p, /Apply only the clothing reference/);
    assertNoGarmentGuesses(p, "couple_01");
  });

  it("regional tabs use image-2-only wording", () => {
    const cmd =
      "COMMAND: style_ref=men_chinese_01 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | action";
    const p = buildFullOutfitPhase2VtoPrompt(cmd, "men_chinese_01", "wardrobe_browse");
    assert.match(p, /Chinese-inspired outfit shown in image 2/);
    assertNoGarmentGuesses(p, "men_chinese_01");
  });
});

describe("419-style catalog split", () => {
  const rows = loadPromptRows();
  const assets = loadAssetRefs();

  it("totals 419 styles", () => {
    assert.equal(rows.length, 419);
  });

  it("exactly 105 Phase 1, 258 Phase 2, 56 FLUX", () => {
    const phase1: string[] = [];
    const phase2: string[] = [];
    const flux: string[] = [];

    for (const row of rows) {
      const p1 = shouldUseWardrobePhase1VtoPrompt(row.stored_command, row.category_id);
      const p2 = shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id);
      const vto = shouldUseVtoEngine(row.stored_command, row.category_id);

      if (p1) {
        assert.equal(p2, false, `${row.style_id} overlaps phase1 and phase2`);
        phase1.push(row.style_id);
        continue;
      }
      if (p2) {
        assert.equal(vto, true, `${row.style_id} phase2 but not vto`);
        phase2.push(row.style_id);
        continue;
      }
      if (!vto) {
        flux.push(row.style_id);
        continue;
      }
      assert.fail(`${row.style_id} unexpected legacy VTO bucket`);
    }

    assert.equal(phase1.length, 105);
    assert.equal(phase2.length, 258);
    assert.equal(flux.length, 56);
    assert.equal(phase1.length + phase2.length + flux.length, 419);
  });

  it("all 258 Phase 2 styles have reference images in asset catalog", () => {
    for (const row of rows) {
      if (!shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id)) continue;
      const ref = assets.get(row.style_id);
      assert.ok(ref, `${row.style_id} missing asset reference`);
      assert.match(ref, /^\/media\/catalog\//);
    }
  });

  it("buildVtoPrompt routes Phase 2 without TRY-ON prefix", () => {
    for (const row of rows) {
      if (!shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id)) continue;
      const prompt = buildVtoPrompt(row.stored_command, row.style_id, row.category_id);
      assert.match(prompt, /^Edit image 1 directly/);
      assert.doesNotMatch(prompt, /^TRY-ON:/);
      assert.match(prompt, /Use image 2 as the visual source of truth/);
      assertNoGarmentGuesses(prompt, row.style_id);
    }
  });

  it("Phase 1 styles unchanged (still Phase 1 master)", () => {
    for (const row of rows) {
      if (
        !(
          row.category_id === "wardrobe_browse" &&
          WARDROBE_PHASE1_GARMENT_TABS.includes(row.tab_id as (typeof WARDROBE_PHASE1_GARMENT_TABS)[number])
        )
      ) {
        continue;
      }
      const prompt = buildVtoPrompt(row.stored_command, row.style_id, row.category_id);
      assert.match(prompt, /Change ONLY:/);
      assert.doesNotMatch(prompt, /Use image 2 as the visual source of truth/);
    }
  });
});

describe("representative Phase 2 prompts via buildVtoPrompt", () => {
  const rows = loadPromptRows();
  function rowFor(id: string) {
    const row = rows.find((r) => r.style_id === id);
    assert.ok(row, id);
    return row;
  }

  const reps = [
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

  for (const id of reps) {
    it(`routes ${id} to Phase 2`, () => {
      const row = rowFor(id);
      assert.equal(shouldUseFullOutfitPhase2VtoPrompt(row.stored_command, row.category_id), true);
      const p = buildVtoPrompt(row.stored_command, id, row.category_id);
      assert.match(p, new RegExp(`visual source of truth for ${id}`));
      assertNoGarmentGuesses(p, id);
    });
  }
});

describe("shortFullOutfitPhase2StyleInstruction", () => {
  it("occasion tab uses casual/formal/wedding label", () => {
    assert.match(
      shortFullOutfitPhase2StyleInstruction("occasions", "formal"),
      /exact formal outfit shown in image 2/
    );
  });
});
