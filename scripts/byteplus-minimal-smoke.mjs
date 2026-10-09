/**
 * Minimal paid BytePlus smoke — EXACTLY 3 generations (hair, outfit, pants).
 * Calls BytePlus API directly (not BFL). Does not use production try-on routing.
 * Run: npx tsx scripts/byteplus-minimal-smoke.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFluxEditPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import { buildBytePlusBeautyRequest, extractBytePlusResultUrl } from "../src/lib/server/byteplus/imageGeneration.ts";
import { byteplusPostImagesGenerations } from "../src/lib/server/byteplus/client.ts";
import { resetServerEnvCache } from "../src/lib/server/env.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = path.join(ROOT, "artifacts", "byteplus-comparison", "minimal-smoke");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const MODEL = "dola-seedream-5-0-flash-260915";
const PROVIDER = "byteplus";

const CASES = [
  {
    key: "hair",
    style_id: "men_hair_styles_02",
    category_id: "hair_styles",
    refRel: "public/media/catalog/hair_styles/men_hair_styles_02.png",
    promptFn: (cmd) => buildFluxEditPrompt(cmd, true),
    routing_note: "Beauty FLUX prompt (production buildFluxEditPrompt)",
  },
  {
    key: "outfit",
    style_id: "men_arabian_03",
    category_id: "wardrobe_browse",
    refRel: "public/media/catalog/wardrobe_browse/men_arabian_03.png",
    promptFn: (cmd, styleId, categoryId) => buildVtoPrompt(cmd, styleId, categoryId),
    routing_note: "Phase 2 full-outfit VTO prompt via buildVtoPrompt (API route still BFL-only for VTO)",
  },
  {
    key: "pants",
    style_id: "men_bottoms_03",
    category_id: "wardrobe_browse",
    refRel: "public/media/catalog/wardrobe_browse/men_bottoms_03.png",
    promptFn: (cmd, styleId, categoryId) => buildVtoPrompt(cmd, styleId, categoryId),
    routing_note: "Phase 1 wardrobe bottoms VTO prompt via buildVtoPrompt",
  },
];

const SOURCE = path.join(ROOT, "artifacts", "external-source-tests", "male_src_1.jpg");

function loadEnvFile() {
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
  process.env.TRY_ON_PROVIDER = "byteplus";
  resetServerEnvCache();
}

function loadCmd(styleId) {
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error("missing command for " + styleId);
}

function toDataUrl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

async function downloadResult(url, dest) {
  if (url.startsWith("data:")) {
    const b64 = url.split(",")[1];
    fs.writeFileSync(dest, Buffer.from(b64, "base64"));
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("download_failed:" + res.status);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

loadEnvFile();
if (!process.env.ARK_API_KEY?.trim()) {
  console.error("ARK_API_KEY missing — aborting without paid calls");
  process.exit(1);
}
if (!fs.existsSync(SOURCE)) {
  console.error("Missing source:", SOURCE);
  process.exit(1);
}

fs.mkdirSync(OUT_ROOT, { recursive: true });
const personDataUrl = toDataUrl(SOURCE);
const summary = [];

for (const caseDef of CASES) {
  const outDir = path.join(OUT_ROOT, caseDef.key);
  fs.mkdirSync(outDir, { recursive: true });

  const refPath = path.join(ROOT, caseDef.refRel);
  if (!fs.existsSync(refPath)) {
    summary.push({ ...caseDef, ok: false, error: "missing_reference", paid_attempt: false });
    console.error(caseDef.key, "SKIP missing ref", refPath);
    continue;
  }

  fs.copyFileSync(SOURCE, path.join(outDir, "source.jpg"));
  fs.copyFileSync(refPath, path.join(outDir, "reference.png"));

  const cmd = loadCmd(caseDef.style_id);
  const prompt =
    caseDef.key === "hair"
      ? caseDef.promptFn(cmd)
      : caseDef.promptFn(cmd, caseDef.style_id, caseDef.category_id);

  const body = buildBytePlusBeautyRequest(
    {
      prompt,
      personDataUrl,
      referenceDataUrl: toDataUrl(refPath),
      width: 768,
      height: 1024,
    },
    MODEL
  );

  const meta = {
    provider: PROVIDER,
    model: MODEL,
    style_id: caseDef.style_id,
    category_id: caseDef.category_id,
    routing_note: caseDef.routing_note,
    prompt_chars: prompt.length,
    image_order: ["person_source", "style_reference"],
    size: body.size,
    paid_attempt: true,
  };

  let entry = { key: caseDef.key, style_id: caseDef.style_id, ok: false, paid_attempt: true };
  const started = Date.now();
  try {
    const response = await byteplusPostImagesGenerations(body);
    const resultUrl = extractBytePlusResultUrl(response);
    if (!resultUrl) throw new Error("empty_result");
    meta.duration_ms = Date.now() - started;
    meta.result_url_host = resultUrl.startsWith("data:") ? "inline" : new URL(resultUrl).host;
    fs.writeFileSync(path.join(outDir, "request-meta.json"), JSON.stringify(meta, null, 2));
    await downloadResult(resultUrl, path.join(outDir, "result.jpg"));
    entry.ok = true;
    entry.duration_ms = meta.duration_ms;
    console.log(caseDef.key, "OK", meta.duration_ms + "ms");
  } catch (e) {
    meta.duration_ms = Date.now() - started;
    meta.error = e instanceof Error ? e.message : String(e);
    fs.writeFileSync(path.join(outDir, "request-meta.json"), JSON.stringify(meta, null, 2));
    entry.error = meta.error;
    console.error(caseDef.key, "FAIL", meta.error);
  }
  summary.push(entry);
}

const report = {
  run_at: new Date().toISOString(),
  provider: PROVIDER,
  model: MODEL,
  max_paid_generations: 3,
  cases: summary,
};
fs.writeFileSync(path.join(OUT_ROOT, "summary.json"), JSON.stringify(report, null, 2));
console.log("Wrote", path.join(OUT_ROOT, "summary.json"));
