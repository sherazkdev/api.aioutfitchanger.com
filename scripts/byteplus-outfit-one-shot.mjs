/**
 * Single paid BytePlus full-outfit generation — men_arabian_03 only.
 * Run: npx tsx scripts/byteplus-outfit-one-shot.mjs
 */
import fs from "fs";
import path from "path";
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
const OUT = path.join(ROOT, "artifacts", "byteplus-comparison", "minimal-smoke", "outfit");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const MODEL = "dola-seedream-5-0-flash-260915";
const STYLE_ID = "men_arabian_03";
const CATEGORY_ID = "wardrobe_browse";
const WIDTH = 768;
const HEIGHT = 1200;

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
const size = formatBytePlusSize(WIDTH, HEIGHT);
const [sw, sh] = size.split("x").map(Number);
if (sw * sh < 921_600) {
  console.error("SIZE_INVALID", size);
  process.exit(1);
}

const sourcePath = path.join(OUT, "source.jpg");
const refPath = path.join(OUT, "reference.png");
const cmd = loadCmd(STYLE_ID);
const prompt = buildVtoPrompt(cmd, STYLE_ID, CATEGORY_ID);
const body = buildBytePlusBeautyRequest(
  {
    prompt,
    personDataUrl: toDataUrl(sourcePath),
    referenceDataUrl: toDataUrl(refPath),
    width: WIDTH,
    height: HEIGHT,
  },
  MODEL
);

const meta = {
  provider: "byteplus",
  model: MODEL,
  style_id: STYLE_ID,
  category_id: CATEGORY_ID,
  prompt_type: "buildVtoPrompt_phase2_full_outfit",
  size: body.size,
  pixels: sw * sh,
  prompt_chars: prompt.length,
};
const started = Date.now();
try {
  const response = await byteplusPostImagesGenerations(body);
  meta.http_status = 200;
  meta.duration_ms = Date.now() - started;
  const resultUrl = extractBytePlusResultUrl(response);
  if (!resultUrl) throw new Error("empty_result");
  await downloadResult(resultUrl, path.join(OUT, "result.jpg"));
  meta.ok = true;
  fs.writeFileSync(path.join(OUT, "request-meta.json"), JSON.stringify(meta, null, 2));
  console.log(JSON.stringify({ ok: true, size: body.size, duration_ms: meta.duration_ms }));
} catch (e) {
  meta.duration_ms = Date.now() - started;
  meta.ok = false;
  meta.error = e instanceof Error ? e.message : String(e);
  const m = meta.error.match(/BYTEPLUS_GENERATE_FAILED:(\d+):/);
  meta.http_status = m ? Number(m[1]) : null;
  fs.writeFileSync(path.join(OUT, "request-meta.json"), JSON.stringify(meta, null, 2));
  console.log(JSON.stringify({ ok: false, error: meta.error, duration_ms: meta.duration_ms }));
  process.exit(1);
}
