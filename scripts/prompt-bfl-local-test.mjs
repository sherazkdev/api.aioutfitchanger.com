/**
 * Validate expanded BFL prompts for all catalog styles; optional live BFL sample runs.
 *
 *   node scripts/prompt-bfl-local-test.mjs
 *   node scripts/prompt-bfl-local-test.mjs --bfl --limit=3
 */
import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PROMPT_CSV_PATH } from "./asset-catalog-lib.mjs";
import {
  buildFluxPrompt,
  parseStyleCommand,
  seedForStyleId,
} from "./bfl-prompt-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function localStyleImagePath(styleId, promptCommand) {
  const parsed = parseStyleCommand(promptCommand);
  const category = parsed?.category ?? "virtual_try_on";
  const png = path.join(root, "public", "media", "catalog", category, `${styleId}.png`);
  if (existsSync(png)) return png;
  const webp = png.replace(/\.png$/i, ".webp");
  if (existsSync(webp)) return webp;
  return null;
}

function loadEnvFile(filename) {
  const envPath = path.join(root, filename);
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val.replace(/\\n/g, "\n");
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

const runBfl = process.argv.includes("--bfl");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const bflLimit = limitArg ? Number(limitArg.split("=")[1]) : 3;

function loadPromptRows() {
  const lines = readFileSync(PROMPT_CSV_PATH, "utf8").trim().split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 7) continue;
    const prompt_command = parts.slice(6).join(",").trim();
    rows.push({ style_id: parts[0].trim(), prompt_command });
  }
  return rows;
}

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FETCH ${url} ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function toDataUrl(buf, mime = "image/jpeg") {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function bflGenerate({ prompt, personBuf, styleBuf, seed }) {
  const key = process.env.BFL_API_KEY?.trim();
  const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
  if (!key) throw new Error("BFL_API_KEY missing");

  const body = {
    prompt,
    input_image: toDataUrl(personBuf, "image/jpeg"),
    input_image_2: toDataUrl(styleBuf, "image/png"),
    width: 768,
    height: 1024,
    disable_pup: true,
    seed,
  };

  const res = await fetch(`${base}/v1/flux-2-pro`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": key },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`BFL ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const started = await res.json();
  const pollUrl = started.polling_url;
  if (!pollUrl) throw new Error("No polling_url");

  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const pollRes = await fetch(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if (st === "ready" && poll.result?.sample) return poll.result.sample;
    if (st === "error" || st === "failed") throw new Error(JSON.stringify(poll.details ?? poll));
  }
  throw new Error("BFL poll timeout");
}

async function main() {
  const rows = loadPromptRows();
  const issues = [];
  const samples = [];
  let minLen = Infinity;
  let maxLen = 0;
  let totalLen = 0;

  for (const row of rows) {
    const parsed = parseStyleCommand(row.prompt_command);
    if (!parsed) {
      issues.push(`${row.style_id}: invalid COMMAND`);
      continue;
    }
    if (parsed.styleRef !== row.style_id) {
      issues.push(`${row.style_id}: style_ref mismatch`);
    }
    const flux = buildFluxPrompt(row.prompt_command, { hasReferenceStyle: true });
    const len = flux.length;
    minLen = Math.min(minLen, len);
    maxLen = Math.max(maxLen, len);
    totalLen += len;
    if (len < 180) issues.push(`${row.style_id}: flux prompt too short (${len})`);
    if (samples.length < 5) {
      samples.push({ style_id: row.style_id, flux_len: len, flux_hash: sha256(flux).slice(0, 16) });
    }
  }

  const report = {
    at: new Date().toISOString(),
    styles: rows.length,
    parse_ok: rows.length - issues.filter((i) => i.includes("invalid")).length,
    issues: issues.slice(0, 30),
    issue_count: issues.length,
    flux_prompt_chars: { min: minLen, max: maxLen, avg: Math.round(totalLen / rows.length) },
    samples,
    bfl_runs: [],
  };

  console.log("Prompt validation:", rows.length, "styles");
  console.log("Issues:", issues.length);
  console.log("Flux length avg:", report.flux_prompt_chars.avg, "chars");

  if (runBfl && issues.length === 0) {
    const outDir = path.join(root, "scripts", "test-reports", `prompt-bfl-${Date.now()}`);
    await mkdir(outDir, { recursive: true });
    const personBuf = await fetchBuf(
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop"
    );
    await writeFile(path.join(outDir, "person.jpg"), personBuf);

    const pick = [
      rows.find((r) => r.style_id.startsWith("men_beard_")),
      rows.find((r) => r.style_id.startsWith("women_hair_color_")),
      rows.find((r) => r.style_id.startsWith("men_pakistani_")),
      rows.find((r) => r.style_id === "men_tryon_01"),
      rows.find((r) => r.style_id.startsWith("women_hijab_")),
    ].filter(Boolean);

    for (const row of pick.slice(0, bflLimit)) {
      const localPath = localStyleImagePath(row.style_id, row.prompt_command);
      if (!localPath) {
        report.bfl_runs.push({ style_id: row.style_id, ok: false, error: "local style image missing" });
        continue;
      }
      const styleBuf = await readFile(localPath);
      const flux = buildFluxPrompt(row.prompt_command, { hasReferenceStyle: true });
      const seed = seedForStyleId(row.style_id);
      try {
        const resultUrl = await bflGenerate({ prompt: flux, personBuf, styleBuf, seed });
        const resultBuf = await fetchBuf(resultUrl);
        await writeFile(path.join(outDir, `${row.style_id}-result.jpg`), resultBuf);
        report.bfl_runs.push({
          style_id: row.style_id,
          ok: true,
          seed,
          flux_hash: sha256(flux).slice(0, 16),
          result_bytes: resultBuf.length,
        });
        console.log("BFL OK", row.style_id);
      } catch (e) {
        report.bfl_runs.push({ style_id: row.style_id, ok: false, error: String(e) });
        console.log("BFL FAIL", row.style_id, e.message);
      }
    }
    report.output_dir = outDir.replace(/\\/g, "/");
    await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
  }

  if (issues.length) {
    console.log(issues.slice(0, 10).join("\n"));
    process.exit(1);
  }
  console.log("PASS — all prompts parse and expand.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
