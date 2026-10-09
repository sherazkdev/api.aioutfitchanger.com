/**
 * Execute remaining P0 replacements: generate source (if needed), backup, apply, family smoke.
 * Run: node artifacts/execute-phase2-p0-remaining.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { backupAndReplace, loadLog, sha256File } from "./lib-phase2-replace.mjs";
import { generateRefPng } from "./generate-p0-ref-bfl.mjs";
import { spawnSync } from "child_process";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PENDING = path.join(ROOT, "artifacts", "p0-pending.json");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const REPORT = path.join(ROOT, "artifacts", "phase2-p0-bulk-report.json");
const SMOKE_REPORT = path.join(ROOT, "PHASE2_P0_BULK_SMOKE.md");

const FAMILY_REP = {
  couple_duo: { style_id: "couple_02", category_id: "couple_duo", person: "male", garmentRel: "media/catalog/couple_duo/couple_02_male.png" },
  arabian: { style_id: "men_arabian_03", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_arabian_03.png" },
  indian: { style_id: "women_indian_02", category_id: "wardrobe_browse", person: "female", garmentRel: "media/catalog/wardrobe_browse/women_indian_02.png" },
  pakistani: { style_id: "men_pakistani_02", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_pakistani_02.png" },
  chinese: { style_id: "men_chinese_02", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_chinese_02.png" },
  korean: { style_id: "men_korean_02", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_korean_02.png" },
  casual: { style_id: "men_casual_02", category_id: "occasions", person: "male", garmentRel: "media/catalog/occasions/men_casual_02.png" },
  formal: { style_id: "men_formal_02", category_id: "occasions", person: "male", garmentRel: "media/catalog/occasions/men_formal_02.png" },
  virtual_try_on: { style_id: "men_tryon_02", category_id: "virtual_try_on", person: "male", garmentRel: "media/catalog/virtual_try_on/men_tryon_02.png" },
  outfit_change: { style_id: "men_outfit_change_02", category_id: "outfit_change", person: "male", garmentRel: "media/catalog/outfit_change/men_outfit_change_02.png" },
};

const PERSON = {
  male: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85",
  female: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85",
};

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function cmdFor(styleId) {
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  return null;
}

function normalizeUrl(u) {
  return (u || "").replace(/^\/+/, "/").replace(/\/+/g, "/").replace(/^\/\//, "/");
}

function categoryFromBucket(bucket, item) {
  if (bucket === "couple_duo") return "couple_duo";
  if (["casual", "formal", "wedding"].includes(bucket)) return "occasions";
  if (bucket === "virtual_try_on") return "virtual_try_on";
  if (bucket === "outfit_change") return "outfit_change";
  return "wardrobe_browse";
}

function familySmoke(family) {
  const r = spawnSync("npx", ["tsx", path.join(ROOT, "artifacts", "phase2-p0-family-smoke.mjs"), family], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
  });
  try {
    const line = (r.stdout || "").trim().split("\n").pop();
    return JSON.parse(line);
  } catch {
    return { family, bfl_ok: false, error: r.stderr || r.stdout || "smoke failed" };
  }
}

const pending = JSON.parse(fs.readFileSync(PENDING, "utf8"));
const log = loadLog();
const done = new Set(log.filter((e) => e.status === "REPLACED").map((e) => e.style_id));

const byFamily = {};
for (const item of pending) {
  if (done.has(item.style_id)) continue;
  const fam = item.bucket;
  if (!byFamily[fam]) byFamily[fam] = [];
  byFamily[fam].push(item);
}

const report = { replaced: [], failed: [], stopped: false, family_smokes: [] };
let failStreak = 0;

const familyOrder = [
  "couple_duo",
  "arabian",
  "indian",
  "pakistani",
  "chinese",
  "korean",
  "casual",
  "formal",
  "virtual_try_on",
  "outfit_change",
];

for (const fam of familyOrder) {
  const items = byFamily[fam] || [];
  if (!items.length) continue;

  for (const item of items) {
    const sid = item.style_id;
    try {
      const srcPath = await generateRefPng(sid, { force: true });
      const targetUrl = normalizeUrl(item.target_file);
      const cat = categoryFromBucket(fam, item);
      const parentCombinedUrl =
        item.parent_style_id && fam === "couple_duo"
          ? `/media/catalog/couple_duo/${item.parent_style_id}.png`
          : undefined;
      const r = backupAndReplace({
        style_id: sid,
        category: cat,
        gender: item.gender,
        targetUrl,
        sourcePath: srcPath,
        reason: item.reason,
        sourceLabel: `bfl-generated:p0/${sid}.png`,
        parentCombinedUrl,
      });
      if (!r.ok) throw new Error(r.error);
      report.replaced.push(sid);
      failStreak = 0;
      fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
      console.log("REPLACED", sid, report.replaced.length);
    } catch (e) {
      const err = String(e.message ?? e);
      const transient = /fetch failed|ECONNRESET|ETIMEDOUT|poll_timeout/i.test(err);
      report.failed.push({ style_id: sid, error: err, transient });
      if (!transient) failStreak++;
      if (failStreak >= 3) {
        report.stopped = true;
        report.stop_reason = "3 consecutive non-transient failures";
        break;
      }
    }
  }

  if (report.stopped) break;

  const smoke = await familySmoke(fam);
  report.family_smokes.push(smoke);
  if (!smoke.bfl_ok) {
    report.stopped = true;
    report.stop_reason = `family smoke failed: ${fam}`;
    break;
  }
}

const remaining = pending.filter((p) => !loadLog().some((e) => e.status === "REPLACED" && e.style_id === p.style_id));
report.remaining_p0 = remaining.length;

fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

let md = `# Phase 2.4 P0 bulk execution\n\n**Remaining P0:** ${report.remaining_p0}\n\n## Family smokes\n\n| Family | style_id | BFL |\n|--------|----------|-----|\n`;
for (const s of report.family_smokes) {
  md += `| ${s.family} | ${s.style_id ?? "—"} | ${s.bfl_ok ? "PASS" : "FAIL"} |\n`;
}
fs.writeFileSync(SMOKE_REPORT, md);

console.log(JSON.stringify({ replaced: report.replaced.length, failed: report.failed.length, remaining: report.remaining_p0, stopped: report.stopped }, null, 2));
