import { loadCloudFunctionAuthConfig } from "./config";
import {
  buildCanonicalString,
  canonicalizeRequestPath,
  normalizeHttpMethod,
  sha256Hex,
  signCanonicalString,
} from "./canonical";
import { safeEqualHex, safeEqualString } from "./timingSafe";
import type {
  CloudFunctionAuthConfig,
  CloudFunctionAuthFailureReason,
  CloudFunctionAuthResult,
} from "./types";
import { CLOUD_FUNCTION_HEADERS } from "./types";
import { normalizeAndValidateFirebaseUid } from "./validateFirebaseUid";

export type VerifyCloudFunctionRequestOptions = {
  /** Inject config (tests). When omitted, loaded from env; null → NOT_CONFIGURED. */
  config?: CloudFunctionAuthConfig | null;
  /**
   * Exact raw body bytes/text that were (or will be) transmitted.
   * Prefer passing this after reading the body once in Phase 2 routes.
   * When omitted, the request is cloned and the body is read as text (empty if none).
   * Do NOT JSON.parse + re-stringify for signing — that breaks the signature.
   */
  rawBody?: string | Buffer | Uint8Array;
  /** Override clock for tests (Unix seconds, UTC). */
  nowSeconds?: number;
};

function header(req: Request, name: string): string | null {
  const v = req.headers.get(name);
  if (v == null) return null;
  const t = v.trim();
  return t.length ? t : null;
}

function fail(reason: CloudFunctionAuthFailureReason): CloudFunctionAuthResult {
  return { ok: false, reason };
}

async function readRawBody(
  request: Request,
  rawBody: string | Buffer | Uint8Array | undefined
): Promise<string | Buffer | Uint8Array> {
  if (rawBody !== undefined) return rawBody;
  try {
    // clone() so callers can still read the original request body later (Phase 2).
    return await request.clone().text();
  } catch {
    return "";
  }
}

/**
 * Verify a Cloud Function → Next.js internal request.
 *
 * Order:
 * 1. env / config present
 * 2. required headers present
 * 3. API key valid (timing-safe)
 * 4. Firebase UID structurally valid
 * 5. timestamp valid (numeric, within skew)
 * 6. body hash of exact raw body
 * 7. HMAC signature valid (timing-safe)
 * 8. return trusted firebaseUid + timestamp
 *
 * Never returns secrets. Never trusts X-Firebase-Uid alone.
 */
export async function verifyCloudFunctionRequest(
  request: Request,
  options: VerifyCloudFunctionRequestOptions = {}
): Promise<CloudFunctionAuthResult> {
  const config =
    options.config === undefined ? loadCloudFunctionAuthConfig() : options.config;
  if (!config) {
    return fail("INTERNAL_AUTH_NOT_CONFIGURED");
  }

  const apiKeyHeader = header(request, CLOUD_FUNCTION_HEADERS.apiKey);
  const firebaseUidHeader = header(request, CLOUD_FUNCTION_HEADERS.firebaseUid);
  const timestampHeader = header(request, CLOUD_FUNCTION_HEADERS.timestamp);
  const signatureHeader = header(request, CLOUD_FUNCTION_HEADERS.signature);

  if (!apiKeyHeader || !firebaseUidHeader || !timestampHeader || !signatureHeader) {
    return fail("MISSING_INTERNAL_AUTH");
  }

  if (!safeEqualString(apiKeyHeader, config.internalApiKey)) {
    return fail("INVALID_INTERNAL_API_KEY");
  }

  const firebaseUid = normalizeAndValidateFirebaseUid(firebaseUidHeader);
  if (!firebaseUid) {
    return fail("INVALID_FIREBASE_UID");
  }

  // Unix seconds as non-negative decimal digits only (no sign, no decimal point).
  // Canonical signature uses the exact header text so CF and Next.js cannot diverge
  // via Number()/String() round-trips (e.g. leading zeros).
  if (!/^\d+$/.test(timestampHeader)) {
    return fail("INVALID_TIMESTAMP");
  }
  const timestamp = Number(timestampHeader);
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    return fail("INVALID_TIMESTAMP");
  }

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > config.maxSkewSeconds) {
    return fail("EXPIRED_TIMESTAMP");
  }

  const bodyBytes = await readRawBody(request, options.rawBody);
  const bodySha256Hex = sha256Hex(bodyBytes);
  const pathWithQuery = canonicalizeRequestPath(request.url);
  const canonical = buildCanonicalString({
    method: normalizeHttpMethod(request.method),
    pathWithQuery,
    firebaseUid,
    timestampSeconds: timestampHeader,
    bodySha256Hex,
  });
  const expectedSig = signCanonicalString(canonical, config.hmacSecret);

  if (!safeEqualHex(signatureHeader, expectedSig)) {
    return fail("INVALID_SIGNATURE");
  }

  return { ok: true, firebaseUid, timestamp };
}

/** Test/helper: build lowercase-hex HMAC for a request (never use from Flutter). */
export function signCloudFunctionRequest(params: {
  method: string;
  url: string;
  firebaseUid: string;
  timestampSeconds: number;
  rawBody?: string | Buffer | Uint8Array;
  hmacSecret: string;
}): string {
  const bodySha256Hex = sha256Hex(params.rawBody ?? "");
  const canonical = buildCanonicalString({
    method: params.method,
    pathWithQuery: canonicalizeRequestPath(params.url),
    firebaseUid: params.firebaseUid,
    timestampSeconds: params.timestampSeconds,
    bodySha256Hex,
  });
  return signCanonicalString(canonical, params.hmacSecret);
}
