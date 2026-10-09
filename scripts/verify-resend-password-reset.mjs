/**
 * Check Resend env for password reset; optional --send user@example.com to deliver one test email.
 * Usage: node scripts/verify-resend-password-reset.mjs
 *        node scripts/verify-resend-password-reset.mjs --send you@example.com
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

const apiKey = process.env.RESEND_API_KEY?.trim();
const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const resetBase =
  process.env.RESET_PASSWORD_URL?.trim().replace(/\/$/, "") ?? `${appUrl}/reset-password`;

console.log("--- Password reset email (Resend) ---");
console.log("RESEND_API_KEY:", apiKey ? `set (${apiKey.slice(0, 6)}…)` : "MISSING");
console.log("RESEND_FROM_EMAIL:", fromEmail ?? "MISSING");
console.log("APP_URL:", process.env.APP_URL ?? "(default localhost:3000)");
console.log("RESET_PASSWORD_URL base:", resetBase);

if (!apiKey || !fromEmail) {
  console.error("\nFAIL: Add RESEND_API_KEY and RESEND_FROM_EMAIL to .env.local on the VPS, then pm2 reload ai-outfit-changer");
  process.exit(1);
}

const sendArg = process.argv.indexOf("--send");
if (sendArg === -1) {
  console.log("\nOK: Env looks configured. Run with --send your@email.com to test delivery.");
  process.exit(0);
}

const to = process.argv[sendArg + 1];
if (!to || !to.includes("@")) {
  console.error("Usage: node scripts/verify-resend-password-reset.mjs --send user@example.com");
  process.exit(1);
}

const { Resend } = await import("resend");
const name = (process.env.RESEND_FROM_NAME ?? "AI Wardrobe").trim() || "AI Wardrobe";
const client = new Resend(apiKey);
const testUrl = `${resetBase}?token=test-token-not-valid`;

const { data, error } = await client.emails.send({
  from: `${name} <${fromEmail}>`,
  to: [to],
  subject: "AI Wardrobe — Resend test (password reset)",
  text: `If you received this, Resend is working.\nReset page base: ${resetBase}\nSample: ${testUrl}`,
});

if (error) {
  console.error("\nFAIL: Resend rejected send:", error);
  console.error("Common fixes: verify domain in Resend dashboard; FROM must be on verified domain.");
  process.exit(1);
}

console.log("\nOK: Test email sent. messageId:", data?.id);
console.log("Next: POST /api/v1/auth/forgot-password with a real email/password account.");
