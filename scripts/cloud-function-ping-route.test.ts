/**
 * Backend internal ping route security tests (no Mongo / no paid APIs).
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { signBackendRequest } from "../functions/src/security/signBackendRequest.ts";
import {
  CLOUD_FUNCTION_HEADERS,
  verifyCloudFunctionRequest,
  type CloudFunctionAuthConfig,
} from "../src/lib/server/cloudFunctionAuth/index.ts";

const CONFIG: CloudFunctionAuthConfig = {
  internalApiKey: "ping-route-internal-key16",
  hmacSecret: "ping-route-hmac-secret16!!",
  maxSkewSeconds: 300,
};

const UID = "pingRouteUid001";
const NOW = 1_792_650_000;
const PATH = "/api/v1/internal/cloud-function/ping";
const ORIGIN = "https://example.test";

async function verify(opts: {
  omit?: Array<"apiKey" | "firebaseUid" | "timestamp" | "signature">;
  apiKey?: string;
  signature?: string;
  timestamp?: number;
  body?: string;
}) {
  const body = opts.body ?? JSON.stringify({ ping: true, source: "secureBackendPing" });
  const ts = opts.timestamp ?? NOW;
  const signed = signBackendRequest({
    method: "POST",
    pathWithQuery: PATH,
    firebaseUid: UID,
    rawBody: body,
    internalApiKey: CONFIG.internalApiKey,
    hmacSecret: CONFIG.hmacSecret,
    timestampSeconds: ts,
  });

  const omit = new Set(opts.omit ?? []);
  const headers = new Headers({ "content-type": "application/json" });
  if (!omit.has("apiKey")) headers.set(CLOUD_FUNCTION_HEADERS.apiKey, opts.apiKey ?? CONFIG.internalApiKey);
  if (!omit.has("firebaseUid")) headers.set(CLOUD_FUNCTION_HEADERS.firebaseUid, UID);
  if (!omit.has("timestamp")) headers.set(CLOUD_FUNCTION_HEADERS.timestamp, String(ts));
  if (!omit.has("signature")) headers.set(CLOUD_FUNCTION_HEADERS.signature, opts.signature ?? signed.signature);

  const req = new Request(`${ORIGIN}${PATH}`, { method: "POST", headers, body });
  return verifyCloudFunctionRequest(req, { config: CONFIG, rawBody: body, nowSeconds: NOW });
}

test("ping: no headers rejected", async () => {
  const r = await verify({ omit: ["apiKey", "firebaseUid", "timestamp", "signature"] });
  assert.equal(r.ok, false);
});

test("ping: fake UID only rejected", async () => {
  const r = await verify({ omit: ["apiKey", "timestamp", "signature"] });
  assert.equal(r.ok, false);
});

test("ping: wrong API key rejected", async () => {
  const r = await verify({ apiKey: "wrong-internal-api-key!!" });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, "INVALID_INTERNAL_API_KEY");
});

test("ping: wrong HMAC rejected", async () => {
  const r = await verify({ signature: "ab".repeat(32) });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, "INVALID_SIGNATURE");
});

test("ping: expired timestamp rejected", async () => {
  const r = await verify({ timestamp: NOW - 301 });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.reason, "EXPIRED_TIMESTAMP");
});

test("ping: valid signed request accepted (verify-only; no User create in route)", async () => {
  const r = await verify({});
  assert.equal(r.ok, true);
  // Route no longer calls resolveFirebaseUser — unit coverage here is HMAC only.
});
