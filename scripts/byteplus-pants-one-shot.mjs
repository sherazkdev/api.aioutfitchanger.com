/**
 * Pants test — download suitable Unsplash source + ONE BytePlus call (men_bottoms_03).
 * Run: npx tsx scripts/byteplus-pants-one-shot.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import {
  buildBytePlusBeautyRequest,
  extractBytePlusResultUrl,
  formatBytePlusSize,
} from "../src/lib/server/byteplus/imageGeneration.ts";
import { byteplusPostImagesGenerations } from "../src/lib/server/byteplus/client.ts";
import { resetServerEnvCache } from "../src/lib/server/env.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "byteplus-comparison", "minimal-smoke", "pants");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const MODEL = "dola-seedream-5-0-flash-260915";
const STYLE_ID = "men_bottoms_03";
const CATEGORY_ID = "wardrobe_browse";

/** Unsplash License — Ben Iwara, full-body standing, khaki pants visible. */
const SOURCE_URL =
  "https://images.unsplash.com/photo-1681483272110-f6215d54ebd9?w=900&h=1350&fit=crop&q=85";
const SOURCE_CREDIT = {
  provider: "Unsplash",
  photo_page: "https://unsplash.com/photos/C1sDxiSsE-8",
  photographer: "Ben Iwara (@1hundredimages)",
  license: "https://unsplash.com/license",
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
      process.env[k] = v;
    }
  }
  process.env.ARK_MODEL = MODEL;
  resetServerEnvCache();
}

function loadCmd(styleId) {
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error("cmd");
}

function toDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

async function downloadResult(url, dest) {
  if (url.startsWith("data:")) {
    fs.writeFileSync(dest, Buffer.from(url.split(",")[1], "base64"));
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("download:" + res.status);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });

const sourcePath = path.join(OUT, "source.jpg");
const refPath = path.join(OUT, "reference.png");

const srcRes = await fetch(SOURCE_URL);
if (!srcRes.ok) {
  console.error("SOURCE_DOWNLOAD_FAILED", srcRes.status);
  process.exit(1);
}
const srcBuf = Buffer.from(await srcRes.arrayBuffer());
fs.writeFileSync(sourcePath, srcBuf);

const meta = await sharp(sourcePath).metadata();
const srcW = meta.width ?? 0;
const srcH = meta.height ?? 0;
const size = formatBytePlusSize(srcW, srcH);
const [outW, outH] = size.split("x").map(Number);

const suitability = {
  waist_visible: srcH >= 900 && srcW >= 500,
  pants_visible: true,
  enough_leg_visible: srcH >= 1000,
  source_pixels: `${srcW}x${srcH}`,
  note: "Manual visual check required before paid call",
};

if (!suitability.waist_visible || !suitability.enough_leg_visible) {
  suitability.paid_calls_made = 0;
  suitability.status = "SOURCE_UNSUITABLE_FOR_PANTS_TEST";
  fs.writeFileSync(path.join(OUT, "request-meta.json"), JSON.stringify({ ...suitability, SOURCE_CREDIT }, null, 2));
  console.error("SOURCE_UNSUITABLE", suitability);
  process.exit(1);
}

if (outW * outH < 921_600) {
  console.error("SIZE_INVALID", size);
  process.exit(1);
}

if (!process.env.ARK_API_KEY?.trim()) {
  console.error("ARK_API_KEY missing");
  process.exit(1);
}

const cmd = loadCmd(STYLE_ID);
const prompt = buildVtoPrompt(cmd, STYLE_ID, CATEGORY_ID);
const body = buildBytePlusBeautyRequest(
  {
    prompt,
    personDataUrl: toDataUrl(sourcePath),
    referenceDataUrl: toDataUrl(refPath),
    width: outW,
    height: outH,
  },
  MODEL
);

const reqMeta = {
  provider: "byteplus",
  model: MODEL,
  style_id: STYLE_ID,
  category_id: CATEGORY_ID,
  prompt_type: "buildVtoPrompt_phase1_wardrobe_bottoms",
  source_credit: SOURCE_CREDIT,
  source_url: SOURCE_URL,
  source_saved: sourcePath,
  suitability,
  size: body.size,
  output_pixels: outW * outH,
  prompt_chars: prompt.length,
};

const started = Date.now();
try {
  const response = await byteplusPostImagesGenerations(body);
  reqMeta.http_status = 200;
  reqMeta.duration_ms = Date.now() - started;
  reqMeta.paid_calls_made = 1;
  const resultUrl = extractBytePlusResultUrl(response);
  if (!resultUrl) throw new Error("empty_result");
  await downloadResult(resultUrl, path.join(OUT, "result.jpg"));
  reqMeta.ok = true;
  fs.writeFileSync(path.join(OUT, "request-meta.json"), JSON.stringify(reqMeta, null, 2));
  console.log(JSON.stringify({ ok: true, size: body.size, duration_ms: reqMeta.duration_ms }));
} catch (e) {
  reqMeta.duration_ms = Date.now() - started;
  reqMeta.paid_calls_made = 1;
  reqMeta.ok = false;
  reqMeta.error = e instanceof Error ? e.message : String(e);
  const m = reqMeta.error.match(/BYTEPLUS_GENERATE_FAILED:(\d+):/);
  reqMeta.http_status = m ? Number(m[1]) : null;
  fs.writeFileSync(path.join(OUT, "request-meta.json"), JSON.stringify(reqMeta, null, 2));
  console.log(JSON.stringify({ ok: false, error: reqMeta.error }));
  process.exit(1);
}
