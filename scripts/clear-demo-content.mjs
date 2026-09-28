/**
 * Remove auto-seeded demo catalog/feed/onboarding (keeps users, jobs, history).
 * Run on VPS: npm run clear:demo-content
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      process.env[k] = v.replace(/\\n/g, "\n");
    }
  }
}

loadEnv();
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

const collections = [
  "catalogcategories",
  "homefeedsections",
  "onboardingpages",
  "appmetadatas",
  "wardrobecategories",
];

await mongoose.connect(uri);
const db = mongoose.connection.db;
const out = {};
for (const name of collections) {
  try {
    const r = await db.collection(name).deleteMany({});
    out[name] = r.deletedCount;
  } catch (e) {
    out[name] = String(e.message || e);
  }
}
console.log(JSON.stringify({ ok: true, deleted: out }, null, 2));
await mongoose.disconnect();
