/**
 * Phase 3 — 12 representative Beauty FLUX smokes (3 per region).
 * Run: npx tsx artifacts/phase3-beauty-flux-smoke.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildFluxPrompt, parseStyleCommand } from "../src/lib/server/bfl/promptBuilder.ts";
import { shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "phase3-beauty-flux-smoke");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");

const PERSON_MALE = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";
const PERSON_FEMALE = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85";

const PICKS = [
  { style_id: "men_hair_styles_02", person: "male" },
  { style_id: "women_hair_styles_04", person: "female" },
  { style_id: "men_hair_styles_07", person: "male" },
  { style_id: "men_hair_color_03", person: "male" },
  { style_id: "women_hair_color_05", person: "female" },
  { style_id: "men_hair_color_08", person: "male" },
  { style_id: "men_beard_03", person: "male" },
  { style_id: "men_beard_06", person: "male" },
  { style_id: "men_beard_09", person: "male" },
  { style_id: "women_hijab_02", person: "female" },
  { style_id: "women_hijab_05", person: "female" },
  { style_id: "women_hijab_08", person: "female" },
];

function loadCmd(styleId) {
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error("cmd " + styleId);
}

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

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
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
    if (st === "error" || st === "failed" || st === "request moderated") return { ok: false, error: JSON.stringify(poll.details ?? poll) };
  }
  return { ok: false, error: "timeout" };
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });
const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
const maleBuf = await fetchBuf(PERSON_MALE);
const femaleBuf = await fetchBuf(PERSON_FEMALE);
const results = [];

for (const pick of PICKS) {
  const cmd = loadCmd(pick.style_id);
  const parsed = parseStyleCommand(cmd);
  const category = parsed?.category ?? "hair_styles";
  const refPath = path.join(ROOT, "public", "media", "catalog", category, `${pick.style_id}.png`);
  const personBuf = pick.person === "female" ? femaleBuf : maleBuf;
  const flux = buildFluxPrompt(cmd, { hasReferenceStyle: true });
  const usesVto = shouldUseVtoEngine(cmd, category);
  const dir = path.join(OUT, pick.style_id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "prompt.txt"), flux);

  let bfl_ok = false;
  let error;
  if (!usesVto) {
    const body = {
      prompt: flux,
      input_image: toDataUrl(personBuf, "image/jpeg"),
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
    const poll = await bflPoll(started.polling_url, key);
    bfl_ok = poll.ok;
    error = poll.error;
    if (poll.ok) {
      const rb = await fetchBuf(poll.sample);
      fs.writeFileSync(path.join(dir, "result.jpg"), rb);
    }
  } else {
    error = "routed_to_vto_unexpected";
  }

  results.push({
    style_id: pick.style_id,
    region: parsed?.region,
    category_id: category,
    engine: usesVto ? "vto-v2" : "flux-2-pro",
    bfl_ok,
    error,
    grades_pending: bfl_ok,
  });
}

fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
