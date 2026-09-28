import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localPath = path.join(root, ".env.local");
const examplePath = path.join(root, ".env.example");

function keysIn(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

const example = keysIn(readFileSync(examplePath, "utf8"));
const local = existsSync(localPath) ? keysIn(readFileSync(localPath, "utf8")) : new Map();
const added = [];

for (const [key, val] of example) {
  const current = local.get(key);
  if (current !== undefined && String(current).trim() !== "") continue;
  if (!String(val).trim()) continue;
  if (!existsSync(localPath)) writeFileSync(localPath, "", "utf8");
  appendFileSync(localPath, `${key}=${val}\n`);
  added.push(key);
}

console.log(JSON.stringify({ ok: true, added }));
