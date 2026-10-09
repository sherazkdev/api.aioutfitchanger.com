/**
 * All 419 catalog styles: 2× BFL with same seed (production routing: VTO outfit / flux edit).
 * Resumable checkpoint. Compare byte-identical pairs.
 *
 *   node scripts/catalog-verify-419.mjs
 *   node scripts/catalog-verify-419.mjs --max=5
 */
import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import { createReadStream } from "fs";
import { appendFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PROMPT_CSV_PATH } from "./asset-catalog-lib.mjs";
import {
  buildFluxPrompt,
  formatCommandLine,
  parseStyleCommand,
  seedForStyleId,
} from "./bfl-prompt-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const OUT = path.join(root, "scripts", "test-reports", "catalog-verify-419");
const CSV_OUT = path.join(OUT, "VERIFY_419_RESULTS.csv");

const OUTFIT_CATS = new Set([
  "virtual_try_on",
  "outfit_change",
  "wardrobe_browse",
  "occasions",
  "couple_duo",
  "presets",
]);

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

const maxArg = process.argv.find((a) => a.startsWith("--max="));
const maxStyles = maxArg ? Number(maxArg.split("=")[1]) : 99999;

function sha256Buf(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function parseRows() {
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

function styleImagePath(categoryId, styleId) {
  const png = path.join(root, "public", "media", "catalog", categoryId, `${styleId}.png`);
  if (existsSync(png)) return png;
  const webp = png.replace(/\.png$/i, ".webp");
  if (existsSync(webp)) return webp;
  return null;
}

const PERSON = {
  men: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop",
  women: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=768&h=1024&fit=crop",
};

async function personBuf(pipeline) {
  const key = pipeline === "men" ? "men" : "women";
  const cache = path.join(OUT, "_shared", `person-${key}.jpg`);
  if (existsSync(cache)) return readFile(cache);
  const res = await fetch(PERSON[key]);
  if (!res.ok) throw new Error(`person fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(cache), { recursive: true });
  await writeFile(cache, buf);
  return buf;
}

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function useVto(row) {
  const parsed = parseStyleCommand(row.prompt_command);
  if (parsed?.region === "outfit") return true;
  return OUTFIT_CATS.has(row.category_id);
}

function vtoPrompt(styleId) {
  return `TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style ${styleId}). Photorealistic, no text or watermarks.`;
}

async function bflPoll(pollUrl, key) {
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

async function runOnce({ engine, prompt, person, ref, seed, key, base }) {
  let res;
  if (engine === "vto-v2") {
    const body = {
      prompt,
      person: toDataUrl(person, "image/jpeg"),
      garment: toDataUrl(ref, ref[0] === 0x89 ? "image/png" : "image/jpeg"),
      output_format: "jpeg",
    };
    if (seed != null) body.seed = seed;
    res = await fetch(`${base}/v1/flux-tools/vto-v2`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-key": key },
      body: JSON.stringify(body),
    });
  } else {
    const body = {
      prompt,
      input_image: toDataUrl(person, "image/jpeg"),
      input_image_2: toDataUrl(ref, ref[0] === 0x89 ? "image/png" : "image/jpeg"),
      width: 768,
      height: 1024,
      disable_pup: true,
      seed,
    };
    res = await fetch(`${base}/v1/flux-2-pro`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-key": key },
      body: JSON.stringify(body),
    });
  }
  if (!res.ok) throw new Error(`${engine} ${res.status}: ${(await res.text()).slice(0, 180)}`);
  const started = await res.json();
  return bflPoll(started.polling_url, key);
}

async function download(url) {
  for (let t = 0; t < 5; t++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`dl ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (t === 4) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (t + 1)));
    }
  }
}

async function main() {
  const key = process.env.BFL_API_KEY?.trim();
  if (!key) {
    console.error("BFL_API_KEY missing");
    process.exit(2);
  }
  const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");

  const allRows = parseRows();
  const targets = allRows.slice(0, maxStyles);
  await mkdir(OUT, { recursive: true });

  if (!existsSync(CSV_OUT)) {
    await writeFile(
      CSV_OUT,
      "style_id,category_id,region,engine,seed,status,identical,hash_a,hash_b,bytes_a,bytes_b,ref_image_ok,error\n",
      "utf8"
    );
  }

  const checkpointPath = path.join(OUT, "checkpoint.json");
  let done = new Set();
  if (existsSync(checkpointPath)) {
    try {
      done = new Set(JSON.parse(readFileSync(checkpointPath, "utf8")).done ?? []);
    } catch {
      /* ignore */
    }
  }

  for (const row of targets) {
    if (done.has(row.style_id)) {
      console.log("skip", row.style_id);
      continue;
    }

    const refPath = styleImagePath(row.category_id, row.style_id);
    const engine = useVto(row) ? "vto-v2" : "flux-2-pro";
    const seed = seedForStyleId(row.style_id);
    const entry = {
      style_id: row.style_id,
      category_id: row.category_id,
      region: row.region,
      engine,
      seed,
      ref_image_ok: Boolean(refPath),
    };

    if (!refPath) {
      entry.status = "skip";
      entry.error = "missing catalog PNG";
      await appendCsv(entry);
      continue;
    }

    try {
      const refBuf = await readFile(refPath);
      const pipeline = row.pipeline === "men" ? "men" : "women";
      const person = await personBuf(pipeline);
      const prompt =
        engine === "vto-v2"
          ? vtoPrompt(row.style_id)
          : buildFluxPrompt(row.prompt_command, { hasReferenceStyle: true });

      const dir = path.join(OUT, row.style_id);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "reference.png"), refBuf);

      console.log("A", row.style_id, engine);
      const urlA = await runOnce({ engine, prompt, person, ref: refBuf, seed, key, base });
      const bufA = await download(urlA);
      await writeFile(path.join(dir, "run-a.jpg"), bufA);

      console.log("B", row.style_id, engine);
      const urlB = await runOnce({ engine, prompt, person, ref: refBuf, seed, key, base });
      const bufB = await download(urlB);
      await writeFile(path.join(dir, "run-b.jpg"), bufB);

      entry.hash_a = sha256Buf(bufA);
      entry.hash_b = sha256Buf(bufB);
      entry.bytes_a = bufA.length;
      entry.bytes_b = bufB.length;
      entry.identical = entry.hash_a === entry.hash_b;
      entry.status = "ok";

      done.add(row.style_id);
      await writeFile(checkpointPath, JSON.stringify({ done: [...done], updated: new Date().toISOString() }, null, 2));
      console.log(entry.identical ? "SAME" : "DIFF", row.style_id);
    } catch (e) {
      entry.status = "fail";
      entry.error = e instanceof Error ? e.message : String(e);
      console.log("FAIL", row.style_id, entry.error);
    }

    await appendCsv(entry);
  }

  console.log("Done batch. CSV:", CSV_OUT);
  console.log("Completed styles:", done.size, "/", targets.length);
}

function appendCsv(entry) {
  const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  return appendFile(
    CSV_OUT,
    [
      entry.style_id,
      entry.category_id,
      entry.region,
      entry.engine,
      entry.seed,
      entry.status,
      entry.identical ? "YES" : entry.identical === false ? "NO" : "",
      entry.hash_a ?? "",
      entry.hash_b ?? "",
      entry.bytes_a ?? "",
      entry.bytes_b ?? "",
      entry.ref_image_ok ? "YES" : "NO",
      entry.error ?? "",
    ]
      .map(esc)
      .join(",") + "\n",
    "utf8"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
