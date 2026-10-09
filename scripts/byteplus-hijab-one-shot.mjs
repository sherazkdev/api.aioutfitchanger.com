/**
 * Single BytePlus hijab identity test — women_hijab_04, production ref + backend prompt.
 * Run: npx tsx scripts/byteplus-hijab-one-shot.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { buildFluxEditPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import {
  buildBytePlusBeautyRequest,
  extractBytePlusResultUrl,
  formatBytePlusSize,
} from "../src/lib/server/byteplus/imageGeneration.ts";
import { byteplusPostImagesGenerations } from "../src/lib/server/byteplus/client.ts";
import { resetServerEnvCache } from "../src/lib/server/env.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "byteplus-comparison", "minimal-smoke", "hijab");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const MODEL = "dola-seedream-5-0-flash-260915";
const STYLE_ID = "women_hijab_04";
const CATEGORY_ID = "hijab_styles";

const PROBLEMATIC_SOURCE =
  process.env.HIJAB_TEST_SOURCE ||
  "C:/Users/shera/.cursor/projects/d-ai-outfit-changer/assets/c__Users_shera_AppData_Roaming_Cursor_User_workspaceStorage_f0ee8dd207d04ca26f6c49e764fa25c3_images_WhatsApp_Image_2026-10-08_at_10.10.53_AM-44e77a66-add1-4d10-a62e-b1eba7ad2868.jpg";
const REF_PATH = path.join(ROOT, "public", "media", "catalog", "hijab_styles", `${STYLE_ID}.png`);

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

if (!fs.existsSync(PROBLEMATIC_SOURCE)) {
  console.error("SOURCE_MISSING", PROBLEMATIC_SOURCE);
  process.exit(1);
}
if (!fs.existsSync(REF_PATH)) {
  console.error("REF_MISSING", REF_PATH);
  process.exit(1);
}

const sourcePath = path.join(OUT, "source.jpg");
const refOut = path.join(OUT, "reference.png");
fs.copyFileSync(PROBLEMATIC_SOURCE, sourcePath);
fs.copyFileSync(REF_PATH, refOut);

const meta = await sharp(sourcePath).metadata();
const srcW = meta.width ?? 768;
const srcH = meta.height ?? 1024;
const size = formatBytePlusSize(srcW, srcH);
const [outW, outH] = size.split("x").map(Number);
if (outW * outH < 921_600) {
  console.error("SIZE_INVALID", size);
  process.exit(1);
}

if (!process.env.ARK_API_KEY?.trim()) {
  console.error("ARK_API_KEY missing");
  process.exit(1);
}

const cmd = loadCmd(STYLE_ID);
const prompt = buildFluxEditPrompt(cmd, true);
const body = buildBytePlusBeautyRequest(
  {
    prompt,
    personDataUrl: toDataUrl(sourcePath),
    referenceDataUrl: toDataUrl(refOut),
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
  prompt_type: "buildFluxEditPrompt_production_hijab",
  source_origin: PROBLEMATIC_SOURCE,
  reference_origin: REF_PATH,
  reference_type: "ORIGINAL_catalog_png",
  size: body.size,
  output_pixels: outW * outH,
  source_pixels: `${srcW}x${srcH}`,
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
