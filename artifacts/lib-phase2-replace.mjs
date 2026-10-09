import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BACKUP = path.join(ROOT, "artifacts", "phase2-original-assets-backup");
export const LOG_OUT = path.join(ROOT, "artifacts", "phase2-replacement-log.json");

export function sha256File(fp) {
  return crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex");
}

export function loadLog() {
  if (!fs.existsSync(LOG_OUT)) return [];
  return JSON.parse(fs.readFileSync(LOG_OUT, "utf8"));
}

export function saveLog(log) {
  fs.writeFileSync(LOG_OUT, JSON.stringify(log, null, 2));
}

export function publicPathFromUrl(url) {
  const u = (url || "").replace(/^\/+/, "").replace(/\\/g, "/");
  return path.join(ROOT, "public", u);
}

export function backupAndReplace({
  style_id,
  category,
  gender,
  targetUrl,
  sourcePath,
  reason,
  sourceLabel,
  parentCombinedUrl,
}) {
  const target = publicPathFromUrl(targetUrl);
  if (!fs.existsSync(sourcePath)) {
    return { ok: false, error: `missing source ${sourcePath}` };
  }
  const cat = category || "misc";
  fs.mkdirSync(path.join(BACKUP, cat), { recursive: true });

  let oldSha = null;
  if (!fs.existsSync(target)) {
    if (!parentCombinedUrl) {
      return { ok: false, error: `missing target ${target}` };
    }
    const parent = publicPathFromUrl(parentCombinedUrl);
    if (!fs.existsSync(parent)) {
      return { ok: false, error: `missing parent combined plate ${parent}` };
    }
    const parentBackup = path.join(BACKUP, cat, path.basename(parent));
    if (!fs.existsSync(parentBackup)) {
      fs.copyFileSync(parent, parentBackup);
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    oldSha = null;
  } else {
    const backupDest = path.join(BACKUP, cat, path.basename(target));
    if (!fs.existsSync(backupDest)) {
      fs.copyFileSync(target, backupDest);
    }
    oldSha = sha256File(target);
  }
  fs.copyFileSync(sourcePath, target);
  const newSha = sha256File(target);
  const entry = {
    style_id,
    category,
    gender,
    old_file: targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`,
    old_sha256: oldSha,
    new_file: targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`,
    new_sha256: newSha,
    reason,
    source: sourceLabel,
    status: "REPLACED",
    replaced_at: new Date().toISOString(),
  };
  const log = loadLog();
  const idx = log.findIndex((e) => e.style_id === style_id && e.new_file === entry.new_file);
  if (idx >= 0) log[idx] = entry;
  else log.push(entry);
  saveLog(log);
  return { ok: true, entry };
}
