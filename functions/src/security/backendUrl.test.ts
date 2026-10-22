import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFixedBackendUrl, validateBackendBaseUrl } from "./backendUrl";

test("accepts https origin", () => {
  const r = validateBackendBaseUrl("https://appworkspro.com");
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.origin, "https://appworkspro.com");
});

test("accepts https origin with trailing slash", () => {
  const r = validateBackendBaseUrl("https://appworkspro.com/");
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.origin, "https://appworkspro.com");
    assert.equal(
      buildFixedBackendUrl(r.origin, "/api/v1/internal/cloud-function/ping"),
      "https://appworkspro.com/api/v1/internal/cloud-function/ping"
    );
  }
});

test("accepts http localhost for local/dev", () => {
  const r = validateBackendBaseUrl("http://127.0.0.1:3000");
  assert.equal(r.ok, true);
});

test("rejects http non-local", () => {
  const r = validateBackendBaseUrl("http://appworkspro.com");
  assert.equal(r.ok, false);
});

test("rejects credentials in URL", () => {
  const r = validateBackendBaseUrl("https://user:pass@appworkspro.com");
  assert.equal(r.ok, false);
});

test("rejects path on base URL", () => {
  const r = validateBackendBaseUrl("https://appworkspro.com/api");
  assert.equal(r.ok, false);
});

test("trailing slash base builds single-slash ping path", () => {
  const url = buildFixedBackendUrl("https://appworkspro.com", "/api/v1/internal/cloud-function/ping");
  assert.equal(url, "https://appworkspro.com/api/v1/internal/cloud-function/ping");
  const url2 = buildFixedBackendUrl("https://appworkspro.com/", "/api/v1/internal/cloud-function/ping");
  assert.equal(url2, "https://appworkspro.com/api/v1/internal/cloud-function/ping");
});
