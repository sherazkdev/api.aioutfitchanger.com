/**
 * Report how ai_outfit_changer.zip maps to BACKEND_ASSET_CATALOG.csv
 * Run: node scripts/ai-outfit-changer-zip-map.mjs
 */
import { loadCatalogRows } from "./asset-catalog-lib.mjs";
import { AI_OUTFIT_ZIP, summarizeNewZipMatches } from "./ai-outfit-changer-zip-sync.mjs";

const rows = loadCatalogRows();
const summary = summarizeNewZipMatches(rows);

if (!summary) {
  console.log("Missing", AI_OUTFIT_ZIP);
  process.exit(1);
}

console.log("Zip PNGs:", summary.zipPngs);
console.log("CSV rows with matching new art:", summary.mappedRows, "/", summary.totalRows);
console.log("By category:", summary.byCat);
console.log("\nUnmapped rows keep assets.zip art. Run npm run assets:sync to apply overlays.");
