import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import {
  fingerprintGatewayApiKey,
  lastFourOfKey,
  loadGatewayMasterKey,
  openGatewayApiKey,
  sealGatewayApiKey,
} from "../src/lib/server/gatewayApiKey/crypto";
import { generateGatewayApiKeyPlaintext, generateGatewayKeyId } from "../src/lib/server/gatewayApiKey/generate";
import { safeEqualString } from "../src/lib/server/cloudFunctionAuth/timingSafe";

describe("gateway API key crypto", () => {
  before(() => {
    if (!process.env.GATEWAY_API_KEY_MASTER_KEY) {
      process.env.GATEWAY_API_KEY_MASTER_KEY = "test-master-key-32-bytes-minimum!!";
    }
  });

  it("generates strong keys", () => {
    const a = generateGatewayApiKeyPlaintext();
    const b = generateGatewayApiKeyPlaintext();
    assert.notEqual(a, b);
    assert.ok(a.length >= 40);
    assert.ok(generateGatewayKeyId().startsWith("gak_"));
  });

  it("round-trips AES-256-GCM seal/open", () => {
    const plaintext = generateGatewayApiKeyPlaintext();
    const sealed = sealGatewayApiKey(plaintext);
    const opened = openGatewayApiKey(sealed);
    assert.equal(opened, plaintext);
    assert.equal(lastFourOfKey(plaintext), plaintext.slice(-4));
    assert.equal(fingerprintGatewayApiKey(plaintext).length, 64);
  });

  it("rejects tampered ciphertext", () => {
    const plaintext = generateGatewayApiKeyPlaintext();
    const sealed = sealGatewayApiKey(plaintext);
    const bad = { ...sealed, ciphertext: Buffer.from("tampered").toString("base64") };
    assert.throws(() => openGatewayApiKey(bad));
  });

  it("wrong master key fails open", () => {
    const plaintext = generateGatewayApiKeyPlaintext();
    const sealed = sealGatewayApiKey(plaintext);
    const other = loadGatewayMasterKey("other-master-key-32-bytes-minimum!!!");
    assert.throws(() => openGatewayApiKey(sealed, other));
  });

  it("timing-safe compare for presented keys", () => {
    const k = generateGatewayApiKeyPlaintext();
    assert.equal(safeEqualString(k, k), true);
    assert.equal(safeEqualString(k, k.slice(0, -1) + "x"), false);
  });
});
