/**
 * Send one FCM test notification. Usage:
 *   node scripts/send-fcm-test.mjs <FCM_DEVICE_TOKEN>
 * Requires FIREBASE_* in .env.local (same as server).
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filename) {
  const envPath = path.join(root, filename);
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env.example");

const fcmToken = process.argv[2];
if (!fcmToken) {
  console.error("Usage: node scripts/send-fcm-test.mjs <FCM_DEVICE_TOKEN>");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (!projectId || !clientEmail || !privateKey) {
  console.error(JSON.stringify({ ok: false, error: "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY missing in .env.local" }));
  process.exit(2);
}
privateKey = privateKey.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const title = "AI Wardrobe — test reminder";
const body = "Firebase test push from local API (scripts/send-fcm-test.mjs).";

const res = await getMessaging().sendEachForMulticast({
  tokens: [fcmToken],
  notification: { title, body },
  data: {
    type: "test_reminder",
    deep_link: "home/try-on",
    sent_at: new Date().toISOString(),
  },
});

const detail = res.responses[0];
const out = {
  ok: res.successCount === 1,
  success_count: res.successCount,
  failure_count: res.failureCount,
  message_id: detail?.messageId ?? null,
  error: detail?.error ? { code: detail.error.code, message: detail.error.message } : null,
  title,
  body,
  sent_at: new Date().toISOString(),
};
console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 3);
