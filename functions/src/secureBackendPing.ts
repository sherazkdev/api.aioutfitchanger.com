import { defineSecret, defineString } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { buildFixedBackendUrl, validateBackendBaseUrl } from "./security/backendUrl";
import { fetchSignedBackend } from "./security/fetchSignedBackend";
import { signBackendRequest } from "./security/signBackendRequest";

const backendBaseUrl = defineString("BACKEND_BASE_URL", {
  default: "",
  description: "Next.js backend origin only, e.g. https://appworkspro.com or http://127.0.0.1:3000",
});

const internalApiKey = defineSecret("CLOUD_FUNCTION_INTERNAL_API_KEY");
const hmacSecret = defineSecret("CLOUD_FUNCTION_HMAC_SECRET");

/** Fixed Phase 2A ping path — never taken from Flutter. */
export const SECURE_BACKEND_PING_PATH = "/api/v1/internal/cloud-function/ping";

type PingBackendData = {
  ok: boolean;
  auth_ok?: boolean;
};

function sanitizeBackendError(status: number, bodyText: string): HttpsError {
  let code: "permission-denied" | "unavailable" | "resource-exhausted" | "internal" | "failed-precondition" =
    "internal";
  if (status === 401 || status === 403) code = "permission-denied";
  else if (status === 503) code = "unavailable";
  else if (status === 429) code = "resource-exhausted";
  else if (status >= 500) code = "internal";
  else if (status >= 400) code = "failed-precondition";

  let message = "Backend request failed";
  try {
    const parsed = JSON.parse(bodyText) as { error?: { code?: string } };
    const errCode = parsed?.error?.code;
    if (typeof errCode === "string" && errCode.length > 0 && errCode.length < 80) {
      message = `Backend rejected request (${errCode})`;
    }
  } catch {
    // ignore
  }
  return new HttpsError(code, message);
}

/**
 * Pure core for tests: auth check → sign → fetch fixed ping.
 * UID is taken ONLY from firebaseAuthUid (must be request.auth.uid).
 * request.data / client payload MUST NOT supply uid/url/path.
 */
export async function runSecureBackendPing(params: {
  firebaseAuthUid: string | undefined | null;
  backendBaseUrlRaw: string;
  internalApiKey: string;
  hmacSecret: string;
  /** Ignored for auth — accepted only to prove client cannot override UID. */
  clientData?: unknown;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<{ ok: true; auth_ok: true }> {
  if (!params.firebaseAuthUid) {
    throw new HttpsError("unauthenticated", "Firebase Authentication required.");
  }

  // Explicitly ignore any client-supplied identity/routing fields.
  void params.clientData;

  const validated = validateBackendBaseUrl(params.backendBaseUrlRaw);
  if (!validated.ok) {
    console.error(JSON.stringify({ event: "secure_backend_ping_misconfigured", reason: validated.reason }));
    throw new HttpsError("failed-precondition", "Backend base URL is not configured.");
  }

  const payload = {
    ping: true,
    source: "secureBackendPing",
  };
  // Build body EXACTLY once — hash and fetch must use the same string.
  const rawBody = JSON.stringify(payload);

  let signed;
  try {
    signed = signBackendRequest({
      method: "POST",
      pathWithQuery: SECURE_BACKEND_PING_PATH,
      firebaseUid: params.firebaseAuthUid,
      rawBody,
      internalApiKey: params.internalApiKey,
      hmacSecret: params.hmacSecret,
    });
  } catch {
    console.error(JSON.stringify({ event: "secure_backend_ping_sign_failed" }));
    throw new HttpsError("internal", "Failed to sign backend request.");
  }

  const url = buildFixedBackendUrl(validated.origin, signed.pathWithQuery);
  const started = Date.now();
  console.info(JSON.stringify({ event: "secure_backend_ping_started", path: SECURE_BACKEND_PING_PATH }));

  const fetched = await fetchSignedBackend({
    url,
    method: signed.method,
    headers: signed.headers,
    rawBody: signed.rawBody,
    timeoutMs: params.timeoutMs ?? 12_000,
    fetchImpl: params.fetchImpl,
  });

  console.info(
    JSON.stringify({
      event: "secure_backend_ping_complete",
      backend_status: fetched.ok ? fetched.status : fetched.status ?? fetched.kind,
      latency_ms: Date.now() - started,
    })
  );

  if (!fetched.ok) {
    if (fetched.kind === "timeout" || fetched.kind === "network" || fetched.kind === "redirect") {
      throw new HttpsError("unavailable", "Backend unreachable.");
    }
    throw sanitizeBackendError(fetched.status ?? 500, fetched.bodyText ?? "");
  }

  let data: PingBackendData = { ok: false };
  try {
    const parsed = JSON.parse(fetched.bodyText) as { data?: PingBackendData };
    if (parsed?.data && typeof parsed.data === "object") {
      data = {
        ok: parsed.data.ok === true,
        auth_ok: parsed.data.auth_ok === true,
      };
    }
  } catch {
    throw new HttpsError("internal", "Invalid backend response.");
  }

  if (!data.ok || !data.auth_ok) {
    throw new HttpsError("internal", "Backend ping failed.");
  }

  return { ok: true, auth_ok: true };
}

/**
 * Temporary Phase 2A validation callable — NOT for permanent production app flow.
 * Lifecycle: controlled integration test → then disable/remove from production clients.
 *
 * App Check is intentionally OFF. Firebase Anonymous Auth does NOT stop account farming;
 * this ping is verify-only on the backend (no Mongo User create) to limit Phase 2A risk.
 */
export const secureBackendPing = onCall(
  {
    secrets: [internalApiKey, hmacSecret],
    // App Check intentionally NOT required / NOT enforced in Phase 2A.
    invoker: "public",
  },
  async (request) => {
    return runSecureBackendPing({
      firebaseAuthUid: request.auth?.uid,
      backendBaseUrlRaw: backendBaseUrl.value(),
      internalApiKey: internalApiKey.value(),
      hmacSecret: hmacSecret.value(),
      clientData: request.data,
    });
  }
);
