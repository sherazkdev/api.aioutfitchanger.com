import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
for (const f of [".env.local", ".env"]) {
  const p = path.join(root, f);
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

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log(JSON.stringify({ error: "NO_MONGODB_URI" }));
  process.exit(0);
}

const start = new Date("2026-10-07T08:30:00.000Z");
const end = new Date("2026-10-07T09:30:00.000Z");

await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
const col = mongoose.connection.db.collection("tryonjobs");
const jobs = await col
  .find({ createdAt: { $gte: start, $lte: end } })
  .sort({ createdAt: -1 })
  .limit(100)
  .toArray();
console.log(
  JSON.stringify(
    {
      window: { start: start.toISOString(), end: end.toISOString() },
      count: jobs.length,
      jobs: jobs.map((j) => ({
        id: String(j._id),
        styleId: j.styleId,
        categoryId: j.categoryId,
        status: j.status,
        createdAt: j.createdAt,
        externalJobId: j.externalJobId,
        resultUrl: j.resultUrl ? "[present]" : null,
      })),
    },
    null,
    2
  )
);
await mongoose.disconnect();
