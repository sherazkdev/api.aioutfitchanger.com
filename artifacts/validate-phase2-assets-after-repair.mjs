/**
 * Post-repair validation (run after catalog PNGs updated — not required for Phase 2.3 plan-only).
 * Run: node artifacts/validate-phase2-assets-after-repair.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import { shouldUseWardrobePhase1VtoPrompt } from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";
import {
  COUPLE_DUO_PRODUCTION_STYLE_IDS,
  activeCoupleDuoGarmentPaths,
  isLegacyCombinedCoupleDuoUrl,
  resolveCoupleDuoGarmentImageUrl,
} from "../src/lib/server/bfl/coupleDuoGarmentRouting.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const MANIFEST = path.join(ROOT, "artifacts", "phase2-asset-repair-manifest.json");
const COUPLE_MAP = path.join(ROOT, "artifacts", "couple-duo-split-map.json");
const CROSS = path.join(ROOT, "artifacts", "phase2-cross-gender-repair-map.json");
const BAD_HASH_SNAPSHOT = path.join(ROOT, "artifacts", "phase2-bad-hash-snapshot.json");

function sha256File(fp) {
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

function loadPhase2StyleIds() {
  const assets = new Map();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 8) continue;
    assets.set(p[0], p[7].replace(/\.webp$/i, ".png"));
  }
  const ids = [];
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    const h = line.slice(0, idx).split(",");
    const cmd = line.slice(idx + 1);
    if (shouldUseWardrobePhase1VtoPrompt(cmd, h[1])) continue;
    if (!shouldUseVtoEngine(cmd, h[1])) continue;
    ids.push({ style_id: h[0], category: h[1], url: assets.get(h[0]) });
  }
  return ids;
}

function loadPhase1Paths() {
  const set = new Set();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 8) continue;
    if (p[1] !== "wardrobe_browse") continue;
    const tab = p[4];
    if (!["tops", "shirts", "bottoms", "skirts", "jackets"].includes(tab)) continue;
    set.add(path.join(ROOT, "public", p[7].replace(/\.webp$/i, ".png").replace(/^\//, "")));
  }
  return set;
}

const phase2 = loadPhase2StyleIds();
const phase1Paths = loadPhase1Paths();
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")).manifest : [];
const coupleMap = fs.existsSync(COUPLE_MAP) ? JSON.parse(fs.readFileSync(COUPLE_MAP, "utf8")) : {};
const cross = fs.existsSync(CROSS) ? JSON.parse(fs.readFileSync(CROSS, "utf8")) : { groups: [] };

const errors = [];
const warnings = [];

function productionGarmentUrls(row) {
  if (row.category === "couple_duo" && COUPLE_DUO_PRODUCTION_STYLE_IDS.includes(row.style_id)) {
    return activeCoupleDuoGarmentPaths(row.style_id);
  }
  return row.url ? [row.url.startsWith("/") ? row.url : `/${row.url}`] : [];
}

for (const row of phase2) {
  const urls = productionGarmentUrls(row);
  if (!urls.length) {
    errors.push({ type: "missing_reference", style_id: row.style_id, path: null });
    continue;
  }
  for (const url of urls) {
    const rel = url.replace(/^\//, "");
    const fp = path.join(ROOT, "public", rel);
    if (!fs.existsSync(fp)) errors.push({ type: "missing_reference", style_id: row.style_id, path: fp });
  }
}

for (const styleId of COUPLE_DUO_PRODUCTION_STYLE_IDS) {
  for (const gender of ["men", "women"]) {
    const url = resolveCoupleDuoGarmentImageUrl(styleId, gender);
    if (!url || (!url.includes("_male") && !url.includes("_female"))) {
      errors.push({ type: "couple_routing_invalid", style_id: styleId, gender, url });
      continue;
    }
    if (isLegacyCombinedCoupleDuoUrl(url, styleId)) {
      errors.push({ type: "couple_combined_selected", style_id: styleId, gender, url });
    }
    const fp = path.join(ROOT, "public", url.replace(/^\//, ""));
    if (!fs.existsSync(fp)) {
      errors.push({ type: "couple_split_missing", style_id: styleId, gender, path: fp });
    }
  }
}

function hashOnDiskMatches(url, expectedSha) {
  const fp = path.join(ROOT, "public", url.replace(/^\//, ""));
  if (!fs.existsSync(fp)) return false;
  return sha256File(fp) === expectedSha;
}

for (const [coupleId, slots] of Object.entries(coupleMap)) {
  for (const key of ["male", "female"]) {
    const url = slots[key];
    if (!url) continue;
    const fp = path.join(ROOT, "public", url.replace(/^\//, ""));
    if (!fs.existsSync(fp)) {
      warnings.push({ type: "couple_split_pending", couple: coupleId, slot: key, expected: fp });
    }
  }
}

if (fs.existsSync(BAD_HASH_SNAPSHOT)) {
  const snap = JSON.parse(fs.readFileSync(BAD_HASH_SNAPSHOT, "utf8"));
  for (const entry of snap.bad_hashes || []) {
    for (const style_id of entry.style_ids || []) {
      const row = phase2.find((r) => r.style_id === style_id);
      if (!row) continue;
      const urls = productionGarmentUrls(row);
      for (const url of urls) {
        const fp = path.join(ROOT, "public", url.replace(/^\//, ""));
        if (!fs.existsSync(fp)) continue;
        const hash = sha256File(fp);
        if (hash === entry.sha256) {
          errors.push({ type: "bad_hash_still_present", style_id, sha256: hash.slice(0, 16), path: url });
        }
      }
      if (
        row.category === "couple_duo" &&
        row.url &&
        isLegacyCombinedCoupleDuoUrl(row.url, style_id) &&
        hashOnDiskMatches(row.url, entry.sha256)
      ) {
        warnings.push({
          type: "couple_legacy_combined_archive_only",
          style_id,
          note: "Combined PNG retains legacy hash; production VTO routes to split assets",
        });
      }
    }
  }
} else {
  warnings.push({ type: "no_bad_hash_snapshot", note: "Run repair apply step to create phase2-bad-hash-snapshot.json before hash checks" });
}

for (const g of cross.groups || []) {
  if (!g.replace_for?.length || !g.keep_for?.length) continue;
  const menWomen = g.style_ids.some((id) => id.startsWith("men_")) && g.style_ids.some((id) => id.startsWith("women_"));
  if (!menWomen) continue;
  const hashes = new Set();
  for (const id of g.style_ids) {
    const row = phase2.find((r) => r.style_id === id);
    if (!row?.url) continue;
    const fp = path.join(ROOT, "public", row.url.replace(/^\//, ""));
    if (fs.existsSync(fp)) hashes.add(sha256File(fp));
  }
  if (hashes.size === 1 && g.replace_for.some((id) => fs.existsSync(path.join(ROOT, "public", (phase2.find((r) => r.style_id === id)?.url || "").replace(/^\//, ""))))) {
    warnings.push({ type: "cross_gender_duplicate_unresolved", sha256: g.sha256, style_ids: g.style_ids });
  }
}

for (const p1 of phase1Paths) {
  if (!fs.existsSync(p1)) errors.push({ type: "phase1_asset_missing", path: p1 });
}

const out = {
  phase2_count: phase2.length,
  phase2_count_expected: 258,
  errors,
  warnings,
  ok: errors.length === 0,
};

console.log(JSON.stringify(out, null, 2));
if (errors.length) process.exit(1);
