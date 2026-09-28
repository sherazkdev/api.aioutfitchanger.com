/**
 * End-to-end try-on test: catalog style image + person photo → POST generate → poll job → save result.
 * Usage: node scripts/try-on-style-test.mjs [baseUrl]
 * Needs BFL_API_KEY in .env.local (restart next server after adding).
 */
import { mkdir, writeFile } from "fs/promises";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env.example");

const outDir = path.join(root, "scripts", "test-reports", `try-on-${Date.now()}`);
await mkdir(outDir, { recursive: true });

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FETCH ${url} ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function toDataUrl(buf, mime = "image/jpeg") {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const report = { base, steps: [], ok: false };

// 1) Catalog style
const cat = await fetch(`${base}/api/v1/catalog/virtual_try_on`).then((r) => r.json());
const style = cat.data?.items?.[0];
if (!style) {
  report.error = "No catalog styles";
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}
report.style = { id: style.id, name: style.name, image_url: style.image_url };
report.steps.push({ step: "catalog", ok: true });

const styleUrl = style.image_url.startsWith("http") ? style.image_url : `${base}${style.image_url}`;
const styleBuf = await fetchBuf(styleUrl);
await writeFile(path.join(outDir, "input-style.jpg"), styleBuf);

// 2) Person source (public domain sample)
const personUrl = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=768&h=1024&fit=crop";
const personBuf = await fetchBuf(personUrl);
await writeFile(path.join(outDir, "input-person.jpg"), personBuf);
report.steps.push({ step: "download_inputs", ok: true });

// 3) Auth
const email = `tryon_${Date.now()}@example.com`;
const reg = await fetch(`${base}/api/v1/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: "TestPass123!", display_name: "TryOn Test" }),
}).then((r) => r.json());
const token = reg.data?.access_token;
if (!token) {
  report.error = reg.error || "register failed";
  report.output_dir = outDir;
  console.log(JSON.stringify(report, null, 2));
  process.exit(3);
}
report.steps.push({ step: "auth", ok: true });

// 4) Generate
const genBody = {
  style_id: style.id,
  category_id: "virtual_try_on",
  source_image_base64: toDataUrl(personBuf, "image/jpeg"),
  style_reference_image_base64: toDataUrl(styleBuf, "image/jpeg"),
  prompt: style.prompt_command || `Apply style ${style.name}`,
  width: 768,
  height: 1024,
};
const genRes = await fetch(`${base}/api/v1/try-on/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  body: JSON.stringify(genBody),
});
const genJson = await genRes.json();
report.generate = { status: genRes.status, body: genJson };
report.steps.push({ step: "generate", ok: genRes.ok, http: genRes.status });

if (!genRes.ok) {
  report.output_dir = outDir.replace(/\\/g, "/");
  report.proof_files = ["input-style.jpg", "input-person.jpg"];
  report.hint =
    genJson.error?.message?.includes("BFL") || genJson.error?.code === "TRY_ON_FAILED"
      ? "Add BFL_API_KEY to .env.local and restart: npx next start -p 3000"
      : genJson.error?.message;
  await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(4);
}

const jobId = genJson.data.job_id;
let resultUrl = null;
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const poll = await fetch(`${base}/api/v1/try-on/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  const st = poll.data?.status;
  report.last_poll = { attempt: i + 1, status: st, error: poll.data?.error };
  if (st === "completed" && poll.data?.result_image_url) {
    resultUrl = poll.data.result_image_url;
    break;
  }
  if (st === "failed" || st === "cancelled") break;
}

if (resultUrl) {
  const full = resultUrl.startsWith("http") ? resultUrl : `${base}${resultUrl}`;
  let resultBuf;
  try {
    resultBuf = await fetchBuf(full);
  } catch {
    resultBuf = await fetchBuf(`${base}/api/v1/files/${resultUrl.replace(/^\/uploads\//, "")}`);
  }
  await writeFile(path.join(outDir, "output-result.jpg"), resultBuf);
  report.result_image_url = resultUrl;
  report.ok = true;
  report.steps.push({ step: "poll_complete", ok: true });
} else {
  report.steps.push({ step: "poll_complete", ok: false });
}

report.output_dir = outDir.replace(/\\/g, "/");
await writeFile(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 5);
