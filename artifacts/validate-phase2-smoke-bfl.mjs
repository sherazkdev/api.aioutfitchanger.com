/**
 * Phase 2 BFL smoke — 10 representative full-outfit styles.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "full-outfit-phase2-smoke-test");
const REPORT = path.join(ROOT, "WARDROBE_PHASE2_SMOKE_TEST.md");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const CDN = "https://appworkspro.com";
const PERSON_FEMALE =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85";
const PERSON_MALE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";

const STYLES = [
  "women_indian_01",
  "men_arabian_01",
  "men_korean_01",
  "women_pakistani_01",
  "men_chinese_01",
  "women_formal_01",
  "men_preset_gym_01",
  "couple_01",
  "women_outfit_change_01",
  "men_tryon_01",
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

function loadMeta() {
  const prompts = new Map();
  for (const line of fs.readFileSync(PROMPT_CSV, "utf8").split(/\r?\n/).slice(1)) {
    const idx = line.indexOf(",COMMAND:");
    if (idx < 0) continue;
    const head = line.slice(0, idx).split(",");
    prompts.set(head[0], { category_id: head[1], stored: line.slice(idx + 1) });
  }
  const assets = new Map();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 8) continue;
    assets.set(p[0], p[7].replace(/\.webp$/i, ".png"));
  }
  return { prompts, assets };
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
  return { started, poll, endpoint: `${base}/v1/flux-tools/vto-v2` };
}

loadEnv();
fs.mkdirSync(OUT, { recursive: true });
const { prompts, assets } = loadMeta();

const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
if (!key) {
  console.error("BFL_API_KEY missing");
  process.exit(3);
}

const personFemale = await fetchBuf(PERSON_FEMALE);
const personMale = await fetchBuf(PERSON_MALE);
fs.writeFileSync(path.join(OUT, "source-person-female.jpg"), personFemale);
fs.writeFileSync(path.join(OUT, "source-person-male.jpg"), personMale);

const results = [];

for (const styleId of STYLES) {
  const meta = prompts.get(styleId);
  if (!meta) throw new Error("missing prompt " + styleId);
  const refPath = assets.get(styleId);
  if (!refPath) throw new Error("missing asset " + styleId);

  const dir = path.join(OUT, styleId);
  fs.mkdirSync(dir, { recursive: true });

  const isMen = styleId.startsWith("men_") || styleId === "couple_01";
  const personBuf = isMen ? personMale : personFemale;
  fs.copyFileSync(
    isMen ? path.join(OUT, "source-person-male.jpg") : path.join(OUT, "source-person-female.jpg"),
    path.join(dir, "source-person.jpg")
  );

  const prompt = buildVtoPrompt(meta.stored, styleId, meta.category_id);
  fs.writeFileSync(path.join(dir, "prompt.txt"), prompt);

  const garmentUrl = `${CDN}${refPath.startsWith("/") ? refPath : `/${refPath}`}`;
  const garmentBuf = await fetchBuf(garmentUrl);
  fs.writeFileSync(path.join(dir, "garment-reference.png"), garmentBuf);

  let run;
  try {
    run = await bflVtoV2({ key, base, prompt, personBuf, garmentBuf });
  } catch (e) {
    results.push({
      style_id: styleId,
      category_id: meta.category_id,
      bfl_ok: false,
      error: String(e.message ?? e),
      manual_checks: null,
    });
    continue;
  }

  fs.writeFileSync(
    path.join(dir, "bfl-metadata.json"),
    JSON.stringify(
      {
        style_id: styleId,
        category_id: meta.category_id,
        engine: "BFL Virtual Try-On v2 (Phase 2 prompt)",
        garment_url: garmentUrl,
        job_id: run.started.id,
        polling_status: run.poll.status,
        prompt_length: prompt.length,
      },
      null,
      2
    )
  );

  if (run.poll.ok) {
    const resultBuf = await fetchBuf(run.poll.sample);
    fs.writeFileSync(path.join(dir, "result.jpg"), resultBuf);
    results.push({
      style_id: styleId,
      category_id: meta.category_id,
      bfl_ok: true,
      result_path: path.relative(ROOT, path.join(dir, "result.jpg")),
      manual_checks: {
        identity: "review",
        face: "review",
        hair: "review",
        body_pose: "review",
        background: "review",
        no_new_person: "review",
        outfit_transferred: "review",
        not_recreated_person: "review",
      },
    });
  } else {
    results.push({
      style_id: styleId,
      category_id: meta.category_id,
      bfl_ok: false,
      error: run.poll.error,
      manual_checks: null,
    });
  }
}

fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));

let md = `# Phase 2 full-outfit BFL smoke test

**Generated:** ${new Date().toISOString()}  
**Output dir:** \`artifacts/full-outfit-phase2-smoke-test/\`

Manual visual review required for identity/outfit columns (automated = BFL job success only).

| style_id | category | BFL | identity | face | hair | pose/bg | no extra person | outfit | not new person |
|----------|----------|-----|----------|------|------|---------|-----------------|--------|----------------|
`;

for (const r of results) {
  const bfl = r.bfl_ok ? "PASS" : `FAIL: ${r.error?.slice(0, 40)}`;
  const rev = r.bfl_ok ? "review" : "—";
  md += `| ${r.style_id} | ${r.category_id} | ${bfl} | ${rev} | ${rev} | ${rev} | ${rev} | ${rev} | ${rev} | ${rev} |\n`;
}

md += `
## Per-style artifacts

`;

for (const r of results) {
  md += `- \`${r.style_id}\`: \`artifacts/full-outfit-phase2-smoke-test/${r.style_id}/\`\n`;
}

fs.writeFileSync(REPORT, md);
console.log(JSON.stringify({ outDir: OUT, report: REPORT, results }, null, 2));

if (results.some((r) => !r.bfl_ok)) process.exit(4);
