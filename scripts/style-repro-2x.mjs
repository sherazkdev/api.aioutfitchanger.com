/**
 * Per style: 2 BFL generations with SAME prompt + seed + inputs → compare byte-identical.
 *
 *   node scripts/style-repro-2x.mjs --all          # all 419 (resumable, hours)
 *   node scripts/style-repro-2x.mjs --all --max=20
 *
 * Output folder: scripts/test-reports/style-repro-2x-latest/
 *   STYLE_REPRO_RESULTS.csv  — one row per style
 *   report.json
 *   index.html               — run-a vs run-b gallery
 */
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { mkdir, readFile, writeFile, copyFile, appendFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PROMPT_CSV_PATH } from "./asset-catalog-lib.mjs";
import { buildFluxPrompt, formatCommandLine, seedForStyleId } from "./bfl-prompt-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const OUT = path.join(root, "scripts", "test-reports", "style-repro-2x-latest");
const CSV_OUT = path.join(OUT, "STYLE_REPRO_RESULTS.csv");

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
const maxStyles = maxArg ? Number(maxArg.split("=")[1]) : runAll ? 99999 : 15;

function sha256File(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

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
    });
  }
  return rows;
}

function localStyleImage(styleId, categoryId) {
  const png = path.join(root, "public", "media", "catalog", categoryId, `${styleId}.png`);
  if (existsSync(png)) return png;
  const webp = png.replace(/\.png$/i, ".webp");
  if (existsSync(webp)) return webp;
  return null;
}

const PERSON_URL = {
  men: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop",
  women: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop",
};

async function personBuf(pipeline) {
  const key = pipeline === "men" ? "men" : "women";
  const cache = path.join(OUT, "_shared", `person-${key}.jpg`);
  if (existsSync(cache)) return readFile(cache);
  const res = await fetch(PERSON_URL[key]);
  if (!res.ok) throw new Error(`person ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(cache), { recursive: true });
  await writeFile(cache, buf);
  return buf;
}

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function bflOnce({ prompt, person, style, seed }) {
  const key = process.env.BFL_API_KEY?.trim();
  const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
  if (!key) throw new Error("BFL_API_KEY missing");

  const styleMime = style[0] === 0x89 ? "image/png" : "image/jpeg";
  const body = {
    prompt,
    input_image: toDataUrl(person, "image/jpeg"),
    input_image_2: toDataUrl(style, styleMime),
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
  if (!res.ok) throw new Error(`BFL ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const started = await res.json();
  const pollUrl = started.polling_url;
  if (!pollUrl) throw new Error("no polling_url");

  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const pollRes = await fetch(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if ((st === "ready" || st === "done") && poll.result?.sample) return poll.result.sample;
    if (st === "error" || st === "failed") throw new Error(JSON.stringify(poll.details ?? poll));
  }
  throw new Error("poll timeout");
}

async function download(url, tries = 5) {
  let last;
  for (let t = 0; t < tries; t++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`dl ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 2000 * (t + 1)));
    }
  }
  throw last;
}

function buildHtml(rows) {
  const cards = rows
    .filter((r) => r.run_a && r.run_b)
    .map(
      (r) => `
    <section class="card ${r.identical ? "same" : "diff"}">
      <h2>${r.style_id} <span>${r.identical ? "✓ SAME bytes" : "✗ DIFFERENT"}</span></h2>
      <p class="meta">${r.category_id} · seed ${r.seed} · ${r.bytes_a} / ${r.bytes_b} bytes</p>
      <div class="pair">
        <figure><img src="${r.style_id}/run-a.jpg" alt="a"/><figcaption>Run A</figcaption></figure>
        <figure><img src="${r.style_id}/run-b.jpg" alt="b"/><figcaption>Run B</figcaption></figure>
      </div>
      <p class="hash">sha256 A: ${r.hash_a}<br/>sha256 B: ${r.hash_b}</p>
    </section>`
    )
    .join("\n");

  const same = rows.filter((r) => r.identical).length;
  const done = rows.filter((r) => r.status === "ok").length;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Style repro 2× — ${done} styles</title>
<style>
body{font-family:system-ui,sans-serif;background:#0d0f12;color:#eee;padding:20px}
.summary{background:#1a2332;padding:16px;border-radius:10px;margin-bottom:24px}
.card{background:#161920;border:1px solid #333;border-radius:10px;padding:14px;margin-bottom:20px}
.card.same{border-color:#3d8c4a}.card.diff{border-color:#c95c5c}
.card h2{font-size:1rem;margin:0 0 8px}.card h2 span{font-size:.75rem;margin-left:8px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:8px;background:#000}
.hash{font-size:.65rem;color:#888;word-break:break-all}
.meta{font-size:.8rem;color:#aaa}
</style></head><body>
<h1>2× same prompt + seed per style</h1>
<div class="summary">Completed: <b>${done}</b> / ${rows.length} catalog · Byte-identical pairs: <b>${same}</b> · CSV: STYLE_REPRO_RESULTS.csv</div>
${cards}
</body></html>`;
}

async function writeCsvHeader() {
  if (!existsSync(CSV_OUT)) {
    await writeFile(
      CSV_OUT,
      "style_id,category_id,seed,status,identical,hash_run_a,hash_run_b,bytes_a,bytes_b,error\n",
      "utf8"
    );
  }
}

async function appendCsv(row) {
  const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  await appendFile(
    CSV_OUT,
    [
      row.style_id,
      row.category_id,
      row.seed,
      row.status,
      row.identical ? "YES" : "NO",
      row.hash_a ?? "",
      row.hash_b ?? "",
      row.bytes_a ?? "",
      row.bytes_b ?? "",
      row.error ?? "",
    ]
      .map(esc)
      .join(",") + "\n",
    "utf8"
  );
}

async function rebuildManifestFromDisk(allRows) {
  const manifest = [];
  for (const row of allRows) {
    const dir = path.join(OUT, row.style_id);
    const a = path.join(dir, "run-a.jpg");
    const b = path.join(dir, "run-b.jpg");
    if (!existsSync(a) || !existsSync(b)) continue;
    const bufA = await readFile(a);
    const bufB = await readFile(b);
    const hash_a = sha256File(bufA);
    const hash_b = sha256File(bufB);
    manifest.push({
      style_id: row.style_id,
      category_id: row.category_id,
      seed: seedForStyleId(row.style_id),
      status: "ok",
      identical: hash_a === hash_b,
      hash_a,
      hash_b,
      bytes_a: bufA.length,
      bytes_b: bufB.length,
      run_a: true,
      run_b: true,
    });
  }
  return manifest;
}

async function main() {
  if (!runAll && !process.argv.find((a) => a.startsWith("--max="))) {
    console.log("Default: first 15 styles. Use --all for full 419.");
  }

  const allRows = parsePromptCsvRows();
  const targets = allRows.slice(0, maxStyles);
  await mkdir(OUT, { recursive: true });
  await writeCsvHeader();

  const checkpointPath = path.join(OUT, "checkpoint.json");
  let done = new Set();
  if (existsSync(checkpointPath)) {
    try {
      done = new Set(JSON.parse(readFileSync(checkpointPath, "utf8")).done ?? []);
    } catch {
      /* ignore */
    }
  }

  const manifest = [];

  for (const row of targets) {
    if (done.has(row.style_id)) {
      console.log("skip (done)", row.style_id);
      continue;
    }

    const stylePath = localStyleImage(row.style_id, row.category_id);
    const entry = {
      style_id: row.style_id,
      category_id: row.category_id,
      seed: seedForStyleId(row.style_id),
      status: "pending",
      identical: false,
    };

    if (!stylePath) {
      entry.status = "skip";
      entry.error = "no ref image";
      manifest.push(entry);
      await appendCsv(entry);
      continue;
    }

    try {
      const styleBuf = await readFile(stylePath);
      const pipeline = row.pipeline === "men" ? "men" : row.pipeline === "women" ? "women" : "women";
      const person = await personBuf(pipeline);
      const prompt = buildFluxPrompt(formatCommandLine(row), { hasReferenceStyle: true });
      const seed = entry.seed;

      const dir = path.join(OUT, row.style_id);
      await mkdir(dir, { recursive: true });

      console.log("A", row.style_id);
      const urlA = await bflOnce({ prompt, person, style: styleBuf, seed });
      const bufA = await download(urlA);
      await writeFile(path.join(dir, "run-a.jpg"), bufA);

      console.log("B", row.style_id);
      const urlB = await bflOnce({ prompt, person, style: styleBuf, seed });
      const bufB = await download(urlB);
      await writeFile(path.join(dir, "run-b.jpg"), bufB);

      entry.hash_a = sha256File(bufA);
      entry.hash_b = sha256File(bufB);
      entry.bytes_a = bufA.length;
      entry.bytes_b = bufB.length;
      entry.identical = entry.hash_a === entry.hash_b;
      entry.status = "ok";
      entry.run_a = true;
      entry.run_b = true;

      done.add(row.style_id);
      await writeFile(checkpointPath, JSON.stringify({ done: [...done] }, null, 2));
      console.log(entry.identical ? "SAME" : "DIFF", row.style_id);
    } catch (e) {
      entry.status = "fail";
      entry.error = e instanceof Error ? e.message : String(e);
      console.log("FAIL", row.style_id, entry.error);
    }

    manifest.push(entry);
    await appendCsv(entry);
  }

  const fullManifest = await rebuildManifestFromDisk(targets);
  const report = {
    at: new Date().toISOString(),
    catalog: allRows.length,
    tested: targets.length,
    completed: fullManifest.length,
    identical_pairs: fullManifest.filter((m) => m.identical).length,
    different_pairs: fullManifest.filter((m) => !m.identical).length,
  };
  await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2), "utf8");
  await writeFile(path.join(OUT, "index.html"), buildHtml(fullManifest.length ? fullManifest : manifest), "utf8");

  console.log("\nCSV:", CSV_OUT.replace(/\\/g, "/"));
  console.log("HTML:", path.join(OUT, "index.html").replace(/\\/g, "/"));
  console.log("Report:", JSON.stringify(report));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
