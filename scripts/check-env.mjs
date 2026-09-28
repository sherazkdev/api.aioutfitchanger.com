/**
 * Validate .env.local for production API (same rules as server env).
 *   npm run check:env
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, ".env.local");

if (!existsSync(file)) {
  console.error("Missing .env.local");
  process.exit(1);
}

const env = {};
for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
}

const missing = [];
if (!env.MONGODB_URI) missing.push("MONGODB_URI");
if (!env.JWT_ACCESS_SECRET || env.JWT_ACCESS_SECRET.length < 32) {
  missing.push("JWT_ACCESS_SECRET (min 32 characters)");
}
if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.length < 32) {
  missing.push("JWT_REFRESH_SECRET (min 32 characters)");
}

if (missing.length) {
  console.error("Fix .env.local:\n - " + missing.join("\n - "));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, message: "Required server env present in .env.local" }));
