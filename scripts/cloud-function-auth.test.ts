/**
 * Phase 1 Cloud Function ↔ backend auth foundation tests.
 * No BFL / BytePlus / Firebase Admin / production DB / paid AI.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import mongoose from "mongoose";
import {
  CLOUD_FUNCTION_HEADERS,
  loadCloudFunctionAuthConfig,
  resolveFirebaseUser,
  signCloudFunctionRequest,
  verifyCloudFunctionRequest,
  type CloudFunctionAuthConfig,
} from "../src/lib/server/cloudFunctionAuth/index.ts";

const TEST_CONFIG: CloudFunctionAuthConfig = {
  internalApiKey: "test-internal-api-key-min16",
  hmacSecret: "test-hmac-secret-value-min16!",
  maxSkewSeconds: 300,
};

const BASE_URL = "https://example.test";
const PATH = "/api/v1/try-on/generate";
const FULL_URL = `${BASE_URL}${PATH}`;
const UID = "firebaseUidAbc123XYZ";
const NOW = 1_792_650_000;

function buildSignedRequest(params: {
  apiKey?: string;
  firebaseUid?: string;
  timestamp?: number;
  body?: string;
  signature?: string | null;
  omit?: Array<"apiKey" | "firebaseUid" | "timestamp" | "signature">;
  method?: string;
  url?: string;
}): Request {
  const method = params.method ?? "POST";
  const url = params.url ?? FULL_URL;
  const body = params.body ?? JSON.stringify({ style_id: "x" });
  const firebaseUid = params.firebaseUid ?? UID;
  const timestamp = params.timestamp ?? NOW;
  const apiKey = params.apiKey ?? TEST_CONFIG.internalApiKey;
  const omit = new Set(params.omit ?? []);

  const signature =
    params.signature === null
      ? undefined
      : (params.signature ??
        signCloudFunctionRequest({
          method,
          url,
          firebaseUid,
          timestampSeconds: timestamp,
          rawBody: body,
          hmacSecret: TEST_CONFIG.hmacSecret,
        }));

  const headers = new Headers({ "content-type": "application/json" });
  if (!omit.has("apiKey")) headers.set(CLOUD_FUNCTION_HEADERS.apiKey, apiKey);
  if (!omit.has("firebaseUid")) headers.set(CLOUD_FUNCTION_HEADERS.firebaseUid, firebaseUid);
  if (!omit.has("timestamp")) headers.set(CLOUD_FUNCTION_HEADERS.timestamp, String(timestamp));
  if (!omit.has("signature") && signature !== undefined) {
    headers.set(CLOUD_FUNCTION_HEADERS.signature, signature);
  }

  return new Request(url, { method, headers, body });
}

test("invalid key: rejected", async () => {
  const req = buildSignedRequest({ apiKey: "wrong-internal-api-key!!" });
  const body = await req.clone().text();
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_INTERNAL_API_KEY");
});

test("invalid signature: rejected", async () => {
  const req = buildSignedRequest({
    signature: "a".repeat(64),
  });
  const body = await req.clone().text();
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("expired timestamp: rejected", async () => {
  const oldTs = NOW - 301;
  const req = buildSignedRequest({ timestamp: oldTs });
  const body = await req.clone().text();
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "EXPIRED_TIMESTAMP");
});

test("valid request: trusted firebaseUid returned", async () => {
  const req = buildSignedRequest({});
  const body = await req.clone().text();
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.firebaseUid, UID);
    assert.equal(result.timestamp, NOW);
  }
});

test("tampered body: invalid signature", async () => {
  const signedBody = JSON.stringify({ style_id: "A" });
  const sentBody = JSON.stringify({ style_id: "B" });
  const signature = signCloudFunctionRequest({
    method: "POST",
    url: FULL_URL,
    firebaseUid: UID,
    timestampSeconds: NOW,
    rawBody: signedBody,
    hmacSecret: TEST_CONFIG.hmacSecret,
  });
  const headers = new Headers({
    "content-type": "application/json",
    [CLOUD_FUNCTION_HEADERS.apiKey]: TEST_CONFIG.internalApiKey,
    [CLOUD_FUNCTION_HEADERS.firebaseUid]: UID,
    [CLOUD_FUNCTION_HEADERS.timestamp]: String(NOW),
    [CLOUD_FUNCTION_HEADERS.signature]: signature,
  });
  const req = new Request(FULL_URL, { method: "POST", headers, body: sentBody });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: sentBody,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("missing headers: rejected without 500", async () => {
  for (const omit of ["apiKey", "firebaseUid", "timestamp", "signature"] as const) {
    const req = buildSignedRequest({ omit: [omit] });
    const body = await req.clone().text();
    const result = await verifyCloudFunctionRequest(req, {
      config: TEST_CONFIG,
      rawBody: body,
      nowSeconds: NOW,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "MISSING_INTERNAL_AUTH");
  }
});

test("future timestamp beyond skew: rejected", async () => {
  const futureTs = NOW + 301;
  const req = buildSignedRequest({ timestamp: futureTs });
  const body = await req.clone().text();
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "EXPIRED_TIMESTAMP");
});

test("INTERNAL_AUTH_NOT_CONFIGURED when config null", async () => {
  const req = buildSignedRequest({});
  const result = await verifyCloudFunctionRequest(req, {
    config: null,
    rawBody: "{}",
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INTERNAL_AUTH_NOT_CONFIGURED");
});

test("empty body signs as SHA256 empty string", async () => {
  const emptyHash = createHash("sha256").update("").digest("hex");
  assert.equal(emptyHash.length, 64);
  const signature = signCloudFunctionRequest({
    method: "GET",
    url: `${BASE_URL}/api/v1/users/me`,
    firebaseUid: UID,
    timestampSeconds: NOW,
    rawBody: "",
    hmacSecret: TEST_CONFIG.hmacSecret,
  });
  const headers = new Headers({
    [CLOUD_FUNCTION_HEADERS.apiKey]: TEST_CONFIG.internalApiKey,
    [CLOUD_FUNCTION_HEADERS.firebaseUid]: UID,
    [CLOUD_FUNCTION_HEADERS.timestamp]: String(NOW),
    [CLOUD_FUNCTION_HEADERS.signature]: signature,
  });
  const req = new Request(`${BASE_URL}/api/v1/users/me`, { method: "GET", headers });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: "",
    nowSeconds: NOW,
  });
  assert.equal(result.ok, true);
});

// --- Firebase user resolver (in-memory fake store; no production Mongo) ---

type FakeUser = {
  _id: mongoose.Types.ObjectId;
  firebaseUid: string;
  role: string;
  subscriptionPlan: string;
  isGuest: boolean;
  status: string;
};

function createMemoryUserStore() {
  const byUid = new Map<string, FakeUser>();
  let createCalls = 0;

  return {
    byUid,
    get createCalls() {
      return createCalls;
    },
    async upsertByFirebaseUid(firebaseUid: string): Promise<FakeUser> {
      const existing = byUid.get(firebaseUid);
      if (existing) return existing;
      createCalls += 1;
      // Simulate concurrent create: if another "insert" raced, Map still ends with one.
      const created: FakeUser = {
        _id: new mongoose.Types.ObjectId(),
        firebaseUid,
        role: "user",
        subscriptionPlan: "free",
        isGuest: true,
        status: "active",
      };
      const raced = byUid.get(firebaseUid);
      if (raced) return raced;
      byUid.set(firebaseUid, created);
      return created;
    },
  };
}

test("new Firebase user creation via resolver", async () => {
  const store = createMemoryUserStore();
  const user = await resolveFirebaseUser(UID, {
    upsertByFirebaseUid: (uid) => store.upsertByFirebaseUid(uid) as never,
  });
  assert.equal(user.firebaseUid, UID);
  assert.ok(user._id);
  assert.equal(user.role, "user");
  assert.equal(user.subscriptionPlan, "free");
  assert.equal(store.byUid.size, 1);
});

test("existing Firebase user resolution returns same Mongo _id", async () => {
  const store = createMemoryUserStore();
  const first = await resolveFirebaseUser(UID, {
    upsertByFirebaseUid: (uid) => store.upsertByFirebaseUid(uid) as never,
  });
  const second = await resolveFirebaseUser(UID, {
    upsertByFirebaseUid: (uid) => store.upsertByFirebaseUid(uid) as never,
  });
  assert.equal(String(first._id), String(second._id));
  assert.equal(store.byUid.size, 1);
  assert.equal(store.createCalls, 1);
});

test("race safety: concurrent resolve yields one user", async () => {
  const store = createMemoryUserStore();
  // Slow first insert so second call can race on empty map.
  let gate: (() => void) | null = null;
  const unlock = new Promise<void>((resolve) => {
    gate = resolve;
  });
  let started = 0;

  const slowUpsert = async (firebaseUid: string) => {
    started += 1;
    if (started === 1) {
      await unlock;
    }
    return store.upsertByFirebaseUid(firebaseUid);
  };

  const p1 = resolveFirebaseUser(UID, { upsertByFirebaseUid: slowUpsert as never });
  // Wait until first is blocked
  while (started < 1) {
    await new Promise((r) => setImmediate(r));
  }
  const p2 = resolveFirebaseUser(UID, { upsertByFirebaseUid: slowUpsert as never });
  gate!();
  const [a, b] = await Promise.all([p1, p2]);
  assert.equal(String(a._id), String(b._id));
  assert.equal(store.byUid.size, 1);
});

test("original POST body remains readable after verify (clone path)", async () => {
  const payload = { style_id: "body_clone_ok", category_id: "occasions" };
  const body = JSON.stringify(payload);
  const req = buildSignedRequest({ body });
  // Do NOT pass rawBody — force verifier to clone()+text()
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, true);
  const parsed = await req.json();
  assert.deepEqual(parsed, payload);
});

test("query-string tampering invalidates signature", async () => {
  const signedUrl = `${BASE_URL}${PATH}?page=1`;
  const tamperedUrl = `${BASE_URL}${PATH}?page=2`;
  const body = JSON.stringify({ style_id: "q" });
  const signature = signCloudFunctionRequest({
    method: "POST",
    url: signedUrl,
    firebaseUid: UID,
    timestampSeconds: NOW,
    rawBody: body,
    hmacSecret: TEST_CONFIG.hmacSecret,
  });
  const headers = new Headers({
    "content-type": "application/json",
    [CLOUD_FUNCTION_HEADERS.apiKey]: TEST_CONFIG.internalApiKey,
    [CLOUD_FUNCTION_HEADERS.firebaseUid]: UID,
    [CLOUD_FUNCTION_HEADERS.timestamp]: String(NOW),
    [CLOUD_FUNCTION_HEADERS.signature]: signature,
  });
  const req = new Request(tamperedUrl, { method: "POST", headers, body });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("method tampering invalidates signature", async () => {
  const body = JSON.stringify({ style_id: "m" });
  const signature = signCloudFunctionRequest({
    method: "POST",
    url: FULL_URL,
    firebaseUid: UID,
    timestampSeconds: NOW,
    rawBody: body,
    hmacSecret: TEST_CONFIG.hmacSecret,
  });
  const headers = new Headers({
    "content-type": "application/json",
    [CLOUD_FUNCTION_HEADERS.apiKey]: TEST_CONFIG.internalApiKey,
    [CLOUD_FUNCTION_HEADERS.firebaseUid]: UID,
    [CLOUD_FUNCTION_HEADERS.timestamp]: String(NOW),
    [CLOUD_FUNCTION_HEADERS.signature]: signature,
  });
  const req = new Request(FULL_URL, { method: "PUT", headers, body });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: body,
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_SIGNATURE");
});

test("missing env secrets → verifier fails closed", async () => {
  const prevKey = process.env.CLOUD_FUNCTION_INTERNAL_API_KEY;
  const prevSecret = process.env.CLOUD_FUNCTION_HMAC_SECRET;
  try {
    delete process.env.CLOUD_FUNCTION_INTERNAL_API_KEY;
    delete process.env.CLOUD_FUNCTION_HMAC_SECRET;
    assert.equal(loadCloudFunctionAuthConfig(), null);
    const req = buildSignedRequest({});
    const result = await verifyCloudFunctionRequest(req, {
      // omit config → load from env (now empty)
      nowSeconds: NOW,
      rawBody: "{}",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.reason, "INTERNAL_AUTH_NOT_CONFIGURED");
  } finally {
    if (prevKey === undefined) delete process.env.CLOUD_FUNCTION_INTERNAL_API_KEY;
    else process.env.CLOUD_FUNCTION_INTERNAL_API_KEY = prevKey;
    if (prevSecret === undefined) delete process.env.CLOUD_FUNCTION_HMAC_SECRET;
    else process.env.CLOUD_FUNCTION_HMAC_SECRET = prevSecret;
  }
});

test("UID present without signature is rejected", async () => {
  const req = buildSignedRequest({ omit: ["signature"] });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: "{}",
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "MISSING_INTERNAL_AUTH");
});

test("negative timestamp rejected", async () => {
  const headers = new Headers({
    "content-type": "application/json",
    [CLOUD_FUNCTION_HEADERS.apiKey]: TEST_CONFIG.internalApiKey,
    [CLOUD_FUNCTION_HEADERS.firebaseUid]: UID,
    [CLOUD_FUNCTION_HEADERS.timestamp]: "-1",
    [CLOUD_FUNCTION_HEADERS.signature]: "ab".repeat(32),
  });
  const req = new Request(FULL_URL, {
    method: "POST",
    headers,
    body: "{}",
  });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: "{}",
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_TIMESTAMP");
});

test("decimal timestamp rejected", async () => {
  const headers = new Headers({
    [CLOUD_FUNCTION_HEADERS.apiKey]: TEST_CONFIG.internalApiKey,
    [CLOUD_FUNCTION_HEADERS.firebaseUid]: UID,
    [CLOUD_FUNCTION_HEADERS.timestamp]: "1792650000.5",
    [CLOUD_FUNCTION_HEADERS.signature]: "ab".repeat(32),
  });
  const req = new Request(FULL_URL, { method: "POST", headers, body: "{}" });
  const result = await verifyCloudFunctionRequest(req, {
    config: TEST_CONFIG,
    rawBody: "{}",
    nowSeconds: NOW,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "INVALID_TIMESTAMP");
});
