/**
 * Static + optional live checks for audit backend fixes (no Flutter).
 *   node scripts/audit-backend-fixes.verify.mjs
 *   node scripts/audit-backend-fixes.verify.mjs http://localhost:3000
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.argv[2] || "").replace(/\/$/, "");

const checks = [];

function fileIncludes(rel, needle) {
  const p = path.join(root, rel);
  if (!existsSync(p)) {
    checks.push({ id: rel, pass: false, note: "file missing" });
    return;
  }
  const ok = readFileSync(p, "utf8").includes(needle);
  checks.push({ id: rel, pass: ok, note: needle });
}

fileIncludes("src/app/api/v1/content-reports/route.ts", "ContentReport.create");
fileIncludes("src/app/api/v1/users/me/fcm-token/route.ts", "export async function DELETE");
fileIncludes("src/app/api/v1/try-on/generate/route.ts", "assertTryOnDailyQuota");
fileIncludes("src/app/api/v1/try-on/generate/route.ts", "moderateTryOnRequest");
fileIncludes("src/lib/server/models/LookHistory.ts", "tryOnJobId: 1");
fileIncludes("src/lib/server/auth/tokens.ts", "refreshInflight");
fileIncludes("src/lib/server/tryOn/publicErrors.ts", "publicTryOnFailureMessage");

async function live() {
  if (!base) return;
  const reg = await fetch(`${base}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `audit_${Date.now()}@example.com`,
      password: "TestPass123!",
      display_name: "Audit",
    }),
  });
  const regJson = await reg.json();
  const token = regJson?.data?.access_token;
  if (!token) {
    checks.push({ id: "live:register", pass: false, note: "no token" });
    return;
  }

  const report = await fetch(`${base}/api/v1/content-reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason: "spam test", job_id: "000000000000000000000001" }),
  });
  checks.push({
    id: "live:POST content-reports",
    pass: report.status === 200,
    note: `status ${report.status}`,
  });

  const mod = await fetch(`${base}/api/v1/try-on/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      source_image_base64:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
      style_id: "women_tryon_01",
      prompt: "lingerie photoshoot",
    }),
  });
  const modJson = await mod.json();
  checks.push({
    id: "live:moderation blocked",
    pass: mod.status === 422 && modJson?.error?.code === "MODERATION_BLOCKED",
    note: `status ${mod.status} code ${modJson?.error?.code}`,
  });

  const fcmDel = await fetch(`${base}/api/v1/users/me/fcm-token`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fcm_token: "audit-noop-token" }),
  });
  checks.push({
    id: "live:DELETE fcm-token",
    pass: fcmDel.status === 200,
    note: `status ${fcmDel.status}`,
  });
}

await live();

const failed = checks.filter((c) => !c.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
process.exit(failed.length ? 1 : 0);
