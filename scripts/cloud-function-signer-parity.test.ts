/**
 * Phase 2A: Cloud Function signer ↔ Next.js verifier signature parity.
 * Uses test secrets only. No paid APIs / Firebase deploy / production DB.
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
  internalApiKey: "parity-internal-api-key16",
  hmacSecret: "parity-hmac-secret-value16!",
  maxSkewSeconds: 300,
};

const UID = "parityFirebaseUid001";
const NOW = 1_792_650_000;
const ORIGIN = "https://example.test";

async function verifySigned(params: {
  method: string;
  pathWithQuery: string;
  rawBody: string;
  tamperPath?: string;
  tamperBody?: string;
  nowSeconds?: number;
}) {
  const signed = signBackendRequest({
    method: params.method,
    pathWithQuery: params.pathWithQuery,
    firebaseUid: UID,
    rawBody: params.rawBody,
    internalApiKey: CONFIG.internalApiKey,
    hmacSecret: CONFIG.hmacSecret,
    timestampSeconds: NOW,
  });

  const sendPath = params.tamperPath ?? signed.pathWithQuery;
  const sendBody = params.tamperBody ?? signed.rawBody;
  const headers = new Headers(signed.headers);
  const req = new Request(`${ORIGIN}${sendPath}`, {
    method: signed.method,
    headers,
    body: params.method.toUpperCase() === "GET" ? undefined : sendBody,
  });

  return verifyCloudFunctionRequest(req, {
    config: CONFIG,
    rawBody: sendBody,
    nowSeconds: params.nowSeconds ?? NOW,
  });
}

test("CF signer → backend verifier: POST body PASS", async () => {
  const rawBody = JSON.stringify({ ping: true, source: "secureBackendPing" });
  const result = await verifySigned({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    rawBody,
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.firebaseUid, UID);
});

test("CF signer → backend verifier: empty body PASS", async () => {
  const result = await verifySigned({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    rawBody: "",
  });
  assert.equal(result.ok, true);
});

test("CF signer → backend verifier: query string PASS", async () => {
  const result = await verifySigned({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping?mode=test",
    rawBody: "{}",
  });
  assert.equal(result.ok, true);
});

test("CF signer → backend verifier: tampered query FAIL", async () => {
  const result = await verifySigned({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping?mode=test",
    rawBody: "{}",
    tamperPath: "/api/v1/internal/cloud-function/ping?mode=other",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("CF signer → backend verifier: tampered body FAIL", async () => {
  const result = await verifySigned({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    rawBody: '{"a":1}',
    tamperBody: '{"a":2}',
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("headers match contract names", () => {
  const signed = signBackendRequest({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: "{}",
    internalApiKey: CONFIG.internalApiKey,
    hmacSecret: CONFIG.hmacSecret,
    timestampSeconds: NOW,
  });
  assert.ok(signed.headers[CLOUD_FUNCTION_HEADERS.apiKey]);
  assert.ok(signed.headers[CLOUD_FUNCTION_HEADERS.firebaseUid]);
  assert.ok(signed.headers[CLOUD_FUNCTION_HEADERS.timestamp]);
  assert.ok(signed.headers[CLOUD_FUNCTION_HEADERS.signature]);
});
