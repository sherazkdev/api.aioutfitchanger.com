/**
 * One paid smoke: POST /try-on/generate for a newly imported style (run on VPS).
 * Uses .env ADMIN not required — registers ephemeral test user.
 */
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const API = process.env.PRODUCTION_API_BASE || "http://127.0.0.1:3020/api/v1";

function loadEnv() {
  for (const f of [".env", ".env.local"]) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (process.env[k] === undefined) process.env[k] = v;
    }
  }
}

async function main() {
  loadEnv();
  const srcPath =
    process.env.SMOKE_SOURCE ||
    path.join(ROOT, "artifacts/full-outfit-phase2-smoke-test/source-person-female.jpg");
  if (!existsSync(srcPath)) {
    console.error("missing source", srcPath);
    process.exit(1);
  }
  const b64 = readFileSync(srcPath).toString("base64");
  const email = `archive-smoke-${Date.now()}@example.com`;
  const reg = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: "SmokeTest8!Aa",
      display_name: "Archive Smoke",
    }),
  });
  const regJson = await reg.json();
  const token = regJson.data?.access_token;
  if (!token) {
    console.error("register failed", reg.status, regJson);
    process.exit(1);
  }

  const style_id = process.env.SMOKE_STYLE_ID || "women_chinese_29";
  const category_id = process.env.SMOKE_CATEGORY_ID || "wardrobe_browse";

  const gen = await fetch(`${API}/try-on/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      source_image_base64: b64,
      style_id,
      category_id,
      person_gender: "women",
    }),
  });
  const genJson = await gen.json();
  console.log(
    JSON.stringify(
      {
        style_id,
        category_id,
        http: gen.status,
        job_id: genJson.data?.job_id,
        status: genJson.data?.status,
        error: genJson.error,
      },
      null,
      2
    )
  );
  if (!gen.ok) process.exit(1);

  const jobId = genJson.data?.job_id;
  if (!jobId) process.exit(0);

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const poll = await fetch(`${API}/try-on/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pj = await poll.json();
    const st = pj.data?.status;
    if (st === "Completed" || st === "Failed" || st === "Cancelled") {
      console.log(
        JSON.stringify(
          {
            final_status: st,
            result_image: pj.data?.result_image_absolute_url || pj.data?.result_image,
            failure_reason: pj.data?.failure_reason,
          },
          null,
          2
        )
      );
      process.exit(st === "Completed" ? 0 : 1);
    }
  }
  console.error("poll timeout");
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
