/**
 * Safe production error-path checks (no BFL spend).
 * node scripts/production-live-error-paths.mjs [baseUrl]
 */
const base = (process.argv[2] || "https://appworkspro.com").replace(/\/$/, "");

async function register() {
  const email = `prod_err_${Date.now()}@example.com`;
  const res = await fetch(`${base}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "TestPass123!", display_name: "Prod Err" }),
  });
  const json = await res.json();
  return json.data?.access_token;
}

const results = [];

async function main() {
  const token = await register();
  if (!token) {
    console.log(JSON.stringify({ ok: false, error: "register_failed" }));
    process.exit(1);
  }

  const badJson = await fetch(`${base}/api/v1/try-on/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{bad",
  });
  const badText = await badJson.text();
  results.push({
    name: "malformed_json",
    pass: badJson.status === 400 && badText.includes("INVALID_JSON") && !/node_modules|\.ts:\d+/.test(badText),
    status: badJson.status,
  });

  const noSrc = await fetch(`${base}/api/v1/try-on/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ style_id: "women_tops_01" }),
  });
  const noSrcJson = await noSrc.json();
  results.push({
    name: "missing_source",
    pass: noSrc.status === 422 && noSrcJson.error?.code === "VALIDATION",
    status: noSrc.status,
  });

  const badStyle = await fetch(`${base}/api/v1/try-on/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      source_image_base64: "data:image/png;base64,iVBORw0KGgo=",
      style_id: "not_a_real_style_xyz",
      category_id: "wardrobe_browse",
    }),
  });
  const badStyleJson = await badStyle.json();
  results.push({
    name: "invalid_style",
    pass: badStyle.status >= 400 && badStyle.status < 500 && badStyleJson.error != null,
    status: badStyle.status,
  });

  const coupleNoGender = await fetch(`${base}/api/v1/try-on/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      source_image_base64: "data:image/png;base64,iVBORw0KGgo=",
      style_id: "couple_02",
      category_id: "couple_duo",
    }),
  });
  const cng = await coupleNoGender.json();
  results.push({
    name: "couple_missing_gender",
    pass: coupleNoGender.status === 422 && cng.error?.code === "VALIDATION",
    status: coupleNoGender.status,
  });

  const meta = await fetch(`${base}/api/v1/app/metadata`);
  results.push({ name: "https_metadata", pass: meta.ok, status: meta.status });

  const ok = results.every((r) => r.pass);
  console.log(JSON.stringify({ base, ok, results }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
