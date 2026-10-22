import {
  buildCanonicalString,
  canonicalizeRequestPath,
  normalizeHttpMethod,
  sha256Hex,
  signCanonicalString,
} from "./canonical";
import { BACKEND_AUTH_HEADERS, type SignBackendRequestInput, type SignedBackendRequest } from "./types";

/**
 * Build HMAC headers for a Cloud Function → Next.js request.
 * Never returns secrets. Headers intentionally include the internal API key
 * for server-to-server use only (never send to Flutter).
 */
export function signBackendRequest(input: SignBackendRequestInput): SignedBackendRequest {
  const method = normalizeHttpMethod(input.method);
  const pathWithQuery = canonicalizeRequestPath(input.pathWithQuery);
  const firebaseUid = input.firebaseUid.trim();
  if (!firebaseUid) {
    throw new Error("FIREBASE_UID_REQUIRED");
  }
  if (!input.internalApiKey?.trim() || !input.hmacSecret?.trim()) {
    throw new Error("BACKEND_SIGNING_SECRETS_REQUIRED");
  }

  const timestampSeconds =
    input.timestampSeconds ?? Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(timestampSeconds) || timestampSeconds < 0) {
    throw new Error("INVALID_TIMESTAMP");
  }
  // Exact digit string used both in header and canonical HMAC input.
  const timestamp = String(timestampSeconds);
  if (!/^\d+$/.test(timestamp)) {
    throw new Error("INVALID_TIMESTAMP");
  }

  const rawBody = input.rawBody ?? "";
  const bodySha256Hex = sha256Hex(rawBody);
  const canonical = buildCanonicalString({
    method,
    pathWithQuery,
    firebaseUid,
    timestampSeconds: timestamp,
    bodySha256Hex,
  });
  const signature = signCanonicalString(canonical, input.hmacSecret);

  return {
    method,
    pathWithQuery,
    firebaseUid,
    timestamp,
    rawBody,
    bodySha256Hex,
    signature,
    headers: {
      [BACKEND_AUTH_HEADERS.apiKey]: input.internalApiKey,
      [BACKEND_AUTH_HEADERS.firebaseUid]: firebaseUid,
      [BACKEND_AUTH_HEADERS.timestamp]: timestamp,
      [BACKEND_AUTH_HEADERS.signature]: signature,
      "Content-Type": "application/json",
    },
  };
}
