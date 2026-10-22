import { createHash, createHmac } from "crypto";

/**
 * Must match docs/CLOUD_FUNCTION_BACKEND_AUTH_CONTRACT.md and
 * src/lib/server/cloudFunctionAuth/canonical.ts exactly.
 */

export function normalizeHttpMethod(method: string): string {
  return method.trim().toUpperCase();
}

/** pathname + search only. Accepts absolute URL or path. */
export function canonicalizeRequestPath(urlOrPath: string): string {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const u = new URL(urlOrPath);
    return `${u.pathname}${u.search}`;
  }
  // Ensure leading slash for bare paths
  const path = urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
  // Use URL parser against a dummy origin for consistent search parsing
  const u = new URL(path, "https://example.invalid");
  return `${u.pathname}${u.search}`;
}

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

export function signCanonicalString(canonical: string, hmacSecret: string): string {
  return createHmac("sha256", hmacSecret).update(canonical, "utf8").digest("hex");
}
