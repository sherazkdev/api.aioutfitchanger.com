import path from "path";
import { fileURLToPath } from "url";
import { backupAndReplace } from "./lib-phase2-replace.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const styleId = process.argv[2];
const sourceRel = process.argv[3];
if (!styleId || !sourceRel) {
  console.error("Usage: node artifacts/apply-partial-fix.mjs <style_id> <sourcePath>");
  process.exit(1);
}
const sourcePath = path.isAbsolute(sourceRel) ? sourceRel : path.join(ROOT, sourceRel);
const meta = {
  women_indian_01: {
    category: "wardrobe_browse",
    gender: "women",
    targetUrl: "/media/catalog/wardrobe_browse/women_indian_01.png",
    reason: "P0 partial fix: distinct slot-01 female indian reference (not _02 clone)",
    sourceLabel: sourceRel,
  },
};
const m = meta[styleId];
if (!m) throw new Error("unknown style " + styleId);
const r = backupAndReplace({ style_id: styleId, ...m, sourcePath });
console.log(JSON.stringify(r, null, 2));
