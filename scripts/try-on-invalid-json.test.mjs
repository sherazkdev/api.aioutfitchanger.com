/**
 * Regression: malformed JSON on POST /api/v1/try-on/generate → 400 INVALID_JSON
 * Run: npx tsx --test scripts/try-on-invalid-json.test.mjs
 * Optional: PHASE4_BASE_URL=http://localhost:3000 (server must be running)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const base = (process.env.PHASE4_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

async function registerToken() {
  const email = `json_test_${Date.now()}@example.com`;
  const res = await fetch(`${base}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "TestPass123!", display_name: "JSON Test" }),
  });
  const json = await res.json();
  return json.data?.access_token;
}

describe("try-on generate invalid JSON", () => {
  it("returns 400 INVALID_JSON without stack trace", async () => {
    const token = await registerToken();
    assert.ok(token, "need running server + auth for try-on route");

    const res = await fetch(`${base}/api/v1/try-on/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: "{not-json",
    });
    const text = await res.text();
    assert.equal(res.status, 400, `expected 400, got ${res.status}: ${text.slice(0, 200)}`);
    assert.doesNotMatch(text, /node_modules|\.ts:\d+/);
    const json = JSON.parse(text);
    assert.equal(json.error?.code, "INVALID_JSON");
    assert.equal(json.data, null);
  });
});
