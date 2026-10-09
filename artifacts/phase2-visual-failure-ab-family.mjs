/**
 * Phase 2 visual failure investigation — A/B prompts + 9 family smokes (no production changes).
 * Run: npx tsx artifacts/phase2-visual-failure-ab-family.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "artifacts", "phase2-visual-failure-tests");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const CDN = "https://appworkspro.com";
const PERSON_FEMALE =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85";
const PERSON_MALE =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";

const TARGETED_PROMPTS = {
  couple_01: `Edit image 1 only.

The people in image 1 are the ONLY people allowed in the result.

Preserve exactly the same number of people, identities, faces, bodies, poses, positions, camera view, lighting and background from image 1.

NEVER copy, add, generate or transfer any person from image 2.

Image 2 is clothing reference only.

Transfer only the clothing/style from image 2 onto the existing person or people in image 1.

Do not recreate the scene.
Photorealistic.`,

  men_arabian_01: `Edit only the clothing of the existing person in image 1.

Image 1 must remain the base image.

Preserve the exact face, hair, skin, body shape, body proportions, pose, hands, framing, camera angle, lighting and background from image 1.

Replace only the clothing with the outfit shown in image 2.

Image 2 is clothing reference only.
Do not copy the model, body, pose, environment or background from image 2.
Do not regenerate the full image.

Photorealistic.`,

  women_indian_01: `Keep the existing person and scene from image 1 unchanged.

Completely replace the visible original outfit with the clothing shown in image 2.

Do not leave visible parts of the original outfit where the reference outfit should replace them.

Use image 2 only for clothing appearance.
Do not copy the reference person's face, body, pose or background.

Preserve identity, body proportions, pose, hair, skin, camera, lighting and background from image 1.

Photorealistic.`,
};

const AB_STYLES = ["couple_01", "men_arabian_01", "women_indian_01"];

const FAMILY_STYLES = [
  { style_id: "couple_02", person: "male" },
  { style_id: "couple_03", person: "male" },
  { style_id: "couple_04", person: "male" },
  { style_id: "men_arabian_02", person: "male" },
  { style_id: "men_arabian_03", person: "male" },
  { style_id: "men_arabian_04", person: "male" },
  { style_id: "women_indian_02", person: "female" },
  { style_id: "women_indian_03", person: "female" },
  { style_id: "men_indian_01", person: "male" },
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
    prompts.set(head[0], { category_id: head[1], gender: head[3] || "", stored: line.slice(idx + 1) });
  }
  const assets = new Map();
  for (const line of fs.readFileSync(ASSET_CSV, "utf8").split(/\r?\n/).slice(1)) {
    const p = line.split(",");
    if (p.length < 8) continue;
    assets.set(p[0], {
      category_id: p[1],
      gender: p[3] || "",
      image_url: p[7].replace(/\.webp$/i, ".png"),
    });
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
      return { ok: true, sample: poll.result.sample, status: st };
    }
    if (st === "error" || st === "failed" || st === "request moderated") {
      return { ok: false, error: JSON.stringify(poll.details ?? poll), status: st };
    }
  }
  return { ok: false, error: "poll_timeout" };
}

async function bflVtoV2({ key, base, prompt, personBuf, garmentBuf, metaOut }) {
  const body = {
    prompt,
    person: toDataUrl(personBuf, "image/jpeg"),
    garment: toDataUrl(garmentBuf, "image/png"),
    output_format: "jpeg",
  };
  fs.writeFileSync(
    metaOut,
    JSON.stringify(
      {
        endpoint: `${base}/v1/flux-tools/vto-v2`,
        body_field_keys: Object.keys(body),
        prompt_length: prompt.length,
        person_bytes: personBuf.length,
        garment_bytes: garmentBuf.length,
        note: "person/garment sent as data URLs; same shape as generate route VTO branch",
      },
      null,
      2
    )
  );
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

async function runStyle({
  key,
  base,
  styleId,
  categoryId,
  stored,
  prompt,
  personBuf,
  garmentUrl,
  outDir,
  label,
}) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "prompt.txt"), prompt);
  const garmentBuf = await fetchBuf(garmentUrl);
  fs.writeFileSync(path.join(outDir, "garment-reference.png"), garmentBuf);
  fs.writeFileSync(path.join(outDir, "source-person.jpg"), personBuf);
  const run = await bflVtoV2({
    key,
    base,
    prompt,
    personBuf,
    garmentBuf,
    metaOut: path.join(outDir, "bfl-request-meta.json"),
  });
  fs.writeFileSync(
    path.join(outDir, "bfl-job.json"),
    JSON.stringify({ style_id: styleId, label, job_id: run.started.id, poll: run.poll }, null, 2)
  );
  if (run.poll.ok) {
    const resultBuf = await fetchBuf(run.poll.sample);
    fs.writeFileSync(path.join(outDir, "result.jpg"), resultBuf);
  }
  return { styleId, label, bfl_ok: run.poll.ok, error: run.poll.error };
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
const results = { ab: [], family: [] };

for (const styleId of AB_STYLES) {
  const meta = prompts.get(styleId);
  const asset = assets.get(styleId);
  const personBuf = styleId.startsWith("women_") ? personFemale : personMale;
  const garmentUrl = `${CDN}${asset.image_url.startsWith("/") ? asset.image_url : `/${asset.image_url}`}`;
  const promptA = buildVtoPrompt(meta.stored, styleId, meta.category_id);
  const promptB = TARGETED_PROMPTS[styleId];

  const smokeA = path.join(ROOT, "artifacts", "full-outfit-phase2-smoke-test", styleId, "result.jpg");
  const dirA = path.join(OUT, "ab", styleId, "A_current");
  const dirB = path.join(OUT, "ab", styleId, "B_targeted");
  fs.mkdirSync(dirA, { recursive: true });
  fs.writeFileSync(path.join(dirA, "prompt.txt"), promptA);
  if (fs.existsSync(smokeA)) {
    fs.copyFileSync(smokeA, path.join(dirA, "result.jpg"));
  }

  const rB = await runStyle({
    key,
    base,
    styleId,
    categoryId: meta.category_id,
    stored: meta.stored,
    prompt: promptB,
    personBuf,
    garmentUrl,
    outDir: dirB,
    label: "B_targeted",
  });
  results.ab.push({ styleId, promptA_len: promptA.length, promptB_len: promptB.length, B: rB });
}

for (const item of FAMILY_STYLES) {
  const { style_id: styleId, person } = item;
  const meta = prompts.get(styleId);
  const asset = assets.get(styleId);
  const personBuf = person === "female" ? personFemale : personMale;
  const garmentUrl = `${CDN}${asset.image_url.startsWith("/") ? asset.image_url : `/${asset.image_url}`}`;
  const prompt = buildVtoPrompt(meta.stored, styleId, meta.category_id);
  const outDir = path.join(OUT, "family", styleId);
  const r = await runStyle({
    key,
    base,
    styleId,
    categoryId: meta.category_id,
    stored: meta.stored,
    prompt,
    personBuf,
    garmentUrl,
    outDir,
    label: "family_current_phase2",
  });
  results.family.push({ ...r, person, catalog_gender: asset.gender, category: meta.category_id });
}

fs.writeFileSync(path.join(OUT, "run-results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
