/**
 * PM2 — single Next.js process (API + admin + broadcast scheduler).
 * Loads .env.local into the process (required: JWT_*, MONGODB_URI).
 */
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const root = path.join(__dirname, "..");
  const file = fs.existsSync(path.join(root, ".env.local"))
    ? path.join(root, ".env.local")
    : path.join(root, ".env");
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val.replace(/\\n/g, "\n");
  }
  return out;
}

const fromFile = loadEnvLocal();

module.exports = {
  apps: [
    {
      name: "ai-outfit-changer",
      cwd: path.join(__dirname, ".."),
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3020 -H 127.0.0.1",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "1G",
      env_production: {
        ...fromFile,
        NODE_ENV: "production",
        PORT: "3020",
      },
    },
  ],
};
