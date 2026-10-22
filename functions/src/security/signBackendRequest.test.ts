/**
 * Cloud Function signing helper unit tests (no Firebase deploy, no paid APIs).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  buildCanonicalString,
  canonicalizeRequestPath,
  normalizeHttpMethod,
  sha256Hex,
} from "./canonical";
import { signBackendRequest } from "./signBackendRequest";

const KEY = "test-internal-api-key-min16";
const SECRET = "test-hmac-secret-value-min16!";
const UID = "firebaseUidAbc123XYZ";
const TS = 1_792_650_000;

test("canonical string exact match", () => {
  const bodyHash = sha256Hex('{"a":1}');
  const canonical = buildCanonicalString({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    timestampSeconds: String(TS),
    bodySha256Hex: bodyHash,
  });
  assert.equal(
    canonical,
    ["POST", "/api/v1/internal/cloud-function/ping", UID, String(TS), bodyHash].join("\n")
  );
});

test("method uppercase", () => {
  assert.equal(normalizeHttpMethod("post"), "POST");
  const signed = signBackendRequest({
    method: "post",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: "{}",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  assert.equal(signed.method, "POST");
});

test("body hash exact", () => {
  const rawBody = JSON.stringify({ ping: true, source: "secureBackendPing" });
  const expected = createHash("sha256").update(rawBody).digest("hex");
  const signed = signBackendRequest({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody,
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  assert.equal(signed.bodySha256Hex, expected);
  assert.equal(signed.rawBody, rawBody);
});

test("empty body hash", () => {
  const empty = createHash("sha256").update("").digest("hex");
  const signed = signBackendRequest({
    method: "GET",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: "",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  assert.equal(signed.bodySha256Hex, empty);
});

test("query string included", () => {
  assert.equal(
    canonicalizeRequestPath("/api/v1/internal/cloud-function/ping?mode=test"),
    "/api/v1/internal/cloud-function/ping?mode=test"
  );
  const signed = signBackendRequest({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping?mode=test",
    firebaseUid: UID,
    rawBody: "{}",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  assert.equal(signed.pathWithQuery, "/api/v1/internal/cloud-function/ping?mode=test");
});

test("signature deterministic", () => {
  const a = signBackendRequest({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: '{"x":1}',
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  const b = signBackendRequest({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: '{"x":1}',
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  assert.equal(a.signature, b.signature);
  assert.equal(a.timestamp, String(TS));
  assert.equal(a.headers["X-Timestamp"], a.timestamp);
  assert.equal(a.headers["X-Signature"], a.signature);
});

test("body tampering changes signature", () => {
  const base = {
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  } as const;
  const a = signBackendRequest({ ...base, rawBody: '{"a":1}' });
  const b = signBackendRequest({ ...base, rawBody: '{"a":2}' });
  assert.notEqual(a.signature, b.signature);
});

test("path tampering changes signature", () => {
  const base = {
    method: "POST",
    firebaseUid: UID,
    rawBody: "{}",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  } as const;
  const a = signBackendRequest({ ...base, pathWithQuery: "/api/v1/internal/cloud-function/ping" });
  const b = signBackendRequest({
    ...base,
    pathWithQuery: "/api/v1/internal/cloud-function/ping?x=1",
  });
  assert.notEqual(a.signature, b.signature);
});

test("UID tampering changes signature", () => {
  const base = {
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    rawBody: "{}",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  } as const;
  const a = signBackendRequest({ ...base, firebaseUid: "uidA" });
  const b = signBackendRequest({ ...base, firebaseUid: "uidB" });
  assert.notEqual(a.signature, b.signature);
});

test("timestamp tampering changes signature", () => {
  const base = {
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: "{}",
    internalApiKey: KEY,
    hmacSecret: SECRET,
  } as const;
  const a = signBackendRequest({ ...base, timestampSeconds: TS });
  const b = signBackendRequest({ ...base, timestampSeconds: TS + 1 });
  assert.notEqual(a.signature, b.signature);
});

test("helper return does not embed hmac secret or raw key fields beyond headers", () => {
  const signed = signBackendRequest({
    method: "POST",
    pathWithQuery: "/api/v1/internal/cloud-function/ping",
    firebaseUid: UID,
    rawBody: "{}",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    timestampSeconds: TS,
  });
  const json = JSON.stringify(signed);
  assert.equal(json.includes(SECRET), false);
  // Internal key is intentionally present only as the X-Internal-API-Key header value
  // for server-to-server use — never returned to Flutter by the callable wrapper.
  assert.equal(signed.headers["X-Internal-API-Key"], KEY);
  assert.ok(!("hmacSecret" in signed));
  assert.ok(!("internalApiKey" in signed));
});
