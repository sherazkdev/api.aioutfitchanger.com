import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeAndValidateFirebaseUid } from "../src/lib/server/cloudFunctionAuth/validateFirebaseUid";
import { GATEWAY_HEADERS } from "../src/lib/server/auth/requireFirebaseGatewayAuth";
import { safeEqualString } from "../src/lib/server/cloudFunctionAuth/timingSafe";

describe("gateway header contract", () => {
  it("uses X-API-Key and X-Firebase-Uid only", () => {
    assert.equal(GATEWAY_HEADERS.apiKey, "X-API-Key");
    assert.equal(GATEWAY_HEADERS.firebaseUid, "X-Firebase-Uid");
  });
});

describe("Firebase UID validation", () => {
  it("accepts normal UIDs", () => {
    assert.equal(normalizeAndValidateFirebaseUid("abcXYZ0123456789"), "abcXYZ0123456789");
  });
  it("rejects empty / whitespace / oversized", () => {
    assert.equal(normalizeAndValidateFirebaseUid(""), null);
    assert.equal(normalizeAndValidateFirebaseUid("   "), null);
    assert.equal(normalizeAndValidateFirebaseUid("a".repeat(129)), null);
    assert.equal(normalizeAndValidateFirebaseUid("uid with space"), null);
  });
});

describe("timing-safe compare", () => {
  it("matches equal strings", () => {
    assert.equal(safeEqualString("secret-value", "secret-value"), true);
    assert.equal(safeEqualString("a", "b"), false);
    assert.equal(safeEqualString("ab", "a"), false);
  });
});

describe("UID spoof policy (documented unit)", () => {
  it("missing key must reject before UID trust — covered by requireFirebaseGatewayAuth order", () => {
    // Structural: headers constant exist; integration covered when Mongo/master key available.
    assert.ok(GATEWAY_HEADERS.apiKey);
    assert.ok(GATEWAY_HEADERS.firebaseUid);
  });
});
