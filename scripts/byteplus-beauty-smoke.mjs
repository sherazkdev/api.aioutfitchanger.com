/**
 * Paid BytePlus beauty smoke + optional BFL comparison.
 * Run: node scripts/byteplus-beauty-smoke.mjs
 * Requires ARK_API_KEY in .env.local. Does NOT run in CI.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFluxEditPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import {
  buildBytePlusBeautyRequest,
  extractBytePlusResultUrl,
} from "../src/lib/server/byteplus/imageGeneration.ts";
import { byteplusPostImagesGenerations } from "../src/lib/server/byteplus/client.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "byteplus-comparison");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const SOURCES = path.join(ROOT, "artifacts", "external-source-tests", "sources-manifest.json");

const STYLES = [
  { style_id: "men_hair_styles_02", person: "male_src_1", category: "hair_styles" },
  { style_id: "men_hair_styles_07", person: "male_src_2", category: "hair_styles" },
  { style_id: "women_hijab_01", person: "hijab_src_1", category: "hijab_styles" },
  { style_id: "women_hijab_02", person: "hijab_src_1", category: "hijab_styles" },
  { style_id: "women_hijab_04", person: "hijab_src_2", category: "hijab_styles" },
  { style_id: "women_hijab_05", person: "hijab_src_2", category: "hijab_styles" },
  { style_id: "women_hijab_08", person: "hijab_src_3", category: "hijab_styles" },
  { style_id: "men_beard_03", person: "male_src_1", category: "beard_styles" },
  { style_id: "men_hair_color_03", person: "male_src_1", category: "hair_colors" },
];

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

function loadCmd(styleId) {
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error("cmd " + styleId);
}

function toDataUrl(filePath, mime = "image/jpeg") {
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function fetchToDataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get("content-type") || "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("download " + res.status);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });

const arkKey = process.env.ARK_API_KEY?.trim();
if (!arkKey) {
  console.error("SKIP: ARK_API_KEY not set — smoke not run");
  process.exit(0);
}

const model = process.env.ARK_MODEL || "dola-seedream-5-0-flash-260915";
const sources = JSON.parse(fs.readFileSync(SOURCES, "utf8"));
const sourceById = new Map(sources.map((s) => [s.id, s]));

const report = {
  run_at: new Date().toISOString(),
  model,
  provider: "byteplus",
  styles: [],
};

for (const pick of STYLES) {
  const cmd = loadCmd(pick.style_id);
  const prompt = buildFluxEditPrompt(cmd, true);
  const refPath = path.join(ROOT, "public", "media", "catalog", pick.category, `${pick.style_id}.png`);
  const src = sourceById.get(pick.person);
  let personDataUrl;
  if (src?.file && fs.existsSync(src.file)) {
    personDataUrl = toDataUrl(src.file);
  } else if (src?.url) {
    personDataUrl = await fetchToDataUrl(src.url);
  } else {
    throw new Error("source " + pick.person);
  }
  const referenceDataUrl = toDataUrl(refPath, "image/png");
  const body = buildBytePlusBeautyRequest(
    { prompt, personDataUrl, referenceDataUrl, width: 768, height: 1024 },
    model
  );

  const dir = path.join(OUT, pick.style_id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "prompt.txt"), prompt);
  fs.writeFileSync(
    path.join(dir, "request-meta.json"),
    JSON.stringify(
      {
        model: body.model,
        size: body.size,
        image_count: Array.isArray(body.image) ? body.image.length : 1,
        prompt_chars: prompt.length,
      },
      null,
      2
    )
  );

  const started = Date.now();
  let entry = { style_id: pick.style_id, ok: false, duration_ms: 0, grade: "INCONCLUSIVE" };
  try {
    const response = await byteplusPostImagesGenerations(body);
    const url = extractBytePlusResultUrl(response);
    if (!url) throw new Error("empty_result");
    entry.duration_ms = Date.now() - started;
    entry.ok = true;
    entry.result_url_host = new URL(url).host;
    await download(url, path.join(dir, "byteplus-result.jpg"));
    entry.grade = "NEEDS_MANUAL_REVIEW";
    entry.notes =
      "Score identity/face/clothes/bg manually. FAIL if different person. PASS if localized edit only.";
  } catch (e) {
    entry.duration_ms = Date.now() - started;
    entry.error = e instanceof Error ? e.message : String(e);
    entry.grade = "FAIL";
  }
  report.styles.push(entry);
  console.log(pick.style_id, entry.ok ? "ok" : "fail", entry.duration_ms + "ms");
}

const reportPath = path.join(OUT, "smoke-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log("Wrote", reportPath);
