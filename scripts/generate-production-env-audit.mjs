/**
 * Scan codebase for process.env usage + merge with getServerEnv schema.
 * Optional VPS key presence: VPS_SSH_PASS + node scripts/generate-production-env-audit.mjs --vps
 * Writes artifacts/production-env-audit.json and PRODUCTION_ENV_AUDIT.md (no secret values).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = path.join(ROOT, "artifacts", "production-env-audit.json");
const OUT_MD = path.join(ROOT, "PRODUCTION_ENV_AUDIT.md");

const ENV_RE = /process\.env\.([A-Z][A-Z0-9_]*)/g;
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "artifacts", ".new-zip"]);

/** @type {Record<string, { used_in: Set<string>, runtime_or_build: string }>} */
const found = {};

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      walk(p);
      continue;
    }
    if (!/\.(ts|tsx|js|mjs|cjs)$/.test(name)) continue;
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    const text = readFileSync(p, "utf8");
    let m;
    while ((m = ENV_RE.exec(text)) !== null) {
      const key = m[1];
      if (!found[key]) found[key] = { used_in: new Set(), runtime_or_build: "runtime" };
      found[key].used_in.add(rel);
      if (rel.includes("next.config") || name.includes("instrumentation")) {
        found[key].runtime_or_build = "build_or_runtime";
      }
    }
  }
}

const SCHEMA = {
  MONGODB_URI: { required: true, secret: true, purpose: "MongoDB connection" },
  MONGODB_MAX_POOL_SIZE: { required: false, secret: false, purpose: "Mongo connection pool size" },
  CONTENT_CACHE_TTL_SECONDS: { required: false, secret: false, purpose: "Public content cache TTL" },
  JWT_ACCESS_SECRET: { required: true, secret: true, purpose: "JWT access token signing" },
  JWT_REFRESH_SECRET: { required: true, secret: true, purpose: "JWT refresh token signing" },
  ACCESS_TOKEN_TTL_SECONDS: { required: false, secret: false, purpose: "Access token lifetime" },
  REFRESH_TOKEN_TTL_SECONDS: { required: false, secret: false, purpose: "Refresh token lifetime" },
  GOOGLE_CLIENT_ID_ANDROID: { required: false, secret: false, purpose: "Google Sign-In Android aud" },
  GOOGLE_CLIENT_ID_IOS: { required: false, secret: false, purpose: "Google Sign-In iOS aud" },
  GOOGLE_CLIENT_ID_WEB: { required: false, secret: false, purpose: "Google Sign-In Web aud" },
  ADMIN_EMAIL: { required: false, secret: false, purpose: "Admin bootstrap email" },
  ADMIN_PASSWORD: { required: false, secret: true, purpose: "Admin bootstrap password" },
  BFL_API_KEY: { required: true, secret: true, purpose: "BFL/FLUX/VTO API key (try-on)" },
  BFL_API_BASE: { required: false, secret: false, purpose: "BFL API base URL" },
  FIREBASE_PROJECT_ID: { required: false, secret: false, purpose: "FCM Firebase project" },
  FIREBASE_CLIENT_EMAIL: { required: false, secret: false, purpose: "FCM service account email" },
  FIREBASE_PRIVATE_KEY: { required: false, secret: true, purpose: "FCM service account key" },
  API_RATE_LIMIT_AUTH_PER_MIN: { required: false, secret: false, purpose: "Auth route rate limit" },
};

const EXTRA = {
  APP_URL: {
    required: true,
    secret: false,
    purpose: "Public HTTPS origin for absolute media/result URLs (couple split assets, uploads)",
  },
  NODE_ENV: { required: true, secret: false, purpose: "Node environment" },
  PORT: { required: false, secret: false, purpose: "Next listen port (PM2 uses 3020 via CLI)" },
  BFL_POLL_MIN_INTERVAL_MS: { required: false, secret: false, purpose: "Try-on job poll throttle" },
  USER_AUTH_CACHE_MS: { required: false, secret: false, purpose: "Auth user cache TTL" },
  DISABLE_CONTENT_SEED: { required: false, secret: false, purpose: "Skip demo content auto-seed" },
  BROADCAST_SCHEDULER_INTERVAL_MS: { required: false, secret: false, purpose: "Scheduled push poll interval" },
  RESET_TOKEN_TTL_HOURS: { required: false, secret: false, purpose: "Password reset token TTL" },
  LIBRETRANSLATE_URL: { required: false, secret: false, purpose: "Optional LibreTranslate endpoint" },
  DEFAULT_SOURCE_LOCALE: { required: false, secret: false, purpose: "Default i18n source locale" },
  NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW: {
    required: false,
    secret: false,
    purpose: "Admin UI mock data (client-exposed; non-secret)",
  },
  NEXT_RUNTIME: { required: false, secret: false, purpose: "Next.js internal runtime flag" },
};

function classifyKey(name) {
  const meta = SCHEMA[name] || EXTRA[name];
  if (!meta) {
    return {
      name,
      used_in: [...(found[name]?.used_in || [])],
      required: false,
      runtime_or_build: found[name]?.runtime_or_build || "runtime",
      secret: name.includes("SECRET") || name.includes("KEY") || name.includes("PASSWORD"),
      purpose: "Referenced in code; review",
      action: "VERIFY_VALUE",
    };
  }
  return {
    name,
    used_in: [...(found[name]?.used_in || [])].sort(),
    required: meta.required,
    runtime_or_build: found[name]?.runtime_or_build || "runtime",
    secret: meta.secret,
    purpose: meta.purpose,
    action: meta.required ? "KEEP" : "OPTIONAL",
  };
}

function parseEnvFile(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function keyStatus(env, name, meta) {
  const v = env[name];
  if (v === undefined) return "MISSING";
  if (!String(v).trim()) return "EMPTY";
  if (name === "MONGODB_URI" && !/^mongodb(\+srv)?:\/\//i.test(v)) return "INVALID FORMAT";
  if (name === "APP_URL" && !/^https:\/\//i.test(v) && meta?.required) return "INVALID FORMAT";
  if (name === "JWT_ACCESS_SECRET" && v.length < 32) return "INVALID FORMAT";
  if (name === "JWT_REFRESH_SECRET" && v.length < 32) return "INVALID FORMAT";
  return "PRESENT";
}

async function fetchVpsEnvKeys() {
  const password = process.env.VPS_SSH_PASS?.trim();
  if (!password) return null;
  let Client;
  try {
    ({ Client } = await import("ssh2"));
  } catch {
    throw new Error("ssh2 package required for --vps (npm install ssh2 --no-save)");
  }
  const host = process.env.VPS_HOST || "13.140.131.209";
  const user = process.env.VPS_USER || "root";
  const appRoot = process.env.VPS_APP_ROOT || "/var/www/ai-outfit-changer";
  const script = `
set -e
cd ${appRoot}
echo "GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
echo "GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo unknown)"
echo "NODE_VERSION=$(node -v 2>/dev/null || echo unknown)"
echo "NPM_VERSION=$(npm -v 2>/dev/null || echo unknown)"
echo "PM2_STATUS=$(pm2 jlist 2>/dev/null | head -c 200 || echo none)"
for f in .env.local .env; do
  if [ -f "$f" ]; then echo "ENV_FILE=$f"; break; fi
done
if [ -f .env.local ]; then
  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env.local | cut -d= -f1 | sort -u
elif [ -f .env ]; then
  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' .env | cut -d= -f1 | sort -u
fi
`.trim();

  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.exec(script, (err, stream) => {
          if (err) return reject(err);
          let out = "";
          stream.on("data", (d) => {
            out += d.toString();
          });
          stream.on("close", () => {
            conn.end();
            resolve(out);
          });
        });
      })
      .on("error", reject)
      .connect({ host, port: 22, username: user, password, readyTimeout: 20000 });
  });
}

walk(path.join(ROOT, "src"));
walk(path.join(ROOT, "scripts"));
walk(path.join(ROOT, "deploy"));

const allNames = new Set([...Object.keys(found), ...Object.keys(SCHEMA), ...Object.keys(EXTRA)]);
const inventory = [...allNames].sort().map(classifyKey);

let vpsMeta = {};
let vpsEnv = {};
const doVps = process.argv.includes("--vps");

if (doVps) {
  try {
    const raw = await fetchVpsEnvKeys();
    if (raw) {
      const lines = raw.split(/\r?\n/);
      for (const line of lines) {
        if (line.startsWith("GIT_") || line.startsWith("NODE_") || line.startsWith("NPM_") || line.startsWith("ENV_FILE=")) {
          const [k, ...rest] = line.split("=");
          vpsMeta[k] = rest.join("=");
          continue;
        }
        if (line.trim()) vpsEnv[line.trim()] = true;
      }
    }
  } catch (e) {
    vpsMeta.VPS_AUDIT_ERROR = String(e.message || e);
  }
}

const localEnvPath = existsSync(path.join(ROOT, ".env.local"))
  ? path.join(ROOT, ".env.local")
  : path.join(ROOT, ".env");
const localEnv = existsSync(localEnvPath) ? parseEnvFile(readFileSync(localEnvPath, "utf8")) : {};

for (const row of inventory) {
  row.local_status = keyStatus(localEnv, row.name, row);
  row.currently_present_on_vps = doVps ? Boolean(vpsEnv[row.name]) : null;
  row.vps_key_status =
    doVps && Object.keys(vpsEnv).length ? (vpsEnv[row.name] ? "PRESENT" : "MISSING") : undefined;
  if (row.local_status === "MISSING" && row.required) row.action = "ADD";
  else if (row.local_status === "PRESENT" && row.required) row.action = "KEEP";
}

const phase14Notes = [
  "Phase 1–4 uses existing BFL_API_KEY, BFL_API_BASE, MONGODB_URI, APP_URL for garment URL resolution and try-on.",
  "Couple split routing requires APP_URL (HTTPS) so resolveGarmentImage can build absolute /media/catalog URLs.",
  "BFL_POLL_MIN_INTERVAL_MS optional; defaults in pollThrottle.ts.",
  "No new variables added to src/lib/server/env.ts Zod schema in Phase 1–4.",
];

const report = {
  generated_at: new Date().toISOString(),
  phase_1_4_new_env_required: [],
  phase_1_4_notes: phase14Notes,
  vps_meta: vpsMeta,
  variables: inventory.map(({ used_in, ...rest }) => ({
    ...rest,
    used_in,
  })),
};

writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

let md = `# Production ENV audit\n\nGenerated: ${report.generated_at}\n\n`;
md += `## Phase 1–4\n\n**No new ENV variables required by Phase 1–4.**\n\n`;
md += phase14Notes.map((n) => `- ${n}`).join("\n") + "\n\n";
md += `## Inventory\n\n| ENV | Local status | VPS key | Required | Secret | Action |\n|---|---|---|---|---|---|\n`;
for (const row of inventory) {
  const vps = doVps ? (row.currently_present_on_vps ? "PRESENT" : "MISSING") : "—";
  md += `| ${row.name} | ${row.local_status} | ${vps} | ${row.required} | ${row.secret} | ${row.action} |\n`;
}
md += `\nSee \`artifacts/production-env-audit.json\` for file references.\n`;
writeFileSync(OUT_MD, md);

console.log(JSON.stringify({ ok: true, json: OUT_JSON, md: OUT_MD, vps: doVps, phase14_new: 0 }));
