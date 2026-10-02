/**
 * Extract assets.zip → public/media/catalog, write seed JSON, optionally seed MongoDB.
 *
 *   npm run assets:sync          # media + generated JSON only
 *   npm run assets:seed          # sync + replace catalog/feed/wardrobe/onboarding in DB
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {
  ASSET_REQ,
  buildSeedPayload,
  ensureZipExtracted,
  loadCatalogRows,
  syncMediaFiles,
  GENERATED_JSON,
  enMap,
} from "./asset-catalog-lib.mjs";

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

const seedDb = process.argv.includes("--seed");

async function main() {
  console.log("Asset catalog install");
  console.log("  requirements:", ASSET_REQ);

  const rows = loadCatalogRows();
  console.log(`  CSV styles: ${rows.length}`);

  const extractDir = ensureZipExtracted();
  console.log("  extracted:", extractDir);

  const { copied, missing } = syncMediaFiles(rows, { extractDir });
  console.log(`  media copied: ${copied}, missing sources: ${missing}`);

  const payload = buildSeedPayload(rows);
  const withPrompts = payload.catalogCategories.reduce(
    (n, c) => n + (c.items?.filter((i) => i.promptCommand?.startsWith("COMMAND:")).length ?? 0),
    0
  );
  console.log(`  catalog items with optimized prompts: ${withPrompts}/${rows.length}`);
  writeFileSync(GENERATED_JSON, JSON.stringify(payload, null, 2), "utf8");
  console.log("  wrote:", GENERATED_JSON);

  if (!seedDb) {
    console.log("\nDone. Run with --seed to load MongoDB (npm run assets:seed).");
    return;
  }

  await loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing — set in .env.local for DB seed");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const collections = [
    { name: "catalogcategories", data: payload.catalogCategories },
    { name: "homefeedsections", data: payload.homeFeedSections },
    { name: "wardrobecategories", data: payload.wardrobeCategories },
  ];

  for (const { name, data } of collections) {
    const col = mongoose.connection.collection(name);
    const del = await col.deleteMany({});
    const ins = await col.insertMany(data);
    console.log(`  ${name}: replaced ${del.deletedCount}, inserted ${ins.insertedCount}`);
  }

  const onboardingCol = mongoose.connection.collection("onboardingpages");
  await onboardingCol.deleteMany({});
  await onboardingCol.insertMany(
    payload.onboardingPages.map((p) => ({
      ...p,
      sourceLocale: "en",
      titleLocalized: enMap(p.title),
      bodyLocalized: enMap(p.body),
    }))
  );
  console.log(`  onboardingpages: inserted ${payload.onboardingPages.length}`);

  await mongoose.disconnect();
  console.log("\nMongoDB seeded with asset catalog.");
  console.log("Reload the app to clear API cache: pm2 reload ai-outfit-changer");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
