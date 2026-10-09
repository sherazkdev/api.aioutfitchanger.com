/**
 * BFL smoke for Phase 2.4 P0 batch 1 replacements (local PNGs).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "phase2-p0-batch1-smoke");
const REPORT = path.join(ROOT, "PHASE2_P0_REPLACEMENT_SMOKE_TEST.md");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const PERSON_FEMALE =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85";
const PERSON_MALE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";

const RUNS = [
  { style_id: "couple_01", category_id: "couple_duo", person: "male", garmentRel: "media/catalog/couple_duo/couple_01_male.png", note: "split asset (routing unchanged)" },
  { style_id: "men_arabian_01", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_arabian_01.png" },
  { style_id: "women_indian_01", category_id: "wardrobe_browse", person: "female", garmentRel: "media/catalog/wardrobe_browse/women_indian_01.png" },
  { style_id: "men_pakistani_01", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_pakistani_01.png" },
  { style_id: "men_chinese_01", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_chinese_01.png" },
  { style_id: "men_korean_01", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_korean_01.png" },
  { style_id: "men_casual_01", category_id: "occasions", person: "male", garmentRel: "media/catalog/occasions/men_casual_01.png" },
  { style_id: "men_formal_01", category_id: "occasions", person: "male", garmentRel: "media/catalog/occasions/men_formal_01.png" },
  { style_id: "men_tryon_01", category_id: "virtual_try_on", person: "male", garmentRel: "media/catalog/virtual_try_on/men_tryon_01.png" },
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

function cmdFor(styleId) {
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/).slice(1)) {
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    if (!line.startsWith(styleId + ",")) continue;
    return line.slice(idx + 1);
  }
  throw new Error("no cmd " + styleId);
}

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FETCH ${url} ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function bflPoll(pollUrl, key) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const pollRes = await fetch(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if ((st === "ready" || st === "done") && poll.result?.sample) {
      return { ok: true, sample: poll.result.sample, status: st };
    }
    if (st === "error" || st === "failed" || st === "request moderated") {
      return { ok: false, error: JSON.stringify(poll.details ?? poll), status: st };
    }
  }
  return { ok: false, error: "poll_timeout" };
}

async function bflVtoV2({ key, base, prompt, personBuf, garmentBuf }) {
  const body = {
    prompt,
    person: toDataUrl(personBuf, "image/jpeg"),
    garment: toDataUrl(garmentBuf, "image/png"),
    output_format: "jpeg",
  };
  const res = await fetch(`${base}/v1/flux-tools/vto-v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": key },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`BFL ${res.status}: ${text.slice(0, 400)}`);
  const started = JSON.parse(text);
  const poll = await bflPoll(started.polling_url, key);
  return { started, poll };
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });
const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
if (!key) {
  console.error("BFL_API_KEY missing");
  process.exit(3);
}

const personFemale = await fetchBuf(PERSON_FEMALE);
const personMale = await fetchBuf(PERSON_MALE);
const results = [];

for (const run of RUNS) {
  const dir = path.join(OUT, run.style_id);
  fs.mkdirSync(dir, { recursive: true });
  const personBuf = run.person === "female" ? personFemale : personMale;
  const garmentPath = path.join(ROOT, "public", run.garmentRel);
  const garmentBuf = fs.readFileSync(garmentPath);
  const stored = cmdFor(run.style_id);
  const prompt = buildVtoPrompt(stored, run.style_id, run.category_id);
  fs.writeFileSync(path.join(dir, "prompt.txt"), prompt);
  fs.writeFileSync(path.join(dir, "garment.png"), garmentBuf);

  let bfl_ok = false;
  let error = null;
  try {
    const out = await bflVtoV2({ key, base, prompt, personBuf, garmentBuf });
    if (out.poll.ok) {
      bfl_ok = true;
      const resultBuf = await fetchBuf(out.poll.sample);
      fs.writeFileSync(path.join(dir, "result.jpg"), resultBuf);
    } else error = out.poll.error;
  } catch (e) {
    error = String(e.message ?? e);
  }
  results.push({ ...run, bfl_ok, error });
}

fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
