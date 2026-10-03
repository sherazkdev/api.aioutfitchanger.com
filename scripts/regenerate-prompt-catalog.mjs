/**
 * Regenerate BACKEND_PROMPT_CATALOG_OPTIMIZED.csv with strong per-style COMMAND actions.
 *
 *   node scripts/regenerate-prompt-catalog.mjs
 *   npm run assets:sync
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PROMPT_CSV_PATH } from "./asset-catalog-lib.mjs";
import { formatCommandLine } from "./bfl-prompt-builder.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseCsvLine(line) {
  const parts = line.split(",");
  if (parts.length < 7) return null;
  return {
    style_id: parts[0].trim(),
    category_id: parts[1].trim(),
    tab_id: parts[2].trim() || undefined,
    gender: parts[3].trim() || undefined,
    region: parts[4].trim(),
    pipeline: parts[5].trim(),
  };
}

function main() {
  const raw = readFileSync(PROMPT_CSV_PATH, "utf8").trim();
  const lines = raw.split(/\r?\n/);
  const header = lines[0];
  const out = [header];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const row = parseCsvLine(line);
    if (!row) {
      console.warn("skip bad line", i + 1);
      continue;
    }
    const prompt_command = formatCommandLine(row);
    out.push(
      [
        row.style_id,
        row.category_id,
        row.tab_id ?? "",
        row.gender ?? "",
        row.region,
        row.pipeline,
        prompt_command,
      ].join(",")
    );
  }

  writeFileSync(PROMPT_CSV_PATH, `${out.join("\n")}\n`, "utf8");
  console.log("Wrote", out.length - 1, "prompts →", PROMPT_CSV_PATH);
  console.log("Next: npm run assets:sync  (then assets:seed-prompts on production)");
}

main();
