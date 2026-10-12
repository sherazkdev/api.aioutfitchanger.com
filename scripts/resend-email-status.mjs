/**
 * Check delivery status for a Resend messageId (from PM2 logs).
 * Usage: node scripts/resend-email-status.mjs 01a12edd-4f94-7bb8-8c82-07d21d80f143
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(name) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) return;
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
    if (process.env[key] === undefined) process.env[key] = val.replace(/\\n/g, "\n");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const messageId = process.argv[2]?.trim();
if (!messageId) {
  console.error("Usage: node scripts/resend-email-status.mjs <messageId>");
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY?.trim();
if (!apiKey) {
  console.error("RESEND_API_KEY missing in .env.local");
  process.exit(1);
}

const res = await fetch(`https://api.resend.com/emails/${messageId}`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Resend API error:", res.status, body);
  process.exit(1);
}

console.log(JSON.stringify(body, null, 2));
console.log("\nTip: last_event delivered | bounced | complained | delivery_delayed");
console.log("Resend dashboard: https://resend.com/emails");
