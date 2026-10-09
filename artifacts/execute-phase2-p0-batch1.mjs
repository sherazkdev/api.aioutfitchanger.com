/**
 * Phase 2.4 P0 batch 1 — backup, couple split, apply replacements from sources dir.
 * Run: node artifacts/execute-phase2-p0-batch1.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BACKUP = path.join(ROOT, "artifacts", "phase2-original-assets-backup");
const SOURCES = path.join(ROOT, "artifacts", "phase2-replacement-sources");
const LOG_OUT = path.join(ROOT, "artifacts", "phase2-replacement-log.json");

const INPLACE = [
  { style_id: "men_arabian_01", category: "wardrobe_browse", gender: "men", rel: "media/catalog/wardrobe_browse/men_arabian_01.png", source: "men_arabian_01.png" },
  { style_id: "women_indian_01", category: "wardrobe_browse", gender: "women", rel: "media/catalog/wardrobe_browse/women_indian_01.png", source: "women_indian_01.png" },
  { style_id: "men_pakistani_01", category: "wardrobe_browse", gender: "men", rel: "media/catalog/wardrobe_browse/men_pakistani_01.png", source: "men_pakistani_01.png" },
  { style_id: "men_chinese_01", category: "wardrobe_browse", gender: "men", rel: "media/catalog/wardrobe_browse/men_chinese_01.png", source: "men_chinese_01.png" },
  { style_id: "men_korean_01", category: "wardrobe_browse", gender: "men", rel: "media/catalog/wardrobe_browse/men_korean_01.png", source: "men_korean_01.png" },
  { style_id: "men_casual_01", category: "occasions", gender: "men", rel: "media/catalog/occasions/men_casual_01.png", source: "men_casual_01.png" },
  { style_id: "men_formal_01", category: "occasions", gender: "men", rel: "media/catalog/occasions/men_formal_01.png", source: "men_formal_01.png" },
  { style_id: "men_tryon_01", category: "virtual_try_on", gender: "men", rel: "media/catalog/virtual_try_on/men_tryon_01.png", source: "men_tryon_01.png" },
];

function sha256File(fp) {
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

function backupFile(rel, category) {
  const src = path.join(ROOT, "public", rel);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const destDir = path.join(BACKUP, category);
  fs.mkdirSync(destDir, { recursive: true });
  const base = path.basename(rel);
  const dest = path.join(destDir, base);
  fs.copyFileSync(src, dest);
  return dest;
}

function appendLog(entry, log) {
  log.push({ ...entry, replaced_at: new Date().toISOString() });
}

async function splitCouple01(log) {
  const combined = path.join(ROOT, "public", "media/catalog/couple_duo/couple_01.png");
  const meta = await sharp(combined).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1536;
  const mid = Math.floor(w * 0.48);
  const maleOut = path.join(ROOT, "public", "media/catalog/couple_duo/couple_01_male.png");
  const femaleOut = path.join(ROOT, "public", "media/catalog/couple_duo/couple_01_female.png");

  backupFile("media/catalog/couple_duo/couple_01.png", "couple_duo");

  const maleBuf = await sharp(combined).extract({ left: 0, top: 0, width: mid, height: h }).png().toBuffer();
  const femaleBuf = await sharp(combined)
    .extract({ left: mid, top: 0, width: w - mid, height: h })
    .png()
    .toBuffer();

  const malePlain = await sharp(maleBuf)
    .flatten({ background: { r: 235, g: 228, b: 218 } })
    .png()
    .toBuffer();
  const femalePlain = await sharp(femaleBuf)
    .flatten({ background: { r: 235, g: 228, b: 218 } })
    .png()
    .toBuffer();

  fs.writeFileSync(maleOut, malePlain);
  fs.writeFileSync(femaleOut, femalePlain);

  appendLog(
    {
      style_id: "couple_01_male",
      category: "couple_duo",
      gender: "men",
      old_file: "/media/catalog/couple_duo/couple_01.png",
      old_sha256: sha256File(combined),
      new_file: "/media/catalog/couple_duo/couple_01_male.png",
      new_sha256: sha256File(maleOut),
      reason: "Split from couple_01 combined plate (left crop + plain fill)",
      source: "couple_01.png crop",
      status: "REPLACED",
    },
    log
  );
  appendLog(
    {
      style_id: "couple_01_female",
      category: "couple_duo",
      gender: "women",
      old_file: "/media/catalog/couple_duo/couple_01.png",
      old_sha256: sha256File(combined),
      new_file: "/media/catalog/couple_duo/couple_01_female.png",
      new_sha256: sha256File(femaleOut),
      reason: "Split from couple_01 combined plate (right crop + plain fill)",
      source: "couple_01.png crop",
      status: "REPLACED",
    },
    log
  );
}

function applyInplace(item, log) {
  const target = path.join(ROOT, "public", item.rel);
  const source = path.join(SOURCES, item.source);
  if (!fs.existsSync(source)) {
    appendLog(
      {
        style_id: item.style_id,
        category: item.category,
        gender: item.gender,
        old_file: "/" + item.rel.replace(/\\/g, "/"),
        old_sha256: fs.existsSync(target) ? sha256File(target) : null,
        new_file: "/" + item.rel.replace(/\\/g, "/"),
        new_sha256: null,
        reason: "Source missing in phase2-replacement-sources",
        source: item.source,
        status: "PENDING_SOURCE",
      },
      log
    );
    return false;
  }
  const oldSha = sha256File(target);
  backupFile(item.rel, item.category);
  fs.copyFileSync(source, target);
  const newSha = sha256File(target);
  appendLog(
    {
      style_id: item.style_id,
      category: item.category,
      gender: item.gender,
      old_file: "/" + item.rel.replace(/\\/g, "/"),
      old_sha256: oldSha,
      new_file: "/" + item.rel.replace(/\\/g, "/"),
      new_sha256: newSha,
      reason: "P0 batch1 wrong-gender / scene fix",
      source: `artifacts/phase2-replacement-sources/${item.source}`,
      status: "REPLACED",
    },
    log
  );
  return true;
}

const log = fs.existsSync(LOG_OUT) ? JSON.parse(fs.readFileSync(LOG_OUT, "utf8")) : [];

await splitCouple01(log);
let applied = 2;
for (const item of INPLACE) {
  if (applyInplace(item, log)) applied++;
}

fs.writeFileSync(LOG_OUT, JSON.stringify(log, null, 2));
console.log(JSON.stringify({ applied, log_entries: log.length }, null, 2));
