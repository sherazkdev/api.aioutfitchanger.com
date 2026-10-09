/**
 * BFL smoke test using production buildVtoPrompt + vto-v2 (same body as generate route VTO branch).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "wardrobe-phase1-smoke-test");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const PERSON_URL =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85";
const GARMENT_BASE = "https://appworkspro.com/media/catalog/wardrobe_browse";

const STYLES = ["women_skirts_03", "women_tops_03", "women_jackets_03", "men_shirts_03", "men_bottoms_03"];

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
  const lines = fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/);
  const line = lines.find((l) => l.startsWith(styleId + ","));
  if (!line) throw new Error("no csv " + styleId);
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
  return { started, poll, bodyKeys: Object.keys(body), endpoint: `${base}/v1/flux-tools/vto-v2` };
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });

const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
if (!key) {
  console.error("BFL_API_KEY missing");
  process.exit(3);
}

const personBuf = await fetchBuf(PERSON_URL);
fs.writeFileSync(path.join(OUT, "source-person.jpg"), personBuf);

const results = [];

for (const styleId of STYLES) {
  const dir = path.join(OUT, styleId);
  fs.mkdirSync(dir, { recursive: true });
  const stored = cmdFor(styleId);
  const prompt = buildVtoPrompt(stored, styleId, "wardrobe_browse");
  fs.writeFileSync(path.join(dir, "prompt.txt"), prompt);
  fs.writeFileSync(path.join(dir, "stored-command.txt"), stored);

  const garmentBuf = await fetchBuf(`${GARMENT_BASE}/${styleId}.png`);
  fs.writeFileSync(path.join(dir, "garment-reference.png"), garmentBuf);

  const run = await bflVtoV2({ key, base, prompt, personBuf, garmentBuf });
  fs.writeFileSync(
    path.join(dir, "bfl-metadata.json"),
    JSON.stringify(
      {
        style_id: styleId,
        category_id: "wardrobe_browse",
        engine: "BFL Virtual Try-On v2",
        endpoint: run.endpoint,
        job_id: run.started.id,
        polling_status: run.poll.status,
        prompt_length: prompt.length,
        bfl_start: run.started,
        bfl_poll: run.poll.raw ?? run.poll,
      },
      null,
      2
    )
  );

  if (run.poll.ok) {
    const sampleUrl = run.poll.sample;
    const resultBuf = await fetchBuf(sampleUrl);
    fs.writeFileSync(path.join(dir, "result.jpg"), resultBuf);
    results.push({ styleId, ok: true, sampleUrl });
  } else {
    results.push({ styleId, ok: false, error: run.poll.error });
  }
}

console.log(JSON.stringify({ outDir: OUT, results }, null, 2));
