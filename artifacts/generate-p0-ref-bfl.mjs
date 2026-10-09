/**
 * Generate catalog reference PNG via BFL (prompt-only outfit model shot).
 * Run: node artifacts/generate-p0-ref-bfl.mjs --style_id=men_arabian_03
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "artifacts", "phase2-replacement-sources", "p0");

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

function promptForStyleId(styleId) {
  const slot = styleId.match(/_(\d+)(?:_(male|female))?$/)?.[1] ?? "01";
  const isCoupleMale = styleId.endsWith("_male");
  const isCoupleFemale = styleId.endsWith("_female");
  const base =
    "Professional e-commerce catalog photo, single person only, full body head to toe, standing front or mild 3/4, plain light beige studio background, soft even lighting, no text, no watermark, no props, no animals, no other people, photorealistic.";

  if (isCoupleMale || isCoupleFemale) {
    const couple = styleId.replace(/_(male|female)$/, "");
    const n = couple.replace("couple_", "");
    if (isCoupleMale) {
      return `${base} Adult man, coordinated couple look #${n}, smart formal outfit, unique color palette for pair ${n}.`;
    }
    return `${base} Adult woman, coordinated couple look #${n}, elegant formal dress, unique color palette for pair ${n}.`;
  }

  if (styleId.startsWith("men_arabian_")) {
    return `${base} Adult Middle Eastern man, Arabian traditional formal wear (thobe/bisht/ghutra), slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_arabian_")) {
    return `${base} Adult Middle Eastern woman, modest Arabian abaya/hijab formal outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_indian_")) {
    return `${base} Adult Indian man, traditional Indian festive outfit (kurta/sherwani), slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_indian_")) {
    if (styleId === "women_indian_01") {
      return `${base} Adult Indian woman, royal blue silk saree with wide gold zari border, matching short-sleeve blouse, pallu over left shoulder, full pleated skirt length visible head to toe, slot 01 unique design, not lehenga, not maroon.`;
    }
    return `${base} Adult Indian woman, traditional Indian outfit (saree/lehenga/anarkali), slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_pakistani_")) {
    return `${base} Adult Pakistani man, shalwar kameez formal outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_pakistani_")) {
    return `${base} Adult Pakistani woman, shalwar kameez / dupatta outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_chinese_")) {
    return `${base} Adult Chinese man, Chinese-inspired formal outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_chinese_")) {
    return `${base} Adult Chinese woman, Chinese-inspired qipao/cheongsam or formal dress, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_korean_")) {
    return `${base} Adult Korean man, modern Korean smart outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_korean_")) {
    return `${base} Adult Korean woman, modern Korean outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_casual_")) {
    return `${base} Adult man, casual daywear outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_casual_")) {
    return `${base} Adult woman, casual daywear outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_formal_")) {
    return `${base} Adult man, formal suit occasion outfit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_formal_")) {
    return `${base} Adult woman, formal occasion dress/suit, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_tryon_")) {
    return `${base} Adult man, complete casual full outfit for virtual try-on, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_tryon_")) {
    return `${base} Adult woman, complete casual full outfit for virtual try-on, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("men_outfit_change_")) {
    return `${base} Adult man, full replacement outfit ensemble, slot ${slot}, distinct design ${slot}.`;
  }
  if (styleId.startsWith("women_outfit_change_")) {
    return `${base} Adult woman, full replacement outfit ensemble, slot ${slot}, distinct design ${slot}.`;
  }
  return `${base} Adult model, full outfit, style ${styleId}.`;
}

async function fetchRetry(url, init, tries = 5) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      return res;
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw last;
}

async function bflPoll(pollUrl, key) {
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetchRetry(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if ((st === "ready" || st === "done") && poll.result?.sample) return poll.result.sample;
    if (st === "error" || st === "failed" || st === "request moderated") {
      throw new Error(JSON.stringify(poll.details ?? poll));
    }
  }
  throw new Error("poll_timeout");
}

export async function generateRefPng(styleId, { force = false } = {}) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPng = path.join(OUT_DIR, `${styleId}.png`);
  if (fs.existsSync(outPng) && !force) return outPng;

  loadEnv();
  const key = process.env.BFL_API_KEY?.trim();
  const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
  if (!key) throw new Error("BFL_API_KEY missing");

  const prompt = promptForStyleId(styleId);
  const body = {
    prompt,
    width: 768,
    height: 1024,
    output_format: "png",
  };
  const res = await fetchRetry(`${base}/v1/flux-2-pro`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": key },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`BFL ${res.status}: ${text.slice(0, 300)}`);
  const started = JSON.parse(text);
  const sampleUrl = await bflPoll(started.polling_url, key);
  const imgRes = await fetchRetry(sampleUrl);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await sharp(buf).png().toFile(outPng);
  return outPng;
}

const args = process.argv.slice(2);
const all = args.includes("--all");
const force = args.includes("--force");
const styleArg = args.find((a) => a.startsWith("--style_id="))?.split("=")[1];

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.includes("generate-p0-ref-bfl")) {
  if (styleArg) {
    const p = await generateRefPng(styleArg, { force });
    console.log("wrote", p);
  } else if (all) {
    const pending = JSON.parse(fs.readFileSync(path.join(ROOT, "artifacts", "p0-pending.json"), "utf8"));
    const report = { ok: [], fail: [] };
    for (const item of pending) {
      const sid = item.style_id;
      try {
        const p = await generateRefPng(sid, { force });
        report.ok.push(sid);
        console.log("OK", sid, p);
      } catch (e) {
        report.fail.push({ sid, error: String(e.message ?? e) });
        console.error("FAIL", sid, e.message ?? e);
      }
    }
    fs.writeFileSync(path.join(ROOT, "artifacts", "p0-bfl-gen-report.json"), JSON.stringify(report, null, 2));
  }
}
