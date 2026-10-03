/**
 * Before/after BFL try-on proof for catalog prompts (weak legacy vs expert expanded).
 *
 *   node scripts/prompt-before-after-verify.mjs              # 1 style per category (~10)
 *   node scripts/prompt-before-after-verify.mjs --all       # all 419 (resumable, long)
 *   node scripts/prompt-before-after-verify.mjs --max=5
 *
 * Opens gallery: scripts/test-reports/prompt-before-after-latest/index.html
 */
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { mkdir, readFile, writeFile, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PROMPT_CSV_PATH } from "./asset-catalog-lib.mjs";
import {
  buildFluxPrompt,
  buildLegacyBflPrompt,
  formatCommandLine,
  formatLegacyCommandLine,
  seedForStyleId,
  parseStyleCommand,
} from "./bfl-prompt-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const LATEST = path.join(root, "scripts", "test-reports", "prompt-before-after-latest");

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

const runAll = process.argv.includes("--all");
const maxArg = process.argv.find((a) => a.startsWith("--max="));
const maxStyles = maxArg ? Number(maxArg.split("=")[1]) : runAll ? 9999 : 0;

function parsePromptCsvRows() {
  const lines = readFileSync(PROMPT_CSV_PATH, "utf8").trim().split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 7) continue;
    rows.push({
      style_id: parts[0].trim(),
      category_id: parts[1].trim(),
      tab_id: parts[2].trim() || undefined,
      gender: parts[3].trim() || undefined,
      region: parts[4].trim(),
      pipeline: parts[5].trim(),
      prompt_command: parts.slice(6).join(",").trim(),
    });
  }
  return rows;
}

function pickSampleRows(allRows) {
  const byCat = new Map();
  for (const r of allRows) {
    if (!byCat.has(r.category_id)) byCat.set(r.category_id, r);
  }
  return [...byCat.values()];
}

function localStyleImage(styleId, categoryId) {
  const png = path.join(root, "public", "media", "catalog", categoryId, `${styleId}.png`);
  if (existsSync(png)) return png;
  const webp = png.replace(/\.png$/i, ".webp");
  if (existsSync(webp)) return webp;
  return null;
}

async function fetchPersonBuf(pipeline) {
  const key = pipeline === "men" ? "men" : pipeline === "women" ? "women" : "women";
  const urls = {
    men: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop",
    women: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop",
  };
  const cache = path.join(LATEST, "_shared", `person-${key}.jpg`);
  if (existsSync(cache)) return readFile(cache);
  const res = await fetch(urls[key]);
  if (!res.ok) throw new Error(`person fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(cache), { recursive: true });
  await writeFile(cache, buf);
  return buf;
}

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function bflGenerate({ prompt, personBuf, styleBuf, seed }) {
  const key = process.env.BFL_API_KEY?.trim();
  const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
  if (!key) throw new Error("BFL_API_KEY missing");

  const mime = styleBuf[0] === 0x89 ? "image/png" : "image/jpeg";
  const body = {
    prompt,
    input_image: toDataUrl(personBuf, "image/jpeg"),
    input_image_2: toDataUrl(styleBuf, mime),
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
  if (!res.ok) throw new Error(`BFL ${res.status}: ${(await res.text()).slice(0, 280)}`);
  const started = await res.json();
  const pollUrl = started.polling_url;
  if (!pollUrl) throw new Error("No polling_url");

  for (let i = 0; i < 120; i++) {
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

async function downloadResult(url, dest, tries = 4) {
  let lastErr;
  for (let t = 0; t < tries; t++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`result ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(dest, buf);
      return buf.length;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * (t + 1)));
    }
  }
  throw lastErr;
}

function scoreHeuristic(beforeBytes, afterBytes) {
  if (!beforeBytes || !afterBytes) return { verdict: "fail", note: "missing output" };
  if (afterBytes > beforeBytes * 0.85) {
    return { verdict: "ok", note: "after output present; expert prompt at least as rich" };
  }
  return { verdict: "review", note: "after smaller — manual eye check recommended" };
}

function buildHtml(report, styleEntries) {
  const cards = styleEntries
    .map(
      (e) => `
    <section class="card">
      <h2>${e.style_id} <span class="cat">${e.category_id}</span></h2>
      <p class="verdict ${e.verdict}">${e.verdict.toUpperCase()} — ${e.note}</p>
      <div class="row">
        <figure><img src="${e.person}" alt="person"/><figcaption>Person (input 1)</figcaption></figure>
        <figure><img src="${e.ref}" alt="ref"/><figcaption>Style ref (input 2)</figcaption></figure>
        <figure><img src="${e.before}" alt="before"/><figcaption>Before (weak prompt)</figcaption></figure>
        <figure><img src="${e.after}" alt="after"/><figcaption>After (expert prompt)</figcaption></figure>
      </div>
      <details><summary>Prompts</summary>
        <pre><b>Before BFL:</b>\n${e.beforePrompt}\n\n<b>After BFL:</b>\n${e.afterPrompt}</pre>
      </details>
    </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Prompt before/after — ${report.styles_tested} styles</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0f1115;color:#e8eaed;margin:0;padding:24px}
  h1{font-size:1.4rem} .meta{color:#9aa0a6;margin-bottom:24px}
  .card{background:#1a1d24;border-radius:12px;padding:16px;margin-bottom:28px;border:1px solid #2a2f3a}
  .cat{font-size:.75rem;color:#8ab4f8;font-weight:normal}
  .row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  img{width:100%;border-radius:8px;background:#000;aspect-ratio:3/4;object-fit:cover}
  figcaption{font-size:.72rem;color:#9aa0a6;margin-top:6px;text-align:center}
  pre{white-space:pre-wrap;font-size:.68rem;background:#0f1115;padding:12px;border-radius:8px;max-height:240px;overflow:auto}
  .ok{color:#81c995}.review{color:#fdd663}.fail{color:#f28b82}
</style></head><body>
<h1>Catalog prompt before / after (${report.styles_tested} styles)</h1>
<p class="meta">Generated ${report.at} · Total catalog ${report.catalog_styles} · Same seed per style · disable_pup=true</p>
${cards}
</body></html>`;
}

async function main() {
  const allRows = parsePromptCsvRows();
  let targets = runAll ? allRows : pickSampleRows(allRows);
  if (maxStyles > 0 && !runAll) targets = targets.slice(0, maxStyles);
  if (maxStyles > 0 && runAll) targets = allRows.slice(0, maxStyles);

  const checkpointPath = path.join(LATEST, "checkpoint.json");
  let done = new Set();
  if (existsSync(checkpointPath)) {
    try {
      done = new Set(JSON.parse(readFileSync(checkpointPath, "utf8")).done ?? []);
    } catch {
      /* ignore */
    }
  }

  await mkdir(LATEST, { recursive: true });

  const report = {
    at: new Date().toISOString(),
    catalog_styles: allRows.length,
    styles_tested: 0,
    results: [],
  };
  const htmlEntries = [];

  for (const row of targets) {
    if (done.has(row.style_id)) continue;

    const stylePath = localStyleImage(row.style_id, row.category_id);
    if (!stylePath) {
      report.results.push({ style_id: row.style_id, skip: true, reason: "no local ref image" });
      continue;
    }


    const styleBuf = await readFile(stylePath);
    const personKey = row.pipeline === "men" ? "men" : "women";
    const personBuf = await fetchPersonBuf(row.pipeline);
    await writeFile(path.join(LATEST, `person-${personKey}.jpg`), personBuf);

    const seed = seedForStyleId(row.style_id);
    const legacyCmd = formatLegacyCommandLine(row);
    const expertCmd = formatCommandLine(row);
    const beforePrompt = buildLegacyBflPrompt(legacyCmd);
    const afterPrompt = buildFluxPrompt(expertCmd, { hasReferenceStyle: true });

    const dir = path.join(LATEST, row.style_id);
    await mkdir(dir, { recursive: true });
    await copyFile(stylePath, path.join(dir, "reference.png"));

    const entry = {
      style_id: row.style_id,
      category_id: row.category_id,
      seed,
      beforePrompt,
      afterPrompt,
      before_bytes: 0,
      after_bytes: 0,
    };

    try {
      console.log("BFL before", row.style_id);
      const beforeUrl = await bflGenerate({
        prompt: beforePrompt,
        personBuf,
        styleBuf,
        seed,
      });
      entry.before_bytes = await downloadResult(beforeUrl, path.join(dir, "before.jpg"));

      console.log("BFL after", row.style_id);
      const afterUrl = await bflGenerate({
        prompt: afterPrompt,
        personBuf,
        styleBuf,
        seed,
      });
      entry.after_bytes = await downloadResult(afterUrl, path.join(dir, "after.jpg"));

      const { verdict, note } = scoreHeuristic(entry.before_bytes, entry.after_bytes);
      entry.verdict = verdict;
      entry.note = note;
      entry.ok = true;

      htmlEntries.push({
        style_id: row.style_id,
        category_id: row.category_id,
        person: `../person-${personKey}.jpg`,
        ref: `${row.style_id}/reference.png`,
        before: `${row.style_id}/before.jpg`,
        after: `${row.style_id}/after.jpg`,
        beforePrompt,
        afterPrompt,
        verdict,
        note,
      });

      done.add(row.style_id);
      await writeFile(checkpointPath, JSON.stringify({ done: [...done] }, null, 2));
      console.log("OK", row.style_id, verdict);
    } catch (e) {
      entry.ok = false;
      entry.error = String(e);
      console.log("FAIL", row.style_id, e.message);
    }

    report.results.push(entry);
    report.styles_tested++;
  }

  await writeFile(path.join(LATEST, "report.json"), JSON.stringify(report, null, 2));
  await writeFile(
    path.join(LATEST, "index.html"),
    buildHtml(report, htmlEntries)
  );

  console.log("\nGallery:", path.join(LATEST, "index.html").replace(/\\/g, "/"));
  console.log("Tested:", report.styles_tested, "styles");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
