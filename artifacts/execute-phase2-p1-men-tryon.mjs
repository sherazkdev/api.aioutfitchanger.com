/**
 * P1: replace men_tryon_02..05 with BFL studio refs.
 */
import path from "path";
import { fileURLToPath } from "url";
import { backupAndReplace } from "./lib-phase2-replace.mjs";
import { generateRefPng } from "./generate-p0-ref-bfl.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const IDS = ["men_tryon_02", "men_tryon_03", "men_tryon_04", "men_tryon_05"];

for (const style_id of IDS) {
  const srcPath = await generateRefPng(style_id, { force: true });
  const r = backupAndReplace({
    style_id,
    category: "virtual_try_on",
    gender: "men",
    targetUrl: `/media/catalog/virtual_try_on/${style_id}.png`,
    sourcePath: srcPath,
    reason: "P1: distinct male virtual_try_on studio ref (bad-hash clearance)",
    sourceLabel: `bfl-generated:p1/${style_id}.png`,
  });
  if (!r.ok) throw new Error(`${style_id}: ${r.error}`);
  console.log("REPLACED", style_id, r.entry.new_sha256);
}
