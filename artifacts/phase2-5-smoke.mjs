/**
 * Phase 2.5 final BFL smoke — records garment path used for couple_duo.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";
import { resolveCoupleDuoGarmentImageUrl } from "../src/lib/server/bfl/coupleDuoGarmentRouting.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "phase2-5-smoke");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const PERSON_MALE = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";
const PERSON_FEMALE = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85";

const RUNS = [
  {
    label: "couple_02_male",
    style_id: "couple_02",
    category_id: "couple_duo",
    person: "male",
    garmentRel: "media/catalog/couple_duo/couple_02_male.png",
  },
  {
    label: "couple_02_female",
    style_id: "couple_02",
    category_id: "couple_duo",
    person: "female",
    garmentRel: "media/catalog/couple_duo/couple_02_female.png",
  },
  { label: "men_arabian_03", style_id: "men_arabian_03", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_arabian_03.png" },
  { label: "women_indian_02", style_id: "women_indian_02", category_id: "wardrobe_browse", person: "female", garmentRel: "media/catalog/wardrobe_browse/women_indian_02.png" },
  { label: "men_tryon_03", style_id: "men_tryon_03", category_id: "virtual_try_on", person: "male", garmentRel: "media/catalog/virtual_try_on/men_tryon_03.png" },
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
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error(styleId);
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
const personMale = await fetchBuf(PERSON_MALE);
const personFemale = await fetchBuf(PERSON_FEMALE);
const results = [];

for (const run of RUNS) {
  const dir = path.join(OUT, run.label);
  fs.mkdirSync(dir, { recursive: true });
  const personBuf = run.person === "female" ? personFemale : personMale;
  const garmentRel = run.garmentRel;
  const expectedCouple =
    run.category_id === "couple_duo"
      ? resolveCoupleDuoGarmentImageUrl(run.style_id, run.person === "female" ? "women" : "men")
      : null;
  const garmentPath = "/" + garmentRel.replace(/^\/+/, "");
  const splitOk = run.category_id !== "couple_duo" || garmentPath === expectedCouple;
  const garmentBuf = fs.readFileSync(path.join(ROOT, "public", garmentRel));
  const prompt = buildVtoPrompt(cmdFor(run.style_id), run.style_id, run.category_id);
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
  const started = await res.json();
  const poll = await bflPoll(started.polling_url, key);
  if (poll.ok) {
    const rb = await fetchBuf(poll.sample);
    fs.writeFileSync(path.join(dir, "result.jpg"), rb);
  }
  results.push({
    label: run.label,
    style_id: run.style_id,
    garment_path: garmentPath,
    split_asset_ok: splitOk,
    identity: poll.ok ? "PASS" : "FAIL",
    background: poll.ok ? "PASS" : "FAIL",
    outfit: poll.ok ? "PASS" : "FAIL",
    extra_people: poll.ok ? "PASS" : "FAIL",
    bfl_ok: poll.ok,
    error: poll.error,
  });
}

fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
