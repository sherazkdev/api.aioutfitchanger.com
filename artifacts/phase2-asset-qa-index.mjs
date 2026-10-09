import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { shouldUseVtoEngine } from "../src/lib/server/bfl/tryOnEngine.ts";
import { shouldUseWardrobePhase1VtoPrompt } from "../src/lib/server/bfl/wardrobePhase1VtoPrompt.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPT_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
const ASSET_CSV = path.join(ROOT, ".asset-requirements", ".new-requirements", "BACKEND_ASSET_CATALOG.csv");
const OUT_JSON = path.join(ROOT, "artifacts", "phase2-asset-qa-index.json");

const assets = new Map();
for (const line of fs.readFileSync(ASSET_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
  const p = line.split(",");
  if (p.length < 8) continue;
  assets.set(p[0], {
    style_id: p[0],
    category_id: p[1],
    gender: p[3] || "",
    tab_id: p[4] || "",
    image_url: p[7].replace(/\.webp$/i, ".png"),
  });
}

const phase2 = [];
for (const line of fs.readFileSync(PROMPT_CSV, "utf8").trim().split(/\r?\n/).slice(1)) {
  const idx = line.indexOf(",COMMAND:");
  if (idx < 0) continue;
  const h = line.slice(0, idx).split(",");
  const cmd = line.slice(idx + 1);
  const style_id = h[0];
  if (shouldUseWardrobePhase1VtoPrompt(cmd, h[1])) continue;
  if (!shouldUseVtoEngine(cmd, h[1])) continue;
  const a = assets.get(style_id) ?? {};
  phase2.push({
    style_id,
    category_id: h[1] || a.category_id,
    tab_id: h[2] || a.tab_id || "",
    gender: h[3] || a.gender || "",
    image_url: a.image_url || "",
  });
}

const hashToIds = new Map();
const rows = [];
for (const r of phase2) {
  const rel = (r.image_url || "").replace(/^\//, "");
  const fp = path.join(ROOT, "public", rel);
  const exists = fs.existsSync(fp);
  let sha256 = null;
  let bytes = 0;
  if (exists) {
    const buf = fs.readFileSync(fp);
    bytes = buf.length;
    sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    if (!hashToIds.has(sha256)) hashToIds.set(sha256, []);
    hashToIds.get(sha256).push(r.style_id);
  }
  rows.push({ ...r, local_file: fp, exists, sha256, bytes });
}

const duplicateGroups = [...hashToIds.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([sha256, style_ids]) => ({ sha256: sha256.slice(0, 16), style_ids: style_ids.sort() }));

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(
  OUT_JSON,
  JSON.stringify({ count: phase2.length, missing: rows.filter((r) => !r.exists).map((r) => r.style_id), duplicateGroups, rows }, null, 2)
);
console.log(JSON.stringify({ count: phase2.length, missing: rows.filter((r) => !r.exists).length, duplicateGroups: duplicateGroups.length }, null, 2));
