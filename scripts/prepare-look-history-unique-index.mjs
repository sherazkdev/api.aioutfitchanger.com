/**
 * Before deploy: remove duplicate (userId, tryOnJobId) rows so sparse unique index can build.
 *   node scripts/prepare-look-history-unique-index.mjs
 * Uses MONGODB_URI from .env.local (same as app).
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env.local");

function loadUri() {
  if (!existsSync(envFile)) throw new Error("Missing .env.local");
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith("MONGODB_URI=")) return t.slice("MONGODB_URI=".length).trim();
  }
  throw new Error("MONGODB_URI not in .env.local");
}

async function main() {
  const uri = loadUri();
  await mongoose.connect(uri);
  const col = mongoose.connection.collection("lookhistories");

  const dupGroups = await col
    .aggregate([
      { $match: { tryOnJobId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { userId: "$userId", tryOnJobId: "$tryOnJobId" },
          ids: { $push: { id: "$_id", createdAt: "$createdAt" } },
          n: { $sum: 1 },
        },
      },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();

  let removed = 0;
  for (const g of dupGroups) {
    const sorted = g.ids.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const keep = sorted[0].id;
    const drop = sorted.slice(1).map((x) => x.id);
    if (drop.length) {
      const r = await col.deleteMany({ _id: { $in: drop } });
      removed += r.deletedCount;
      console.log("deduped", g._id, "kept", String(keep), "removed", r.deletedCount);
    }
  }

  await col.createIndex(
    { userId: 1, tryOnJobId: 1 },
    { unique: true, sparse: true, name: "userId_1_tryOnJobId_1" }
  );

  console.log(JSON.stringify({ ok: true, duplicate_groups: dupGroups.length, removed }));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
