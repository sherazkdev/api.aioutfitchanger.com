import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertSafeRemoteUrl, isBlockedHostname, isBlockedIp } from "../src/lib/server/security/safeRemoteFetch";

describe("SSRF guards", () => {
  it("blocks localhost and metadata hostnames", () => {
    assert.equal(isBlockedHostname("localhost"), true);
    assert.equal(isBlockedHostname("metadata.google.internal"), true);
    assert.equal(isBlockedHostname("cdn.example.com"), false);
  });

  it("blocks private and link-local IPs", () => {
    assert.equal(isBlockedIp("127.0.0.1"), true);
    assert.equal(isBlockedIp("10.0.0.5"), true);
    assert.equal(isBlockedIp("192.168.1.1"), true);
    assert.equal(isBlockedIp("169.254.169.254"), true);
    assert.equal(isBlockedIp("::1"), true);
    assert.equal(isBlockedIp("8.8.8.8"), false);
  });

  it("rejects non-https and userinfo", async () => {
    await assert.rejects(() => assertSafeRemoteUrl("ftp://example.com/a"), /PROTOCOL/);
    await assert.rejects(() => assertSafeRemoteUrl("http://example.com/a"), /PROTOCOL/);
    await assert.rejects(() => assertSafeRemoteUrl("https://user:pass@example.com/a"), /USERINFO/);
    await assert.rejects(() => assertSafeRemoteUrl("https://127.0.0.1/a"), /IP_BLOCKED|HOST/);
    await assert.rejects(() => assertSafeRemoteUrl("https://localhost/a"), /HOST_BLOCKED/);
  });
});
