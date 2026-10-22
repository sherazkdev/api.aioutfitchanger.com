import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpsError } from "firebase-functions/v2/https";
import { runSecureBackendPing, SECURE_BACKEND_PING_PATH } from "./secureBackendPing";

const KEY = "test-internal-api-key-min16";
const SECRET = "test-hmac-secret-value-min16!";
const UID = "firebaseUidAuthOnly001";

function okFetch(): typeof fetch {
  return async () =>
    new Response(JSON.stringify({ data: { ok: true, auth_ok: true }, error: null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
}

test("unauthenticated callable → no backend call", async () => {
  let called = 0;
  const fetchImpl: typeof fetch = async () => {
    called += 1;
    return new Response("nope");
  };
  await assert.rejects(
    () =>
      runSecureBackendPing({
        firebaseAuthUid: null,
        backendBaseUrlRaw: "https://appworkspro.com",
        internalApiKey: KEY,
        hmacSecret: SECRET,
        fetchImpl,
      }),
    (err: unknown) => err instanceof HttpsError && err.code === "unauthenticated"
  );
  assert.equal(called, 0);
});

test("client data UID cannot override request.auth.uid", async () => {
  let seenUidHeader: string | null = null;
  const fetchImpl: typeof fetch = async (_url, init) => {
    const headers = new Headers(init?.headers);
    seenUidHeader = headers.get("X-Firebase-Uid");
    return new Response(JSON.stringify({ data: { ok: true, auth_ok: true }, error: null }), {
      status: 200,
    });
  };
  await runSecureBackendPing({
    firebaseAuthUid: UID,
    backendBaseUrlRaw: "https://appworkspro.com",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    clientData: { uid: "attacker-injected-uid", firebaseUid: "attacker-injected-uid" },
    fetchImpl,
  });
  assert.equal(seenUidHeader, UID);
});

test("fixed path only — not client controlled", async () => {
  let seenUrl = "";
  const fetchImpl: typeof fetch = async (url) => {
    seenUrl = String(url);
    return new Response(JSON.stringify({ data: { ok: true, auth_ok: true }, error: null }), {
      status: 200,
    });
  };
  await runSecureBackendPing({
    firebaseAuthUid: UID,
    backendBaseUrlRaw: "https://appworkspro.com/",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    clientData: { path: "/api/v1/try-on/generate", url: "https://evil.example/" },
    fetchImpl,
  });
  assert.equal(seenUrl, `https://appworkspro.com${SECURE_BACKEND_PING_PATH}`);
});

test("backend redirect → sanitized unavailable", async () => {
  const fetchImpl: typeof fetch = async () => {
    throw new TypeError("redirect mode is set to error: 302");
  };
  await assert.rejects(
    () =>
      runSecureBackendPing({
        firebaseAuthUid: UID,
        backendBaseUrlRaw: "https://appworkspro.com",
        internalApiKey: KEY,
        hmacSecret: SECRET,
        fetchImpl,
      }),
    (err: unknown) => err instanceof HttpsError && err.code === "unavailable"
  );
});

test("backend timeout → sanitized unavailable", async () => {
  const fetchImpl: typeof fetch = async (_url, init) => {
    const signal = init?.signal;
    return await new Promise<Response>((_resolve, reject) => {
      if (signal?.aborted) {
        reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
        return;
      }
      signal?.addEventListener("abort", () => {
        reject(Object.assign(new Error("aborted"), { name: "TimeoutError" }));
      });
    });
  };
  await assert.rejects(
    () =>
      runSecureBackendPing({
        firebaseAuthUid: UID,
        backendBaseUrlRaw: "https://appworkspro.com",
        internalApiKey: KEY,
        hmacSecret: SECRET,
        fetchImpl,
        timeoutMs: 20,
      }),
    (err: unknown) => err instanceof HttpsError && err.code === "unavailable"
  );
});

test("valid ping returns sanitized ok/auth_ok only", async () => {
  const result = await runSecureBackendPing({
    firebaseAuthUid: UID,
    backendBaseUrlRaw: "https://appworkspro.com",
    internalApiKey: KEY,
    hmacSecret: SECRET,
    fetchImpl: okFetch(),
  });
  assert.deepEqual(result, { ok: true, auth_ok: true });
});
