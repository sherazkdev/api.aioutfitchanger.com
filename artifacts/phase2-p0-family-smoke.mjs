/**
 * Single-family BFL smoke for P0 bulk. Usage: npx tsx artifacts/phase2-p0-family-smoke.mjs arabian
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVtoPrompt } from "../src/lib/server/bfl/tryOnEngine.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const family = process.argv[2];
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");

const REPS = {
  couple_duo: { style_id: "couple_02", category_id: "couple_duo", person: "male", garmentRel: "media/catalog/couple_duo/couple_02_male.png" },
  arabian: { style_id: "men_arabian_03", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_arabian_03.png" },
  indian: { style_id: "women_indian_02", category_id: "wardrobe_browse", person: "female", garmentRel: "media/catalog/wardrobe_browse/women_indian_02.png" },
  pakistani: { style_id: "men_pakistani_02", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_pakistani_02.png" },
  chinese: { style_id: "men_chinese_02", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_chinese_02.png" },
  korean: { style_id: "men_korean_02", category_id: "wardrobe_browse", person: "male", garmentRel: "media/catalog/wardrobe_browse/men_korean_02.png" },
  casual: { style_id: "men_casual_02", category_id: "occasions", person: "male", garmentRel: "media/catalog/occasions/men_casual_02.png" },
  formal: { style_id: "men_formal_02", category_id: "occasions", person: "male", garmentRel: "media/catalog/occasions/men_formal_02.png" },
  virtual_try_on: { style_id: "men_tryon_02", category_id: "virtual_try_on", person: "male", garmentRel: "media/catalog/virtual_try_on/men_tryon_02.png" },
  outfit_change: { style_id: "men_outfit_change_02", category_id: "outfit_change", person: "male", garmentRel: "media/catalog/outfit_change/men_outfit_change_02.png" },
};

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
  return null;
}

loadEnv();
const rep = REPS[family];
if (!rep) {
  console.log(JSON.stringify({ family, bfl_ok: false, error: "unknown family" }));
  process.exit(0);
}

const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
const personUrl =
  rep.person === "female"
    ? "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop&q=85"
    : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85";

const garmentPath = path.join(ROOT, "public", rep.garmentRel);
if (!fs.existsSync(garmentPath)) {
  console.log(JSON.stringify({ family, style_id: rep.style_id, bfl_ok: false, error: "missing garment" }));
  process.exit(0);
}

const personBuf = Buffer.from(await (await fetch(personUrl)).arrayBuffer());
const garmentBuf = fs.readFileSync(garmentPath);
const prompt = buildVtoPrompt(cmdFor(rep.style_id), rep.style_id, rep.category_id);
const res = await fetch(`${base}/v1/flux-tools/vto-v2`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-key": key },
  body: JSON.stringify({
    prompt,
    person: `data:image/jpeg;base64,${personBuf.toString("base64")}`,
    garment: `data:image/png;base64,${garmentBuf.toString("base64")}`,
    output_format: "jpeg",
  }),
});
const started = await res.json();
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 2500));
  const poll = await fetch(started.polling_url, { headers: { "x-key": key } }).then((r) => r.json());
  const st = (poll.status ?? "").toLowerCase();
  if ((st === "ready" || st === "done") && poll.result?.sample) {
    console.log(JSON.stringify({ family, style_id: rep.style_id, bfl_ok: true }));
    process.exit(0);
  }
  if (st === "error" || st === "failed") {
    console.log(JSON.stringify({ family, style_id: rep.style_id, bfl_ok: false, error: poll.details ?? poll }));
    process.exit(0);
  }
}
console.log(JSON.stringify({ family, style_id: rep.style_id, bfl_ok: false, error: "timeout" }));
