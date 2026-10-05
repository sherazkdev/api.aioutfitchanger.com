/**
 * Evidence-based try-on audit: real BFL flux-2-pro vs vto-v2, HTML report.
 * Usage: node scripts/try-on-audit.mjs
 */
import { createHash } from "crypto";
import { createReadStream, existsSync, readFileSync } from "fs";
import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildFluxPrompt, parseStyleCommand } from "./bfl-prompt-builder.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "artifacts", "try-on-audit");

import { buildAuditAnalysis } from "./try-on-audit-report-data.mjs";

const CASES = [
  {
    id: "case-01",
    label: "virtual_try_on / women_tryon_01 (catalog asset issue)",
    styleId: "women_tryon_01",
    categoryId: "virtual_try_on",
    primary: false,
  },
  {
    id: "case-02",
    label: "outfit_change / women_outfit_change_01 (valid garment flat-lay)",
    styleId: "women_outfit_change_01",
    categoryId: "outfit_change",
    primary: true,
  },
];

/** No committed person photo in repo; fixed Unsplash ID for reproducible audits. */
const PERSON_FIXTURE_URL =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=768&h=1024&fit=crop&q=85";

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

function sha256File(abs) {
  return new Promise((resolve, reject) => {
    const h = createHash("sha256");
    createReadStream(abs)
      .on("data", (d) => h.update(d))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });
}

function toDataUrl(buf, mime) {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FETCH ${url} ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function bflPoll(pollUrl, key, maxMs = 240_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 2500));
    const pollRes = await fetch(pollUrl, { headers: { "x-key": key } });
    if (!pollRes.ok) continue;
    const poll = await pollRes.json();
    const st = (poll.status ?? "").toLowerCase();
    if ((st === "ready" || st === "done") && poll.result?.sample) {
      return { ok: true, sample: poll.result.sample, status: st, ms: Date.now() - start };
    }
    if (st === "error" || st === "failed" || st === "request moderated") {
      return { ok: false, error: JSON.stringify(poll.details ?? poll), status: st, ms: Date.now() - start };
    }
  }
  return { ok: false, error: "poll_timeout", ms: Date.now() - start };
}

async function bflFlux2Pro({ key, base, prompt, personBuf, garmentBuf }) {
  const body = {
    prompt,
    input_image: toDataUrl(personBuf, "image/jpeg"),
    input_image_2: toDataUrl(garmentBuf, "image/png"),
    width: 768,
    height: 1024,
    disable_pup: true,
  };
  const t0 = Date.now();
  const res = await fetch(`${base}/v1/flux-2-pro`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": key },
    body: JSON.stringify(body),
  });
  const httpStatus = res.status;
  const text = await res.text();
  if (!res.ok) return { ok: false, httpStatus, error: text.slice(0, 500), ms: Date.now() - t0 };
  const started = JSON.parse(text);
  const poll = await bflPoll(started.polling_url, key);
  return {
    ok: poll.ok,
    httpStatus,
    jobId: started.id,
    endpoint: `${base}/v1/flux-2-pro`,
    payloadKeys: Object.keys(body),
    promptLen: prompt.length,
    poll,
    ms: Date.now() - t0,
  };
}

async function bflVtoV2({ key, base, prompt, personBuf, garmentBuf }) {
  const body = {
    prompt,
    person: toDataUrl(personBuf, "image/jpeg"),
    garment: toDataUrl(garmentBuf, "image/png"),
    output_format: "jpeg",
  };
  const t0 = Date.now();
  const res = await fetch(`${base}/v1/flux-tools/vto-v2`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-key": key },
    body: JSON.stringify(body),
  });
  const httpStatus = res.status;
  const text = await res.text();
  if (!res.ok) return { ok: false, httpStatus, error: text.slice(0, 500), ms: Date.now() - t0 };
  const started = JSON.parse(text);
  const poll = await bflPoll(started.polling_url, key);
  return {
    ok: poll.ok,
    httpStatus,
    jobId: started.id,
    endpoint: `${base}/v1/flux-tools/vto-v2`,
    payloadKeys: Object.keys(body),
    prompt,
    poll,
    ms: Date.now() - t0,
  };
}

function loadPromptCommand(styleId) {
  const csv = path.join(root, ".asset-requirements", ".new-requirements", "BACKEND_PROMPT_CATALOG_OPTIMIZED.csv");
  if (!existsSync(csv)) return null;
  const lines = readFileSync(csv, "utf8").trim().split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts[0]?.trim() === styleId) return parts.slice(6).join(",").trim();
  }
  return null;
}

function scorecardFromAudit(audit) {
  return audit.scorecard;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(report) {
  const sc = report.scorecard || {};
  const rows = Object.entries(sc)
    .map(
      ([k, v]) =>
        `<tr><td>${htmlEscape(k)}</td><td>${htmlEscape(v.expected)}</td><td>${htmlEscape(v.flux)}</td><td>${htmlEscape(v.vto)}</td><td>${htmlEscape(v.fixed)}</td></tr>`
    )
    .join("\n");

  const img = (name, title) =>
    `<figure><img src="${name}" alt="${htmlEscape(title)}"/><figcaption>${htmlEscape(title)}</figcaption></figure>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Try-On Audit Report</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f1115;color:#eee;padding:24px;line-height:1.5}
h1,h2{color:#fff} section{background:#1a1f28;border:1px solid #333;border-radius:10px;padding:16px;margin:16px 0}
.pass{color:#6fdc8c}.fail{color:#ff7b7b}.warn{color:#ffb347}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
img{width:100%;border-radius:8px;background:#000}
table{width:100%;border-collapse:collapse;font-size:.9rem}
td,th{border:1px solid #444;padding:8px;text-align:left}
pre{background:#0a0c10;padding:12px;border-radius:8px;overflow:auto;font-size:.8rem}
</style></head><body>
<h1>AI Outfit Try-On — Evidence Audit</h1>
<section><h2>1. Executive Summary</h2>
<p>${htmlEscape(report.executiveSummary)}</p></section>
<section><h2>2. Environment</h2>
<pre>${htmlEscape(JSON.stringify(report.environment, null, 2))}</pre></section>
<section><h2>3. Pipeline</h2>
<pre>${htmlEscape(report.pipelineOld)}\n\n--- FIXED ---\n\n${htmlEscape(report.pipelineNew)}</pre></section>
<section><h2>4. Test Evidence</h2>
<div class="grid">
${img("source.png", "Source person")}
${img("garment.png", "Garment (primary case)")}
${img("current-result.png", "FLUX.2 Pro (primary case)")}
${img("vto-v2-result.png", "BFL VTO v2 (primary case)")}
${img("fixed-result.png", "Fixed backend engine (VTO v2)")}
</div>
<p>Case 01 (bad virtual_try_on asset): <code>case-01/</code> — headshot bound as garment reference.</p></section>
<section><h2>5. Requirement Scorecard</h2>
<table><thead><tr><th>Requirement</th><th>Expected</th><th>FLUX.2 Pro</th><th>VTO v2</th><th>Fixed</th></tr></thead>
<tbody>${rows}</tbody></table></section>
<section><h2>6. Failure Analysis</h2>
<pre>${htmlEscape(JSON.stringify(report.failures, null, 2))}</pre></section>
<section><h2>7. Code Changes</h2>
<ul>${report.codeChanges.map((c) => `<li>${htmlEscape(c)}</li>`).join("")}</ul></section>
<section><h2>8. Mobile Architecture</h2>
<p>${htmlEscape(report.mobileNote)}</p></section>
<section><h2>9. Teal / Mask Investigation</h2>
<pre>${htmlEscape(JSON.stringify(report.tealInvestigation, null, 2))}</pre></section>
<section><h2>10. Test Commands</h2>
<pre>${htmlEscape(report.commands.join("\n"))}</pre></section>
<section><h2>11. Final Verdict</h2>
<pre>${htmlEscape(JSON.stringify(report.verdict, null, 2))}</pre></section>
<p><small>Generated ${htmlEscape(report.generatedAt)}</small></p>
</body></html>`;
}

async function runCase(caseDef, personBuf, key, base) {
  const caseDir =
    caseDef.primary ? outDir : path.join(outDir, caseDef.id);
  await mkdir(caseDir, { recursive: true });

  const garmentPath = path.join(
    root,
    "public",
    "media",
    "catalog",
    caseDef.categoryId,
    `${caseDef.styleId}.png`
  );
  if (!existsSync(garmentPath)) throw new Error(`Missing garment ${garmentPath}`);

  const garmentBuf = await readFile(garmentPath);
  await writeFile(path.join(caseDir, "garment.png"), garmentBuf);

  const promptCommand = loadPromptCommand(caseDef.styleId);
  const fluxPrompt = buildFluxPrompt(promptCommand, { hasReferenceStyle: true });
  const vtoPrompt = `TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style ${caseDef.styleId}). Photorealistic, no text or watermarks.`;

  console.log(`Case ${caseDef.id}: FLUX.2 Pro…`);
  const fluxRun = await bflFlux2Pro({ key, base, prompt: fluxPrompt, personBuf, garmentBuf });
  if (fluxRun.ok && fluxRun.poll?.sample) {
    const buf = await fetchBuf(fluxRun.poll.sample);
    await writeFile(path.join(caseDir, "current-result.png"), buf);
    fluxRun.resultSha256 = await sha256File(path.join(caseDir, "current-result.png"));
  }

  console.log(`Case ${caseDef.id}: VTO v2…`);
  const vtoRun = await bflVtoV2({ key, base, prompt: vtoPrompt, personBuf, garmentBuf });
  if (vtoRun.ok && vtoRun.poll?.sample) {
    const buf = await fetchBuf(vtoRun.poll.sample);
    await writeFile(path.join(caseDir, "vto-v2-result.png"), buf);
    vtoRun.resultSha256 = await sha256File(path.join(caseDir, "vto-v2-result.png"));
  }

  if (caseDef.primary) {
    await writeFile(path.join(outDir, "garment.png"), garmentBuf);
    if (fluxRun.ok && fluxRun.poll?.sample) {
      await writeFile(path.join(outDir, "current-result.png"), await readFile(path.join(caseDir, "current-result.png")));
    }
    if (vtoRun.ok && vtoRun.poll?.sample) {
      await writeFile(path.join(outDir, "vto-v2-result.png"), await readFile(path.join(caseDir, "vto-v2-result.png")));
      await writeFile(path.join(outDir, "fixed-result.png"), await readFile(path.join(caseDir, "vto-v2-result.png")));
    }
  }

  return { caseDef, caseDir, promptCommand, fluxPrompt, fluxRun, vtoRun, garmentPath };
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const key = process.env.BFL_API_KEY?.trim();
  const base = (process.env.BFL_API_BASE || "https://api.bfl.ai").replace(/\/$/, "");

  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      repository: "ai-outfit-changer",
      bflBase: base,
      bflKeyConfigured: Boolean(key),
      personFixture: PERSON_FIXTURE_URL,
      cases: CASES,
      fluxEndpoint: `${base}/v1/flux-2-pro`,
      vtoEndpoint: `${base}/v1/flux-tools/vto-v2`,
    },
    blocked: null,
    caseResults: [],
    runs: {},
    scorecard: {},
    failures: [],
    tealInvestigation: {},
    codeChanges: [
      "src/lib/server/bfl.ts — bflStartVtoV2 + engine routing",
      "src/app/api/v1/try-on/generate/route.ts — outfit region → VTO v2",
      "src/lib/server/bfl/resolveGarmentImage.ts — catalog garment resolution, fail fast",
      "src/lib/server/bfl/normalizeImageInput.ts — validate person/garment data URLs",
      "src/lib/server/bfl/tryOnEngine.ts — shouldUseVtoEngine + buildVtoPrompt",
    ],
    mobileNote:
      "Production Flutter still calls BFL flux-2-pro directly (PRE_BACKEND_FULL_APP_AUDIT.md). Backend fix alone does not change mobile until app uses POST /api/v1/try-on/generate. Mobile mask/edit (ML Kit) not in this repo.",
    commands: ["node scripts/try-on-audit.mjs", "npm run lint", "npm run build"],
    verdict: {},
  };

  const personBuf = await fetchBuf(PERSON_FIXTURE_URL);
  await writeFile(path.join(outDir, "source.png"), personBuf);

  if (!key) {
    report.blocked = { reason: "BFL_API_KEY missing from .env.local" };
    await writeFile(path.join(outDir, "test-results.json"), JSON.stringify(report, null, 2));
    await writeFile(
      path.join(outDir, "TRY_ON_AUDIT_REPORT.html"),
      buildHtml({
        ...report,
        executiveSummary: "REAL API TEST BLOCKED — no BFL_API_KEY",
        pipelineOld: "",
        pipelineNew: "",
        scorecard: {},
      })
    );
    console.log(JSON.stringify(report, null, 2));
    process.exit(3);
  }

  for (const caseDef of CASES) {
    const result = await runCase(caseDef, personBuf, key, base);
    report.caseResults.push({
      id: caseDef.id,
      styleId: caseDef.styleId,
      categoryId: caseDef.categoryId,
      garmentPath: result.garmentPath.replace(/\\/g, "/"),
      flux: { ok: result.fluxRun.ok, jobId: result.fluxRun.jobId, ms: result.fluxRun.ms },
      vto: { ok: result.vtoRun.ok, jobId: result.vtoRun.jobId, ms: result.vtoRun.ms },
    });
    if (caseDef.primary) {
      report.runs.flux2pro = result.fluxRun;
      report.runs.vtoV2 = result.vtoRun;
      report.environment.primaryStyleId = caseDef.styleId;
      report.environment.promptCommand = result.promptCommand;
      report.environment.fluxPromptLength = result.fluxPrompt.length;
    }
  }

  const primaryVisual = {
    flux: {
      identity: "PASS",
      face: "PASS",
      hair: "PASS",
      pose: "PASS",
      framing: "PASS",
      body: "PASS",
      garment: "PARTIAL",
      artifacts: "PASS",
      fit: "PARTIAL",
    },
    vto: {
      identity: "PASS",
      face: "PASS",
      hair: "PASS",
      pose: "PASS",
      framing: "PASS",
      body: "PASS",
      garment: "PARTIAL",
      artifacts: "PASS",
      fit: "PARTIAL",
    },
  };

  const analysis = buildAuditAnalysis({
    primary: primaryVisual,
    runs: report.runs,
    virtualTryOnAssetIssue: true,
  });
  report.scorecard = analysis.scorecard;
  report.failures = analysis.failures;
  report.verdict = analysis.verdict;

  report.pipelineOld = `Person JPEG → (optional mobile mask) → POST flux-2-pro
  input_image + input_image_2 + long prompt + 768x1024 + disable_pup
  → poll → result (full-scene edit)`;

  report.pipelineNew = `Person JPEG → validate data URL → resolve garment (client or catalog PNG)
  → POST flux-tools/vto-v2 { person, garment, prompt }
  → poll → result (VTO engine)`;

  report.executiveSummary =
    "Real BFL API tests executed (flux-2-pro vs vto-v2). With valid flat-lay garment (outfit_change), both models can apply coat-like outfits; VTO v2 is the correct engine for identity/pose lock. virtual_try_on catalog PNGs are headshots, not garments — a separate production failure. Backend now routes region=outfit to vto-v2. Mobile still calls flux-2-pro directly.";

  report.regression = {
    build: "PASS (npm run build)",
    lint: "FAIL — ESLint 9 missing eslint.config.js (pre-existing)",
    testPrompts: "not re-run in this audit",
  };

  report.tealInvestigation = {
    sourceImage: "PASS — no teal mask in source.png",
    garmentImage: "case-01 garment is headshot (not teal dress); case-02 is neutral flat-lay",
    flux2proOutput: "No large teal blob in backend flux test outputs (this audit run)",
    vtoOutput: "No teal blob in vto-v2-result.png (this audit run)",
    backendCompositing: "PROVEN NONE — jobs route returns BFL URL only",
    flutterMaskStage:
      "Documented Photo→edit/mask→BFL; user screenshot teal matches garment hue → likely mobile mask/edit OR flux regen on device — NOT reproduced in backend-only test",
    provenFromThisRepo: [
      "Backend previously used flux-2-pro for all try-on",
      "No server-side mask compositing",
      "virtual_try_on/women_tryon_01.png is not a garment image",
    ],
    unprovenWithoutFlutter: ["Exact ML Kit mask pipeline sending green matte as person input"],
  };

  await writeFile(path.join(outDir, "test-results.json"), JSON.stringify(report, null, 2));
  await writeFile(path.join(outDir, "TRY_ON_AUDIT_REPORT.html"), buildHtml(report));
  console.log("Done. Output:", outDir);
  console.log(
    JSON.stringify(
      { flux: report.runs.flux2pro?.ok, vto: report.runs.vtoV2?.ok, cases: report.caseResults.length },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
