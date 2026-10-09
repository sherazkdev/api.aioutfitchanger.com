/**
 * One-off: men_shirts_03 BFL validation with male person fixture.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "wardrobe-phase1-smoke-test", "men_shirts_03");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
/** Male studio portrait (public domain Unsplash) — upright pose, dark background. */
const PERSON_URL =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";
const GARMENT_URL = "https://appworkspro.com/media/catalog/wardrobe_browse/men_shirts_03.png";
const STYLE_ID = "men_shirts_03";

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
  const line = fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/).find((l) => l.startsWith(styleId + ","));
  const idx = line.indexOf(",COMMAND:");
  return line.slice(idx + 1);
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
      return { ok: true, sample: poll.result.sample, status: st, raw: poll };
    }
    if (st === "error" || st === "failed" || st === "request moderated") {
      return { ok: false, error: JSON.stringify(poll.details ?? poll), status: st, raw: poll };
    }
  }
  return { ok: false, error: "poll_timeout" };
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });

const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
if (!key) {
  console.error("BFL_API_KEY missing");
  process.exit(3);
}

const stored = cmdFor(STYLE_ID);
const prompt = buildVtoPrompt(stored, STYLE_ID, "wardrobe_browse");
const personBuf = await fetchBuf(PERSON_URL);
const garmentBuf = await fetchBuf(GARMENT_URL);

fs.writeFileSync(path.join(OUT, "source-person.jpg"), personBuf);
fs.writeFileSync(path.join(OUT, "source-person-url.txt"), PERSON_URL);
fs.writeFileSync(path.join(OUT, "garment-reference.png"), garmentBuf);
fs.writeFileSync(path.join(OUT, "prompt.txt"), prompt);
fs.writeFileSync(path.join(OUT, "stored-command.txt"), stored);

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
if (!res.ok) {
  console.error(text.slice(0, 500));
  process.exit(4);
}
const started = JSON.parse(text);
const poll = await bflPoll(started.polling_url, key);

fs.writeFileSync(
  path.join(OUT, "bfl-metadata.json"),
  JSON.stringify(
    {
      style_id: STYLE_ID,
      category_id: "wardrobe_browse",
      validation: "male_person_final",
      person_source_url: PERSON_URL,
      garment_url: GARMENT_URL,
      engine: "BFL Virtual Try-On v2",
      endpoint: `${base}/v1/flux-tools/vto-v2`,
      job_id: started.id,
      prompt_from: "buildVtoPrompt (production tryOnEngine.ts)",
      bfl_start: started,
      bfl_poll: poll.raw ?? poll,
    },
    null,
    2
  )
);

if (!poll.ok) {
  console.error(poll.error);
  process.exit(5);
}

const resultBuf = await fetchBuf(poll.sample);
fs.writeFileSync(path.join(OUT, "result.jpg"), resultBuf);
console.log(JSON.stringify({ ok: true, out: OUT, sample: poll.sample }, null, 2));
