/**
 * A/B: production ref vs clean ref. Same prompt, source, FLUX settings.
 * npx tsx artifacts/hijab-identity-reference-test/run-ab-test.mjs
 */
import fs from "fs";
import path from "path";
import { pathToFileURL, fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const ART = HERE;
const SRC =
  process.env.HIJAB_TEST_SOURCE ||
  "C:/Users/shera/.cursor/projects/d-ai-outfit-changer/assets/c__Users_shera_AppData_Roaming_Cursor_User_workspaceStorage_f0ee8dd207d04ca26f6c49e764fa25c3_images_WhatsApp_Image_2026-10-08_at_10.10.53_AM-44e77a66-add1-4d10-a62e-b1eba7ad2868.jpg";

const STYLES = [
  "women_hijab_01",
  "women_hijab_02",
  "women_hijab_04",
  "women_hijab_05",
  "women_hijab_08",
];
const RUNS = Number(process.env.HIJAB_AB_RUNS || "3");
const EXTRA_PROMPT = process.env.HIJAB_EXTRA_FACE_RULE === "1";

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const CSV = path.join(
  ROOT,
  ".asset-requirements/.new-requirements/BACKEND_PROMPT_CATALOG_OPTIMIZED.csv"
);

function loadCmd(styleId) {
  for (const line of fs.readFileSync(CSV, "utf8").split(/\r?\n/)) {
    if (!line.startsWith(styleId + ",")) continue;
    const idx = line.indexOf(",COMMAND:");
    return line.slice(idx + 1);
  }
  throw new Error("cmd " + styleId);
}

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function bflPoll(pollUrl, key) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const pollRes = await fetch(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if ((st === "ready" || st === "done") && poll.result?.sample)
      return { ok: true, sample: poll.result.sample };
    if (st === "error" || st === "failed" || st === "request moderated")
      return { ok: false, error: JSON.stringify(poll.details ?? poll) };
  }
  return { ok: false, error: "timeout" };
}

loadEnv();
const key = process.env.BFL_API_KEY?.trim();
const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");
if (!key) {
  console.error("BFL_API_KEY missing");
  process.exit(1);
}

const { buildFluxPrompt } = await import(
  pathToFileURL(path.join(ROOT, "src/lib/server/bfl/promptBuilder.ts")).href
);

const personBuf = fs.readFileSync(SRC);
const outRoot = path.join(
  ART,
  "outputs",
  EXTRA_PROMPT ? "phase2-clean-plus-prompt" : "phase1-ab"
);
fs.mkdirSync(outRoot, { recursive: true });

const FACE_RULE =
  " Image 2 is reference material for the hijab only. Do not copy, blend, transfer, imitate, or reconstruct any facial features, skin tone, makeup, expression, head shape, or identity from image 2.";

const results = [];

for (const styleId of STYLES) {
  const cmd = loadCmd(styleId);
  let prompt = buildFluxPrompt(cmd, { hasReferenceStyle: true });
  if (EXTRA_PROMPT) prompt += FACE_RULE;

  for (const refKind of ["original", "clean"]) {
    const refPath =
      refKind === "original"
        ? path.join(ART, "refs", "original", `${styleId}.png`)
        : path.join(ART, "refs", "clean", `${styleId}.png`);
    const refBuf = fs.readFileSync(refPath);
    const dir = path.join(outRoot, styleId, refKind);
    fs.mkdirSync(dir, { recursive: true });

    for (let run = 1; run <= RUNS; run++) {
      const body = {
        prompt,
        input_image: toDataUrl(personBuf, "image/jpeg"),
        input_image_2: toDataUrl(refBuf, "image/png"),
        width: 768,
        height: 1024,
        disable_pup: true,
      };
      const res = await fetch(`${base}/v1/flux-2-pro`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-key": key },
        body: JSON.stringify(body),
      });
      const started = await res.json();
      const poll = started.polling_url
        ? await bflPoll(started.polling_url, key)
        : { ok: false, error: JSON.stringify(started) };

      const file = path.join(dir, `run_${run}.jpg`);
      if (poll.ok) {
        const rb = await fetch(poll.sample);
        fs.writeFileSync(file, Buffer.from(await rb.arrayBuffer()));
      }

      results.push({
        style_id: styleId,
        reference: refKind === "original" ? "ORIGINAL" : "CLEAN",
        run,
        ok: poll.ok,
        file: poll.ok ? file : null,
        error: poll.error,
        external_id: started.id,
        extra_prompt: EXTRA_PROMPT,
      });
      console.log(styleId, refKind, run, poll.ok ? "ok" : poll.error);
    }
  }
}

const manifest = {
  source: SRC,
  runs_per_arm: RUNS,
  extra_prompt: EXTRA_PROMPT,
  prompt_face_rule: EXTRA_PROMPT ? FACE_RULE.trim() : null,
  results,
};
fs.writeFileSync(path.join(outRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("Wrote", path.join(outRoot, "manifest.json"));
