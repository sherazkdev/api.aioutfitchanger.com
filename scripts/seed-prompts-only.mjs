/**
 * Update only promptCommand on existing catalog styles (no delete/replace of collections).
 *
 *   npm run assets:seed-prompts
 *
 * Requires MONGODB_URI in .env or .env.local and
 * .asset-requirements/.new-requirements/BACKEND_PROMPT_CATALOG_OPTIMIZED.csv
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { loadPromptByStyleId, PROMPT_CSV_PATH } from "./asset-catalog-lib.mjs";

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

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error("MONGODB_URI missing — set in .env or .env.local");
    process.exit(1);
  }

  const prompts = loadPromptByStyleId();
  if (prompts.size === 0) {
    console.error(`No prompts loaded. Expected CSV at:\n  ${PROMPT_CSV_PATH}`);
    process.exit(1);
  }

  console.log("Prompt-only seed (catalog promptCommand fields only)");
  console.log("  CSV prompts:", prompts.size);
  console.log("  MongoDB:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"));

  await mongoose.connect(uri);
  const col = mongoose.connection.collection("catalogcategories");
  const categories = await col.find({}).toArray();

  let stylesUpdated = 0;
  let stylesSkippedSame = 0;
  let stylesNoCsv = 0;
  let categoriesTouched = 0;

  for (const cat of categories) {
    let dirty = false;
    const items = (cat.items ?? []).map((item) => {
      const next = prompts.get(item.id);
      if (!next) {
        stylesNoCsv++;
        return item;
      }
      if (item.promptCommand === next) {
        stylesSkippedSame++;
        return item;
      }
      stylesUpdated++;
      dirty = true;
      return { ...item, promptCommand: next };
    });

    if (dirty) {
      await col.updateOne({ _id: cat._id }, { $set: { items } });
      categoriesTouched++;
    }
  }

  await mongoose.disconnect();

  console.log("\nDone.");
  console.log("  categories updated:", categoriesTouched);
  console.log("  styles prompt updated:", stylesUpdated);
  console.log("  styles already correct:", stylesSkippedSame);
  console.log("  styles in DB without CSV row:", stylesNoCsv);
  console.log("\nReload app to clear API cache: pm2 reload ai-outfit-changer");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
