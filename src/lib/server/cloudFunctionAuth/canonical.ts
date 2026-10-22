import { createHash, createHmac } from "crypto";

/**
 * Canonical path for signing: pathname + query string exactly as on the request URL.
 * Query parameters are NOT re-sorted — Cloud Function and backend must use the same
 * URL string that is actually sent (e.g. `/api/v1/try-on/generate` or
 * `/api/v1/history?page=1&limit=20`).
 */
export function canonicalizeRequestPath(url: string | URL): string {
  const u = typeof url === "string" ? new URL(url) : url;
  return `${u.pathname}${u.search}`;
}

export function normalizeHttpMethod(method: string): string {
  return method.trim().toUpperCase();
}

/** SHA-256 of raw body bytes/text → lowercase hex. Empty body = SHA256(""). */
export function sha256Hex(rawBody: string | Buffer | Uint8Array): string {
  return createHash("sha256").update(rawBody).digest("hex");
}

/**
 * Canonical string (LF newlines):
 *   METHOD
 *   PATH_WITH_QUERY
 *   FIREBASE_UID
 *   TIMESTAMP
 *   SHA256_BODY
 */
export function buildCanonicalString(params: {
  method: string;
  pathWithQuery: string;
  firebaseUid: string;
  timestampSeconds: number | string;
  bodySha256Hex: string;
}): string {
  return [
    normalizeHttpMethod(params.method),
    params.pathWithQuery,
    params.firebaseUid,
    String(params.timestampSeconds),
    params.bodySha256Hex.toLowerCase(),
  ].join("\n");
}

/** HMAC-SHA256(canonical, secret) → lowercase hex. */
export function signCanonicalString(canonical: string, hmacSecret: string): string {
  return createHmac("sha256", hmacSecret).update(canonical, "utf8").digest("hex");
}
