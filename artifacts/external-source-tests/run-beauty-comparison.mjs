/**
 * Investigation: Hair + Hijab on fresh Unsplash sources — direct FLUX vs backend API.
 * Run: npx tsx artifacts/external-source-tests/run-beauty-comparison.mjs [apiBase]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFluxPrompt, parseStyleCommand } from "../../src/lib/server/bfl/promptBuilder.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)));
const CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const API_BASE = (process.argv[2] || "https://appworkspro.com").replace(/\/$/, "");

const SOURCES = [
  { id: "male_src_1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "male_src_2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "male_src_3", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "female_hair_src_1", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "female_hair_src_2", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "female_hair_src_3", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "hijab_src_1", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "hijab_src_2", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
  { id: "hijab_src_3", url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=768&h=1024&fit=crop&q=85", credit: "Unsplash" },
];

const HAIR_CASES = [
  { style_id: "men_hair_styles_02", category_id: "hair_styles", source: "male_src_1" },
  { style_id: "men_hair_styles_07", category_id: "hair_styles", source: "male_src_2" },
  { style_id: "men_hair_styles_03", category_id: "hair_styles", source: "male_src_3" },
  { style_id: "women_hair_styles_02", category_id: "hair_styles", source: "female_hair_src_1" },
  { style_id: "women_hair_styles_04", category_id: "hair_styles", source: "female_hair_src_2" },
  { style_id: "women_hair_styles_07", category_id: "hair_styles", source: "female_hair_src_3" },
];

const HIJAB_CASES = [
  { style_id: "women_hijab_04", category_id: "hijab_styles", source: "hijab_src_1" },
  { style_id: "women_hijab_05", category_id: "hijab_styles", source: "hijab_src_2" },
  { style_id: "women_hijab_08", category_id: "hijab_styles", source: "hijab_src_3" },
  { style_id: "women_hijab_02", category_id: "hijab_styles", source: "hijab_src_1" },
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
  for (const line of fs.readFileSync(CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error("cmd " + styleId);
}

function toDataUrl(buf, mime = "image/jpeg") {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function bflPoll(pollUrl, key) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const pollRes = await fetch(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if ((st === "ready" || st === "done") && poll.result?.sample) return { ok: true, sample: poll.result.sample };
    if (st === "error" || st === "failed" || st === "request moderated")
      return { ok: false, error: JSON.stringify(poll.details ?? poll) };
  }
  return { ok: false, error: "timeout" };
}

async function runDirectFlux({ style_id, category_id, personBuf, key, base, dir }) {
  const cmd = loadCmd(style_id);
  const flux = buildFluxPrompt(cmd, { hasReferenceStyle: true });
  const refPath = path.join(ROOT, "public", "media", "catalog", category_id, `${style_id}.png`);
  fs.writeFileSync(path.join(dir, "direct-prompt.txt"), flux);
  const body = {
    prompt: flux,
    input_image: toDataUrl(personBuf),
    input_image_2: toDataUrl(fs.readFileSync(refPath), "image/png"),
    width: 768,
    height: 1024,
    disable_pup: true,
  };
  const res = await fetch(`${base}/v1/flux-2-pro`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": key },
    body: JSON.stringify(body),
  });
  const started = await res.json();
  if (!started.polling_url) return { ok: false, error: JSON.stringify(started) };
  const poll = await bflPoll(started.polling_url, key);
  if (!poll.ok) return poll;
  const rb = await fetchBuf(poll.sample);
  fs.writeFileSync(path.join(dir, "result-direct.jpg"), rb);
  return { ok: true };
}

async function apiRegister() {
  const email = `beauty_cmp_${Date.now()}@example.com`;
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "TestPass123!", display_name: "Beauty Cmp" }),
  });
  const json = await res.json();
  return json.data?.access_token;
}

async function pollApiJob(token, jobId) {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const r = await fetch(`${API_BASE}/api/v1/try-on/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const j = await r.json();
    const st = j.data?.status;
    if (st === "completed" && j.data?.result_image_absolute_url) return { ok: true, url: j.data.result_image_absolute_url };
    if (st === "failed" || st === "cancelled") return { ok: false, error: j.data?.error ?? st };
  }
  return { ok: false, error: "timeout" };
}

async function runBackendApi({ style_id, category_id, personBuf, token, dir, person_gender }) {
  const res = await fetch(`${API_BASE}/api/v1/try-on/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      source_image_base64: toDataUrl(personBuf),
      style_id,
      category_id,
      person_gender,
      width: 768,
      height: 1024,
    }),
  });
  const json = await res.json();
  if (res.status !== 200 || !json.data?.job_id) {
    return { ok: false, error: JSON.stringify(json.error ?? json) };
  }
  fs.writeFileSync(path.join(dir, "api-job.json"), JSON.stringify(json.data, null, 2));
  const poll = await pollApiJob(token, json.data.job_id);
  if (!poll.ok) return poll;
  const rb = await fetchBuf(poll.url);
  fs.writeFileSync(path.join(dir, "result-api.jpg"), rb);
  return { ok: true };
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });
const key = process.env.BFL_API_KEY?.trim();
const bflBase = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
if (!key) {
  console.error("BFL_API_KEY required");
  process.exit(1);
}

const sourceManifest = [];
for (const s of SOURCES) {
  const buf = await fetchBuf(s.url);
  const fp = path.join(OUT, `${s.id}.jpg`);
  fs.writeFileSync(fp, buf);
  sourceManifest.push({ id: s.id, file: fp, url: s.url, credit: s.credit });
}
fs.writeFileSync(path.join(OUT, "sources-manifest.json"), JSON.stringify(sourceManifest, null, 2));

const sourceMap = new Map(sourceManifest.map((s) => [s.id, fs.readFileSync(s.file)]));
const token = await apiRegister();
if (!token) {
  console.error("API register failed");
  process.exit(2);
}

const results = [];

async function runCase(caseDef, kind) {
  const personBuf = sourceMap.get(caseDef.source);
  const slug = `${kind}_${caseDef.style_id}_${caseDef.source}`;
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(OUT, `${caseDef.source}.jpg`), path.join(dir, "source.jpg"));

  const gender = caseDef.style_id.startsWith("men_") ? "men" : "women";
  const direct = await runDirectFlux({
    style_id: caseDef.style_id,
    category_id: caseDef.category_id,
    personBuf,
    key,
    base: bflBase,
    dir,
  });
  const api = await runBackendApi({
    style_id: caseDef.style_id,
    category_id: caseDef.category_id,
    personBuf,
    token,
    dir,
    person_gender: gender,
  });

  results.push({
    kind,
    style_id: caseDef.style_id,
    category_id: caseDef.category_id,
    source: caseDef.source,
    direct_flux: direct,
    backend_api: api,
    dir: slug,
  });
  console.log(slug, "direct", direct.ok, "api", api.ok);
}

for (const c of HAIR_CASES) await runCase(c, "hair");
for (const c of HIJAB_CASES) await runCase(c, "hijab");

fs.writeFileSync(path.join(OUT, "run-results.json"), JSON.stringify(results, null, 2));
console.log("Wrote", path.join(OUT, "run-results.json"));
