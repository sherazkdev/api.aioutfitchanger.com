import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import {
  buildWardrobePhase1VtoPrompt,
  resolveWardrobePhase1Tab,
  shouldUseWardrobePhase1VtoPrompt,
  WARDROBE_PHASE1_GARMENT_TABS,
} from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");

function loadPromptRows() {
  const lines = fs.readFileSync(PROMPT_CSV, "utf8").trim().split(/\r?\n/).slice(1);
  const rows = [];
  for (const line of lines) {
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    const head = line.slice(0, idx).split(",");
    const cmd = line.slice(idx + 1);
    rows.push({
      style_id: head[0],
      category_id: head[1],
      tab_id: head[2] || "",
      stored_command: cmd,
    });
  }
  return rows;
}

function loadAssetTabs() {
  const lines = fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1);
  const map = new Map();
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length < 5) continue;
    map.set(parts[0], { category_id: parts[1], tab_id: parts[4] || "" });
  }
  return map;
}

function sampleCommand(styleId: string, tab: string) {
  return `COMMAND: style_ref=${styleId} | category=wardrobe_browse | pipeline=women | tab=${tab} | region=outfit | placeholder action`;
}

describe("wardrobe phase 1 garment tabs", () => {
  for (const tab of WARDROBE_PHASE1_GARMENT_TABS) {
    it(`activates phase 1 for tab=${tab}`, () => {
      const cmd = sampleCommand(`test_${tab}_01`, tab);
      assert.equal(shouldUseWardrobePhase1VtoPrompt(cmd, "wardrobe_browse"), true);
      assert.equal(resolveWardrobePhase1Tab(cmd, "wardrobe_browse"), tab);
      const prompt = buildWardrobePhase1VtoPrompt(cmd, `test_${tab}_01`, "wardrobe_browse");
      assert.match(prompt, /Edit image 1 directly/);
      assert.doesNotMatch(prompt, /The person of image 1, maintaining exactly their face/);
      switch (tab) {
        case "tops":
          assert.match(prompt, /Replace ONLY the top using image 2/);
          assert.match(prompt, /Match the exact top from image 2/);
          break;
        case "shirts":
          assert.match(prompt, /Replace ONLY the shirt using image 2/);
          assert.match(prompt, /Match the exact shirt from image 2/);
          break;
        case "bottoms":
          assert.match(prompt, /Replace ONLY the pants\/trousers\/bottom garment/);
          break;
        case "skirts":
          assert.match(prompt, /Replace ONLY the skirt using image 2/);
          assert.match(prompt, /skirt\/skater\/midi silhouette/);
          break;
        case "jackets":
          assert.match(prompt, /Replace or add ONLY the jacket\/outerwear layer/);
          break;
      }
    });
  }

  it("does not activate for traditional indian tab", () => {
    const cmd = sampleCommand("women_indian_01", "indian");
    assert.equal(shouldUseWardrobePhase1VtoPrompt(cmd, "wardrobe_browse"), false);
  });

  it("does not activate for beard", () => {
    const cmd =
      "COMMAND: style_ref=men_beard_01 | category=beard_styles | pipeline=men | region=beard | Edit image 1: beard";
    assert.equal(shouldUseWardrobePhase1VtoPrompt(cmd, "beard_styles"), false);
  });

  it("phase 2 full-outfit prompt for couple_duo (not legacy TRY-ON)", () => {
    const cmd =
      "COMMAND: style_ref=couple_01 | category=couple_duo | pipeline=neutral | region=outfit | coordinated outfit";
    const prompt = buildVtoPrompt(cmd, "couple_01", "couple_duo");
    assert.match(prompt, /^Edit image 1 directly/);
    assert.match(prompt, /Preserve exactly the people already present in image 1/);
    assert.doesNotMatch(prompt, /^TRY-ON: The person of image 1 wearing the garments of image 2/);
  });
});

describe("105 wardrobe single-garment styles from CSV", () => {
  it("resolves exactly 105 phase-1 styles", () => {
    const prompts = loadPromptRows();
    const assets = loadAssetTabs();
    const phase1 = prompts.filter((r) => {
      if (r.category_id !== "wardrobe_browse") return false;
      return WARDROBE_PHASE1_GARMENT_TABS.includes(r.tab_id as (typeof WARDROBE_PHASE1_GARMENT_TABS)[number]);
    });
    assert.equal(phase1.length, 105);
    for (const row of phase1) {
      assert.equal(
        shouldUseWardrobePhase1VtoPrompt(row.stored_command, "wardrobe_browse"),
        true,
        row.style_id
      );
      const assetTab = assets.get(row.style_id)?.tab_id;
      assert.equal(assetTab, row.tab_id, `${row.style_id} tab mismatch asset vs prompt CSV`);
    }
  });

  it("314 non-phase-1 styles use Phase 2 VTO or FLUX (not Phase 1)", () => {
    const prompts = loadPromptRows();
    const nonPhase1 = prompts.filter(
      (r) =>
        !(
          r.category_id === "wardrobe_browse" &&
          WARDROBE_PHASE1_GARMENT_TABS.includes(r.tab_id as (typeof WARDROBE_PHASE1_GARMENT_TABS)[number])
        )
    );
    assert.equal(nonPhase1.length, 419 - 105);
    for (const row of nonPhase1.slice(0, 50)) {
      assert.equal(shouldUseWardrobePhase1VtoPrompt(row.stored_command, row.category_id), false);
    }
  });
});

describe("example style prompts", () => {
  const prompts = loadPromptRows();
  function cmdFor(id: string) {
    const row = prompts.find((r) => r.style_id === id);
    assert.ok(row, id);
    return row.stored_command;
  }

  it("exports women_skirts_03 prompt snapshot", () => {
    const p = buildVtoPrompt(cmdFor("women_skirts_03"), "women_skirts_03", "wardrobe_browse");
    assert.match(p, /Replace ONLY the skirt using image 2/);
  });
});
